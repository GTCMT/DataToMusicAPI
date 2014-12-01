/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module synth
 */

/**
 * Creates a new instance of synthesizer object. Wraps WebAudio functions somehow.
 * @function module:synth.synth
 * @param [type='sine'] {string} Choices: 'sine', 'saw', 'square', 'triange', 'noise', 'click', 'sampler', etc...
 * @returns {dtm.synth}
 */
dtm.synth = function (type) {
    var synth = {
        className: 'dtm.synth',

        buffer: null,

        envelope: {
            attack: 0.001,
            decay: 0.001,
            sustain: 1,
            release: 0.001
        },

        params: {
            type: 'sine',
            isPlaying: false,
            gain: 0.5,

            duration: 1,

            freq: 440,
            noteNum: 69,

            adsr: [0.001, 0.2, 0, 0.001],

            detune: {
                isOn: false,
                amount: 0,
                spread: 0
            },

            lpf: {
                isOn: false,
                cof: 4000,
                res: 1
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
        },

        /**
         * A JavaScript promise object with play() function extended. Used for the audio sample loading.
         * @name module:synth#promise
         * @type {object}
         */
        promise: null
    };

    var noise = makeNoise(8192);

    /**
     * Sets the ADSR envelope for the main amplitude.
     * @function module:synth#adsr
     * @param attack {number} Attack time in seconds.
     * @param decay {number} Decay time in seconds.
     * @param sustain {number} Sustain level between 0-1.
     * @param release {number} Release time in seconds.
     * @returns {dtm.synth}
     */
    synth.adsr = function () {
        // TODO: take indiv values OR array

        if (typeof(arguments) !== 'undefeined') {
            synth.params.adsr[0] = arguments[0] || 0.001;
            synth.params.adsr[1] = arguments[1] || 0.001;
            synth.params.adsr[2] = arguments[2];
            synth.params.adsr[3] = arguments[3] || 0.001;
        }

        return synth;
    };

    /**
     * Loads an audio sample eaither from a URL, an ArrayBuffer, or Webaudio buffer data. When loading from URL or un-decoded ArrayBuffer, it will return a promise object which passes the dtm.synth object to the callback with decoded buffer being loaded. You could call the play() function directly on the promise, but the timing of the playback is not guaranteed as immediate. If given a WebAudio buffer, it returns the dtm.synth object. It will also set the current synth type to 'sampler'.
     * @function module:synth#load
     * @param arg {string|arraybuffer|buffer}
     * @param [cb] {function}
     * @returns {promise | dtm.synth}
     */
    synth.load = function (arg, cb) {
        synth.params.type = 'sampler';

        if (arg.constructor.name === 'AudioBuffer') {
            synth.buffer = arg;
            return synth;
        } else {
            var promise = new Promise(function (resolve, reject) {
                if (typeof(arg) === 'string') {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', arg, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            actx.decodeAudioData(xhr.response, function (buf) {
                                synth.buffer = buf;
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
                        synth.buffer = buf;
                        resolve(synth);

                        if (typeof(cb) !== 'undefined') {
                            cb(synth);
                        }
                    });
                } else if (arg instanceof Array) {
                    var buf = actx.createBuffer(1, arg.length, dtm.sr);
                    var content = buf.getChannelData(0);
                    _.forEach(content, function (val, idx) {
                        content[idx] = arg[idx];
                    });

                    synth.buffer = buf;
                    resolve(synth);

                    if (typeof(cb) !== 'undefined') {
                        cb(synth);
                    }
                }
            });

            promise.play = function () {
                promise.then(function (s) {
                    s.play();
                });
            };

            synth.promise = promise;
            return promise;
        }
    };

    /**
     * Starts playing the dtm.synth object.
     * @function module:synth#play
     * @param [del=0] {number} Delay in seconds for the playback.
     * @param [dur] {number} Duration of the playback in seconds.
     * @returns {dtm.synth}
     */
    synth.play = function (del, dur) {
        del = del || 0;
        dur = dur || synth.params.duration;

        var startT = now() + del;
        var src;

        //var noise = makeNoise();

        if (synth.params.type === 'noise') {
            src = actx.createBufferSource();
            src.buffer = noise;
            src.loop = true;
        } else if (synth.params.type === 'sampler') {
            src = actx.createBufferSource();
            src.buffer = synth.buffer;
            src.playbackRate = 1;
            src.loop = false;
        } else if (synth.params.type === 'click') {
            src = actx.createBufferSource();
            var buf = actx.createBuffer(1, 2, dtm.sr);
            var contents = buf.getChannelData(0);
            contents[1] = 1;
            src.buffer = buf;
            src.playbackRate = 1;
            src.loop = false;
        } else {
            src = actx.createOscillator();
            src.frequency.setValueAtTime(synth.params.freq, startT);
        }

        switch (synth.params.type) {
            case 'sine':
                src.type = 'sine';
                break;
            case 'saw':
                src.type = 'sawtooth';
                break;
            case 'square':
                src.type = 'square';
                break;
            case 'triange':
                src.type = 'triangle';
                break;
            default:
                break;
        }

        var amp = actx.createGain();

        if (synth.params.lpf.isOn) {
            var lpf = actx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.setValueAtTime(synth.params.lpf.cof, startT);
            lpf.Q.setValueAtTime(synth.params.lpf.res, startT);
            src.connect(lpf);
            lpf.connect(amp);
        } else {
            src.connect(amp);
        }

        if (synth.params.comb.isOn) {
            var comb = actx.createDelay();
            comb.delayTime.setValueAtTime(1/dtm.val.mtof(synth.params.comb.nn), startT);

            var combAmp = actx.createGain();
            combAmp.gain.setValueAtTime(synth.params.comb.amount, startT);

            var combFb = actx.createGain();
            combFb.gain.setValueAtTime(0.95, startT);

            amp.connect(comb);
            comb.connect(combAmp);
            comb.connect(combFb);
            combFb.connect(comb);
            combAmp.connect(out());
        }

        if (synth.params.delay.isOn) {
            var delay = actx.createDelay();
            delay.delayTime.setValueAtTime(synth.params.delay.time, startT);

            var delAmp = actx.createGain();
            delAmp.gain.setValueAtTime(synth.params.delay.amount, startT);

            var delFb = actx.createGain();
            delFb.gain.setValueAtTime(synth.params.delay.feedback, startT);

            amp.connect(delay);
            delay.connect(delAmp);
            delay.connect(delFb);
            delFb.connect(delay);
            delAmp.connect(out());
        }

        // TODO: not chaning the effects...
        if (synth.params.verb.isOn) {
            var verb = actx.createConvolver();
            verb.buffer = dtm.buffs.verbIr;

            var verbAmp = actx.createGain();
            verbAmp.gain.setValueAtTime(synth.params.verb.amount, startT);

            amp.connect(verb);
            verb.connect(verbAmp);
            verbAmp.connect(out());
        }

        amp.connect(out());

        var susLevel = synth.params.adsr[2] * synth.params.gain;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(synth.params.gain, startT, synth.params.adsr[0]);
        amp.gain.setTargetAtTime(susLevel, startT+synth.params.adsr[0], synth.params.adsr[1]);

        var relStart = startT + synth.params.adsr[0] + synth.params.adsr[1] + dur;
        amp.gain.setTargetAtTime(0, relStart, synth.params.adsr[3]);

        src.start(startT);
        src.stop(relStart + synth.params.adsr[3] + 0.3);

        return synth;
    };

    synth.run = function () {
        return synth;
    };

    synth.stop = function (del) {
        del = del || 0;
        return synth;
    };

    /**
     * Sets the MIDI note number to be played.
     * @function module:synth#nn
     * @param nn {integer}
     * @returns {dtm.synth}
     */
    synth.nn = function (nn) {
        synth.params.noteNum = nn;
        synth.params.freq = dtm.value.mtof(nn);

        return synth;
    };

    /**
     * Sets the amplitude of the note.
     * @function module:synth#amp
     * @param val {number} Amplitude between 0-1.
     * @returns {dtm.synth}
     */
    synth.amp = function (val) {
        synth.params.gain = val;
        return synth;
    };

    /**
     * Sets the duration for the each note.
     * @function module:synth#dur
     * @param val {number} Duration in seconds.
     * @returns {dtm.synth}
     */
    synth.dur = function (val) {
        synth.params.duration = val;
        return synth;
    };

    synth.attr = function (obj) {
        var keys = _.keys(obj);

        _.forEach(keys, function (key) {
            if (typeof(synth[key]) !== 'undefined') {
                synth[key] = obj[key];
            }
        });

        return synth;
    };

    synth.attack = function (val) {
        synth.params.adsr[0] = val;
        return synth;
    };

    synth.decay = function (val) {
        synth.params.adsr[1] = val;
        return synth;
    };

    synth.sustain = function (val) {
        synth.params.adsr[2] = val;
        return synth;
    };

    synth.release = function (val) {
        synth.params.adsr[3] = val;
        return synth;
    };

    /**
     * Applies a Low Pass Filter.
     * @param cof {number} Cutoff Frequency in Hz.
     * @param res {number} Q or resonance level.
     * @returns {dtm.synth}
     */
    synth.lpf = function (cof, res) {
        synth.params.lpf.isOn = true;
        synth.params.lpf.cof = cof || 4000;
        synth.params.lpf.res = res || 1;
        return synth;
    };

    /**
     * Applies a reverb to the voice.
     * @function module:synth#verb
     * @param amt {number} 0-1
     * @returns {dtm.synth}
     */
    synth.verb = function (amt) {
        synth.params.verb.isOn = true;
        synth.params.verb.amount = amt;
        return synth;
    };

    /**
     * Same as synth.verb().
     * @function module:synth#reverb
     * @type {Function}
     */
    synth.reverb = synth.verb;

    // TODO: stereo mode
    /**
     * Applies a feedback delay.
     * @function module:synth#delay
     * @param amt {number} The amount or amplitude of the delay (0-1).
     * @param [time=0.3] {number} Delay time in seconds.
     * @param [fb=0.3] {number} Feedback amount in 0-1.
     * @param [stereo=false] {boolean} Stereo switch.
     * @returns {dtm.synth}
     */
    synth.delay = function (amt, time, fb, stereo) {
        synth.params.delay.isOn = true;
        synth.params.delay.amount = amt || 0;
        synth.params.delay.time = time || 0.3;
        synth.params.delay.feedback = fb || 0.3;
        synth.params.delay.stereo = stereo || false;

        return synth;
    };

    /**
     * Applies a resonating comb filter.
     * @param amt
     * @param nn
     * @returns {dtm.synth}
     */
    synth.comb = function (amt, nn) {
        synth.params.comb.isOn = true;
        synth.params.comb.amount = amt || 0;
        synth.params.comb.nn = nn || 69;
        return synth;
    };

    /**
     * Sets the wavetable or mode of the dtm.synth.
     * @function module:synth#set
     * @param type {string|array} Choices: sine, saw, square, triangle, noise, click, sampler
     * @returns {dtm.synth}
     */
    synth.set = function (type) {
        switch (type) {
            case 'sin':
            case 'sine':
                synth.params.type = 'sine';
                break;
            case 'saw':
            case 'sawtooth':
                synth.params.type = 'saw';
                break;
            case 'sq':
            case 'square':
                synth.params.type = 'square';
                break;
            case 'tri':
            case 'triangle':
                synth.params.type = 'triangle';
                break;
            case 'wn':
            case 'noise':
                synth.params.type = 'noise';
                break;
            case 'click':
                synth.params.type = 'click';
                break;
            case 'sampler':
                synth.params.type = 'sampler';
                break;
            default:
                break;
        }

        return synth;
    };

    synth.type = synth.wt = synth.set;
    synth.set(type);

    return synth;
};

dtm.s = dtm.syn = dtm.synth;

function makeNoise(bufLen) {
    bufLen = bufLen || 4192;

    var buffer = actx.createBuffer(1, bufLen, dtm.sr);
    var contents = buffer.getChannelData(0);

    _.forEach(_.range(bufLen), function (idx) {
        contents[idx] = _.random(-1, 1, true);
    });

    return buffer;
}

function makeIr(decay) {
    var bufLen = Math.round(decay * dtm.sr) || dtm.sr;

    var buffer = actx.createBuffer(2, bufLen, dtm.sr);
    var left = buffer.getChannelData(0);
    var right = buffer.getChannelData(1);

    var exp = 10;
    _.forEach(_.range(bufLen), function (idx) {
        left[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen-idx)/bufLen, exp), -1, 1);
        right[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen-idx)/bufLen, exp), -1, 1);
    });

    return buffer;
}

dtm.makeIr = makeIr;
dtm.buffs = {
    verbIr: dtm.makeIr(2)
};
