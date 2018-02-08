/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module music
 */

/**
 * Returns a new instance of music object.
 * @function module:music.music
 * @returns {dtm.music}
 * @example
 * var m = dtm.music();
 * m.play();
*/
dtm.m = dtm.music = function () {
    var music = new Music();
    return music.init.apply(music, arguments);
};

/**
 * Enable the offline-rendering mode. Most of the real-time behaviors should not changes. This mode may not be memory optimal in some browsers such as Chrome.
 * @function module:music.offline
 * @param bool
 * @example
 * dtm.music.offline(true); // Turn on the offline mode.
 */
dtm.music.offline = function (bool) {
    if (isBoolean(bool)) {
        Music.prototype.offline = bool;
    } else if (isEmpty(bool)) {
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
            var size = Music.prototype.verbIr.length;
            var ir = ctx.createBuffer(1, size, self.params.sr);

            if (ir.copyToChannel) {
                ir.copyToChannel(Music.prototype.verbIr.get(), 0);
            } else {
                // for Safari
                var tempIrBuff = ir.getChannelData(0);
                var verbIr = Music.prototype.verbIr.get();
                tempIrBuff.forEach(function (v, i) {
                    tempIrBuff[i] = verbIr[i];
                });
            }
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
                    if (blockNum > that.bit.length - 1) {
                        blockNum = that.bit.length - 1;
                    }
                    var res = Math.pow(2, that.bit[blockNum]);
                    self.params.rendered[i] = Math.round(v * res) / res;
                });
            } else {
                self.params.wavetable.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.bit.length - 1) {
                        blockNum = that.bit.length - 1;
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
        mode: 'wavetable',
        sr: 44100,
        dur: {
            base: null,
            auto: true
        },
        interval: {
            base: null,
            auto: true
        },
        bpm: null,
        time: null,
        offset: null,
        repeat: {max: 0, current: 0, resetNext: true, nextTime: null},
        iteration: 0,
        sequence: null,

        onNoteCallback: [],
        offNoteCallback: [],

        interp: 'step',

        baseTime: 0.0, // for offline rendering
        voiceId: Math.random(),
        startTime: 0.0,
        phase: 0.0,
        phasor: {base: null},
        playing: false,

        data: null,
        wavetable: null,
        rendered: null,
        tabLen: 1024,
        lengthFixed: false,
        source: 'sine',
        type: 'synth',
        promise: null,
        pending: false,

        amp: {base: null},

        note: {
            base: null,
            isFinal: true
        },
        freq: {
            base: null,
            isFinal: false
        },
        pitch: {
            base: null,
            isFinal: false
        },

        pan: {base: null},
        curve: false,
        offline: false,

        rtFxOnly: true,
        named: [],

        monitor: {
            state: false,
            grab: null,
            block: 1024
        }
    };

    music.nodes = {
        src: null,
        amp: null,
        pan: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null,
        phasor: null,
        itvSrc: null,
        monitor: null
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

Music.prototype.actx = dtm.wa.actx || new (window.AudioContext || window.webkitAudioContext)();

Music.prototype.octx = null;
Music.prototype.offline = false;
Music.prototype.dummyBuffer = Music.prototype.actx.createBuffer(1, 1, 44100);
Music.prototype.defaultSize = 512;
Music.prototype.defaultWt = dtm.sine(Music.prototype.defaultSize);
Music.prototype.verbIr = dtm.gen('noise').size(88200).mult(dtm.gen('decay').size(44100));

Music.prototype.defaults = {
    intDur: dtm.data([[1]]),
    bpm: dtm.data([[60]]),
    time: dtm.data([[1/4]]),
    offset: dtm.data([[0]]),
    amp: dtm.data([[0.5]]),
    note: dtm.data([[69]]),
    freq: dtm.data([[440]]),
    pitch: dtm.data([[1]]),
    pan: dtm.data([[0]])
};

/**
 * @function module:music#init
 * @returns {Music}
 */
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
        // that.params.wavetable = new Float32Array(that.params.tabLen);
        // that.params.wavetable.forEach(function (v, i) {
        //     that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        // });
        that.params.wavetable = dtm.sine(that.params.tabLen).get();
    } else {
        that.params.wavetable = Music.prototype.defaultWt.get();
    }

    that.params.dur.base = Music.prototype.defaults.intDur;
    that.params.interval.base = Music.prototype.defaults.intDur;
    that.params.bpm = Music.prototype.defaults.bpm;
    that.params.time = Music.prototype.defaults.time;
    that.params.offset = Music.prototype.defaults.offset;
    that.params.amp.base = Music.prototype.defaults.amp;
    that.params.note.base = Music.prototype.defaults.note;
    that.params.freq.base = Music.prototype.defaults.freq;
    that.params.pitch.base = Music.prototype.defaults.pitch;
    that.params.pan.base = Music.prototype.defaults.pan;

    return that;
};

