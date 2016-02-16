/**
 * @fileOverview Instrument model "default"
 * @module instr-decatur
 */

(function () {
    var m = dtm.model('decatur', 'instr').register();

    var params = {
        name: 'Flute',

        score: true,
        midi: true,

        // only for score
        staves: 1,
        clef: 'g',
        durFx: ['rest', 'stacc', 'half', 'normal', 'tenuto', 'slur'],
        dynFx: ['pp', 'p', 'mp', 'mf', 'f', 'ff'],

        // only for MIDI
        bpm: dtm.master.clock.get('bpm'),

        voice: 'mono',
        measures: 4,
        time: '4/4',
        div: 16,
        update: 1,
        repeat: 2,
        repMap: [2, 3, 3, 3, 4, 5, 5, 6, 6, 6, 7, 7, 8, 9],

        divMap: [16, 8, 16, 8, 16],
        range: {
            'Flute': [60, 75, 91],
            'Cello': [36, 48, 72],
            'Piano': [60, 72, 84],
            'PianoL': [36, 48, 60],
            'Pad': [36, 54, 72],
            'Bass': [48, 54, 60]
        },
        scale: [[0, 2, 7, 9], [2, 5, 7], [0, 2, 5, 7, 10], [0, 2, 5, 7], [0, 2, 4, 7, 9], [0, 2, 4, 6, 7], [2, 4, 6, 7, 9]],

        celloFx: ['arc', 'pizz'],

        callbacks: []
    };

    var mods = {
        pitch: dtm.array().fill('random', 8, 60, 72).round(),
        range: dtm.array(0.3),
        scale: dtm.array(params.scale[params.scale.length-1]),
        scaleSel: dtm.array(2),

        transp: dtm.array(0),
        chord: dtm.array(0),

        pos: dtm.array(0),

        div: dtm.a(Math.round(params.divMap.length/2)),
        repeat: dtm.array(1),
        note: dtm.array().fill('ones', 8),
        dur: dtm.array().fill('ones', 8),
        dyn: dtm.array().fill('zeros', 8),

        activity: dtm.array(0)
    };

    var g = dtm.guido;
    var osc = dtm.osc;

    m.output = function (c) {
        c.div(params.div);

        var rep = params.repeat;
        var numNotes = params.div * params.measures;

        if (c.get('beat') % (numNotes * params.update) === 0) {
            params.callbacks.forEach(function (cb) {
                cb(c);
            });
        }

        var sc = mods.scale.get();
        var chord = mods.chord.get();

        var pLen = Math.round(numNotes/rep);
        var pArr = mods.pitch.clone().fit(pLen, 'linear').log(10).round();

        var nArr = mods.note.clone().scale(0.1, 1).fit(pLen, 'linear').fitSum(pLen, true);
        var acArr = mods.activity.clone().fit(pLen, 'linear').round();
        var trArr = mods.transp.clone().fit(pLen, 'linear').round();

        if (params.score && (params.name === 'Flute' || params.name === 'Piano' || params.name === 'PianoL' || params.name === 'Cello')) {


            // MEMO: \repeatBegin at the beginning breaks the score (bug)
            if (c.get('beat') % (numNotes * params.update) === 0) {
                var seq = [];

                var slurOn = false;
                var accum = 0, accErr = 0;
                var fixImaginaryLines = false;
                var pre, post;

                var durArr = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round();
                var dynArr = mods.dyn.clone().fit(pLen, 'step');


                if (params.div <= 16) {
                    params.durFx[2] = 'stacc';
                } else {
                    params.durFx[2] = 'half';
                }

                for (var i = 0; i < numNotes; i++) {
                    seq[i] = '';

                    var p = pArr.get('next');
                    var len = nArr.get('next');
                    var dur = durArr.get('next');
                    var prevDyn = dynArr.get('current');
                    var dyn = dynArr.get('next');
                    var ac = acArr.get('next');
                    var tr = trArr.get('next');

                    //===== imaginary line stuff =====
                    if (len > 1 && len + (accum % 4) > 4) {
                        fixImaginaryLines = true;
                        post = (len + accum) % 4;

                        if (post == 0) {
                            post = 4;
                        }
                        pre = len - post;
                    }
                    accum += len;
                    //==================================

                    if (i == numNotes-1) {
                        accErr = numNotes - accum;

                        if (fixImaginaryLines) {
                            post += accErr;
                        } else {
                            len += accErr;
                        }
                    }

                    if (post == 0) {
                        len = pre;
                        fixImaginaryLines = false;
                    }

                    var pitch = '';

                    pitch += dtm.guido.nnToPitch(pq(p+tr, sc, true));

                    // note len & duration
                    if (params.durFx[dur] == 'rest' || ac === 0) {
                        pitch = '_';

                        if (slurOn) {
                            seq[i-1] += ' \\slurEnd';
                            slurOn = false;
                        }
                    }

                    if (params.durFx[dur] == 'slur' && ac !== 0) {
                        if (!slurOn && i !== numNotes-1) {
                            seq[i] += '\\slurBegin ';
                            slurOn = true;
                        }
                    }

                    if (params.durFx[dur] == 'half' && ac !== 0) {
                        if (fixImaginaryLines) {
                            seq[i] += pitch + '*' + pre + '/' + params.div*2 + '_*' + pre + '/' + params.div*2;
                            seq[i] += ',';
                            seq[i] += pitch + '*' + post + '/' + params.div*2 + '_*' + post + '/' + params.div*2;
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div*2 + '_*' + len + '/' + params.div*2;
                        }

                    } else {
                        if (fixImaginaryLines && !(params.durFx[dur] == 'rest' || ac === 0)) {
                            seq[i] += '\\tieBegin \\space<4> ' + pitch + '*' + pre + '/' + params.div;
                            seq[i] += ' , ';
                            seq[i] += pitch + '*' + post + '/' + params.div + ' \\tieEnd';
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div;
                        }
                    }

                    if (ac !== 0 && !slurOn && params.div >= 4 && seq[i] != '' && params.name !== 'PianoL') {
                        if (params.durFx[dur] == 'stacc') {
                            seq[i] = '\\stacc( ' + seq[i] + ' )';
                        } else if (params.durFx[dur] == 'tenuto') {
                            seq[i] = '\\ten( ' + seq[i] + ' )';
                        }
                    }

                    if (params.durFx[dur] !== 'rest' &&
                        params.durFx[dur] !== 'stacc' &&
                        params.durFx[dur] !== 'tenuto' &&
                        ac === 2 && chord.length === 1 &&
                        seq[i] != '' &&
                        params.name !== 'PianoL') {
                        seq[i] = '\\accent( ' + seq[i] + ' )';
                    }

                    if ((params.durFx[dur] != 'slur' && slurOn) || i == numNotes-1 && slurOn) {
                        seq[i] += ' \\slurEnd';
                        slurOn = false;
                    }

                    fixImaginaryLines = false;
                }

                //================ formatting ================

                for (var i = seq.length-1; i >= 0; i--) {
                    if (seq[i] === '') {
                        seq.splice(i, 1);
                    }
                }

                for (var i = seq.length-1; i > 0; i--) {
                    if (seq[i].indexOf('_') > -1 && seq[i-1].indexOf('_') > -1) {
                        seq[i-1] = '_*' + (parseInt(seq[i].substr(seq[i].indexOf('*')+1, (seq[i].indexOf('/')-seq[i].indexOf('*')-1))) +
                        parseInt(seq[i-1].substr(seq[i-1].indexOf('*')+1, (seq[i-1].indexOf('/')-seq[i-1].indexOf('*')-1)))) + '/' + params.div;

                        seq[i] = '';
                    }
                }

                for (var i = 0; i < seq.length; i++) {
                    if (seq[i].indexOf(',') > -1) {
                        var sliced = seq[i].split(',');
                        seq[i] = sliced[0];
                        seq.splice(i+1, 0, sliced[1]);
                    }
                }

                for (var i = seq.length-1; i > 0; i--) {
                    if (seq[i] === '') {
                        seq.splice(i, 1);
                    }
                }

                for (var i = 0; i < seq.length; i++) {
                    if (seq[i].indexOf(' ') > -1) {
                        var sliced = seq[i].split(' ');
                        for (var j = 0; j < sliced.length-1; j++) {
                            seq[i+j] = sliced[j];
                            seq.splice(i+1+j, 0, sliced[j+1]);
                        }
                    }
                }

                if (mods.chord.get('len') > 1) {
                    seq = harmonizeGuido(seq, chord, sc);
                }

                var staffFormat = '\\staffFormat<"5-line",';
                if (seq.length === 1) {
                    staffFormat += 'size=1.3pt>';
                } else if (seq.length < 50) {
                    staffFormat += 'size=1.3pt>';
                } else if (seq.length < 100) {
                    staffFormat += 'size=2pt>';
                } else {
                    staffFormat += 'size=3pt>';
                }

                var staff = '\\staff<';

                switch (params.name) {
                    case 'Flute':
                        staff += '1';
                        break;
                    case 'Cello':
                        staff += '2';
                        break;
                    case 'Piano':
                        staff+= '3';
                        break;
                    case 'PianoL':
                        staff+= '4';
                        break;
                    default:
                        break;
                }

                if (seq.length === 1) {
                    staff += ',5mm>';
                } else {
                    switch (params.name) {
                        case 'Flute':
                            staff += ',14mm>';
                            break;
                        case 'Cello':
                            staff += ',14mm>';
                            break;
                        case 'Piano':
                            staff+= ',10mm>';
                            break;
                        case 'PianoL':
                            staff+= ',10mm>';
                            break;
                        default:
                            break;
                    }
                }

                seq = seq.join(' ');

                var name = '';
                if (params.name === 'Flute' || params.name === 'Cello') {
                    name += '\\instr<"' + params.name + '", dx=-1.65cm, dy=-0.5cm>';
                } else if (params.name === 'Piano') {
                    name += '\\instr<"' + params.name + '", dx=-1.65cm, dy=-1.3cm>';
                }
                var clef = '\\clef<"' + params.clef + '">';

                if (params.name === 'PianoL') {
                    clef = '';
                }

                var time = '\\meter<"' + params.time + '">';

                var autoBreak = '';
                var pageFormat = '';

                var barLine = '\\barFormat<style="staff">';

                if (params.name === 'Flute') {
                    autoBreak = '\\set<autoSystemBreak="off">';
                    pageFormat = '\\pageFormat<30cm, 10cm, 2cm, 5cm, 2cm, 5cm>';
                }

                //+ staff + staffFormat
                osc.send('/decatur/score', [params.name, '[' + pageFormat + autoBreak + name + clef + time + seq + ' \\space<6> \\repeatEnd]']);
            }
        }

        if (params.midi) {
            if (c.get('beat') % (numNotes * params.update) === 0) {
                params.bpm = dtm.master.clock.get('bpm');
                var evList = [];
                var unit = 60 / params.bpm * 4 / params.div;

                var dur = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round().normalize();

                var del = 0;

                for (var j = 0; j < params.update; j++) {
                    // TODO: array get-next should be fixed
                    pArr.index(pLen-1);
                    nArr.index(pLen-1);
                    dur.index(pLen-1);
                    acArr.index(pLen-1);

                    del = numNotes * j;

                    for (var i = 0; i < numNotes; i++) {
                        var noteLen = nArr.get('next');
                        var p = pArr.get('next');
                        var durMod = dur.get('next');
                        var ac = acArr.get('next');
                        var tr = trArr.get('next');

                        if (noteLen !== 0) {
                            if (durMod !== 0 && ac !== 0) {
                                var delInSec = del * unit + rand(0, 0.01);
                                var durInSec = noteLen * durMod * unit * 0.95;
                                if (mods.chord.get('len') > 1) {
                                    for (var k = 0; k < chord.length; k++) {
                                        var trv = pq(p + tr, sc, true);
                                        evList.push([delInSec, durInSec, pq(trv + chord[k], sc, true)]);
                                    }
                                } else {
                                    evList.push([delInSec, durInSec, pq(p + tr, sc, true)]);
                                }
                            }
                            del += noteLen;
                        }
                    }
                }

                for (var i = 0; i < evList.length; i++) {
                    if (typeof(evList[i]) !== 'undefined') {
                        dtm.osc.send('/decatur/midi', [params.name].concat(evList[i]));
                    }
                }
            }
        }

        return m.parent;
    };

    m.param.get = function (param) {
        switch (param) {
            case 'score':
                break;
            case 'midi':
                break;

            case 'a':
            case 'array':
                return mods[arguments[1]];
                break;
            default:
                break;
        }
        return m.parent;
    };

    /**
     * Switches output for Guido notation.
     * @function module:instr-decatur#score
     * @param bool {boolean}
     * @returns {dtm.instr}
     */
    m.param.score = function (bool) {
        params.score = bool;
        return m.parent;
    };


    /**
     * Switches output for MIDI message via OSC.
     * @function module:instr-decatur#midi
     * @param bool {boolean}
     * @returns {dtm.instr}
     */
    m.param.midi = function (bool) {
        params.midi = bool;
        return m.parent;
    };

    /**
     * Sets the instrument name.
     * @function module:instr-decatur#name
     * @param src {string}
     * @returns {dtm.instr}
     */
    m.param.name = function (src) {
        params.name = src;

        switch (params.name) {
            case 'Flute':
                params.clef = 'g';
                break;
            case 'Cello':
                params.clef = 'f';
                break;
            case 'Piano':
                params.clef = 'g';
                break;
            case 'PianoL':
                params.clef = 'f';
                break;
            default:
                break;
        }
        return m.parent;
    };

    /**
     * Sets the number of measures.
     * @function module:instr-decatur#measures
     * @param val {number}
     * @returns {dtm.instr}
     */
    m.param.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.param.update = function (val) {
        params.update = val;
        return m.parent;
    };

    /**
     * Sets the system clef.
     * @function module:instr-decatur#clef
     * @param src {string}
     * @returns {dtm.instr}
     */
    m.param.clef = function (src) {
        params.clef = src;
        return m.parent;
    };

    /**
     * Sets the number of staves.
     * @function module:instr-decatur#staves
     * @param num {number}
     * @returns {dtm.instr}
     */
    m.param.staves = function (num) {
        params.staves = num;
        return m.parent;
    };

    /**
     * Sets a callback function to be called at an update.
     * @function module:instr-decatur#staves
     * @param cb {function}
     * @returns {dtm.instr}
     */
    m.param.onUpdate = function (cb) {
        params.callbacks.push(cb);
        return m.parent;
    };

    /**
     * Sets the pitch value or sequence.
     * @function module:instr-decatur#staves
     * @param src {number|string|array|dtm.array}
     * @param [mode='adaptive'] {string}
     * @returns {dtm.instr}
     */
    m.mod.pitch = function (src, mode) {
        mapper(src, 'pitch');

        if (m.modes.literal.indexOf(mode) > -1) {
            mods.pitch.round();
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96, 0, 1).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81, 0, 1).round();
                mods.pitch.rescale(36, 72, 0, 1).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84, 0, 1).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60, 0, 1).round();
            } else if (params.name === 'Bass') {
                mods.pitch.rescale(48, 65, 0, 1).round();
            } else {
                mods.pitch.rescale(60, 96, 0, 1).round();
            }
        } else {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81).round();
                mods.pitch.rescale(36, 72).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60).round();
            } else if (params.name === 'Bass') {
                mods.pitch.rescale(48, 65).round();
            } else {
                mods.pitch.rescale(60, 96).round();
            }
        }

        return m.parent;
    };

    m.mod.range = function (src, mode) {
        mapper(src, 'range');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            mods.range.exp(2, 0, 1).scale(0.2, 0.8);
        }

        return m.parent;
    };

    m.mod.transpose = function (src, mode) {
        mapper(src, 'transp');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
        }

        return m.parent;
    };

    m.mod.tr = m.mod.transp = m.mod.transpose;

    m.mod.scale = function (src, mode) {
        if (m.modes.literal.indexOf(mode) > -1) {
            mapper(src, 'scale');
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mapper(src, 'scaleSel');
            mods.scaleSel.rescale(0, params.scale.length-1, 0, 1).round();
            mods.scale.set(params.scale[mods.scaleSel.get('mode')])
        } else {
            mapper(src, 'scaleSel');
            mods.scaleSel.rescale(0, params.scale.length-1).round();
            mods.scale.set(params.scale[mods.scaleSel.get('mode')])
        }

        return m.parent;
    };

    m.mod.chord = function (src, mode) {
        mapper(src, 'chord');
        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
        }
        return m.parent;
    };

    m.mod.pq = m.mod.scale;

    m.mod.div = function (src, mode) {
        mapper(src, 'div');

        if (m.modes.literal.indexOf(mode) > -1) {
            params.div = mods.div.round().get('mode');
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            mods.div.range(0, params.divMap.length-1).round();
            params.div = params.divMap[mods.div.get('mode')];
        }

        return m.parent;
    };

    m.mod.activity = function (src, mode) {
        mapper(src, 'activity');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.activity.scale(0, 2, 0, 1).round();
        } else {
            mods.activity.scale(0, 2).round();
        }

        if (!mode) {
        }

        return m.parent;
    };

    m.mod.ac = m.mod.activity;

    m.mod.note = function (src, mode) {
        mapper(src, 'note');

        if (m.modes.literal.indexOf(mode) > -1) {
            mods.note.round();
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
        }

        //else {
        //    mods.note.fitSum(params.measures * mods.div.get(0), true);
        //}

        return m.parent;
    };

    m.mod.dur = function (src, mode) {
        mapper(src, 'dur');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.dur.normalize(0, 1);
        } else {
            mods.dur.normalize();
        }

        return m.parent;
    };

    m.mod.dyn = function (src, mode) {
        mapper(src, 'dyn');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.dyn.scale(0, 5, 0, 1).round();
        } else {
            mods.dyn.scale(0, 5).round();
        }

        return m.parent;
    };

    m.mod.density = function (src, mode) {
        mapper(src, 'density');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            mods.density.scale(1, 32).exp(5, 0, 1);
        }

        return m.parent;
    };

    m.mod.repeat = function (src, mode) {
        mapper(src, 'repeat');

        if (m.modes.literal.indexOf(mode) > -1) {
            params.repeat = src;
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.repeat.rescale(0, params.repMap.length-1, 0, 1).round();
            params.repeat = params.repMap[mods.repeat.get('mode')];
        } else {
            mods.repeat.rescale(0, params.repMap.length-1).round();
            params.repeat = params.repMap[mods.repeat.get('mode')];
        }

        return m.parent;
    };

    m.mod.rep = m.mod.repeat;

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            mods[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            mods[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
                mods[dest] = dtm.array(src);
            } else if (isDtmArray(src)) {
                if (src.get('type') === 'string') {
                    mods[dest] = src.clone().classify();
                } else {
                    mods[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                mods[dest] = src;
            }
        }
    }

    function harmonizeGuido(seq, chord, scale) {
        for (var i = 0; i < seq.length; i++) {
            if (seq[i].indexOf('*') > -1 && seq[i].indexOf('_') === -1) {
                var nn = dtm.guido.pitchToNn(seq[i].split('*')[0]);

                seq[i] = '{' + seq[i];

                for (var j = 0; j < chord.length; j++) {
                    if (chord[j] !== 0) {
                        var cv = nn + chord[j];
                        if (scale) {
                            cv = pq(cv, scale, true);
                        }
                        seq[i] += ', ';
                        seq[i] += dtm.guido.nnToPitch(cv);
                    }
                }
                seq[i] += '}';
            }
        }

        return seq;
    }

    return m;
})();