dtm.synth2 = function (source) {
    var synth = {
        type: 'synth2',
        rendered: null
    };

    var params = {
        sr: 44100,
        kr: 4410,
        dur: 1,
        wt: null,
        tabLen: 8192,
        amp: null,
        freq: null,
        curve: false,
        offline: false
    };

    params.amp = new Float32Array([1]);
    params.freq = new Float32Array([440 * params.tabLen / params.sr]);
    params.wt = new Float32Array(params.tabLen);
    params.wt.forEach(function (v, i) {
        params.wt[i] = Math.sin(2 * Math.PI * i / params.tabLen);
    });

    var actx = null;
    if (params.offline) {
        actx = new OfflineAudioContext(1, params.dur*params.sr, params.sr);
    } else {
        actx = dtm.wa.actx;
    }

    var nodes = {
        src: null,
        amp: null,
        out: null,
        fx: [{}]
    };

    function setParamCurve (time, dur, curves) {
        curves.forEach(function (curve) {
            if (params.curve) {
                curve.param.setValueCurveAtTime(curve.value, time, dur);
            } else {
                curve.value.forEach(function (v, i) {
                    curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                });
            }
        });
    }

    var fx = {
        LPF: function () {
            this.freq = new Float32Array([20000.0]);
            this.q = new Float32Array([1.0]);

            this.in = actx.createGain();
            this.lpf = actx.createBiquadFilter();
            this.out = actx.createGain();
            this.in.connect(this.lpf);
            this.lpf.connect(this.out);

            this.run = function (time, dur) {
                var curves = [];
                curves.push({param: this.lpf.frequency, value: this.freq});
                curves.push({param: this.lpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        Delay: function () {
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
                var curves = [];
                curves.push({param: this.wet.gain, value: this.mix});
                curves.push({param: this.delay.delayTime, value: this.time});
                curves.push({param: this.fb.gain, value: this.feedback});
                setParamCurve(time, dur, curves);
            };
        },

        BitQuantizer: function () {
            this.bit = new Float32Array([16]);

            this.in = actx.createGain();
            this.out = actx.createGain();
            this.in.connect(this.out);

            this.run = function (time, dur) {
                params.wt.forEach(function (v, i) {
                    params.wt[i] = v;
                });
            };
        },

        WaveShaper: function () {

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

            time += actx.currentTime;

            nodes.src = actx.createBufferSource();
            nodes.amp = actx.createGain();
            nodes.out = actx.createGain();
            nodes.fx[0].out = actx.createGain();
            nodes.src.connect(nodes.amp);
            nodes.amp.connect(nodes.fx[0].out);
            nodes.out.connect(actx.destination);

            for (var n = 1; n < nodes.fx.length; n++) {
                nodes.fx[n-1].out.connect(nodes.fx[n].in);
                nodes.fx[n].run(time, dur);
            }
            nodes.fx[n-1].out.connect(nodes.out);

            if (source === 'noise') {
                nodes.src.buffer = actx.createBuffer(1, params.sr/2, params.sr);
                var chData = nodes.src.buffer.getChannelData(0);
                chData.forEach(function (v, i) {
                    chData[i] = Math.random() * 2.0 - 1.0;
                });
                nodes.src.loop = true;
            } else {
                nodes.src.buffer = actx.createBuffer(1, params.tabLen, params.sr);
                nodes.src.buffer.copyToChannel(params.wt, 0);
                nodes.src.loop = true;
            }

            var curves = [];
            curves.push({param: nodes.src.playbackRate, value: params.freq});
            curves.push({param: nodes.amp.gain, value: params.amp});
            setParamCurve(time, dur, curves);

            nodes.fx[0].out.gain.value = 1.0;
            nodes.out.gain.value = 0.3;

            nodes.src.start(time);
            nodes.src.stop(time+dur);

            if (params.offline) {
                actx.startRendering();
                actx.oncomplete = function (e) {
                    synth.rendered = e.renderedBuffer.getChannelData(0);
                };
            }
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
        src = typeCheck(src);
        if (src) {
            if (src.length !== params.tabLen) {
                src = dtm.transform.fit(src, params.tabLen);
            }
            params.wt = new Float32Array(src);
        } else {
            params.wt = new Float32Array(params.tabLen);
            params.wt.forEach(function (v, i) {
                params.wt[i] = Math.sin(2 * Math.PI * i / params.tabLen);
            });
        }
        return synth;
    };

    synth.nn = function (src, mode) {
        if (typeof(mode) === 'string') {

        } else {
            src = typeCheck(src);
            if (src) {
                params.freq = new Float32Array(src);
                params.freq.forEach(function (v, i) {
                    params.freq[i] = dtm.value.mtof(v) * params.tabLen/params.sr;
                });
            }
        }
        return synth;
    };

    synth.lpf = function (freq, q) {
        var id = nodes.fx.length;
        nodes.fx[id] = new fx.LPF();

        freq = typeCheck(freq);
        if (freq) {
            nodes.fx[id].freq = new Float32Array(freq);
        }

        q = typeCheck(q);
        if (q) {
            nodes.fx[id].q = new Float32Array(q);
        }

        return synth;
    };

    synth.delay = function (mix, time, feedback) {
        var id = nodes.fx.length;
        nodes.fx[id] = new fx.Delay();

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

    synth.bq = function (bit) {
        var id = nodes.fx.length;
        nodes.fx[id] = new fx.BitQuantizer();

        bit = typeCheck(bit);
        if (bit) {
            nodes.fx[id].bit = new Float32Array(bit);
        }
        return synth;
    };

    synth.sh = function (src) {
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
                if (isDtmArray(src)) {
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