/**
 * Sets the size of the wavetable.
 * @function module:music#size | len
 * @param val {Integer} Size in integer. Should be bigger than 0.
 * @returns {dtm.music} self
 * @example
 * dtm.music().size(8).play();
 */
Music.prototype.size = Music.prototype.len = function (val) {
    var that = this;

    if (isInteger(val) && val > 0) {
        that.params.tabLen = val;
        // that.params.wavetable = new Float32Array(that.params.tabLen);
        // that.params.wavetable.forEach(function (v, i) {
        //     that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        // });
    }
    return that;
};

Music.prototype.mode = function (mode) {
    return this;
};

/**
 * Creates and returns a clone of the music object at the current state.
 * @function module:music#clone
 * @returns {dtm.music}
 * @example
 * var a = dtm.music().note(72).amp(0.3);
 * var b = a.clone().play();
 * a.note(84).play(); // This will not affect the state of the object `b`.
 */
Music.prototype.clone = function () {
    var m = dtm.music();
    var newParams = {}, newNodes = {};

    try {
        objForEach(this.params, function (v, k) {
            if (['amp', 'note', 'freq', 'pitch', 'pan'].indexOf(k) > -1) {
                newParams[k] = {};

                if (v.base.params.id !== Music.prototype.defaults[k].params.id) {
                    newParams[k].base = v.base.clone();
                } else {
                    newParams[k].base = Music.prototype.defaults[k];
                }
                newParams[k].isFinal = v.isFinal;
            } else {
                newParams[k] = v;
            }
        });

        objForEach(this.nodes, function (v, i) {
            newNodes[i] = v;
        });
    } catch (e) {
        console.log(e);
    }

    newParams.voiceId = Math.random();
    return m.meta.setParams(newParams).meta.setNodes(newNodes);
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

function getInterval(index) {
    return this.params.interval.base.get(index).get(0) * (240 * this.params.time.get(index).get(0) / this.params.bpm.get(index).get(0));
}

/**
 * Plays a synthesized sound.
 * @function module:music#play | p
 * @returns {dtm.music}
 * @example
 * dtm.music().play();
 */
Music.prototype.play = Music.prototype.p = function (time) {
    var that = this;
    var actx = Music.prototype.actx;
    // var defer = 0.01;
    var defer = 0;

    // TODO: not right
    if (!isEmpty(time) && !isNumber(time)) {
        that.offset.apply(that, arguments);
    }

    // if playSwitch is a function
    if (that.params.pending) {
        console.log('what is this');
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
        if (!that.params.lengthFixed) {
            that.params.lengthFixed = true;
        }

        var seqValue = that.params.sequence ? that.params.sequence[mod(that.params.iteration, that.params.sequence.length)] : that.params.iteration;

        // TODO: allow fractional index?
        // TODO: this is in many ways not right
        if (isEmpty(time) || !isNumber(time)) {
            that.params.offset(seqValue).each(function (v, i, d) {
                var voiceIter = that.params.sequence ? that.params.sequence[mod(that.params.iteration + i, that.params.sequence.length)] : that.params.iteration + i;

                if (i === 0) {
                    time = d.get(voiceIter);
                } else {
                    that.clone().iter(voiceIter).play(d.get(voiceIter));
                }
            });
        }

        var amp = that.params.amp.base.get(seqValue).val;
        var pan = that.params.pan.base.get(seqValue).val;
        var pitch;

        if (that.params.note.isFinal) {
            pitch = that.params.note.base.get(seqValue).val.map(function (v) {
                return that.freqToPitch(mtof(v));
            });
        } else if (that.params.freq.isFinal) {
            pitch = that.params.freq.base.get(seqValue).val.map(function (v) {
                return that.freqToPitch(v);
            });
        } else {
            pitch = that.params.pitch.base.get(seqValue).val;
        }

        var interval, dur;
        interval = getInterval.call(that, seqValue);

        if (interval <= 0) {
            interval = 0;
        }

        if (!that.params.dur.auto && that.params.interval.auto) {
            interval = dur = that.params.dur.base.get(seqValue).val[0];
        } else if (that.params.dur.auto && interval !== 0) {
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
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }

        // could be in initialize-note sequence
        if (that.params.repeat.resetNext) {
            that.params.repeat.current = that.params.repeat.max;
            that.params.repeat.resetNext = false;
        }

        var curves;
        dtm.master.addVoice(that);

        //===============================
        if (Music.prototype.offline) {
            // TODO: use promise
            that.params.onNoteCallback.forEach(function (fn) {
                fn(that, seqValue);
            });

            var octx = new OfflineAudioContext(1, (time + dur * 4) * that.params.sr, that.params.sr);

            time += octx.currentTime;

            that.nodes.src = octx.createBufferSource();
            that.nodes.amp = octx.createGain();
            that.nodes.out = octx.createGain();
            that.nodes.fx[0].out = octx.createGain();
            that.nodes.src.connect(that.nodes.amp);
            that.nodes.amp.connect(that.nodes.fx[0].out);
            that.nodes.out.connect(octx.destination);

            for (var n = 1; n < that.nodes.fx.length; n++) {
                that.nodes.fx[n].run(time, dur);
                that.nodes.fx[n - 1].out.connect(that.nodes.fx[n].in);
            }
            that.nodes.fx[n - 1].out.connect(that.nodes.out);

            if (that.params.source === 'noise') {
                that.nodes.src.buffer = octx.createBuffer(1, that.params.sr / 2, that.params.sr);
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
            that.setParamCurve(time, dur, curves);

            that.nodes.fx[0].out.gain.setValueAtTime(0.0, 0);
            that.nodes.out.gain.setValueAtTime(0.3, 0);

            that.nodes.src.start(time);
            that.nodes.src.stop(time + dur);

            octx.startRendering();
            octx.oncomplete = function (e) {
                that.params.rendered = e.renderedBuffer.getChannelData(0);

                time += that.params.baseTime;

                that.nodes.rtSrc = actx.createBufferSource();
                that.nodes.pFx[0].out = actx.createGain();
                that.nodes.pan = actx.createStereoPanner();
                var out = actx.createGain();
                that.nodes.rtSrc.connect(that.nodes.pFx[0].out);
                for (var n = 1; n < that.nodes.pFx.length; n++) {
                    that.nodes.pFx[n].run(time, dur);
                    that.nodes.pFx[n - 1].out.connect(that.nodes.pFx[n].in);
                }
                that.nodes.pFx[n - 1].out.connect(that.nodes.pan);
                that.nodes.pan.connect(out);
                out.connect(actx.destination);

                var stupidBuffer = actx.createBuffer(1, that.params.rendered.length, that.params.sr);
                stupidBuffer.copyToChannel(that.params.rendered, 0);
                that.nodes.rtSrc.buffer = stupidBuffer;
                that.nodes.rtSrc.loop = false;
                that.nodes.rtSrc.start(time);
                that.nodes.rtSrc.stop(time + that.nodes.rtSrc.buffer.length);

                that.setParamCurve(time, dur, [{param: that.nodes.pan.pan, value: pan}]);

                out.gain.setValueAtTime(1.0, 0);

                that.nodes.rtSrc.onended = function () {
                    stupidBuffer = undefined;
                    try {
                        that.nodes.rtSrc.buffer = Music.prototype.dummyBuffer;
                    } catch (e) {
                    }
                    that.nodes.rtSrc.disconnect(0);
                    that.nodes.rtSrc.onended = undefined;
                    that.nodes.rtSrc = undefined;

                    dtm.master.removeVoice(that);

                    if (that.params.repeat.current > 1) {
                        that.play(); // TODO: pass any argument?
                        that.params.repeat.current--;
                    } else {
                        that.params.repeat.resetNext = true;
                    }
                };
            };
        } else {
            var silence = actx.createGain();
            silence.gain.setValueAtTime(1.0, 0);

            // for calling back functions after delay
            if (time !== 0) {
                that.nodes.preSrc = actx.createBufferSource();
                that.nodes.preSrc.buffer = Music.prototype.dummyBuffer;
                that.nodes.preSrc.loop = true;
                that.nodes.preSrc.connect(silence);

                that.nodes.preSrc.onended = function () {
                    that.params.onNoteCallback.forEach(function (fn) {
                        fn(that, seqValue);
                    });
                };

                that.nodes.preSrc.start(actx.currentTime);
                that.nodes.preSrc.stop(actx.currentTime + time);
            } else {
                // TODO: use promise
                that.params.onNoteCallback.forEach(function (fn) {
                    fn(that, seqValue);
                });
            }

            // time += actx.currentTime;
            time += that.params.repeat.nextTime ? that.params.repeat.nextTime : actx.currentTime;
            that.params.repeat.nextTime = time + interval;

            that.params.startTime = time;

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
                that.nodes.pFx[n].run(time, dur);
                that.nodes.pFx[n - 1].out.connect(that.nodes.pFx[n].in);
            }

            if (actx.createStereoPanner) {
                that.nodes.pFx[n - 1].out.connect(that.nodes.pan);
                that.nodes.pan.connect(out);
            } else {
                that.nodes.pFx[n - 1].out.connect(that.nodes.left);
                that.nodes.pFx[n - 1].out.connect(that.nodes.right);
                that.nodes.left.connect(that.nodes.merger, 0, 0);
                that.nodes.right.connect(that.nodes.merger, 0, 1);
                that.nodes.merger.connect(out);
            }

            that.nodes.itvSrc = actx.createBufferSource();
            that.nodes.itvSrc.buffer = Music.prototype.dummyBuffer;
            that.nodes.itvSrc.loop = true;
            that.nodes.itvSrc.connect(silence);
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

            if (!that.params.monitor.process) {
                out.connect(actx.destination);
            }

            //========= monitoring ==========
            if (that.params.monitor.state) {
                that.nodes.monitor = actx.createScriptProcessor(that.params.monitor.block, 1, 1);
                var monitorData = dtm.data();

                if (that.params.mode === 'phasor') {
                    that.nodes.monitor.onaudioprocess = function () {
                        var phase = that.phase();
                        if (that.params.phasor.base) {
                            phase = that.params.phasor.base(seqValue).get(phase * that.params.phasor.base.get(seqValue).length);
                        }
                        if (isFunction(that.params.monitor.grab)) {
                            that.params.monitor.grab(monitorData.set(phase), seqValue);
                        } else {
                            that.params.monitor.grab.set(phase);
                        }
                    };
                } else {
                    // TODO: not cleared?
                    that.nodes.monitor.onaudioprocess = function (event) {
                        var samps = event.inputBuffer.getChannelData(0);
                        if (isFunction(that.params.monitor.grab)) {
                            var processed = that.params.monitor.grab(monitorData.set(samps));

                            if (that.params.monitor.process) {
                                var outputBuffer = event.outputBuffer.getChannelData(0);
                                if (processed !== outputBuffer.length) {
                                    processed.fit(outputBuffer.length);
                                }
                                for (var i = 0, l = outputBuffer.length; i < l; i++) {
                                    outputBuffer[i] = processed.get(i);
                                }
                            }
                        } else {
                            that.params.monitor.grab.set(samps);
                        }
                    };
                }

                var mntGain = actx.createGain();
                mntGain.gain.setValueAtTime(that.params.monitor.process ? 1 : 0, 0);

                out.connect(that.nodes.monitor).connect(mntGain).connect(actx.destination);
            }
            //===============================

            // onended was sometimes not getting registered before src.start for some reason
            var p = new Promise(function (resolve) {
                that.nodes.itvSrc.onended = function () {
                    if (interval >= dur) {
                        dtm.master.removeVoice(that);
                    }

                    // rep(1) would only play once
                    if (that.params.repeat.current > 1) {
                        that.play(); // TODO: pass any argument?
                        that.params.repeat.current--;
                    } else {
                        that.params.repeat.resetNext = true;

                        if (that.params.monitor.state) {
                            // that.params.monitor.state = false;
                        }
                    }

                    that.params.offNoteCallback.forEach(function (fn) {
                        fn(that, seqValue);
                    });
                };

                that.nodes.src.onended = function () {
                    if (dur > interval) {
                        dtm.master.removeVoice(that);
                    }

                    if (that.params.monitor.state) {
                        // that.params.monitor.state = false;
                        that.nodes.monitor.onaudioprocess = null;
                        that.nodes.monitor.disconnect();
                        that.nodes.monitor = null;
                    }

                    that.params.playing = false;
                };

                resolve();
            });

            p.then(function () {
                that.nodes.itvSrc.start(time);
                that.nodes.itvSrc.stop(time + interval);
                that.nodes.src.start(time + 0.00001);
                that.nodes.src.stop(time + dur + 0.00001);

                // ignoring start offset for now
                // need a timer
                that.params.playing = true;
            });

            curves = [];
            curves.push({param: that.nodes.src.playbackRate, value: pitch});
            curves.push({param: that.nodes.amp.gain, value: amp});
            that.setParamCurve(time, dur, curves);

            if (actx.createStereoPanner) {
                that.setParamCurve(time, dur, [{param: that.nodes.pan.pan, value: pan}]);
            } else {
                var left = pan.map(function (v) {
                    if (v < 0) {
                        return 0.5;
                    } else {
                        return 0.5 - v * 0.5;
                    }
                });

                var right = pan.map(function (v) {
                    if (v < 0) {
                        return 0.5 + v * 0.5;
                    } else {
                        return 0.5;
                    }
                });
                that.setParamCurve(time, dur, [{param: that.nodes.left.gain, value: left}]);
                that.setParamCurve(time, dur, [{param: that.nodes.right.gain, value: right}]);
            }

            that.nodes.pFx[0].out.gain.setValueAtTime(1.0, 0); // ?
            out.gain.setValueAtTime(1.0, 0);

            var ramp = 0.002;
            declipper.gain.setValueAtTime(0.0, time);
            declipper.gain.linearRampToValueAtTime(1.0, time + ramp);
            declipper.gain.setTargetAtTime(0.0, time + dur - ramp, ramp * 0.3);
        }

        that.params.iteration++;

        // }, defer + that.meta.deferIncr);
    }, defer);

    return that;
};

