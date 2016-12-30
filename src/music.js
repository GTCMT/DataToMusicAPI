/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module music
 */

///**
// * Creates a new instance of synthesizer object.
// * @function module:music.music
// * @returns {dtm.music}
// */
dtm.m = dtm.music = function () {
    var music = new Music();
    return music.init.apply(music, arguments);
};

dtm.music.offline = function (bool) {
    if (isBoolean(bool)) {
        Music.prototype.offline = bool;
    } else if (isEmpy(bool)) {
        Music.prototype.offline = true;
    }
};

var fx = {
    // TODO: named param mode not complete
    Gain: function (self, mode) {
        var name = null;
        var post = isBoolean(mode) ? mode : self.params.rtFxOnly;
        if (isString(mode)) {
            post = true;
            name = mode;
        }
        this.mult = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.gain = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.gain);
            this.gain.connect(this.out);

            var curves = [];
            curves.push({param: this.gain.gain, value: this.mult});
            self.setParamCurve(time, dur, curves);

            if (!isEmpty(name)) {
                self.params.named[name] = this.gain.gain;
            }
        }
    },

    LPF: function (self, post) {
        this.freq = new Float32Array([20000.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.lpf = ctx.createBiquadFilter();
            this.out = ctx.createGain();
            this.in.connect(this.lpf);
            this.lpf.connect(this.out);

            var curves = [];
            curves.push({param: this.lpf.frequency, value: this.freq});
            curves.push({param: this.lpf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    HPF: function (self, post) {
        this.freq = new Float32Array([30.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.hpf = ctx.createBiquadFilter();
            this.hpf.type = 'highpass';
            this.out = ctx.createGain();
            this.in.connect(this.hpf);
            this.hpf.connect(this.out);

            var curves = [];
            curves.push({param: this.hpf.frequency, value: this.freq});
            curves.push({param: this.hpf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    BPF: function (self, post) {
        this.freq = new Float32Array([30.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.bpf = ctx.createBiquadFilter();
            this.bpf.type = 'bandpass';
            this.out = ctx.createGain();
            this.in.connect(this.bpf);
            this.bpf.connect(this.out);

            var curves = [];
            curves.push({param: this.bpf.frequency, value: this.freq});
            curves.push({param: this.bpf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    APF: function (self, post) {
        this.freq = new Float32Array([30.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.apf = ctx.createBiquadFilter();
            this.apf.type = 'allpass';
            this.out = ctx.createGain();
            this.in.connect(this.apf);
            this.apf.connect(this.out);

            var curves = [];
            curves.push({param: this.apf.frequency, value: this.freq});
            curves.push({param: this.apf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    Delay: function (self, post) {
        this.mix = new Float32Array([0.5]);
        this.time = new Float32Array([0.3]);
        this.feedback = new Float32Array([0.5]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
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
            self.setParamCurve(time, dur, curves);
        };
    },

    Reverb: function (self, post) {
        this.mix = toFloat32Array(0.5);
        //this.time = toFloat32Array(2.0);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
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

            // var size = self.params.sr * 2;
            var size = dtm.wa.buffs.verbIr.length;
            var ir = ctx.createBuffer(1, size, self.params.sr);
            ir.copyToChannel(dtm.wa.buffs.verbIr.get(), 0);
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
            self.setParamCurve(time, dur, curves);
        }
    },

    Convolver: function (self, post) {
        this.mix = toFloat32Array(1);
        this.tgt = toFloat32Array(1);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.conv = ctx.createConvolver();
            this.wet = ctx.createGain();
            this.dry = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.conv);
            this.conv.connect(this.wet);
            this.wet.connect(this.out);
            this.in.connect(this.dry);
            this.dry.connect(this.out);

            var size = this.tgt.length;
            var tgt = ctx.createBuffer(1, size, self.params.sr);
            tgt.copyToChannel(this.tgt, 0);
            this.conv.buffer = tgt;

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
            self.setParamCurve(time, dur, curves);
        }
    },

    BitQuantizer: function (self) {
        this.bit = new Float32Array([16]);
        var that = this;

        this.run = function (time, dur) {
            var ctx = Music.prototype.actx;
            this.in = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.out);

            var interval = dur * self.params.sr / this.bit.length;
            this.bit.forEach(function (v, i) {
                // allowing fractional values...
                if (v > 16) {
                    v = 16;
                } else if (v < 1) {
                    v = 1;
                }
                that.bit[i] = v;
            });

            if (Music.prototype.offline) {
                self.params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.bit.length-1) {
                        blockNum = that.bit.length-1;
                    }
                    var res = Math.pow(2, that.bit[blockNum]);
                    self.params.rendered[i] = Math.round(v * res) / res;
                });
            } else {
                self.params.wavetable.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.bit.length-1) {
                        blockNum = that.bit.length-1;
                    }
                    var res = Math.pow(2, that.bit[blockNum]);
                    self.params.wavetable[i] = Math.round(v * res) / res;
                });
            }
        };
    },

    SampleHold: function (self) {
        this.samps = new Float32Array([1]);
        var that = this;

        this.run = function (time, dur) {
            var ctx = Music.prototype.actx;
            this.in = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.out);

            var interval = dur * self.params.sr / this.samps.length;
            this.samps.forEach(function (v, i) {
                v = Math.round(v);
                if (v < 1) {
                    v = 1;
                }
                that.samps[i] = v;
            });

            if (Music.prototype.offline) {
                self.params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.samps.length - 1) {
                        blockNum = that.samps.length - 1;
                    }
                    var samps = that.samps[blockNum];
                    var hold = 0;
                    if (i % samps === 0) {
                        hold = v;
                    }
                    self.params.rendered[i] = hold;
                });
            } else {
                self.params.wavetable.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.samps.length - 1) {
                        blockNum = that.samps.length - 1;
                    }
                    var samps = that.samps[blockNum];
                    var hold = 0;
                    if (i % samps === 0) {
                        hold = v;
                    }
                    self.params.wavetable[i] = hold;
                });
            }
        }
    }
};

function Music() {
    function music() {
        return music.clone();
    }

    music.params = {
        sr: 44100,
        dur: {
            base: dtm.data([[1]]),
            auto: true
        },
        interval: {
            base: dtm.data([[1]]),
            auto: true
        },
        play: { base: dtm.data([[true]]) },
        offset: 0.0,
        repeat: 1,
        autoRep: true,
        iteration: 0,
        sequence: null,

        onNoteCallback: [],

        interp: 'step',

        baseTime: 0.0, // for offline rendering
        voiceId: Math.random(),
        startTime: 0.0,
        phase: 0.0,
        playing: false,

        data: null,
        wavetable: null,
        rendered: null,
        tabLen: 1024,
        source: 'sine',
        type: 'synth',
        promise: null,
        pending: false,

        amp: { base: dtm.data([[0.5]]) },

        notenum: {
            base: dtm.data([[69]]),
            isFinal: true
        },
        freq: {
            base: dtm.data([[440]]),
            isFinal: false
        },
        pitch: {
            base: dtm.data([[1]]),
            isFinal: false
        },

        pan: { base: dtm.data([[0]]) },
        curve: false,
        offline: false,

        rtFxOnly: true,
        named: []
    };

    music.nodes = {
        src: null,
        amp: null,
        pan: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null,
        phasor: null
    };

    music.meta = {
        type: 'dtm.music',
        setParams: function (newParams) {
            music.params = newParams;
            return music;
        },
        setNodes: function (newNodes) {
            music.nodes = newNodes;
            return music;
        },
        deferIncr: 1
    };

    music.__proto__ = Music.prototype;
    return music;
}

Music.prototype = Object.create(Function.prototype);

Music.prototype.actx = dtm.wa.actx;
Music.prototype.octx = null;
Music.prototype.offline = false;
Music.prototype.dummyBuffer = Music.prototype.actx.createBuffer(1, 1, 44100);
Music.prototype.defaultSize = 512;
Music.prototype.defaultWt = dtm.sine(Music.prototype.defaultSize);

Music.prototype.init = function () {
    var that = this;
    var actx = Music.prototype.actx;

    that.params.sr = actx.sampleRate;
    that.params.tabLen = Music.prototype.defaultSize;

    if (isFunction(arguments[0])) {
        that.params.onNoteCallback.push(arguments[0]);
    } else if (isInteger(arguments[0]) && arguments[0] > 0) {
        that.params.tabLen = arguments[0];
    }

    that.params.baseTime = actx.currentTime;

    // TODO: move that to global (master?)
    if (that.params.tabLen !== Music.prototype.defaultSize) {
        that.params.wavetable = new Float32Array(that.params.tabLen);
        that.params.wavetable.forEach(function (v, i) {
            that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        });
    } else {
        that.params.wavetable = Music.prototype.defaultWt.get();
    }

    return that;
};

Music.prototype.size = Music.prototype.len = function (val) {
    var that = this;

    if (isInteger(val) && val > 0) {
        that.params.tabLen = val;
        that.params.wavetable = new Float32Array(that.params.tabLen);
        that.params.wavetable.forEach(function (v, i) {
            that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        });
    }
    return that;
};

Music.prototype.mode = function (mode) {
    return this;
};

Music.prototype.clone = function () {
    var newParams = {};

    try {
        objForEach(this.params, function (v, k) {
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
    } catch (e) {
        console.log(e);
    }

    newParams.voiceId = Math.random();
    return dtm.music().meta.setParams(newParams);
};

/**
 * Returns parameters
 * @function module:music#get
 * @param param
 * @returns {*}
 */
Music.prototype.get = function (param) {
    switch (param) {
        case 'dur':
        case 'duration':
            return this.params.dur;
        case 'source':
            return this.params.source;
        case 'tabLen':
            return this.params.tabLen;
        case 'wavetable':
            return this.params.wavetable;
        case 'id':
            return this.params.voiceId;
        default:
            return this;
    }
};

/**
 * Plays
 * @function module:music#play
 * @returns {dtm.music}
 */
Music.prototype.play = Music.prototype.p = function (fn) {
    var that = this;
    var actx = Music.prototype.actx;

    if (isFunction(fn)) {
        that.params.onNoteCallback.push(fn);
    }

    var defer = 0.01;

    // if playSwitch is a function

    if (that.params.pending) {
        that.params.pending = false;
        that.params.promise.then(function () {
            that.play();
            return that;
        });
        return that;
    }

    // TODO: use promise-all rather than deferring
    // deferred
    setTimeout(function () {
        var seqValue = that.params.sequence ? that.params.sequence[mod(that.params.iteration, that.params.sequence.length)] : that.params.iteration;

        // TODO: use promise
        that.params.onNoteCallback.forEach(function (fn) {
            fn(that, seqValue);
        });

        var amp = processParam(that.params.amp, seqValue);
        var pan = processParam(that.params.pan, seqValue);
        var pitch;

        if (that.params.notenum.isFinal) {
            pitch = processParam(that.params.notenum, seqValue).map(function (v) {
                return that.freqToPitch(mtof(v));
            });
        } else if (that.params.freq.isFinal) {
            pitch = processParam(that.params.freq, seqValue).map(function (v) {
                return that.freqToPitch(v);
            });
        } else {
            pitch = processParam(that.params.pitch, seqValue);
        }

        var interval, dur;
        interval = processParam(that.params.interval, seqValue)[0];

        if (interval <= 0) {
            interval = 0;
        }

        if (that.params.dur.auto && interval !== 0) {
            if (that.params.dur.auto === 'sample') {
                that.params.tabLen = that.params.wavetable.length;

                dur = 0;
                pitch.forEach(function (v) {
                    dur += that.params.tabLen / that.params.sr / v / pitch.length;
                });
            } else {
                dur = interval;
            }
        } else {
            dur = processParam(that.params.dur, seqValue)[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }

        var offset = that.params.offset;
        var curves;

        dtm.master.addVoice(that);

        //===============================
        if (Music.prototype.offline) {
            var octx = new OfflineAudioContext(1, (offset + dur*4) * that.params.sr, that.params.sr);

            offset += octx.currentTime;

            that.nodes.src = octx.createBufferSource();
            that.nodes.amp = octx.createGain();
            that.nodes.out = octx.createGain();
            that.nodes.fx[0].out = octx.createGain();
            that.nodes.src.connect(that.nodes.amp);
            that.nodes.amp.connect(that.nodes.fx[0].out);
            that.nodes.out.connect(octx.destination);

            for (var n = 1; n < that.nodes.fx.length; n++) {
                that.nodes.fx[n].run(offset, dur);
                that.nodes.fx[n-1].out.connect(that.nodes.fx[n].in);
            }
            that.nodes.fx[n-1].out.connect(that.nodes.out);

            if (that.params.source === 'noise') {
                that.nodes.src.buffer = octx.createBuffer(1, that.params.sr/2, that.params.sr);
                var chData = that.nodes.src.buffer.getChannelData(0);
                chData.forEach(function (v, i) {
                    chData[i] = Math.random() * 2.0 - 1.0;
                });
                that.nodes.src.loop = true;
            } else {
                that.nodes.src.buffer = octx.createBuffer(1, that.params.tabLen, that.params.sr);
                that.nodes.src.buffer.copyToChannel(that.params.wavetable, 0);
                that.nodes.src.loop = true;
            }

            curves = [];
            curves.push({param: that.nodes.src.playbackRate, value: pitch});
            curves.push({param: that.nodes.amp.gain, value: amp});
            that.setParamCurve(offset, dur, curves);

            that.nodes.fx[0].out.gain.value = 1.0;
            that.nodes.out.gain.value = 0.3;

            that.nodes.src.start(offset);
            that.nodes.src.stop(offset + dur);

            octx.startRendering();
            octx.oncomplete = function (e) {
                that.params.rendered = e.renderedBuffer.getChannelData(0);

                offset += that.params.baseTime;

                that.nodes.rtSrc = actx.createBufferSource();
                that.nodes.pFx[0].out = actx.createGain();
                that.nodes.pan = actx.createStereoPanner();
                var out = actx.createGain();
                that.nodes.rtSrc.connect(that.nodes.pFx[0].out);
                for (var n = 1; n < that.nodes.pFx.length; n++) {
                    that.nodes.pFx[n].run(offset, dur);
                    that.nodes.pFx[n-1].out.connect(that.nodes.pFx[n].in);
                }
                that.nodes.pFx[n-1].out.connect(that.nodes.pan);
                that.nodes.pan.connect(out);
                out.connect(actx.destination);

                that.nodes.rtSrc.buffer = actx.createBuffer(1, that.params.rendered.length, that.params.sr);
                that.nodes.rtSrc.buffer.copyToChannel(that.params.rendered, 0);
                that.nodes.rtSrc.loop = false;
                that.nodes.rtSrc.start(offset);
                that.nodes.rtSrc.stop(offset + that.nodes.rtSrc.buffer.length);

                that.setParamCurve(offset, dur, [{param: that.nodes.pan.pan, value: pan}]);

                out.gain.value = 1.0;

                that.nodes.rtSrc.onended = function () {
                    dtm.master.removeVoice(that);

                    if (that.params.repeat > 1) {
                        that.play(); // TODO: pass any argument?
                        that.params.repeat--;
                    }
                };
            };
        } else {
            offset += actx.currentTime;

            that.params.startTime = offset;

            that.nodes.src = actx.createBufferSource();
            that.nodes.amp = actx.createGain();
            that.nodes.pFx[0].out = actx.createGain();

            if (actx.createStereoPanner) {
                that.nodes.pan = actx.createStereoPanner();
            } else {
                that.nodes.left = actx.createGain();
                that.nodes.right = actx.createGain();
                that.nodes.merger = actx.createChannelMerger(2);
            }

            var declipper = actx.createGain();
            var out = actx.createGain();
            that.nodes.src.connect(that.nodes.amp);
            that.nodes.amp.connect(declipper);
            declipper.connect(that.nodes.pFx[0].out);
            for (var n = 1; n < that.nodes.pFx.length; n++) {
                that.nodes.pFx[n].run(offset, dur);
                that.nodes.pFx[n-1].out.connect(that.nodes.pFx[n].in);
            }

            if (actx.createStereoPanner) {
                that.nodes.pFx[n-1].out.connect(that.nodes.pan);
                that.nodes.pan.connect(out);
            } else {
                that.nodes.pFx[n-1].out.connect(that.nodes.left);
                that.nodes.pFx[n-1].out.connect(that.nodes.right);
                that.nodes.left.connect(that.nodes.merger, 0, 0);
                that.nodes.right.connect(that.nodes.merger, 0, 1);
                that.nodes.merger.connect(out);
            }
            out.connect(actx.destination);

            var dummySrc = actx.createBufferSource();
            dummySrc.buffer = Music.prototype.dummyBuffer;
            dummySrc.loop = true;
            var silence = actx.createGain();
            silence.gain.value = 1;
            dummySrc.connect(silence);
            silence.connect(out);

            var tempBuff = actx.createBuffer(1, that.params.tabLen, that.params.sr); // FF needs this stupid procedure of storing to a variable (Feb 18, 2016)
            if (tempBuff.copyToChannel) {
                // for Safari
                tempBuff.copyToChannel(that.params.wavetable, 0);
            } else {
                var tempTempBuff = tempBuff.getChannelData(0);
                tempTempBuff.forEach(function (v, i) {
                    tempTempBuff[i] = that.params.wavetable[i];
                });
            }
            that.nodes.src.buffer = tempBuff;
            that.nodes.src.loop = (that.params.type !== 'sample');

            // onended was sometimes not getting registered before src.start for some reason
            var p = new Promise(function (resolve) {
                dummySrc.onended = function () {
                    if (interval >= dur) {
                        dtm.master.removeVoice(that);
                    }

                    // rep(1) would only play once
                    if (that.params.repeat > 1) {
                        that.play(); // TODO: pass any argument?
                        that.params.repeat--;
                    }
                };

                that.nodes.src.onended = function () {
                    if (dur > interval) {
                        dtm.master.removeVoice(that);
                    }
                    that.params.playing = false;
                };

                resolve();
            });

            p.then(function () {
                dummySrc.start(offset);
                dummySrc.stop(offset + interval);
                that.nodes.src.start(offset + 0.00001);
                that.nodes.src.stop(offset + dur + 0.00001);

                // ignoring start offset for now
                // need a timer
                that.params.playing = true;
            });

            curves = [];
            curves.push({param: that.nodes.src.playbackRate, value: pitch});
            curves.push({param: that.nodes.amp.gain, value: amp});
            that.setParamCurve(offset, dur, curves);

            if (actx.createStereoPanner) {
                that.setParamCurve(offset, dur, [{param: that.nodes.pan.pan, value: pan}]);
            } else {
                var left = pan.map(function (v) {
                    if (v < 0) {
                        return 0.5;
                    } else {
                        return 0.5 - v*0.5;
                    }
                });

                var right = pan.map(function (v) {
                    if (v < 0) {
                        return 0.5 + v*0.5;
                    } else {
                        return 0.5;
                    }
                });
                that.setParamCurve(offset, dur, [{param: that.nodes.left.gain, value: left}]);
                that.setParamCurve(offset, dur, [{param: that.nodes.right.gain, value: right}]);
            }

            that.nodes.pFx[0].out.gain.value = 1.0; // ?
            out.gain.value = 1.0;

            var ramp = 0.005;
            declipper.gain.setValueAtTime(0.0, offset);
            declipper.gain.linearRampToValueAtTime(1.0, offset + ramp);
            declipper.gain.setTargetAtTime(0.0, offset + dur - ramp, ramp * 0.3);
        }

        that.params.iteration++;

    }, defer + that.meta.deferIncr);

    return that;
};

Music.prototype.start = function () {
    this.rep();
    this.play.apply(this, arguments);
    return this;
};

Music.prototype.trigger = Music.prototype.trig = Music.prototype.t = function () {
    this.mute();
    this.play.apply(this, arguments);
    return this;
};

Music.prototype.run = Music.prototype.r = function () {
    this.mute().rep();
    this.play.apply(this, arguments);
    return this;
};

/**
 * Stops the currently playing sound.
 * @function module:music#stop
 * @param [time=0] {number} Delay in seconds for the stop action to be called.
 * @returns {dtm.music}
 */
Music.prototype.stop = Music.prototype.s = function (time) {
    var that = this;

    var defer = 0.0;

    if (!isNumber(time)) {
        time = 0.0; // TODO: time not same as rt rendering time
    }

    that.params.repeat = 0;

    setTimeout(function () {
        if (that.nodes.src) {
            that.nodes.src.stop(time);
        }

        if (that.nodes.rtSrc) {
            that.nodes.rtSrc.stop(time);
        }

        dtm.master.removeVoice(that);
    }, defer + that.meta.deferIncr*2);

    return that;
};

Music.prototype.offset = function (src) {
    this.params.offset = toFloat32Array(src)[0];
    return this;
};

Music.prototype.mute = function (bool) {
    if (isBoolean(bool)) {
        var val = bool ? 0 : 1;
        this.gain(val);
    } else {
        this.gain(0);
    }
    return this;
};

Music.prototype.unmute = function () {
    this.gain(1);
    return this;
};

Music.prototype.sync = Music.prototype.follow = function (input) {
    if (isDtmSynth(input)) {
        this.interval(input);
        this.seq(input);
    }
    return this;
};

Music.prototype.mimic = function (input) {
    if (isDtmSynth(input)) {
        // synth = input();
        this.interval(input);
        this.seq(input);
        this.notenum(input);
        this.amplitude(input);
        this.pan(input);
        this.wavetable(input);
    }
    return this;
};

Music.prototype.each = Music.prototype.do = Music.prototype.call = Music.prototype.onnote = function (fn) {
    if (isFunction(fn)) {
        this.params.onNoteCallback.push(fn);
    }
    return this;
};

// set order of the iteration
Music.prototype.sequence = Music.prototype.seq = function (input) {
    if (input === 'reset' || input === 'clear' || input === []) {
        this.params.sequence = null;
    }

    if (isDtmSynth(input)) {
        this.params.sequence = [input.seq()];
    } else if (argsAreSingleVals(arguments) && arguments.length > 1) {
        if (isNumOrFloat32Array(argsToArray(arguments))) {
            this.params.sequence = argsToArray(arguments);
        }
    } else if (isNumber(input)) {
        this.params.sequence = [input];
    } else if (isNumOrFloat32Array(input)) {
        this.params.sequence = input;
    } else if (isNumDtmArray(input)) {
        this.params.sequence = input.get();
    } else {
        return this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;
    }

    return this;
};

// bad name, should be "reset"?
Music.prototype.iter = Music.prototype.incr =function (val) {
    if (isInteger(val)) {
        this.params.iteration = val;
        return this;
    }
    return this.params.iteration;
};

Music.prototype.phase = function () {
    this.params.phase = (Music.prototype.actx.currentTime - this.params.startTime) / this.params.dur.base(this.seq()).get(0);
    if (this.params.phase < 0.0) {
        this.params.phase = 0.0;
    } else if (this.params.phase > 1.0) {
        this.params.phase = 1.0;
    }
    return this.params.phase;
};

Music.prototype.repeat = Music.prototype.rep = function (times, interval) {
    if (isInteger(times) && times > 0) {
        this.params.repeat = times;
    } else if (isEmpty(times) || times === Infinity || times === true) {
        this.params.repeat = Infinity;
    }
    return this;
};

Music.prototype.interval = Music.prototype.int = Music.prototype.i = function () {
    var depth = 2;

    if (arguments.length === 0) {
        return this.params.interval.base();
    }

    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].interval();
        this.params.interval.base = check(res, depth) ? convertShallow(res) : this.params.interval.base;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.interval.base, this);
        this.params.interval.base = check(res, depth) ? convertShallow(res) : this.params.interval.base;
    } else {
        var argList = argsToArray(arguments);
        this.params.interval.base = check(argList) ? convertShallow(argList) : this.params.interval.base;
    }

    this.params.interval.auto = false;

    if (this.params.dur.auto) {
        this.params.dur.auto = 'interval';
    }

    return this;
};

Music.prototype.bpm = function () {
    if (arguments.length === 0) {
        return this.params.interval.base().reciprocal()
    }
    var depth = 2;

    if (isFunction(arguments[0])) {
        var res = arguments[0](this.params.interval.base, this);
        this.params.interval.base = check(res, depth) ? convertShallow(res).reciprocal() : this.params.interval.base;
    } else {
        var argList = argsToArray(arguments);
        this.params.interval.base = check(argList) ? convertShallow(argList).reciprocal() : this.params.interval.base;
    }

    this.params.interval.auto = false;

    if (this.params.dur.auto) {
        this.params.dur.auto = 'interval';
    }

    return this;
};

/**
 * Takes array types with only up to the max depth of 1.
 * @function module:music#dur
 * @returns {dtm.music}
 */
Music.prototype.duration = Music.prototype.dur = Music.prototype.d = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        if (this.params.dur.auto) {
            return this.params.interval.base(seqValue);
        } else {
            return this.params.dur.base(seqValue);
        }
    }

    var depth = 2;
    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].duration();
        this.params.dur.base = check(res, depth) ? convertShallow(res) : this.params.dur.base;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.dur.base, this);
        this.params.dur.base = check(res, depth) ? convertShallow(res) : this.params.dur.base;
    } else {
        var argList = argsToArray(arguments);
        this.params.dur.base = check(argList) ? convertShallow(argList) : this.params.dur.base;
    }

    this.params.dur.auto = false;

    return this;
};

