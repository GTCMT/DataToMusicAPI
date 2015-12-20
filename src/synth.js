/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module synth
 */

/**
 * Creates a new instance of synthesizer object.
 * @function module:synth.synth
 * @returns {dtm.synth}
 */
dtm.synth = function () {
    var synth = {
        type: 'dtm.synth',
        rendered: null,
        promise: null,

        meta: {
            type: 'dtm.synth'
        }
    };

    var params = {
        sr: 44100,
        kr: 4410,
        dur: 1.0,
        wavetable: null,
        rendered: null,
        tabLen: 8192,
        source: 'sine',
        amp: null,
        freq: null,
        pitch: null,
        pan: null,
        curve: false,
        offline: false,
        clock: null,
        baseTime: 0.0,
        lookahead: false,
        autoDur: false,
        voiceId: Math.random(),

        useOfflineContext: true,
        named: []
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

    var nodes = {
        src: null,
        amp: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null
    };

    if (!!arguments.callee.caller) {
        if (arguments.callee.caller.arguments.length > 0) {
            if (typeof(arguments.callee.caller.arguments[0]) === 'object') {
                if (arguments.callee.caller.arguments[0].type === 'dtm.clock') {
                    params.clock = arguments.callee.caller.arguments[0];
                    params.lookahead = true;
                    params.autoDur = true;
                }
            }
        }
    }

    var actx = dtm.wa.actx;
    params.sr = actx.sampleRate;
    var octx = null;

    var init = function () {
        if (typeof(arguments[0]) === 'object') {
            if (arguments[0].hasOwnProperty('type')) {
                if (arguments[0].type === 'dtm.clock') {
                    params.clock = arguments[0];
                    params.lookahead = true;
                    params.autoDur = true;
                }
            }
        }

        params.baseTime = actx.currentTime;

        params.amp = new Float32Array([1]);
        params.freq = new Float32Array([440]);
        params.pitch = freqToPitch(params.freq);
        params.wavetable = new Float32Array(params.tabLen);
        params.wavetable.forEach(function (v, i) {
            params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
        });
        params.pan = new Float32Array([0.0]);
    };

    init.apply(this, arguments);

    function freqToPitch(freqArr) {
        var res = new Float32Array(freqArr.length);
        freqArr.forEach(function (v, i) {
            res[i] = v * params.tabLen / params.sr;
        });
        return res;
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
        //Gain: function (post) {
        //    post = (typeof(post) === 'boolean') ? post : false;
        //    this.mult = new Float32Array([1.0]);
        //
        //    this.run = function (time, dur) {
        //        var ctx = post ? actx : octx;
        //        this.in = ctx.createGain();
        //        this.gain = ctx.createGain();
        //        this.out = ctx.createGain();
        //        this.in.connect(this.gain);
        //        this.gain.connect(this.out);
        //
        //        var curves = [];
        //        curves.push({param: this.gain.gain, value: this.mult});
        //        setParamCurve(time, dur, curves);
        //    }
        //},

        Gain: function (mode) {
            var name = null;
            var post = isBoolean(mode) ? post : false;
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
            post = isBoolean(post) ? post : false;
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
            post = isBoolean(post) ? post : false;
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
            post = isBoolean(post) ? post : false;
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
            post = isBoolean(post) ? post : false;
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
            post = isBoolean(post) ? post : false;
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
        if (typeof(clock) === 'object') {
            if (clock.type === 'dtm.clock') {
                params.clock = clock;
            }
        }
        return synth;
    };

    /**
     * @function module:synth#lookahead
     * @param lookahead
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
        if (isNumber(src)) {
            if (src > 0) {
                params.autoDur = false;
                params.dur = src;
            }
        } else if (isBoolean(src)) {
            params.autoDur = src;
        } else if (src === 'auto') {
            params.autoDur = true;
        }
        return synth;
    };

    synth.offset = function (src) {
        return synth;
    };

    /**
     * Plays
     * @function module:synth#play
     * @param [time=0] {number} Delay in seconds that the synth starts playing
     * @param [dur] {number} Duration in seconds
     * @param [lookahead] {number} Delay in seconds for the s
     * @returns {dtm.synth}
     */
    synth.play = function (time, dur, lookahead) {
        var defer = 0;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        // deferred
        setTimeout(function () {
            //===== type check
            if (isBoolean(time)) {
                if (time) {
                    time = 0.0;
                } else {
                    return synth;
                }
            } else if (!isNumber(time) || time < 0) {
                time = 0.0;
            }

            if (params.autoDur) {
                params.dur = params.clock.get('dur');
            }

            if (!isNumber(dur) || dur <= 0) {
                dur = params.dur;
            } else {
                if (dur > 0) {
                    params.dur = dur;
                }
            }
            //===== end of type check

            dtm.master.addVoice(synth);

            //===============================
            //var test = new OfflineAudioContext(1, (time + dur*4) * params.sr, params.sr);
            //
            //var a = test.createBufferSource();
            //a.buffer = test.createBuffer(1, 100, 44100);
            //a.connect(test.destination);
            //a.start();
            //test.startRendering();
            //test.oncomplete = function () {
            //    //a.disconnect();
            //    console.log('meow');
            //    //test = undefined;
            //};
            //iframe = null;

            octx = new OfflineAudioContext(1, (time + dur*4) * params.sr, params.sr);

            time += octx.currentTime;

            if (params.lookahead) {
                time += params.clock.get('lookahead');
            }

            nodes.src = octx.createBufferSource();
            nodes.amp = octx.createGain();
            nodes.out = octx.createGain();
            nodes.fx[0].out = octx.createGain();
            nodes.src.connect(nodes.amp);
            nodes.amp.connect(nodes.fx[0].out);
            nodes.out.connect(octx.destination);

            for (var n = 1; n < nodes.fx.length; n++) {
                nodes.fx[n].run(time, dur);
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
            curves.push({param: nodes.src.playbackRate, value: params.pitch});
            curves.push({param: nodes.amp.gain, value: params.amp});
            setParamCurve(time, dur, curves);

            nodes.fx[0].out.gain.value = 1.0;
            nodes.out.gain.value = 0.3;

            nodes.src.start(time);
            nodes.src.stop(time+dur);

            octx.startRendering();
            octx.oncomplete = function (e) {
                params.rendered = e.renderedBuffer.getChannelData(0);

                time += params.baseTime;
                if (params.lookahead) {
                    time += params.clock.get('lookahead');
                }

                nodes.rtSrc = actx.createBufferSource();
                nodes.pFx[0].out = actx.createGain();
                var pan = actx.createStereoPanner();
                var out = actx.createGain();
                nodes.rtSrc.connect(nodes.pFx[0].out);
                for (var n = 1; n < nodes.pFx.length; n++) {
                    nodes.pFx[n].run(time, dur);
                    nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                }
                nodes.pFx[n-1].out.connect(pan);
                pan.connect(out);
                out.connect(actx.destination);

                nodes.rtSrc.buffer = actx.createBuffer(1, params.rendered.length, params.sr);
                nodes.rtSrc.buffer.copyToChannel(params.rendered, 0);
                nodes.rtSrc.loop = false;
                nodes.rtSrc.start(time);
                nodes.rtSrc.stop(time + nodes.rtSrc.buffer.length);

                setParamCurve(time, dur, [{param: pan.pan, value: params.pan}]);

                out.gain.value = 1.0;

                nodes.rtSrc.onended = function () {
                    //var key;
                    //for (key in params) {
                    //    if (params.hasOwnProperty(key)) {
                    //        params[key] = undefined;
                    //        delete params[key];
                    //    }
                    //}
                    //for (key in nodes) {
                    //    if (nodes.hasOwnProperty(key)) {
                    //        nodes[key] = undefined;
                    //        delete nodes[key];
                    //    }
                    //}

                    dtm.master.removeVoice(synth);

                    // TODO: these might actually cause memory leak???
                    //octx = undefined;
                    //synth = undefined;
                    //arguments.callee = undefined; // ?
                };

                //synth.rendered = e.renderedBuffer.getChannelData(0).slice(0, dur*params.sr);
            };
        }, defer);

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

    synth.render = function (time, dur) {
        //===== type check
        if (!isNumber(time) || time < 0) {
            time = 0.0;
        }

        if (params.autoDur) {
            params.dur = params.clock.get('dur');
        }

        if (!isNumber(dur)) {
            dur = params.dur;
        } else {
            if (params.dur > 0) {
                params.dur = dur;
            }
        }
        //===== end of type check

        synth.promise = new Promise(function (resolve) {
            // defer
            setTimeout(function () {
                octx = new OfflineAudioContext(1, (time + dur * 4) * params.sr, params.sr);
                time += octx.currentTime;

                nodes.src = octx.createBufferSource();
                nodes.amp = octx.createGain();
                nodes.out = octx.createGain();
                nodes.fx[0].out = octx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(nodes.fx[0].out);
                nodes.out.connect(octx.destination);

                for (var n = 1; n < nodes.fx.length; n++) {
                    nodes.fx[n].run(time, dur);
                    nodes.fx[n - 1].out.connect(nodes.fx[n].in);
                }
                nodes.fx[n - 1].out.connect(nodes.out);

                if (params.source === 'noise') {
                    nodes.src.buffer = octx.createBuffer(1, params.sr / 2, params.sr);
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
                curves.push({param: nodes.src.playbackRate, value: params.pitch});
                curves.push({param: nodes.amp.gain, value: params.amp});
                setParamCurve(time, dur, curves);

                nodes.fx[0].out.gain.value = 1.0;
                nodes.out.gain.value = 0.3;

                nodes.src.start(time);
                nodes.src.stop(time + dur);

                octx.startRendering();

                octx.oncomplete = function (e) {
                    //synth.rendered = e.renderedBuffer.getChannelData(0).slice(0, dur * params.sr);
                    resolve(e.renderedBuffer.getChannelData(0).slice(0, dur * params.sr));
                };
            }, 0);
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

        setTimeout(function () {
            if (nodes.src) {
                nodes.src.stop(time);
            }

            if (nodes.rtSrc) {
                nodes.rtSrc.stop(time);
            }

            dtm.master.removeVoice(synth);
        }, defer);

        return synth;
    };

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

    /**
     * Sets the frequency of the oscillator
     * @function module:synth#freq
     * @param src
     * @param mode
     * @param [post=false] boolean
     * @returns {dtm.synth}
     */
    synth.freq = function (src, mode, post) {
        if (typeof(mode) === 'string') {
            switch (mode) {
                case 'add':
                    break;
                case 'mult':
                case 'dot':
                    break;
                default:
                    break;
            }
        } else {
            src = typeCheck(src);
            if (src) {
                params.freq = src;
                params.pitch = freqToPitch(params.freq);
            }
        }
        return synth;
    };

    /**
     * Sets the pitch of the oscillator by a MIDI note number.
     * @function module:synth#nn | notenum
     * @param src
     * @param mode
     * @param [post=false] {boolean}
     * @returns {dtm.synth}
     */
    synth.nn = function (src, mode, post) {
        if (typeof(mode) === 'string') {

        } else {
            src = typeCheck(src);
            if (src) {
                params.freq = new Float32Array(src.length);
                src.forEach(function (v, i) {
                    params.freq[i] = dtm.value.mtof(v);
                });
                params.pitch = freqToPitch(params.freq);
            }
        }
        return synth;
    };

    synth.notenum = synth.nn;

    // for longer sample playback
    synth.pitch = function (src, mode, post) {
        return synth;
    };

    /**
     * @function module:synth#amp
     * @param src
     * @param mode
     * @param post
     * @returns {dtm.synth}
     */
    synth.amp = function (src, mode, post) {
        if (typeof(mode) === 'string') {
            var arr = typeCheck(src);

            // TODO: fit to the longer array
            if (arr.length !== params.amp.length) {
                arr = dtm.transform.fit(arr, params.amp.length, 'linear');
            }

            switch (mode) {
                case 'add':
                    params.amp.forEach(function (v, i) {
                        params.amp[i] = v + arr[i];
                    });
                    break;
                case 'mult':
                case 'dot':
                    params.amp.forEach(function (v, i) {
                        params.amp[i] = v * arr[i];
                    });
                    break;
                default:
                    break;
            }
        } else {
            src = typeCheck(src);
            if (src) {
                params.amp = src;
            }
        }
        return synth;
    };

    /**
     * @function module:synth#pan
     * @param src
     * @returns {dtm.synth}
     */
    synth.pan = function (src) {
        src = typeCheck(src);
        if (src) {
            params.pan = src;
        }
        return synth;
    };

    synth.ts = function (src) {
        return synth;
    };

    synth.ps = function (src) {

    };

    synth.wt = function (src, mode) {
        src = typeCheck(src);
        if (src) {
            //if (src.length !== params.tabLen) {
            //    if (src.length > 1000) {
            //        src = dtm.transform.fit(src, params.tabLen, 'step');
            //    } else {
            //        src = dtm.transform.fit(src, params.tabLen, 'linear');
            //    }
            //}
            params.wavetable = src;
            params.tabLen = src.length;
            params.pitch = freqToPitch(params.freq);
        } else {
            params.wavetable = new Float32Array(params.tabLen);
            params.wavetable.forEach(function (v, i) {
                params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
            });
        }
        return synth;
    };

    synth.wavetable = synth.wt;

    synth.source = function (src) {
        if (typeof(src) === 'string') {
            params.source = src;
        }

        return synth;
    };

    /**
     * @function module:synth#gain
     * @param mult
     * @param post
     * @returns {dtm.synth}
     */
    synth.gain = function (mult, post) {
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

    synth.am = function (src) {
        src = typeCheck(src);
        if (src) {

        }
        return synth;
    };

    synth.fm = function (src) {
        src = typeCheck(src);
        if (src) {
            src = dtm.transform.fit(src, Math.round(params.tabLen/10), 'linear');
            params.freq = dtm.transform.fit(params.freq, Math.round(params.tabLen/10), 'step');
            params.freq.forEach(function (v, i) {
                params.freq[i] = v + src[i];
            });
        }
        return synth;
    };

    synth.waveshape = function (src) {
        return synth;
    };

    /**
     * @function module:synth#bq | bitquantize | crush
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

    synth.crush = synth.bitquantize = synth.bq;

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
        if (isNumber(src)) {
            return new Float32Array([src]);
        } else if (typeof(src) === 'object' || typeof(src) === 'function') {
            if (src === null) {
                return false;
            } else if (src.constructor === Float32Array) {
                return src;
            } else if (isNumArray(src)) {
                return new Float32Array(src);
            } else if (isDtmObj(src)) {
                if (isDtmArray(src)) {
                    if (src.get().constructor === Array) {
                        //var foo = new Promise(function (resolve) {
                        //    resolve(new Float32Array(src.get()));
                        //});
                        return new Float32Array(src.get());
                    } else if (src.get().constructor === Float32Array) {
                        return src.get();
                    }
                } else if (src.meta.type === 'dtm.synth') {
                    //console.log(src.promise);
                    //src.promise.then(function (val) {
                    //    console.log(val);
                    //});
                    //console.log(src.rendered);
                    return src.rendered;
                } else if (src.meta.type === 'dtm.model') {
                    return new Float32Array(src.get());
                }
            }
        } else {
            return false;
        }
    }

    /**
     * @function module:synth#get
     * @param param
     * @returns {*}
     */
    synth.get = function (param) {
        switch (param) {
            case 'fx':
                return nodes.fx;
            default:
                return synth;
        }
    };

    //synth.wt.apply(this, arguments);

    return synth;
};

dtm.s = dtm.syn = dtm.synth;

dtm.startWebAudio();