/**
 * Repetitively plays sound.
 * @function module:music#start
 * @returns {dtm.music}
 * @example
 * dtm.music().start();
 */
Music.prototype.start = function () {
    this.interval.apply(this, arguments);
    this.rep().play();
    return this;
};

/**
 * Triggers itself (including the registered callback functions) after a certain time delay.
 * @function module:music#trigger | trig | t
 * @type {Music.t}
 */
Music.prototype.trigger = Music.prototype.trig = Music.prototype.t = function () {
    this.offset.apply(this, arguments);
    this.mute().play();
    return this;
};

/**
 * @function module:music#run | r
 * @type {Music.r}
 */
Music.prototype.run = Music.prototype.r = function () {
    this.interval.apply(this, arguments);
    this.mute().rep().play();
    return this;
};

/**
 * Stops the currently playing sound.
 * @function module:music#stop | s
 * @param [time=0] {number} Delay in seconds for the stop action to be called.
 * @returns {dtm.music}
 */
Music.prototype.stop = Music.prototype.s = function (time) {
    var that = this;

    var defer = 0.0;

    that.params.repeat.current = 0;
    that.params.repeat.resetNext = true;

    setTimeout(function () {
        if (!isNumber(time)) {
            // time = 0.0;
            time = Music.prototype.actx.currentTime;
        } else {
            // time += Music.prototype.actx.currentTime;
        }

        if (that.nodes.src) {
            that.nodes.src.stop(time);
        }

        if (that.nodes.itvSrc) {
            that.nodes.itvSrc.stop(time);
        }

        if (that.nodes.rtSrc) {
            that.nodes.rtSrc.stop(time);
        }

        that.params.monitor.state = false;
        if (that.nodes.monitor) {
            that.nodes.monitor.onaudioprocess = null;
            that.nodes.monitor.disconnect();
        }

        dtm.master.removeVoice(that);
    // }, defer + that.meta.deferIncr * 2);
    }, that.meta.deferIncr);

    return that;
};