/**
 * @function module:music#amp
 * @returns {dtm.music}
 */
Music.prototype.amplitude = Music.prototype.amp = Music.prototype.a = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.amp.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        // TODO: will be muted when the parent is triggering / running
        // should fix and use gain instead
        return this.amplitude(arguments[0].amp());
    }

    this.mapParam(arguments, this.params.amp);
    return this;
};

/**
 * Sets the frequency of the oscillator
 * @function module:music#freq
 * @returns {dtm.music}
 */
Music.prototype.frequency = Music.prototype.freq = Music.prototype.f = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.freq.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.frequency(arguments[0].freq());
    }
    this.mapParam(arguments, this.params.freq);
    this.setFinal('freq');

    return this;
};

/**
 * Sets the pitch of the oscillator by a MIDI note number.
 * @function module:music#notenum
 * @returns {dtm.music}
 */
Music.prototype.notenum = Music.prototype.note = Music.prototype.nn = Music.prototype.n = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.notenum.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.notenum(arguments[0].notenum());
    }
    this.mapParam(arguments, this.params.notenum);
    this.setFinal('notenum');

    if (this.params.playing) {
        this.nodes.src.playbackRate.cancelScheduledValues(this.params.startTime);
        var pitch = processParam(this.params.notenum, seqValue).map(function (v) {
            return freqToPitch(mtof(v));
        });
        var dur = processParam(this.params.dur, seqValue)[0];
        this.setParamCurve(this.params.startTime, dur, [{param: this.nodes.src.playbackRate, value: pitch}]);
    }

    return this;
};

