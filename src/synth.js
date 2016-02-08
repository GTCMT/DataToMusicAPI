/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module synth
 */

///**
// * Creates a new instance of synthesizer object.
// * @function module:synth.synth
// * @returns {dtm.synth}
// */
dtm.synth = function () {
    var synth = function () {
        return synth.clone();
    };

    var params = {
        sr: 44100,
        kr: 4410,
        dur: 1.0,
        durTest: dtm.array(1.0),
        offset: 0.0,
        repeat: 1,
        autoRep: true,

        interp: 'step',

        baseTime: 0.0, // for offline rendering
        lookahead: false,
        autoDur: false,
        voiceId: Math.random(),
        startTime: 0.0,
        phase: 0.0,

        wavetable: null,
        rendered: null,
        tabLen: 8192,
        source: 'sine',
        type: 'synth',
        promise: null,
        pending: false,

        amp: { base: dtm.array([[1]]) },

        notenum: {
            base: dtm.array([[69]]),
            isFinal: true
        },
        freq: {
            base: dtm.array([[440]]),
            isFinal: false
        },
        pitch: {
            base: dtm.array([[1]]),
            isFinal: false
        },

        pan: { base: dtm.array([[0]]) },
        curve: false,
        offline: false,
        clock: null,

        //useOfflineContext: true,
        rtFxOnly: true,
        named: []
    };

    var nodes = {
        src: null,
        amp: null,
        pan: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null,

        phasor: null
    };

    synth.meta = {
        type: 'dtm.synth',
        setParams: function (newParams) {
            params = newParams;
            return synth;
        },
        setNodes: function (newNodes) {
            nodes = newNodes;
            return synth;
        }
    };

    synth.get = function (param) {
        switch (param) {
            case 'clock':
                return params.clock;
            case 'lookahead':
                return params.lookahead;
            case 'autoDur':
                return params.autoDur;
            case 'dur':
            case 'duration':
                return params.dur;
            case 'source':
                return params.source;
            case 'tabLen':
                return params.tabLen;
            case 'wavetable':
                return params.wavetable;
            case 'id':
                return params.voiceId;
            default:
                return synth;
        }
    };

    if (!!arguments.callee.caller) {
        if (arguments.callee.caller.arguments.length > 0) {
            if (isObject(arguments.callee.caller.arguments[0])) {
                if (arguments.callee.caller.arguments[0].type === 'dtm.clock') {
                    params.clock = arguments.callee.caller.arguments[0];
                    params.lookahead = true;
                    params.autoDur = true;
                }
            }
        }
    }

    var actx = dtm.wa.actx;
    var octx = null;
    params.sr = actx.sampleRate;
    params.rtFxOnly = !dtm.wa.useOfflineContext;
    var deferIncr = 1;

    var init = function () {
        if (isObject(arguments[0])) {
            if (arguments[0].hasOwnProperty('type')) {
                if (arguments[0].type === 'dtm.clock') {
                    params.clock = arguments[0];
                    params.lookahead = true;
                    params.autoDur = true;
                }
            }
        }

        params.baseTime = actx.currentTime;
        params.wavetable = new Float32Array(params.tabLen);
        params.wavetable.forEach(function (v, i) {
            params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
        });
    };

    init.apply(this, arguments);

    function freqToPitch(freq) {
        if (isFloat32Array(freq)) {
            var res = new Float32Array(freq.length);
            freq.forEach(function (v, i) {
                res[i] = v * params.tabLen / params.sr;
            });
            return res;
        } else if (isNumber(freq)) {
            return freq * params.tabLen / params.sr;
        }
    }

    function pitchToFreq(pitchArr) {

    }

    function setParamCurve (time, dur, curves) {
        curves.forEach(function (curve) {
            // if the curve length exceeds the set duration * this
            var maxDurRatioForSVAT = 0.25;
            if (params.curve || (curve.value.length / params.sr) > (params.dur * maxDurRatioForSVAT)) {
                curve.param.setValueCurveAtTime(curve.value, time, dur);
            } else {
                curve.value.forEach(function (v, i) {
                    curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                });
            }
        });
    }

    var fx = {
        // TODO: named param mode not complete
        Gain: function (mode) {
            var name = null;
            var post = isBoolean(mode) ? mode : params.rtFxOnly;
            if (isString(mode)) {
                post = true;
                name = mode;
            }
            this.mult = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.gain = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.gain);
                this.gain.connect(this.out);

                var curves = [];
                curves.push({param: this.gain.gain, value: this.mult});
                setParamCurve(time, dur, curves);

                if (!isEmpty(name)) {
                    params.named[name] = this.gain.gain;
                }
            }
        },

        LPF: function (post) {
            this.freq = new Float32Array([20000.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.lpf = ctx.createBiquadFilter();
                this.out = ctx.createGain();
                this.in.connect(this.lpf);
                this.lpf.connect(this.out);

                var curves = [];
                curves.push({param: this.lpf.frequency, value: this.freq});
                curves.push({param: this.lpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        HPF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.hpf = ctx.createBiquadFilter();
                this.hpf.type = 'highpass';
                this.out = ctx.createGain();
                this.in.connect(this.hpf);
                this.hpf.connect(this.out);

                var curves = [];
                curves.push({param: this.hpf.frequency, value: this.freq});
                curves.push({param: this.hpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        BPF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.bpf = ctx.createBiquadFilter();
                this.bpf.type = 'bandpass';
                this.out = ctx.createGain();
                this.in.connect(this.bpf);
                this.bpf.connect(this.out);

                var curves = [];
                curves.push({param: this.bpf.frequency, value: this.freq});
                curves.push({param: this.bpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        APF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.apf = ctx.createBiquadFilter();
                this.apf.type = 'allpass';
                this.out = ctx.createGain();
                this.in.connect(this.apf);
                this.apf.connect(this.out);

                var curves = [];
                curves.push({param: this.apf.frequency, value: this.freq});
                curves.push({param: this.apf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        Delay: function (post) {
            this.mix = new Float32Array([0.5]);
            this.time = new Float32Array([0.3]);
            this.feedback = new Float32Array([0.5]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.delay = ctx.createDelay();
                this.wet = ctx.createGain();
                this.dry = ctx.createGain();
                this.fb = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.delay);
                this.delay.connect(this.fb);
                this.fb.connect(this.delay);
                this.delay.connect(this.wet);
                this.wet.connect(this.out);
                this.in.connect(this.dry);
                this.dry.connect(this.out);

                var curves = [];
                curves.push({param: this.wet.gain, value: this.mix});
                curves.push({param: this.delay.delayTime, value: this.time});
                curves.push({param: this.fb.gain, value: this.feedback});
                setParamCurve(time, dur, curves);
            };
        },

        Reverb: function (post) {
            this.mix = toFloat32Array(0.5);
            //this.time = toFloat32Array(2.0);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.verb = ctx.createConvolver();
                this.wet = ctx.createGain();
                this.dry = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.verb);
                this.verb.connect(this.wet);
                this.wet.connect(this.out);
                this.in.connect(this.dry);
                this.dry.connect(this.out);

                var size = params.sr * 2;
                var ir = ctx.createBuffer(1, size, params.sr);
                ir.copyToChannel(dtm.gen('noise').size(size).mult(dtm.gen('decay').size(size)).get(), 0);
                this.verb.buffer = ir;

                this.dryLevel = this.mix.map(function (v) {
                    if (v <= 0.5) {
                        return 1.0;
                    } else {
                        return 1.0 - (v - 0.5) * 2.0;
                    }
                });

                this.wetLevel = this.mix.map(function (v) {
                    if (v >= 0.5) {
                        return 1.0;
                    } else {
                        return v * 2.0;
                    }
                });

                var curves = [];
                curves.push({param: this.dry.gain, value: this.dryLevel});
                curves.push({param: this.wet.gain, value: this.wetLevel});
                setParamCurve(time, dur, curves);
            }
        },

        Convolver: function () {

        },

        BitQuantizer: function () {
            this.bit = new Float32Array([16]);
            var self = this;

            this.run = function (time, dur) {
                this.in = actx.createGain();
                this.out = actx.createGain();
                this.in.connect(this.out);

                var interval = dur * params.sr / this.bit.length;
                this.bit.forEach(function (v, i) {
                    // allowing fractional values...
                    if (v > 16) {
                        v = 16;
                    } else if (v < 1) {
                        v = 1;
                    }
                    self.bit[i] = v;
                });

                params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > self.bit.length-1) {
                        blockNum = self.bit.length-1;
                    }
                    var res = Math.pow(2, self.bit[blockNum]);
                    params.rendered[i] = Math.round(v * res) / res;
                });
            };
        },

        SampleHold: function () {
            this.samps = new Float32Array([1]);
            var self = this;

            this.run = function (time, dur) {
                this.in = actx.createGain();
                this.out = actx.createGain();
                this.in.connect(this.out);

                var interval = dur * params.sr / this.samps.length;
                this.samps.forEach(function (v, i) {
                    v = Math.round(v);
                    if (v < 1) {
                        v = 1;
                    }
                    self.samps[i] = v;
                });

                params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > self.samps.length-1) {
                        blockNum = self.samps.length-1;
                    }
                    var samps = self.samps[blockNum];
                    var hold = 0;
                    if (i % samps === 0) {
                        hold = v;
                    }
                    params.rendered[i] = hold;
                })
            }
        },

        WaveShaper: function () {

        }
    };

    /**
     * Sets dtm.clock object for internal-use in the synth.
     * @function module:synth#clock
     * @param clock {dtm.clock} dtm.clock object
     * @returns {dtm.synth}
     */
    synth.clock = function (clock) {
        if (isObject(clock)) {
            if (clock.type === 'dtm.clock') {
                params.clock = clock;
            }
        }
        return synth;
    };

    /**
     * @function module:synth#lookahead
     * @param lookahead {bool|number}
     * @returns {dtm.synth}
     */
    synth.lookahead = function (lookahead) {
        if (isBoolean(lookahead)) {
            params.lookahead = lookahead;
        }
        return synth;
    };

    /**
     * @function module:synth#dur
     * @param src
     * @returns {dtm.synth}
     */
    synth.dur = function (src) {
        if (isNumber(src) && src > 0) {
            params.autoDur = false;
            params.dur = src;
        } else if (isBoolean(src)) {
            params.autoDur = src;
        } else if (src === 'auto') {
            params.autoDur = true;
        } else if (isDtmArray(src)) {
            params.durTest = src;
        } else if (isFunction(src)) {
            params.dur = src(dtm.a(params.dur), synth, params.clock);
        }
        return synth;
    };

    synth.int = synth.interval = synth.dur;

    synth.offset = function (src) {
        params.offset = toFloat32Array(src)[0];
        return synth;
    };

    // maybe not good to have this in synth, instead should be in a model?
    synth.time = function (src) {
        if (isNumber(src) && (src > 0) && !isEmpty(params.clock)) {
            if (dtm.val.mod(params.clock.get('beat'), params.clock.get('time') * src) === 0) {
                // TODO: implement
            }
        }
        return synth;
    };

    /**
     * Plays
     * @function module:synth#play
     * @param [bool=true] {boolean}
     * @returns {dtm.synth}
     */
    synth.play = function (bool) {
        var defer = 0.01;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        // if playSwitch is a function



        //params.dur = params.durTest.get('next');

        if (params.pending) {
            params.pending = false;
            params.promise.then(function () {
                synth.play(bool);
                return synth;
            });
            return synth;
        }

        // deferred
        setTimeout(function () {
            //===== type check
            if (isBoolean(bool) && bool === false) {
                return synth;
            }

            function process(param) {
                var temp = param.base.get('next').clone();
                if (!isEmpty(param.add)) {
                    temp.add(param.add.get('next'));
                }
                if (!isEmpty(param.mult)) {
                    temp.mult(param.mult.get('next'));
                }
                return temp.value;
            }

            var amp = process(params.amp);
            var pan = process(params.pan);
            var pitch;

            if (params.notenum.isFinal) {
                pitch = process(params.notenum).map(function (v) {
                    return freqToPitch(dtm.val.mtof(v));
                });
            } else if (params.freq.isFinal) {
                pitch = process(params.freq).map(function (v) {
                    return freqToPitch(v);
                });
            } else {
                pitch = process(params.pitch);
            }

            if (params.autoDur) {
                if (params.type === 'sample') {
                    params.tabLen = params.wavetable.length;

                    params.dur = 0;
                    pitch.forEach(function (v) {
                        params.dur += params.tabLen / params.sr / v / pitch.length;
                    })
                } else if (params.clock) {
                    params.dur = params.clock.get('dur');
                }
            }

            var offset = params.offset;
            var dur = params.dur;

            dtm.master.addVoice(synth);

            //===============================
            if (dtm.wa.useOfflineContext) {
                octx = new OfflineAudioContext(1, (offset + dur*4) * params.sr, params.sr);

                offset += octx.currentTime;

                if (params.lookahead) {
                    offset += params.clock.get('lookahead');
                }

                nodes.src = octx.createBufferSource();
                nodes.amp = octx.createGain();
                nodes.out = octx.createGain();
                nodes.fx[0].out = octx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(nodes.fx[0].out);
                nodes.out.connect(octx.destination);

                for (var n = 1; n < nodes.fx.length; n++) {
                    nodes.fx[n].run(offset, dur);
                    nodes.fx[n-1].out.connect(nodes.fx[n].in);
                }
                nodes.fx[n-1].out.connect(nodes.out);

                if (params.source === 'noise') {
                    nodes.src.buffer = octx.createBuffer(1, params.sr/2, params.sr);
                    var chData = nodes.src.buffer.getChannelData(0);
                    chData.forEach(function (v, i) {
                        chData[i] = Math.random() * 2.0 - 1.0;
                    });
                    nodes.src.loop = true;
                } else {
                    nodes.src.buffer = octx.createBuffer(1, params.tabLen, params.sr);
                    nodes.src.buffer.copyToChannel(params.wavetable, 0);
                    nodes.src.loop = true;
                }

                var curves = [];
                curves.push({param: nodes.src.playbackRate, value: pitch});
                curves.push({param: nodes.amp.gain, value: amp});
                setParamCurve(offset, dur, curves);

                nodes.fx[0].out.gain.value = 1.0;
                nodes.out.gain.value = 0.3;

                nodes.src.start(offset);
                nodes.src.stop(offset + dur);

                octx.startRendering();
                octx.oncomplete = function (e) {
                    params.rendered = e.renderedBuffer.getChannelData(0);

                    offset += params.baseTime;
                    if (params.lookahead) {
                        offset += params.clock.get('lookahead');
                    }

                    nodes.rtSrc = actx.createBufferSource();
                    nodes.pFx[0].out = actx.createGain();
                    nodes.pan = actx.createStereoPanner();
                    var out = actx.createGain();
                    nodes.rtSrc.connect(nodes.pFx[0].out);
                    for (var n = 1; n < nodes.pFx.length; n++) {
                        nodes.pFx[n].run(offset, dur);
                        nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                    }
                    nodes.pFx[n-1].out.connect(nodes.pan);
                    nodes.pan.connect(out);
                    out.connect(actx.destination);

                    nodes.rtSrc.buffer = actx.createBuffer(1, params.rendered.length, params.sr);
                    nodes.rtSrc.buffer.copyToChannel(params.rendered, 0);
                    nodes.rtSrc.loop = false;
                    nodes.rtSrc.start(offset);
                    nodes.rtSrc.stop(offset + nodes.rtSrc.buffer.length);

                    setParamCurve(offset, dur, [{param: nodes.pan.pan, value: pan}]);

                    out.gain.value = 1.0;

                    nodes.rtSrc.onended = function () {
                        dtm.master.removeVoice(synth);
                    };
                };
            } else {
                offset += actx.currentTime;

                if (params.lookahead) {
                    offset += params.clock.get('lookahead');
                }

                params.startTime = offset;

                nodes.src = actx.createBufferSource();
                nodes.amp = actx.createGain();
                nodes.pFx[0].out = actx.createGain();
                nodes.pan = actx.createStereoPanner();
                var declipper = actx.createGain();
                var out = actx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(declipper);
                declipper.connect(nodes.pFx[0].out);
                for (var n = 1; n < nodes.pFx.length; n++) {
                    nodes.pFx[n].run(offset, dur);
                    nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                }
                nodes.pFx[n-1].out.connect(nodes.pan);
                nodes.pan.connect(out);
                out.connect(actx.destination);

                nodes.src.buffer = actx.createBuffer(1, params.tabLen, params.sr);
                nodes.src.buffer.copyToChannel(params.wavetable, 0);
                nodes.src.loop = (params.type !== 'sample');
                nodes.src.start(offset);
                nodes.src.stop(offset + dur);

                var curves = [];
                curves.push({param: nodes.src.playbackRate, value: pitch});
                curves.push({param: nodes.amp.gain, value: amp});
                setParamCurve(offset, dur, curves);
                setParamCurve(offset, dur, [{param: nodes.pan.pan, value: pan}]);

                nodes.pFx[0].out.gain.value = 1.0; // ?
                out.gain.value = 1.0;

                var ramp = 0.005;
                declipper.gain.setValueAtTime(0.0, offset);
                declipper.gain.linearRampToValueAtTime(1.0, offset + ramp);
                declipper.gain.setTargetAtTime(0.0, offset + dur - ramp, ramp * 0.3);

                nodes.src.onended = function () {
                    dtm.master.removeVoice(synth);

                    // rep(1) would only play once
                    if (params.repeat > 1) {
                        params.repeat--;
                        synth.play(); // TODO: pass any argument?
                    }
                };
            }

        }, defer + deferIncr);

        return synth;
    };

    // testing
    synth.cancel = function (time) {
        if (!isNumber(time)) {
            time = 0.0;
        }

        objForEach(params.named, function (p) {
            p.cancelScheduledValues(actx.currentTime + time);
        });

        return synth;
    };

    /**
     * Stops the currently playing sound.
     * @function module:synth#stop
     * @param [time=0] {number} Delay in seconds for the stop action to be called.
     * @returns {dtm.synth}
     */
    synth.stop = function (time) {
        var defer = 0.0;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        if (!isNumber(time)) {
            time = 0.0; // TODO: time not same as rt rendering time
        }

        params.repeat = 0;

        setTimeout(function () {
            if (nodes.src) {
                nodes.src.stop(time);
            }

            if (nodes.rtSrc) {
                nodes.rtSrc.stop(time);
            }

            dtm.master.removeVoice(synth);
        }, defer + deferIncr*2);

        return synth;
    };

    synth.repeat = function (times, interval) {
        if (isInteger(times) && times > 0) {
            params.repeat = times;
        } else if (isEmpty(times) || times === Infinity || times === true) {
            params.repeat = Infinity;
        }
        return synth;
    };

    synth.rep = synth.repeat;

    function getPhase() {
        params.phase = (actx.currentTime - params.startTime) / params.dur;
        if (params.phase < 0.0) {
            params.phase = 0.0;
        } else if (params.phase > 1.0) {
            params.phase = 1.0;
        }
        return params.phase;
    }

    synth.mod = function (name, val) {
        if (isString(name) && params.named.hasOwnProperty(name)) {
            setTimeout(function () {
                params.named[name].cancelScheduledValues(0); // TODO: check
                params.named[name].setValueAtTime(val, 0);
            }, 0);
        }
        return synth;
    };

    synth.modulate = synth.mod;

    function setFinal(param) {
        ['notenum', 'freq', 'pitch'].forEach(function (v) {
            params[v].isFinal = v === param;
        });
    }

    /**
     * Sets the frequency of the oscillator
     * @function module:synth#freq
     * @param src
     * @returns {dtm.synth}
     */
    synth.freq = function () {
        params.freq.base = map(arguments, params.freq.base);
        setFinal('freq');

        return synth;
    };

    synth.freq.add = function () {
        if (isEmpty(params.freq.add)) {
            params.freq.add = map(arguments, params.freq.add);
        } else {
            params.freq.add.add(map(arguments, params.freq.add), params.interp);
        }
        setFinal('freq');

        return synth;
    };

    synth.freq.mult = function () {
        if (isEmpty(params.freq.mult)) {
            params.freq.mult = map(arguments, params.freq.mult);
        } else {
            params.freq.mult.mult(map(arguments, params.freq.mult), params.interp);
        }
        setFinal('freq');

        return synth;
    };

    /**
     * Sets the pitch of the oscillator by a MIDI note number.
     * @function module:synth#notenum
     * @param src
     * @returns {dtm.synth}
     */
    synth.notenum = function () {
        params.notenum.base = map(arguments, params.notenum.base);
        setFinal('notenum');

        return synth;
    };

    synth.nn = synth.notenum;

    synth.notenum.add = function () {
        if (isEmpty(params.notenum.add)) {
            params.notenum.add = map(arguments, params.notenum.add);
        } else {
            params.notenum.add.add(map(arguments, params.notenum.add), params.interp);
        }
        setFinal('notenum');

        return synth;
    };

    synth.notenum.mult = function () {
        if (isEmpty(params.notenum.mult)) {
            params.notenum.mult = map(arguments, params.notenum.mult);
        } else {
            params.notenum.mult.mult(map(arguments, params.notenum.mult), params.interp);
        }
        setFinal('notenum');

        return synth;
    };

    // for longer sample playback
    synth.pitch = function () {
        params.pitch.base = map(arguments, params.pitch.base);
        setFinal('pitch');
        return synth;
    };

    synth.pitch.add = function () {
        if (isEmpty(params.pitch.add)) {
            params.pitch.add = map(arguments, params.pitch.add);
        } else {
            params.pitch.add.add(map(arguments, params.pitch.add), params.interp);
        }
        setFinal('pitch');
        return synth;
    };

    synth.pitch.mult = function () {
        if (isEmpty(params.pitch.mult)) {
            params.pitch.mult = map(arguments, params.pitch.mult);
        } else {
            params.pitch.mult.mult(map(arguments, params.pitch.mult), params.interp);
        }
        setFinal('pitch');
        return synth;
    };

    /**
     * @function module:synth#amp
     * @param src
     * @returns {dtm.synth}
     */
    synth.amp = function () {
        params.amp.base = map(arguments, params.amp.base);

        if (isDtmArray(src) && src.get('autolen')) {
            src.size(Math.round(params.dur * params.sr));
        }

        return synth;
    };

    synth.amp.add = function () {
        if (isEmpty(params.amp.add)) {
            params.amp.add = map(arguments, params.amp.add);
        } else {
            params.amp.add.add(map(arguments, params.amp.add), params.interp);
        }
        return synth;
    };

    synth.amp.mult = function () {
        if (isEmpty(params.amp.mult)) {
            params.amp.mult = map(arguments, params.amp.mult);
        } else {
            params.amp.mult.mult(map(arguments, params.amp.mult), params.interp);
        }
        return synth;
    };

    /**
     * @function module:synth#pan
     * @param src
     * @returns {dtm.synth}
     */
    synth.pan = function () {
        params.pan.base = map(arguments, params.pan.base);
        return synth;
    };

    synth.pan.add = function () {
        if (isEmpty(params.pan.add)) {
            params.pan.add = map(arguments, params.pan.add);
        } else {
            params.pan.add.add(map(arguments, params.pan.add), params.interp);
        }
        return synth;
    };

    synth.pan.mult = function () {
        if (isEmpty(params.pan.mult)) {
            params.pan.mult = map(arguments, params.pan.mult);
        } else {
            params.pan.mult.mult(map(arguments, params.pan.mult), params.interp);
        }
        return synth;
    };

    synth.ts = function (src) {
        return synth;
    };

    synth.ps = function (src) {

    };

    synth.wavetable = function (src, mode) {
        src = typeCheck(src);
        if (isFloat32Array(src)) {
            params.wavetable = src;
            params.tabLen = src.length;
            params.pitch = freqToPitch(params.freq); // ?
        } else if (isFunction(src)) {
            if (params.promise) {
                params.promise.then(function () {
                    params.wavetable = toFloat32Array(src(dtm.array(params.wavetable)));
                });
            } else {
                params.wavetable = toFloat32Array(src(dtm.array(params.wavetable)));
                params.tabLen = params.wavetable.length;
                params.pitch = freqToPitch(params.freq); // ?
            }
        } else {
            params.wavetable = new Float32Array(params.tabLen);
            params.wavetable.forEach(function (v, i) {
                params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
            });
        }
        return synth;
    };

    synth.table = synth.wt = synth.wavetable;

    synth.source = function (src) {
        if (isString(src)) {
            params.source = src;
        }

        return synth;
    };

    synth.load = function (name) {
        if (isString(name)) {
            params.pending = true;
            params.source = name;
            params.type = 'sample';
            synth.pitch(1);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', name, true);
            xhr.responseType = 'arraybuffer';
            params.promise = new Promise(function (resolve) {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        actx.decodeAudioData(xhr.response, function (buf) {
                            params.wavetable = buf.getChannelData(0);
                            params.autoDur = true;
                            resolve(synth);
                        });
                    }
                };
            });

            xhr.send();
        }
        //else if (arg.constructor.name === 'ArrayBuffer') {
        //    actx.decodeAudioData(arg, function (buf) {
        //        params.buffer = buf;
        //        resolve(synth);
        //
        //        if (typeof(cb) !== 'undefined') {
        //            cb(synth);
        //        }
        //    });
        //} else if (arg.constructor === Array) {
        //    var buf = actx.createBuffer(1, arg.length, dtm.wa.actx.sampleRate);
        //    var content = buf.getChannelData(0);
        //    content.forEach(function (val, idx) {
        //        content[idx] = arg[idx];
        //    });
        //
        //    params.buffer = buf;
        //    resolve(synth);
        //
        //    if (typeof(cb) !== 'undefined') {
        //        cb(synth);
        //    }
        //}
        return synth;
    };

    /**
     * @function module:synth#gain
     * @param mult
     * @param post
     * @returns {dtm.synth}
     */
    synth.gain = function (mult, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var gain = new fx.Gain(post);

        mult = typeCheck(mult);
        if (mult) {
            gain.mult = mult;
        }

        if (post) {
            nodes.pFx.push(gain);
        } else {
            nodes.fx.push(gain);
        }
        return synth;
    };

    /**
     * @function module:synth#lpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.lpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var lpf = new fx.LPF(post);

        freq = typeCheck(freq);
        if (freq) {
            lpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            lpf.q = q;
        }

        if (post) {
            nodes.pFx.push(lpf);
        } else {
            nodes.fx.push(lpf);
        }
        return synth;
    };

    /**
     * @function module:synth#hpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.hpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var hpf = new fx.HPF(post);

        freq = typeCheck(freq);
        if (freq) {
            hpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            hpf.q = q;
        }

        if (post) {
            nodes.pFx.push(hpf);
        } else {
            nodes.fx.push(hpf);
        }
        return synth;
    };

    /**
     * @function module:synth#bpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.bpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var bpf = new fx.BPF(post);

        freq = typeCheck(freq);
        if (freq) {
            bpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            bpf.q = q;
        }

        if (post) {
            nodes.pFx.push(bpf);
        } else {
            nodes.fx.push(bpf);
        }
        return synth;
    };

    /**
     * @function module:synth#apf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.apf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var apf = new fx.APF(post);

        freq = typeCheck(freq);
        if (freq) {
            apf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            apf.q = q;
        }

        if (post) {
            nodes.pFx.push(apf);
        } else {
            nodes.fx.push(apf);
        }
        return synth;
    };

    /**
     * @function module:synth#delay
     * @param mix
     * @param time
     * @param feedback
     * @param post
     * @returns {dtm.synth}
     */
    synth.delay = function (mix, time, feedback, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var delay = new fx.Delay(post);

        mix = typeCheck(mix);
        if (mix) {
            delay.mix = mix;
        }

        time = typeCheck(time);
        if (time) {
            delay.time = time;
        }

        feedback = typeCheck(feedback);
        if (feedback) {
            delay.feedback = feedback;
        }

        if (post) {
            nodes.pFx.push(delay);
        } else {
            nodes.fx.push(delay);
        }
        return synth;
    };

    synth.reverb = function (mix, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var verb = new fx.Reverb(post);

        mix = typeCheck(mix);
        if (mix) {
            verb.mix = mix;
        }

        if (post) {
            nodes.pFx.push(verb);
        } else {
            nodes.fx.push(verb);
        }
        return synth;
    };

    synth.verb = synth.reverb;

    synth.conv = function (src) {
        return synth;
    };

    synth.waveshape = function (src) {
        return synth;
    };

    /**
     * @function module:synth#bq
     * @param bit
     * @returns {dtm.synth}
     */
    synth.bq = function (bit) {
        var bq = new fx.BitQuantizer();

        bit = typeCheck(bit);
        if (bit) {
            bq.bit = bit;
        }
        nodes.pFx.push(bq);
        return synth;
    };

    /**
     * @see {@link module:synth#bq}
     * @type {synth.bq|*}
     */
    synth.bitquantize = synth.bq;

    /**
     * @function module:synth#sh | samphold | samplehold
     * @param samps
     * @returns {dtm.synth}
     */
    synth.sh = function (samps) {
        var sh = new fx.SampleHold();

        samps = typeCheck(samps);
        if (samps) {
            sh.samps = samps;
        }
        nodes.pFx.push(sh);
        return synth;
    };

    synth.samplehold = synth.samphold = synth.sh;

    function typeCheck(src) {
        if (isNestedDtmArray(src)) {
            //return toFloat32Array(src);
            return src;
        } else if (isFunction(src)) {
            //return deferCallback(src);
            return src;
        } else {
            return toFloat32Array(src);
        }
    }

    function check(src) {
        return isNumber(src) ||
            isNumArray(src) ||
            isNestedArray(src) ||
            isNumOrFloat32Array(src) ||
            isNumDtmArray(src) ||
            isNestedNumDtmArray(src);
    }

    function convert(src) {
        if (isNestedNumDtmArray(src)) {
            return src;
        } else if (isNumDtmArray(src)) {
            return dtm.array([src]);
        } else if (isNestedArray(src)) {
            return dtm.array(src);
        } else {
            return dtm.array([toFloat32Array(src)]);
        }
    }

    function map(args, param) {
        if (isFunction(args[0])) {
            var res = args[0](param, synth, params.clock);
            return check(res) ? convert(res) : param;
        } else {
            var argList = argsToArray(args);
            return check(argList) ? convert(argList) : param;
        }
    }


    // TODO: return value type not consistent!
    /**
     * @function module:synth#get
     * @param param
     * @returns {*}
     */
    synth.get = function (param) {
        switch (param) {
            case 'wt':
            case 'wavetable':
                return dtm.array(params.wavetable);
            case 'dur':
                return dtm.array(params.dur);
            case 'phase':
                return getPhase();
            case 'nn':
            case 'notenum':
                return dtm.array(params.notenum);
            case 'freq':
            case 'frequency':
                return dtm.array(params.freq);
            case 'pitch':
                return dtm.array(params.pitch);
            case 'fx':
                return nodes.fx;

            case 'samplerate':
            case 'sr':
            case 'fs':
                return params.sr;

            case 'numsamps':
                return Math.round(params.sr * params.dur);

            default:
                return synth;
        }
    };

    synth.clone = function () {
        var newParams = {};

        objForEach(params, function (v, k) {
            if (['amp', 'notenum', 'freq', 'pitch', 'pan'].indexOf(k) > -1) {
                newParams[k] = {};
                newParams[k].base = v.base.clone();
                newParams[k].add = isDtmArray(v.add) ? v.add.clone() : undefined;
                newParams[k].mult = isDtmArray(v.mult) ? v.mult.clone() : undefined;
                newParams[k].isFinal = v.isFinal;
            } else {
                newParams[k] = v;
            }

        });

        newParams.voiceId = Math.random();
        return dtm.synth().meta.setParams(newParams);
    };

    synth.load.apply(this, arguments);
    return synth;
};

dtm.s = dtm.syn = dtm.synth;

dtm.startWebAudio();