/**
 * @function module:music#after | aft | offset
 * @type {Music.offset}
 */
Music.prototype.aft = Music.prototype.after = Music.prototype.offset = function () {
    var argList = argsToArray(arguments);
    if (check(argList)) {
        this.params.offset = convert(argList);
    }
    return this;
};

/**
 * @function module:music#mute
 * @param bool
 * @returns {Music}
 */
Music.prototype.mute = function (bool) {
    if (isBoolean(bool)) {
        var val = bool ? 0 : 1;
        this.gain(val);
    } else {
        this.gain(0);
    }
    return this;
};

/**
 * @function module:music#unmute
 * @returns {Music}
 */
Music.prototype.unmute = function () {
    this.gain(1);
    return this;
};

/**
 * @function module:music#sync | follow
 * @type {Music.follow}
 */
Music.prototype.sync = Music.prototype.follow = function (input) {
    if (isDtmSynth(input)) {
        this.interval(input);
        this.bpm(input);
        this.time(input);
        this.seq(input);
    }
    return this;
};

/**
 * @function module:music#mimic
 * @param input
 * @returns {Music}
 */
Music.prototype.mimic = function (input) {
    if (isDtmSynth(input)) {
        this.interval(input);
        this.bpm(input);
        this.time(input);
        this.seq(input);
        this.note(input);
        this.amplitude(input);
        this.pan(input);
        this.wavetable(input);
    }
    return this;
};

