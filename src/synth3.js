dtm.synth3 = function () {
    var synth = {
        type: 'synth3'
    };

    var params = {
        sr: 44100,
        kr: 4410,
        dur: 1,
        wt: null,
        tabLen: 16384,
        amp: null,
        freq: null,
        curve: false
    };

    params.amp = new Float32Array([1]);
    params.freq = new Float32Array([440 * params.tabLen / params.sr]);
    params.wt = new Float32Array(params.tabLen);
    params.wt.forEach(function (v, i) {
        params.wt[i] = Math.sin(2 * Math.PI * i / params.tabLen);
    });

    var nodes = {
        src: null,
        amp: null,
        out: null,
        fx: [{}],
        fxStr: [{}]
    };

    var fx = {
        lpf: {
            method: 'createBiquadFilter',
            parallel: false,
            mix: 1.0
        },

        //delay: {
        //    method: 'createDelay',
        //    parallel: true,
        //    mix: 0.3
        //},
        lpff: {

        },

        delay: function () {
            var self = this;
            var actx = dtm.wa.actx;

            this.mix = new Float32Array([0.5]);
            this.time = new Float32Array([0.3]);
            this.feedback = new Float32Array([0.5]);

            this.in = actx.createGain();
            this.delay = actx.createDelay();
            this.wet = actx.createGain();
            this.dry = actx.createGain();
            this.fb = actx.createGain();
            this.out = actx.createGain();

            this.in.connect(this.delay);
            this.delay.connect(this.fb);
            this.fb.connect(this.delay);

            this.delay.connect(this.wet);
            this.wet.connect(this.out);

            this.in.connect(this.dry);
            this.dry.connect(this.out);

            this.run = function (time, dur) {
                if (params.curve) {
                    this.wet.gain.setValueCurveAtTime(this.mix, time, dur);
                    this.delay.delayTime.setValueCurveAtTime(this.mix, time, dur);
                    this.fb.gain.setValueCurveAtTime(this.mix, time, dur);
                } else {
                    this.mix.forEach(function (v, i) {
                        self.wet.gain.setValueAtTime(v, time + i/self.mix.length * dur);
                    });
                    this.time.forEach(function (v, i) {
                        self.delay.delayTime.setValueAtTime(v, time + i/self.time.length * dur);
                    });
                    this.feedback.forEach(function (v, i) {
                        self.fb.gain.setValueAtTime(v, time + i/self.feedback.length * dur);
                    });
                }
            };
        }
    };

    synth.play = function (time, dur) {
        // defer
        setTimeout(function () {
            if (typeof(time) !== 'number') {
                time = 0.0;
            }
            if (typeof(dur) !== 'number') {
                dur = params.dur;
            }

            var actx = dtm.wa.actx;
            time += actx.currentTime;

            nodes.src = actx.createBufferSource();
            nodes.amp = actx.createGain();
            nodes.out = actx.createGain();
            nodes.fx[0].out = actx.createGain();

            nodes.src.connect(nodes.amp);
            nodes.amp.connect(nodes.fx[0].out);
            nodes.fx[0].out.gain.value = 1.0;

            for (var n = 1; n < nodes.fx.length; n++) {
                nodes.fx[n-1].out.connect(nodes.fx[n].in);
                nodes.fx[n].run(time, dur);
            }
            nodes.fx[n-1].out.connect(nodes.out);

            //for (var n = 1; n < nodes.fx.length; n++) {
            //    nodes.fx[n].in = actx[fx[nodes.fx[n].type].method]();
            //    nodes.fx[n-1].out.connect(nodes.fx[n].in);
            //
            //    nodes.fx[n].wet = actx.createGain();
            //    nodes.fx[n].out = actx.createGain();
            //
            //    nodes.fx[n].in.connect(nodes.fx[n].wet);
            //    nodes.fx[n].wet.connect(nodes.fx[n].out);
            //
            //    if (fx[nodes.fx[n].type].parallel) {
            //        nodes.fx[n].dry = actx.createGain();
            //        nodes.fx[n-1].out.connect(nodes.fx[n].dry);
            //        nodes.fx[n].dry.connect(nodes.fx[n].out);
            //        nodes.fx[n].dry.gain.value = 1.0;
            //    } else {
            //
            //    }
            //
            //    nodes.fx[n].wet.gain.value = 1.0;
            //    nodes.fx[n].out.gain.value = 1.0;
            //
            //    Object.keys(nodes.fx[n].params).forEach(function (param) {
            //        var curve = nodes.fx[n].params[param];
            //        if (params.curve) {
            //            nodes.fx[n].in[param].setValueCurveAtTime(curve, time, dur);
            //        } else {
            //            curve.forEach(function (v, i) {
            //                nodes.fx[n].in[param].setValueAtTime(v, time + i/curve.length * dur);
            //            });
            //        }
            //    });
            //}

            nodes.out.connect(actx.destination);

            nodes.src.loop = true;
            nodes.src.buffer = actx.createBuffer(1, params.tabLen, params.sr);
            nodes.src.buffer.copyToChannel(params.wt, 0);

            nodes.src.start(time);
            nodes.src.stop(time+dur);

            if (params.curve) {
                nodes.src.playbackRate.setValueCurveAtTime(params.freq, time, dur);
                nodes.amp.gain.setValueCurveAtTime(params.amp, time, dur);
            } else {
                params.freq.forEach(function (v, i) {
                    nodes.src.playbackRate.setValueAtTime(v, time + i/params.freq.length * dur);
                });

                params.amp.forEach(function (v, i) {
                    nodes.amp.gain.setValueAtTime(v, time + i/params.amp.length * dur);
                });
            }

            nodes.out.gain.value = 0.3;
            return synth;
        }, 0);

        return synth;
    };

    synth.dur = function (src, mode) {
        params.dur = src;
        return synth;
    };

    synth.freq = function (src, mode) {
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
            params.freq = new Float32Array(typeCheck(src));
            params.freq.forEach(function (v, i) {
                params.freq[i] = v * params.tabLen / params.sr;
            });
        }
        return synth;
    };

    synth.amp = function (src, mode) {
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
            params.amp = new Float32Array(typeCheck(src));
        }
        return synth;
    };

    synth.wt = function (src, mode) {
        var arr = typeCheck(src);
        if (arr.length !== params.tabLen) {
            arr = dtm.transform.fit(arr, params.tabLen);
        }
        params.wt = new Float32Array(arr);
        return synth;
    };

    synth.nn = function (src, mode) {
        if (typeof(mode) === 'string') {

        } else {
            params.freq = new Float32Array(typeCheck(src));
            params.freq.forEach(function (v, i) {
                params.freq[i] = dtm.value.mtof(v) * params.tabLen/params.sr;
            });
        }
        return synth;
    };
    
    synth.lpf = function (freq, q) {
        var id = nodes.fx.length;
        nodes.fx[id] = {};
        nodes.fx[id].type = 'lpf';
        nodes.fx[id].params = {};

        freq = typeCheck(freq);
        if (freq) {
            nodes.fx[id].params.frequency = new Float32Array(freq);
        }

        q = typeCheck(q);
        if (q) {
            nodes.fx[id].params.Q = new Float32Array(q);
        }

        return synth;
    };

    synth.delay = function (mix, time, feedback) {
        var id = nodes.fx.length;
        nodes.fx[id] = new fx.delay();
        //nodes.fx[id] = {};
        //nodes.fx[id].type = 'delay';
        //nodes.fx[id].params = {};

        mix = typeCheck(mix);
        if (mix) {
            nodes.fx[id].mix = new Float32Array(mix);
        }

        time = typeCheck(time);
        if (time) {
            nodes.fx[id].time = new Float32Array(time);
        }

        feedback = typeCheck(feedback);
        if (feedback) {
            nodes.fx[id].feedback = new Float32Array(feedback);
        }

        return synth;
    };

    function typeCheck(src) {
        if (typeof(src) === 'number') {
            return [src];
        } else if (typeof(src) === 'object') {
            if (src === null) {
                return false;
            } else if (src.constructor === Array) {
                return src;
            } else if (src.hasOwnProperty('type')) {
                if (src.type === 'dtm.array') {
                    return src.get();
                } else if (src.type === 'dtm.synth') {
                    return src.wt;
                }
            }
        } else {
            return false;
        }
    }

    synth.get = function (param) {
        switch (param) {
            case 'fx':
                return nodes.fx;
            default:
                return synth;
        }
    };

    return synth;
};