// for longer sample playback
Music.prototype.pitch = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.pitch.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.pitch(arguments[0].pitch());
    }

    this.mapParam(arguments, this.params.pitch);
    this.setFinal('pitch');
    return this;
};

// TODO: wavetable param should be a dtm.data object
Music.prototype.w = Music.prototype.wt = Music.prototype.wavetable = function (src) {
    var that = this;

    if (arguments.length === 0) {
        return dtm.data(that.params.wavetable);
    } else if (isDtmSynth(arguments[0])) {
        return that.wavetable(arguments[0].wavetable());
    }

    src = typeCheck(src);
    if (isFloat32Array(src)) {
        // that.params.tabLen = src.length; // for the morphing / in-note modulation
        if (that.params.tabLen !== src.length) {
            that.params.wavetable = dtm.data(src).step(that.params.tabLen).get();
        } else {
            that.params.wavetable = src;
        }
        //that.params.pitch = freqToPitch(that.params.freq); // ?
    } else if (isFunction(src)) {
        if (that.params.promise) {
            that.params.promise.then(function () {
                that.params.wavetable = toFloat32Array(src(dtm.data(that.params.wavetable)));
            });
        } else {
            that.params.wavetable = toFloat32Array(src(dtm.data(that.params.wavetable)));
            that.params.tabLen = that.params.wavetable.length;
            //that.params.pitch = freqToPitch(that.params.freq); // ?
        }
    } else {
        that.params.wavetable = new Float32Array(that.params.tabLen);
        that.params.wavetable.forEach(function (v, i) {
            that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        });
    }

    if (that.params.playing) {
        if (that.params.wavetable.length !== that.params.tabLen) {
            that.params.wavetable = dtm.data(that.params.wavetable).step(that.params.tabLen).get();
        }
        if (that.nodes.src.buffer.copyToChannel) {
            // for Safari
            that.nodes.src.buffer.copyToChannel(that.params.wavetable, 0);
        } else {
            var tempBuff = that.nodes.src.buffer.getChannelData(0);
            tempBuff.forEach(function (v, i) {
                tempBuff[i] = that.params.wavetable[i];
            });
        }
    }

    return that;
};