/**
 * @function module:music#each | do | on | onnote
 * @type {Music.onnote}
 */
Music.prototype.each = Music.prototype.do = Music.prototype.on = Music.prototype.onnote = function (fn) {
    if (isFunction(fn)) {
        this.params.onNoteCallback.push(fn);
    }
    return this;
};

/**
 * @function module:music#offnote | off
 * @type {Music.offnote}
 */
Music.prototype.off = Music.prototype.offnote = function (fn) {
    if (isFunction(fn)) {
        this.params.offNoteCallback.push(fn);
    }
    return this;
};

// set order of the iteration
/**
 * @function module:music#sequence | seq
 * @type {Music.seq}
 */
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
/**
 * @function module:music#iter | incr
 * @type {Music.incr}
 */
Music.prototype.iter = Music.prototype.incr = function (val) {
    if (isInteger(val)) {
        this.params.iteration = val;
        return this;
    }
    return this.params.iteration;
};

/**
 * @function module:music#phase | scan
 * @type {Music.phase}
 */
Music.prototype.scan = Music.prototype.phase = function (input, block) {
    if (isDtmArray(input) || isFunction(input)) {
        this.params.mode = 'phasor';

        if (!isNumber(block)) {
            block = 1024;
        }

        this.params.monitor.state = true;
        this.params.monitor.grab = input;
        this.params.monitor.block = block;
        return this;
    } else {
        var phasorDuration;
        if (!this.params.dur.auto && this.params.interval.auto) {
            phasorDuration = this.params.dur.base;
        } else if (!this.params.dur.auto && !this.params.interval.auto) {
            phasorDuration = this.params.interval.base;
        } else {
            phasorDuration = this.params.interval.base;
        }
        this.params.phase = (Music.prototype.actx.currentTime - this.params.startTime) / phasorDuration(this.seq()).get(0);
        if (this.params.phase < 0.0) {
            this.params.phase = 0.0;
        } else if (this.params.phase > 1.0) {
            this.params.phase = 1.0;
        }
        return this.params.phase;
    }
};

