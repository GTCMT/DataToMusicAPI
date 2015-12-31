/**
 * @fileOverview Instrument model "default"
 * @module instr-default
 */

(function (){
    var m = dtm.model('default', 'instr').register();

    var params = {
        clock: dtm.clock(true, 8),
        sync: true,
        callbacks: [],

        modules: {
            voice: dtm.synth(),
            wavetable: null,
            volume: dtm.array(1),
            pan: dtm.array(0.5),
            scale: dtm.array().fill('seq', 12),
            rhythm: dtm.array(1),
            pitch: dtm.array(69),
            transp: dtm.array(0),
            chord: dtm.array(0),
            bpm: dtm.array(120),
            subdiv: dtm.array(8),
            repeats: null,
            step: null,

            atk: null,
            dur: dtm.array(0.25),
            lpf: null,
            res: dtm.array(0),
            comb: null,
            delay: null
        },

        pqRound: false
    };

    m.output = function (c) {
        var v = params.modules.voice;
        var vol = params.modules.volume.get('next');
        var pan = params.modules.pan.get('next');
        var dur = params.modules.dur.get('next');
        var r = params.modules.rhythm.get('next');
        var p = params.modules.pitch.get('next');
        var sc = params.modules.scale.get();
        var tr = params.modules.transp.get('next');
        var ct = params.modules.chord.get();
        var div = params.modules.subdiv.get('next');
        c.subDiv(div);

        var wt = params.modules.wavetable;
        var lpf = params.modules.lpf;
        var comb = params.modules.comb;
        var delay = params.modules.delay;

        if (params.sync === false) {
            c.bpm(params.modules.bpm.get('next'));
        }

        params.callbacks.forEach(function (cb) {
            cb(params.clock);
        });

        if (r) {
            ct.forEach(function (val) {
                if (wt) {
                    v.wt(wt.get());
                }

                if (lpf) {
                    v.lpf(lpf.get('next'), params.modules.res.get('next'));
                }

                if (comb) {
                    v.comb(0.5, params.modules.comb.get('next'));
                }

                if (delay) {
                    v.delay(params.modules.delay.get('next'));
                }

                v.dur(dur).decay(dur);
                v.nn(dtm.val.pq(p + val, sc, params.pqRound) + tr).amp(vol).pan(pan).play();
            });
        }
    };

    /**
     * Sets the synthesis voice for the instrument. Alternatively: .syn(), .synth()
     * @function module:instr-default#voice
     * @param arg {string|dtm.synth}
     * @returns {dtm.instr}
     */
    m.param.voice = function (arg) {
        if (typeof(arg) === 'string') {
            params.modules.voice.set(arg);
        } else if (arg.type === 'dtm.synth') {
            params.modules.voice = arg;
        }
        return m.parent;
    };

    m.param.syn = m.param.synth = m.param.voice;

    /**
     * Sets the wavetable using the input. Alternatively: .wavetable()
     * @function module:instr-default#wt
     * @param src {number|string|array|dtm.array}
     * @param [mode='adaptive'] {string}
     * @returns {dtm.instr}
     */
    m.mod.wt = function (src, mode) {
        mapper(src, 'wavetable');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.wavetable.range(0, 1, 0, 1)
        } else {
            params.modules.wavetable.normalize();
        }

        return m.parent;
    };

    m.mod.wf = m.mod.wavetable = m.mod.wt;

    m.mod.at = function (src, mode) {
        mapper(src, 'at');

        return m.parent;
    };

    m.mod.rhythm = function (src, mode) {
        mapper(src, 'rhythm');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.rhythm.normalize().round();
        }

        return m.parent;
    };

    m.mod.beats = m.mod.rhythm;

    m.mod.volume = function (src, mode) {
        mapper(src, 'volume');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.volume.logCurve(5, 0, 1).rescale(0.1, 1);
        }

        return m.parent;
    };

    m.mod.amp = m.mod.level = m.mod.vol = m.mod.volume;

    /**
     * Sets the stereo panning.
     * @function module:instr-default#pan
     * @param src {number|array|dtm.array|string}
     * @param mode {string}
     * @returns {dtm.instr}
     */
    m.mod.pan = function (src, mode) {
        mapper(src, 'pan');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.pan.normalize(0, 1);
        } else {
            params.modules.pan.normalize();
        }

        return m.parent;
    };

    m.mod.pitch = function (src, mode, round) {
        mapper(src, 'pitch');

        if (m.modes.literal.indexOf(mode) > -1) {

        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.pitch.rescale(60, 90, 0, 1);
        } else {
            params.modules.pitch.rescale(60, 90);
        }

        if (round) {
            params.modules.pitch.round();
        }

        return m.parent;
    };

    m.mod.nn = m.mod.noteNum = m.mod.pitch;

    m.mod.transpose = function (src, mode, round) {
        mapper(src, 'transp');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.transp.normalize().scale(-12, 12);
        }

        if (round) {
            params.modules.transp.round();
        }

        return m.parent;
    };

    m.mod.tr = m.mod.transp = m.mod.transpose;

    m.mod.scale = function (src, mode, round) {
        if (typeof(round) === 'undefined') {
            params.pqRound = false;
        } else {
            params.pqRound = round;
        }

        mapper(src, 'scale');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.scale.normalize().scale(0,11).round().unique().sort()
        }


        return m.parent;
    };

    m.mod.pq = m.mod.scale;

    m.mod.chord = function (src, mode) {
        mapper(src, 'chord');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.chord.normalize().scale(0, 12).round().unique().sort();

            if (params.modules.chord.get('len') > 4) {
                params.modules.chord.fit(4).round().unique().sort();
            }
        }

        return m.parent;
    };

    m.param.clock = function (bpm, subDiv, time) {
        m.parent.get('clock').bpm(bpm);
        m.parent.get('clock').subDiv(subDiv);
        return m.parent;
    };

    m.mod.bpm = function (src, mode) {
        params.sync = false;

        mapper(src, 'bpm');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.bpm.normalize().scale(60, 180);
        }

        return m.parent;
    };

    m.mod.tempo = m.mod.bpm;

    // CHECK: not working
    m.mod.subDiv = function (src, mode) {
        mapper(src, 'subdiv');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.subdiv.normalize().scale(1, 5).round().powof(2);
        }

        return m.parent;
    };

    m.mod.speed = m.mod.len = m.mod.note = m.mod.div = m.mod.subdiv = m.mod.subDiv;

    m.param.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }
        params.clock.sync(bool);
        params.sync = bool;
        return m.parent;
    };

    m.mod.lpf = function (src, mode) {
        mapper(src, 'lpf');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.lpf.normalize().exp(3, 0, 1).scale(500, 5000);
        }

        return m.parent;
    };

    m.mod.res = function (src, mode) {
        mapper(src, 'res');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.res.normalize().scale(0, 50);
        }

        return m.parent;
    };

    m.mod.comb = function (src, mode) {
        mapper('comb', src);

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.comb.normalize().rescale(60, 90);
        }

        return m.parent;
    };

    m.mod.delay = function (src, mode) {
        mapper(src, 'delay');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.delay.normalize();
        }

        return m.parent;
    };

    m.mod.dur = function (src, mode) {
        mapper(src, 'dur');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.dur.normalize().exp(10, 0, 1).scale(0.01, 0.5);
        }

        return m.parent;
    };

    // CHECK: kind of broken now
    m.mod.on = function (arg) {
        switch (arg) {
            case 'note':
                params.callbacks.push(arguments[1]);
                break;

            case 'every':
            case 'beat':
                var foo = arguments[1];
                var bar = arguments[2];
                params.callbacks.push(function (c) {
                    if (c.get('beat') % foo === 0) {
                        bar(c)
                    }
                });
                break;

            case 'subDiv':
            case 'subdiv':
            case 'div':
                break;

            default:
                break;
        }
        return m.parent;
    };

    m.mod.when = m.mod.on;

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
                params.modules[dest] = dtm.array(src);
            } else if (isDtmArray(src)) {
                if (src.get('type') === 'string') {
                    params.modules[dest] = src.clone().classify();
                } else {
                    params.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.modules[dest] = src;
            }
        }
    }

    return m;
})();