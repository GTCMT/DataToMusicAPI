/**
 * Creates a new instance of synthesizer object. Wraps WebAudio functions somehow.
 * @function module:synth_old.synth_old
 * @param [type='sine'] {string} Choices: 'sine', 'saw', 'square', 'triange', 'noise', 'click', 'sampler', etc...
 * @param [wt] {string}
 * @returns {dtm.synth}
 */
dtm.synth3 = function (type, wt) {
    var params = {
        type: 'sine',

        note: {
            delay: 0,
            duration: 1
        },

        output: {
            gain: 0.5,
            pan: 0.0
        },

        isPlaying: false,
        buffer: null,

        mono: false,

        amp: {
            gain: 0.5,
            adsr: [0.001, 0.2, 0, 0.001],
            // TODO: redesign
            curve: null,
            dur: null,
            loop: false
        },

        pitch: {
            freq: 440,
            noteNum: 69
        },

        wt: {
            isOn: false,
            wt: null
        },

        lpf: {
            isOn: false,
            cof: 4000,
            res: 1
        },

        detune: {
            isOn: false,
            amount: 0,
            spread: 0
        },

        delay: {
            isOn: false,
            amount: 0,
            time: 0.3,
            sync: false,
            note: 6,
            feedback: 0.3,
            stereo: false
        },

        verb: {
            isOn: false,
            amount: 0
        },

        comb: {
            isOn: false,
            amount: 0,
            nn: 69
        }
    };

    var nodes = {
        src: null,
        amp: null,
        out: null
    };

    var noise = null;

    if (dtm.wa.isOn) {
        noise = dtm.wa.makeNoise(8192);
    }

    var synth = {
        type: 'dtm.synth'
    };

    var promise = null;

    /**
     * Returns the value of a parameter.
     * @function module:synth_old#get
     * @param param {string} amp, volume | gain, frequency | freq | cps, noteNum | notenum | note | nn, buffer
     * @returns {*}
     */
    synth.get = function (param) {
        switch (param) {
            case 'params':
                return null;

            case 'amp':
                return params.amp.gain;

            case 'volume':
            case 'gain':
                return params.output.gain;

            case 'pan':
                return params.output.pan;

            case 'frequency':
            case 'freq':
            case 'cps':
                return params.pitch.freq;

            case 'noteNum':
            case 'notenum':
            case 'note':
            case 'nn':
                return params.pitch.noteNum;

            case 'buffer':
                return params.buffer;

            default:
                return null;
        }
    };

    /**
     * Sets the wavetable or mode of the dtm.synth.
     * @function module:synth_old#set
     * @param type {string|array} Choices: sine, saw, square, triangle, noise, click, sampler
     * @returns {dtm.synth}
     */
    synth.set = function (type) {
        if (typeof(type) === 'string') {
            if (type.indexOf('.wav') > -1 || type.indexOf('.mp3') > -1) {
                synth.load(type);
                return synth;
            }
        }

        switch (type) {
            case 'sin':
            case 'sine':
                params.type = 'sine';
                break;
            case 'saw':
            case 'sawtooth':
                params.type = 'saw';
                break;
            case 'sq':
            case 'square':
                params.type = 'square';
                break;
            case 'tri':
            case 'triangle':
                params.type = 'triangle';
                break;
            case 'wn':
            case 'noise':
            case 'rand':
            case 'random':
                params.type = 'noise';
                break;
            case 'click':
            case 'impulse':
                params.type = 'click';
                break;
            case 'wt':
            case 'wavetable':
                params.type = 'wavetable';
                if (typeof(arguments[1] !== 'undefined')) {
                    synth.wt(arguments[1]);
                } else {
                    synth.wt([0]);
                }
                break;
            case 'sampler':
                params.type = 'sampler';
                break;
            default:
                break;
        }

        return synth;
    };

    synth.init = function () {
        nodes.out = dtm.wa.actx.createGain();
        nodes.out.gain.setValueAtTime(0.5, 0);
        nodes.out.connect(dtm.wa.actx.destination);
        return synth;
    };

    synth.wt = function (arr) {
        params.wt.isOn = true;

        if (typeof(arr) === 'undefined') {
            arr = [0];
        }

        var base = [0, 1];

        for (var i = 0; i < arr.length; i++) {
            base.push(arr[i]);
        }

        var real = new Float32Array(base);
        //var img = real;
        params.wt.wt = dtm.wa.actx.createPeriodicWave(real, real);

        return synth;
    };

    /**
     * Sets the ADSR envelope for the main amplitude.
     * @function module:synth_old#adsr
     * @param attack {number} Attack time in seconds.
     * @param decay {number} Decay time in seconds.
     * @param sustain {number} Sustain level between 0-1.
     * @param release {number} Release time in seconds.
     * @returns {dtm.synth}
     */
    synth.adsr = function () {
        // TODO: take indiv values OR array

        if (typeof(arguments) !== 'undefeined') {
            params.amp.adsr[0] = arguments[0] || 0.001;
            params.amp.adsr[1] = arguments[1] || 0.001;
            params.amp.adsr[2] = arguments[2];
            params.amp.adsr[3] = arguments[3] || 0.001;
        }

        return synth;
    };

    /**
     * Loads an audio sample eaither from a URL, an ArrayBuffer, or Webaudio buffer data. When loading from URL or un-decoded ArrayBuffer, it will return a promise object which passes the dtm.synth object to the callback with decoded buffer being loaded. You could call the play() function directly on the promise, but the timing of the playback is not guaranteed as immediate. If given a WebAudio buffer, it returns the dtm.synth object. It will also set the current synth type to 'sampler'.
     * @function module:synth_old#load
     * @param arg {string|arraybuffer|buffer}
     * @param [cb] {function}
     * @returns {promise | dtm.synth}
     */
    synth.load = function (arg, cb) {
        var actx = dtm.wa.actx;

        params.type = 'sampler';

        if (arg.constructor.name === 'AudioBuffer') {
            params.buffer = arg;
            return synth;
        } else {
            promise = new Promise(function (resolve, reject) {
                if (typeof(arg) === 'string') {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', arg, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            actx.decodeAudioData(xhr.response, function (buf) {
                                params.buffer = buf;
                                resolve(synth);

                                if (typeof(cb) !== 'undefined') {
                                    cb(buf);
                                }
                            });
                        }
                    };

                    xhr.send();
                } else if (arg.constructor.name === 'ArrayBuffer') {
                    actx.decodeAudioData(arg, function (buf) {
                        params.buffer = buf;
                        resolve(synth);

                        if (typeof(cb) !== 'undefined') {
                            cb(synth);
                        }
                    });
                } else if (arg.constructor === Array) {
                    var buf = actx.createBuffer(1, arg.length, dtm.wa.actx.sampleRate);
                    var content = buf.getChannelData(0);
                    content.forEach(function (val, idx) {
                        content[idx] = arg[idx];
                    });

                    params.buffer = buf;
                    resolve(synth);

                    if (typeof(cb) !== 'undefined') {
                        cb(synth);
                    }
                }
            });

            // TODO: this will break all other setter functions
            //promise.play = function () {
            //    promise.then(function (s) {
            //        s.play();
            //    });
            //};

            //return promise;
        }
        return synth;
    };

    /**
     * Starts playing the dtm.synth object.
     * @function module:synth_old#play
     * @param [del=0] {number} Delay in seconds for the playback.
     * @param [dur] {number} Duration of the playback in seconds.
     * @returns {dtm.synth}
     */
    synth.play = function (del, dur) {
        // TODO: type / range check

        if (nodes.out === null) {
            synth.init();
        }

        if (promise) {
            promise.then(function () {
                play(del, dur)
            });
        } else {
            play(del, dur);
        }

        function play(del, dur) {
            var actx = dtm.wa.actx;
            var now = dtm.wa.now;
            var out = dtm.wa.out;

            if (typeof(del) !== 'number') {
                del = 0;
            }

            if (typeof(dur) !== 'number') {
                dur = params.note.duration;
            }

            var noteStartTime = now() + del + 0.0001;

            if (params.type === 'noise') {
                nodes.src = actx.createBufferSource();
                if (!noise) {
                    noise = dtm.wa.makeNoise(8192);
                }
                nodes.src.buffer = noise;
                nodes.src.loop = true;
            } else if (params.type === 'sampler') {
                nodes.src = actx.createBufferSource();
                nodes.src.buffer = params.buffer;
                nodes.src.playbackRate = 1;
                nodes.src.loop = false;
            } else if (params.type === 'click') {
                nodes.src = actx.createBufferSource();
                var buf = actx.createBuffer(1, 2, dtm.sr);
                var contents = buf.getChannelData(0);
                contents[1] = 1;
                nodes.src.buffer = buf;
                nodes.src.playbackRate = 1;
                nodes.src.loop = false;
            } else {
                nodes.src = actx.createOscillator();
                nodes.src.frequency.setValueAtTime(params.pitch.freq, noteStartTime);

                switch (params.type) {
                    case 'sine':
                        nodes.src.type = 'sine';
                        break;
                    case 'saw':
                        nodes.src.type = 'sawtooth';
                        break;
                    case 'square':
                        nodes.src.type = 'square';
                        break;
                    case 'triange':
                        nodes.src.type = 'triangle';
                        break;

                    default:
                        break;
                }

                if (params.wt.isOn) {
                    nodes.src.setPeriodicWave(params.wt.wt);
                }
            }

            nodes.amp = actx.createGain();

            // ATTACK
            // amp.gain.setValueAtTime(0, startT); // not working!
            // setTargetAtTime w/ small value not working as intended (Jun 6, 2015)
            var atkTime = params.amp.adsr[0];
            if (params.amp.adsr[0] < 0.01) {
                nodes.amp.gain.value = params.amp.gain;

            } else {
                nodes.amp.gain.value = 0;
                nodes.amp.gain.setTargetAtTime(params.amp.gain, noteStartTime, atkTime); // attack
            }

            // DECAY - SUSTAIN
            var decayTime = params.amp.adsr[1];
            var susLevel = params.amp.adsr[2] * params.amp.gain;

            nodes.amp.gain.setTargetAtTime(susLevel, noteStartTime+atkTime, decayTime);

            // RELEASE
            var relStartTime = (dur > atkTime + decayTime) ? noteStartTime + dur : noteStartTime + atkTime + decayTime;
            var releaseTime = params.amp.adsr[3];

            if (params.lpf.isOn) {
                var lpf = actx.createBiquadFilter();
                lpf.type = 'lowpass';
                lpf.frequency.setValueAtTime(params.lpf.cof, noteStartTime);
                lpf.Q.setValueAtTime(params.lpf.res, noteStartTime);
                nodes.src.connect(lpf);
                lpf.connect(nodes.amp);
            } else {
                nodes.src.connect(nodes.amp);
            }

            if (params.comb.isOn) {
                var comb = actx.createDelay();
                comb.delayTime.setValueAtTime(1/dtm.val.mtof(params.comb.nn), noteStartTime);

                var combAmp = actx.createGain();
                combAmp.gain.setValueAtTime(params.comb.amount, noteStartTime);

                var combFb = actx.createGain();
                combFb.gain.setValueAtTime(0.95, noteStartTime);

                nodes.amp.connect(comb);
                comb.connect(combAmp);
                comb.connect(combFb);
                combFb.connect(comb);
                combAmp.connect(nodes.out);
            }

            if (params.delay.isOn) {
                var delay = actx.createDelay();
                delay.delayTime.setValueAtTime(params.delay.time, noteStartTime);

                var delAmp = actx.createGain();
                delAmp.gain.setValueAtTime(params.delay.amount, noteStartTime);

                var delFb = actx.createGain();
                delFb.gain.setValueAtTime(params.delay.feedback, noteStartTime);

                nodes.amp.connect(delay);
                delay.connect(delAmp);
                delay.connect(delFb);
                delFb.connect(delay);
                delAmp.connect(nodes.out);
            }

            // TODO: not chaning the effects...
            if (params.verb.isOn) {
                var verb = actx.createConvolver();
                verb.buffer = dtm.wa.buffs.verbIr;

                var verbAmp = actx.createGain();
                verbAmp.gain.setValueAtTime(params.verb.amount, noteStartTime);

                nodes.amp.connect(verb);
                verb.connect(verbAmp);
                verbAmp.connect(nodes.out);
            }


            //var gain = actx.createGain();
            //gain.gain.setValueAtTime(params.output.gain, noteStartTime);


            var pan = actx.createStereoPanner();
            pan.pan.setValueAtTime(params.output.pan, 0);
            //var x = params.output.pan * 4 - 2;
            //var y = (1-params.output.pan) * 4 - 2;
            //pan.setPosition(x, y, -0.5);

            nodes.amp.connect(pan);

            //gain.connect(pan);
            //pan.connect(out());
            pan.connect(nodes.out);

            nodes.src.start(noteStartTime);

            if (params.amp.curve !== null) {
                nodes.amp.gain.cancelScheduledValues(noteStartTime);
                // TODO: ADSR should be applied after this!

                var curveDur = params.amp.dur || params.note.duration;

                if (params.amp.loop) {
                    var noteDur = params.note.duration;
                    if (dur > 0) {
                        noteDur = dur;
                    }
                    console.log(noteDur, curveDur, params.amp.dur);
                    for (var i = 0; i < Math.ceil(noteDur/curveDur); i++) {
                        nodes.amp.gain.setValueCurveAtTime(params.amp.curve, noteStartTime + curveDur*i, curveDur);
                    }
                } else {
                    nodes.amp.gain.setValueCurveAtTime(params.amp.curve, noteStartTime, curveDur);
                }
            }

            if (dur >= 0) {
                nodes.src.stop(relStartTime + params.amp.adsr[3] + 0.3);
                nodes.amp.gain.setTargetAtTime(0.0, relStartTime, releaseTime);
            }
        }

        return synth;
    };

    synth.stop = function (del) {
        if (typeof(del) !== 'number') {
            del = 0.0;
        }

        var now = dtm.wa.now();

        var releaseTime = params.amp.adsr[3];
        nodes.amp.gain.cancelScheduledValues(now + del);
        nodes.amp.gain.setTargetAtTime(0.0, now + del, releaseTime);
        nodes.src.stop(now + del + releaseTime);

        return synth;
    };

    /**
     * Sets the MIDI note number to be played.
     * @function module:synth_old#nn
     * @param nn {number}
     * @returns {dtm.synth}
     */
    synth.nn = function (nn) {
        if (typeof(nn) !== 'number') {
            return synth;
        }
        nn = nn < 0 ? 0 : nn;
        nn = nn > 127 ? 127 : nn;

        params.pitch.noteNum = nn;
        params.pitch.freq = dtm.value.mtof(nn);

        return synth;
    };

    /**
     * Sets the frequency of the note to be played.
     * @function module:synth_old#freq
     * @param freq {number}
     * @returns {dtm.synth}
     */
    synth.freq = function (freq) {
        if (typeof(freq) !== freq) {
            return synth;
        }
        freq = freq < 1.0 ? 1.0 : freq;
        freq = freq > dtm.wa.actx.sampleRate ? dtm.wa.actx.sampleRate : freq;

        params.pitch.freq = freq;
        return synth;
    };

    /**
     * Sets the amplitude of the note.
     * @function module:synth_old#amp
     * @param val {number} Amplitude between 0-1.
     * @returns {dtm.synth}
     */
    synth.amp = function (val) {
        if (typeof(val) === 'number') {
            params.amp.gain = val;
        } else if (val.constructor === Array) {

            params.amp.dur = params.note.duration;
            if (typeof(arguments[1]) === 'number') {
                params.amp.dur = arguments[1];
            }

            var kr = 44100;
            //var arr = dtm.transform.fit(val, Math.round(kr * params.amp.dur));
            params.amp.curve = new Float32Array(val);

            if (typeof(arguments[2]) === "boolean") {
                params.amp.loop = arguments[2];
            }
        }

        return synth;
    };

    /**
     * Sets the duration for the each note.
     * @function module:synth_old#dur | duration | len | length
     * @param val {number} Duration in seconds.
     * @returns {dtm.synth}
     */
    synth.dur = function (val) {
        params.note.duration = val;
        return synth;
    };
    synth.len = synth.length = synth.duration = synth.dur;

    synth.attr = function (obj) {
        var keys = Object.keys(obj);

        keys.forEach(function (key) {
            if (typeof(synth[key]) !== 'undefined') {
                synth[key] = obj[key];
            }
        });

        return synth;
    };

    /**
     * Sets the attack time of the amplitude envelope
     * @function module:synth_old#attack | atk
     * @param val {number} Attack time in seconds
     * @returns {dtm.synth}
     */
    synth.attack = function (val) {
        params.amp.adsr[0] = val;
        return synth;
    };
    synth.atk = synth.attack;

    /**
     * Sets the decay time of the amplitude envelope
     * @function module:synth_old#decay | dcy
     * @param val {number} Decay time in seconds
     * @returns {dtm.synth}
     */
    synth.decay = function (val) {
        params.amp.adsr[1] = val;
        return synth;
    };
    synth.dcy = synth.decay;

    /**
     * Sets the sustain level of the amplitude envelope
     * @function module:synth_old#sustain | sus
     * @param val {number} Normalized sustain level between 0 and 1
     * @returns {{type: string, promise: null}}
     */
    synth.sustain = function (val) {
        params.amp.adsr[2] = val;
        return synth;
    };
    synth.sus = synth.sustain;

    /**
     * Sets the release time of the amplitude envelope
     * @function module:synth_old#release | rel
     * @param val {number} Release time in seconds
     * @returns {{type: string, promise: null}}
     */
    synth.release = function (val) {
        params.amp.adsr[3] = val;
        return synth;
    };
    synth.rel = synth.release;

    /**
     * Sets the output gain level
     * @function module:synth_old#gain
     * @param val {number} Normalized gain value between 0 and 1
     * @returns {{type: string, promise: null}}
     */
    synth.gain = function (val) {
        if (typeof(val) !== 'number') {
            return synth;
        } else {
            val = val < 0.0 ? 0.0 : val;
        }
        params.output.gain = val;
        return synth;
    };

    /**
     * Sets the output stereo panning
     * @function module:synth_old#pan
     * @param val {number} Stereo pan value between 0 and 1. The center = 0.5.
     * @returns {{type: string}}
     */
    synth.pan = function (val) {
        if (typeof(val) !== 'number') {
            return synth;
        } else {
            params.output.pan = val < -1.0 ? -1.0 : val;
            params.output.pan = val > 1.0 ? 1.0 : val;
        }
        return synth;
    };

    /**
     * Applies a Low Pass Filter.
     * @function module:synth_old#lpf
     * @param cof {number} Cutoff Frequency in Hz.
     * @param res {number} Q or resonance level.
     * @returns {dtm.synth}
     */
    synth.lpf = function (cof, res) {
        params.lpf.isOn = true;
        params.lpf.cof = cof || 4000;
        params.lpf.res = res || 1;
        return synth;
    };

    /**
     * Applies a reverb to the voice.
     * @function module:synth_old#verb
     * @param amt {number} 0-1
     * @returns {dtm.synth}
     */
    synth.verb = function (amt) {
        params.verb.isOn = true;
        params.verb.amount = amt;
        return synth;
    };

    /**
     * Same as synth.verb().
     * @function module:synth_old#reverb
     * @type {Function}
     */
    synth.reverb = synth.verb;

    // TODO: stereo mode
    /**
     * Applies a feedback delay.
     * @function module:synth_old#delay
     * @param amt {number} The amount or amplitude of the delay (0-1).
     * @param [time=0.3] {number} Delay time in seconds.
     * @param [fb=0.3] {number} Feedback amount in 0-1.
     * @param [stereo=false] {boolean} Stereo switch.
     * @returns {dtm.synth}
     */
    synth.delay = function (amt, time, fb, stereo) {
        params.delay.isOn = true;
        params.delay.amount = amt || 0;
        params.delay.time = time || 0.3;
        params.delay.feedback = fb || 0.3;
        params.delay.stereo = stereo || false;

        return synth;
    };

    /**
     * Applies a resonating comb filter.
     * @param amt
     * @param nn
     * @returns {dtm.synth}
     */
    synth.comb = function (amt, nn) {
        params.comb.isOn = true;
        params.comb.amount = amt || 0;
        params.comb.nn = nn || 69;
        return synth;
    };

    // TODO: implement FM
    /**
     * Applies Frequency Modulation
     * @function module:synth_old#fm
     * @param amp
     * @param base
     * @param freq
     * @param wt
     * @returns {dtm.synth}
     */
    synth.fm = function (amp, base, freq, wt) {

        return synth;
    };

    synth.mono = function (bool) {
        if (!isBoolean(bool)) {
            params.mono = true;
        } else {
            params.mono = bool;
        }
        return synth;
    };

    synth.set(type, wt);

    return synth;
};