/**
 * @function module:music#repeat | rep
 * @type {Music.rep}
 */
Music.prototype.repeat = Music.prototype.rep = function (times) {
    if (isInteger(times) && times > 0) {
        this.params.repeat.max = times;
    } else if (isEmpty(times) || times === Infinity || times === true) {
        this.params.repeat.max = Infinity;
    }

    this.params.repeat.resetNext = true;
    return this;
};

/**
 * Sets the interval in seconds between repeated or iterated events.
 * @function module:music#every | at | interval | int | i
 * @type {Music.i}
 */
Music.prototype.every = Music.prototype.at = Music.prototype.interval = Music.prototype.int = Music.prototype.i = function () {
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

// Music.prototype.rate
/**
 * @function module:music#bpm
 * @returns {Music}
 */
Music.prototype.bpm = function () {
    if (arguments.length === 0) {
        return this.params.bpm()
    }
    var depth = 2;

    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].bpm();
        this.params.bpm = check(res, depth) ? convertShallow(res) : this.params.bpm;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.bpm, this);
        this.params.bpm = check(res, depth) ? convertShallow(res) : this.params.bpm;
    } else {
        var argList = argsToArray(arguments);
        this.params.bpm = check(argList) ? convertShallow(argList) : this.params.bpm;
    }

    this.params.interval.auto = false;

    if (this.params.dur.auto) {
        this.params.dur.auto = 'interval';
    }

    return this;
};