Music.prototype.load = function (name) {
    var that = this;

    if (name === 'noise') {
        that.params.wavetable = dtm.gen('noise').size(44100).get();
        that.freq(1);

    } else if (isString(name)) {
        that.params.pending = true;
        that.params.source = name;
        that.params.type = 'sample';
        that.pitch(1);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', name, true);
        xhr.responseType = 'arraybuffer';
        that.params.promise = new Promise(function (resolve) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    Music.prototype.actx.decodeAudioData(xhr.response, function (buf) {
                        that.params.wavetable = buf.getChannelData(0);

                        if (that.params.dur.auto) {
                            that.params.dur.auto = 'sample';
                        }
                        resolve(that);
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
    return that;
};

// TODO: not needed
function processParam(param, seqValue) {
    var tempArr = param.base.get(seqValue).clone();
    return tempArr.get();
}

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

function check(src, depth) {
    if (!isInteger(depth)) {
        depth = 3;
    }
    return isNumber(src) ||
        ((isNumArray(src) ||
        isNestedArray(src) ||
        isNestedWithDtmArray(src) ||
        isNumOrFloat32Array(src) ||
        isNumDtmArray(src) ||
        isNestedNumDtmArray(src)) && getMaxDepth(src) <= depth);
}

function convert(src) {
    if (isArray(src) && src.length === 1) {
        return convert(src[0]);
    } else {
        if (isNestedNumDtmArray(src)) {
            return src;
        } else if (isNestedWithDtmArray(src)) {
            return dtm.data(src);
        } else if (isNumDtmArray(src)) {
            return dtm.data([src]);
        } else if (isNestedArray(src)) {
            return dtm.data(src);
        } else if (isNumOrFloat32Array(src)) {
            return dtm.data([src]);
        } else {
            return dtm.data([toFloat32Array(src)]);
        }
    }
}

function convertShallow(src) {
    if (isArray(src) && src.length === 1) {
        return convertShallow(src[0]);
    } else {
        if (isNestedNumDtmArray(src)) {
            return src;
        } else if (isNestedWithDtmArray(src)) {
            return dtm.data.apply(this, src);
        } else if (isNumDtmArray(src)) {
            return src().block(1);
        } else if (isNestedArray(src)) {
            return dtm.data(src);
        } else if (isNumOrFloat32Array(src)) {
            return dtm.data(src).block(1);
        } else {
            return dtm.data([toFloat32Array(src)]);
        }
    }
}

Music.prototype.mapParam = function (args, param, mod) {
    var res, argList;

    if (mod === 'base' || typeof(mod) === 'undefined') {
        if (isFunction(args[0])) {
            res = args[0](param['base'], this);
            param['base'] = check(res) ? convert(res) : param;
        } else {
            argList = argsToArray(args);
            param['base'] = check(argList) ? convert(argList) : param;
        }
    }
};

Music.prototype.freqToPitch = function (freq) {
    var that = this;
    if (isFloat32Array(freq)) {
        var res = new Float32Array(freq.length);
        freq.forEach(function (v, i) {
            res[i] = v * that.params.tabLen / that.params.sr;
        });
        return res;
    } else if (isNumber(freq)) {
        return freq * that.params.tabLen / that.params.sr;
    }
};

Music.prototype.setParamCurve = function (time, dur, curves) {
    var that = this;
    curves.forEach(function (curve) {
        // if the curve length exceeds the set duration * this
        var maxDurRatioForSVAT = 0.25;
        if (that.params.curve || (curve.value.length / that.params.sr) > (dur * maxDurRatioForSVAT)) {
            curve.param.setValueCurveAtTime(curve.value, time, dur);
        } else {
            curve.value.forEach(function (v, i) {
                curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                // for chrome v53.0.2785.116
                if (i === curve.value.length-1) {
                    curve.param.setValueAtTime(v, time + dur);
                }
            });
        }
        // curve.param.setValueCurveAtTime(curve.value, time, dur);
    });
};

Music.prototype.setFinal = function (param) {
    var that = this;
    ['notenum', 'freq', 'pitch'].forEach(function (v) {
        that.params[v].isFinal = v === param;
    });
};

/**
 * @function module:music#gain
 * @param mult
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.gain = function (mult, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var gain = new fx.Gain(this, post);

    mult = typeCheck(mult);
    if (mult) {
        gain.mult = mult;
    }

    if (post) {
        this.nodes.pFx.push(gain);
    } else {
        this.nodes.fx.push(gain);
    }
    return this;
};

/**
 * @function module:music#lpf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.lpf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var lpf = new fx.LPF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        lpf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        lpf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(lpf);
    } else {
        this.nodes.fx.push(lpf);
    }
    return this;
};

/**
 * @function module:music#hpf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.hpf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var hpf = new fx.HPF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        hpf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        hpf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(hpf);
    } else {
        this.nodes.fx.push(hpf);
    }
    return this;
};

/**
 * @function module:music#bpf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.bpf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var bpf = new fx.BPF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        bpf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        bpf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(bpf);
    } else {
        this.nodes.fx.push(bpf);
    }
    return this;
};

/**
 * @function module:music#apf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.apf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var apf = new fx.APF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        apf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        apf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(apf);
    } else {
        this.nodes.fx.push(apf);
    }
    return this;
};

/**
 * @function module:music#delay
 * @param mix
 * @param time
 * @param feedback
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.delay = function (mix, time, feedback, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var delay = new fx.Delay(this, post);

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
        this.nodes.pFx.push(delay);
    } else {
        this.nodes.fx.push(delay);
    }
    return this;
};

Music.prototype.reverb = Music.prototype.verb = function (mix, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var verb = new fx.Reverb(this, post);

    mix = typeCheck(mix);
    if (mix) {
        verb.mix = mix;
    }

    if (post) {
        this.nodes.pFx.push(verb);
    } else {
        this.nodes.fx.push(verb);
    }
    return this;
};

Music.prototype.convolve = Music.prototype.conv = function (tgt, mix, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var conv = new fx.Convolver(this, post);

    tgt = typeCheck(tgt);
    if (tgt) {
        conv.tgt = tgt;
    }

    mix = typeCheck(mix);
    if (mix) {
        conv.mix = mix;
    }

    if (post) {
        this.nodes.pFx.push(conv);
    } else {
        this.nodes.fx.push(conv);
    }
    return this;
};

/**
 * @function module:music#bq
 * @param bit
 * @returns {dtm.music}
 */
Music.prototype.bitquantize = Music.prototype.bq = function (bit) {
    var bq = new fx.BitQuantizer(this);

    bit = typeCheck(bit);
    if (bit) {
        bq.bit = bit;
    }
    this.nodes.pFx.push(bq);
    return this;
};

/**
 * @function module:music#sh | samphold | samplehold
 * @param samps
 * @returns {dtm.music}
 */
Music.prototype.samphold = Music.prototype.sh = function (samps) {
    var sh = new fx.SampleHold(this);

    samps = typeCheck(samps);
    if (samps) {
        sh.samps = samps;
    }
    this.nodes.pFx.push(sh);
    return this;
};

dtm.startWebAudio();

/* obsolete? */
// synth.mod = function (name, val) {
//     if (isString(name) && params.named.hasOwnProperty(name)) {
//         setTimeout(function () {
//             params.named[name].cancelScheduledValues(0); // TODO: check
//             params.named[name].setValueAtTime(val, 0);
//         }, 0);
//     }
//     return synth;
// };
//
// synth.modulate = synth.mod;
//
// testing
// synth.cancel = function (time) {
//     if (!isNumber(time)) {
//         time = 0.0;
//     }
//
//     objForEach(params.named, function (p) {
//         p.cancelScheduledValues(actx.currentTime + time);
//     });
//
//     return synth;
// };