/**
 * @function module:music#time
 * @returns {Music}
 */
Music.prototype.time = function () {
    if (arguments.length === 0) {
        return this.params.time()
    }
    var depth = 2;

    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].time();
        this.params.time = check(res, depth) ? convertShallow(res) : this.params.time;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.time, this);
        this.params.time = check(res, depth) ? convertShallow(res) : this.params.time;
    } else {
        var argList = argsToArray(arguments);
        this.params.time = check(argList) ? convertShallow(argList) : this.params.time;
    }

    return this;
};

/**
 * Takes array types with only up to the max depth of 1.
 * @function module:music#for | duration | dur | d
 * @returns {dtm.music}
 */
Music.prototype.for = Music.prototype.duration = Music.prototype.dur = Music.prototype.d = function () {
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
 * @function module:music#amplitude | amp | a
 * @returns {dtm.music}
 */
Music.prototype.amplitude = Music.prototype.amp = Music.prototype.a = function () {
    var that = this;
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.amp.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        // TODO: will be muted when the parent is triggering / running
        // should fix and use gain instead
        return this.amplitude(arguments[0].amp());
    }

    this.mapParam(arguments, this.params.amp);

    // TODO: experimental
    if (that.params.playing) {
        that.nodes.amp.gain.cancelScheduledValues(that.params.startTime);
        var amp = that.params.amp.base.get(seqValue).val;

        //==================== copied from play()
        var interval, dur;
        interval = getInterval.call(that, seqValue);

        if (interval <= 0) {
            interval = 0;
        }

        if (that.params.dur.auto && interval !== 0) {
            if (that.params.dur.auto === 'sample') {
                dur = interval; // TODO: pitch-curve dependent
            } else {
                dur = interval;
            }
        } else {
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }
        //====================

        that.setParamCurve(that.params.startTime, dur, [{param: that.nodes.amp.gain, value: amp}]);
    }
    return this;
};

/**
 * Sets the frequency of the oscillator
 * @function module:music#frequency | freq | f
 * @returns {dtm.music}
 */
Music.prototype.frequency = Music.prototype.freq = Music.prototype.f = function () {
    var that = this;
    var seqValue = that.params.sequence ? that.params.sequence[mod(that.params.iteration, that.params.sequence.length)] : that.params.iteration;

    if (arguments.length === 0) {
        return that.params.freq.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return that.frequency(arguments[0].freq());
    }
    that.mapParam(arguments, that.params.freq);
    that.setFinal('freq');

    if (that.params.playing) {
        that.nodes.src.playbackRate.cancelScheduledValues(that.params.startTime);
        var pitch = that.params.freq.base.get(seqValue).val.map(function (v) {
            return that.freqToPitch(v);
        });

        //==================== copied from play()
        var interval, dur;
        interval = getInterval.call(that, seqValue);

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
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }
        //====================

        that.setParamCurve(that.params.startTime, dur, [{param: that.nodes.src.playbackRate, value: pitch}]);
    }

    return that;
};

/**
 * Sets the pitch of the oscillator by a MIDI note number.
 * @function module:music#notenum | note | nn | n
 * @returns {dtm.music}
 */
Music.prototype.notenum = Music.prototype.note = Music.prototype.nn = Music.prototype.n = function () {
    var that = this;
    var seqValue = that.params.sequence ? that.params.sequence[mod(that.params.iteration, that.params.sequence.length)] : that.params.iteration;

    if (arguments.length === 0) {
        return that.params.note.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return that.note(arguments[0].note());
    }
    if (arguments.length === 1 && isDtmArray(arguments[0]) && arguments[0].params.isTarget) {
        arguments[0].attach(that, that.note);
    }
    that.mapParam(arguments, that.params.note);
    that.setFinal('note');

    // TODO: experimental
    if (that.params.playing) {
        that.nodes.src.playbackRate.cancelScheduledValues(that.params.startTime);
        var pitch = that.params.note.base.get(seqValue).val.map(function (v) {
            return that.freqToPitch(mtof(v));
        });

        //==================== copied from play()
        var interval, dur;
        interval = getInterval.call(that, seqValue);

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
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }
        //====================

        that.setParamCurve(that.params.startTime, dur, [{param: that.nodes.src.playbackRate, value: pitch}]);
    }

    return that;
};

// for longer sample playback
/**
 * @function module:music#pitch
 * @returns {Music}
 */
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

/**
 * @function module:music#pan
 * @returns {Music}
 */
Music.prototype.pan = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.pan.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.pan(arguments[0].pan());
    }

    this.mapParam(arguments, this.params.pan);
    return this;
};

// TODO: wavetable param should be a dtm.data object
// TODO: too many aliases
/**
 * @function module:music#waveform | wave | wf | wavetable | wt | w | osc
 * @type {Music.wavetable}
 */
Music.prototype.osc = Music.prototype.w = Music.prototype.wave = Music.prototype.wf = Music.prototype.waveform = Music.prototype.wt = Music.prototype.wavetable = function (src) {
    var that = this;

    if (arguments.length === 0) {
        return dtm.data(that.params.wavetable);
    } else if (isDtmSynth(arguments[0])) {
        return that.wavetable(arguments[0].wavetable());
    }

    src = typeCheck(src);
    if (isFloat32Array(src)) {
        // for the morphing / in-note modulation
        if (that.params.lengthFixed) {
            if (that.params.tabLen !== src.length) {
                that.params.wavetable = dtm.data(src).step(that.params.tabLen).get();
            } else {
                that.params.wavetable = src;
            }
        } else {
            that.params.wavetable = src;
            that.params.tabLen = src.length;
            // that.params.pitch = freqToPitch(that.params.freq); // ?
        }
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

    if (arguments.length === 1 && isDtmArray(arguments[0]) && arguments[0].params.isTarget) {
        arguments[0].attach(that, that.wavetable);
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

/**
 * @function module:music#sample | load
 * @type {Music.load}
 */
Music.prototype.sample = Music.prototype.load = function (name) {
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
        ((isNumDtmArray(src) ||
        // isNumArray(src) ||
        isNumOrFloat32Array(src) ||
        isNestedArray(src) ||
        isNestedWithDtmArray(src) ||
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

// TODO: 'base' vs 'mod' not needed anymore?
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
        var ksmps = 100;
        // if the curve length exceeds the "control rate"
        if (that.params.curve || (that.params.sr * dur / curve.value.length) < ksmps) {
            if (curve.value.length === 1) {
                curve.value.push(curve.value[0]);
            }
            curve.param.setValueCurveAtTime(toFloat32Array(curve.value), time, dur);
        } else {
            curve.value.forEach(function (v, i) {
                curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                // for chrome v53.0.2785.116
                if (i === curve.value.length - 1) {
                    curve.param.setValueAtTime(v, time + dur);
                }
            });
        }
    });
};

Music.prototype.setFinal = function (param) {
    var that = this;
    ['note', 'freq', 'pitch'].forEach(function (v) {
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

/**
 * @function module:music#reverb | verb
 * @type {Music.verb}
 */
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

/**
 * @function module:music#convolve | conv
 * @type {Music.conv}
 */
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
 * @function module:music#bitquantize | bq
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
 * @function module:music#samphold | sh
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

/**
 * @function module:music#monitor
 * @param input
 * @param block
 * @returns {Music}
 */
Music.prototype.monitor = function (input, block) {
    if (!isNumber(block)) {
        block = 1024;
    }

    if (isDtmArray(input) || isFunction(input)) {
        this.params.monitor.state = true;
        this.params.monitor.grab = input;
        this.params.monitor.block = block;
    }

    return this;
};

/**
 * @function module:music#process
 * @param input
 * @param block
 * @returns {Music}
 */
Music.prototype.process = function (input, block) {
    if (!isNumber(block)) {
        block = 1024;
    }

    if (isDtmArray(input) || isFunction(input)) {
        this.params.monitor.state = true;
        this.params.monitor.process = true;
        this.params.monitor.grab = input;
        this.params.monitor.block = block;
    }

    return this;
};

/**
 * @function module:music#phasor | curve
 * @type {Music.phasor}
 */
Music.prototype.curve = Music.prototype.phasor = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.phasor(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.phasor(arguments[0].phasor());
    }

    this.mapParam(arguments, this.params.phasor);
    return this;
};

Music.prototype.fft = function (input, block) {
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