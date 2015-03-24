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
        div: 8,
        update: 1,
        repeat: 2,
        repMap: [2, 3, 3, 3, 4, 5, 5, 6, 6, 6, 7, 7, 8, 9],

        divMap: [16, 8, 16, 8, 16],
        range: {
            'Flute': [60, 75, 93],
            'Cello': [36, 48, 72],
            'Piano': [60, 72, 84],
            'PianoL': [36, 48, 60],
            'Pad': [36, 54, 72],
            'Pulse': [60, 75, 93]
        },
        scale: [[0, 2, 7, 9], [2, 5, 7], [0, 2, 5, 7, 10], [0, 2, 5, 7], [0, 2, 4, 7, 9], [0, 2, 4, 6, 7], [2, 4, 6, 7, 9]],

        celloFx: ['arc', 'pizz'],

        callbacks: []
    };

    var mods = {
        pitch: dtm.array().fill('normal', 8, 60, 72).round(),
        range: dtm.array(0.3),
        scale: dtm.array(params.scale[params.scale.length-1]),
        scaleSel: dtm.array(2),

        transp: dtm.array(0),
        chord: dtm.array(0),

        pos: dtm.array(0),

        div: dtm.a(Math.round(params.divMap.length/2)),
        repeat: dtm.array(2),
        note: dtm.array().fill('line', 8),
        dur: dtm.array().fill('ones', 8),
        dyn: dtm.array().fill('zeros', 8),

        //density: dtm.array(8),
        activity: dtm.array(1)
    };

    var g = dtm.guido;
    var osc = dtm.osc;

    m.output = function (c) {
        c.div(params.div);

        var rep = params.repeat;
        var numNotes = params.div * params.measures;

        if (c.get('beat') % (numNotes * params.update) === 0) {
            _.forEach(params.callbacks, function (cb) {
                cb(c);
            });
        }

        var pLen = Math.round(numNotes/rep);

        //var range = mods.range.clone().fit(pLen, 'step');
        //var low = Math.round((params.range[params.name][0] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        //var high = Math.round((params.range[params.name][2] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        var nArr = mods.note.clone().scale(0.1, 1).fit(pLen, 'linear').fitSum(pLen, true);
        var acArr = mods.activity.clone().fit(pLen, 'linear').round();
        var trArr = mods.transp.clone().fit(pLen, 'linear').round();

        if (params.score && (params.name === 'Flute' || params.name === 'Piano' || params.name === 'PianoL' || params.name === 'Cello')) {


            // MEMO: \repeatBegin at the beginning breaks the score (bug)
            if (c.get('beat') % (numNotes * params.update) === 0) {
                var seq = [];
                var pc = [];
                var oct = [];

                var slurOn = false;
                var accum = 0, accErr = 0;
                var fixImaginaryLines = false;
                var pre, post;

                var pArr = mods.pitch.clone().fit(pLen, 'linear');
                //pArr.rescale(low, high).round().pq(mods.scale.get(), true);
                pArr.round().pq(mods.scale.get(), true).round();

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
                        //console.log('bad: ' + i);
                        //console.log('accum: ' + accum);
                        //console.log('pre: ' + pre);
                        //console.log('post: ' + post);
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

                    //if (params.name === 'PianoL') {
                    //    pitch += '{';
                    //    var pMod = 0;
                    //
                    //    for (var i = 0; i < 3; i++) {
                    //        switch (i) {
                    //            case 0:
                    //                pMod = p + 0;
                    //                break;
                    //            case 1:
                    //                pMod = p + 7;
                    //                break;
                    //            case 2:
                    //                pMod = p + 10;
                    //                break;
                    //            default:
                    //                break;
                    //        }
                    //        pc[i] = g.pitchClass[dtm.val.mod(pMod, 12)];
                    //        oct[i] = (pMod - dtm.val.mod(pMod, 12)) / 12 - 4;
                    //        pitch += pc[i] + oct[i].toString();
                    //
                    //        if (i < 2) {
                    //            pitch += ',';
                    //        } else {
                    //            pitch += '}';
                    //        }
                    //    }
                    //
                    //} else {
                    //}
                    pitch += dtm.guido.nnToPitch(p+tr);

                    // note len & duration
                    if (params.durFx[dur] == 'rest' || ac === 0) {
                        pitch = '_';

                        if (slurOn) {
                            seq[i-1] += ' )';
                            slurOn = false;
                        }
                    }

                    if (params.durFx[dur] == 'slur' && ac !== 0) {
                        if (!slurOn && i !== numNotes-1) {
                            seq[i] += '\\slur( ';
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
                            seq[i] += '\\tie( ' + pitch + '*' + pre + '/' + params.div;
                            seq[i] += ',';
                            seq[i] += pitch + '*' + post + '/' + params.div + ' )';
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div;
                        }
                    }

                    if (ac !== 0 && !slurOn && params.div > 16) {
                        if (params.durFx[dur] == 'stacc') {
                            seq[i] = '\\stacc( ' + seq[i] + ' )';
                        } else if (params.durFx[dur] == 'tenuto') {
                            seq[i] = '\\ten( ' + seq[i] + ' )';
                        }
                    }

                    if ((params.durFx[dur] != 'slur' && slurOn) || i == numNotes-1 && slurOn) {
                        seq[i] += ' )';
                        slurOn = false;
                    }

                    //if (i > 0) {
                    //    if (dyn != prevDyn && (params.durFx[dur] != 'rest' || ac === 0)) {
                    //        seq[i] = '\\intens<"' + params.dynFx[dyn] + '", dx=-0.3, dy=-4> ' + seq[i];
                    //    }
                    //} else {
                    //    if (params.durFx[dur] != 'rest' || ac === 0) {
                    //        seq[i] = '\\intens<"' + params.dynFx[dyn] + '", dx=-0.3, dy=-4> ' + seq[i];
                    //    }
                    //}

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
                    seq = harmonizeGuido(seq, mods.chord.get(), mods.scale.get());
                }

                var accum = 0;
                var space = ' \\space<4>';
                for (var i = 0; i < seq.length; i++) {
                    accum += parseInt(seq[i].substr(seq[i].indexOf('*')+1, (seq[i].indexOf('/')-seq[i].indexOf('*')-1)));

                    if (seq[i].indexOf('_') > -1) {
                        seq[i] = '\\space<4> ' + seq[i] + ' \\space<4>';
                    }


                    if (accum >= 16) {
                        seq[i] += space;
                        if (accum % 16 === 0 && i !== seq.length-1) {
                            seq[i+1] = '\\bar' + space + seq[i+1];
                        } else if (i === seq.length-1) {
                            seq[i] += ' \\space<3>';
                        }
                        accum -= 16;
                    }
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
                var time = '\\meter<"' + params.time + '">';

                var autoBreak = '\\set<autoSystemBreak="off">';
                var barLine = '\\barFormat<style="staff">';

                //+ staff + staffFormat
                osc.send('/decatur/score', [params.name, '[' + autoBreak + barLine + name + clef + time + seq + ' \\repeatEnd]']);
            }
        }

        if (params.midi) {
            if (c.get('beat') % (numNotes * params.update) === 0) {
                params.bpm = dtm.master.clock.get('bpm');
                var evList = [];
                var unit = 60 / params.bpm * 4 / params.div;

                var sc = mods.scale.get();

                var p = mods.pitch.clone().fit(pLen, 'linear');
                //p.rescale(low, high).round().pq(sc, true);
                p.round().pq(sc, true).round();

                var dur = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round().normalize();


                var del = 0;
                //var tr = mods.transp.get('next');

                for (var j = 0; j < params.update; j++) {
                    // TODO: array get-next should be fixed
                    nArr.index(pLen-1);
                    p.index(pLen-1);
                    dur.index(pLen-1);
                    acArr.index(pLen-1);

                    del = numNotes * j;

                    for (var i = 0; i < numNotes; i++) {
                        var noteLen = nArr.get('next');
                        var pitch = p.get('next');
                        var durMod = dur.get('next');
                        var ac = acArr.get('next');
                        var tr = trArr.get('next');

                        if (noteLen !== 0) {
                            if (durMod !== 0 && ac !== 0) {
                                var delInSec = del * unit + dtm.val.rand(0, 0.01);
                                var durInSec = noteLen * durMod * unit * 0.95;
                                if (mods.chord.get('len') > 1) {
                                    var chord = mods.chord.get();
                                    for (var j = 0; j < chord.length; j++) {
                                        var cv = dtm.val.pq(pitch + chord[j] + tr, sc, true);

                                        evList.push([delInSec, durInSec, cv]);
                                    }
                                } else {
                                    evList.push([delInSec, durInSec, pitch]);
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
            default:
                break;
        }
        return m.parent;
    };

    m.param.score = function (bool) {
        params.score = bool;
        return m.parent;
    };

    m.param.midi = function (bool) {
        params.midi = bool;
        return m.parent;
    };

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

    m.param.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.param.update = function (val) {
        params.update = val;
        return m.parent;
    };

    m.param.clef = function (src) {
        params.clef = src;
        return m.parent;
    };

    m.param.staves = function (num) {
        params.staves = num;
        return m.parent;
    };

    m.param.onUpdate = function (cb) {
        params.callbacks.push(cb);
        return m.parent;
    };

    m.mod.pitch = function (src, mode) {
        mapper(src, 'pitch');

        if (m.modes.literal.indexOf(mode) > -1) {
            mods.pitch.round();
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96, 0, 1).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84, 0, 1).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60, 0, 1).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81, 0, 1).round();
                mods.pitch.rescale(36, 72, 0, 1).round();
            } else {
                mods.pitch.rescale(60, 96, 0, 1).round();
            }
        } else {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81).round();
                mods.pitch.rescale(36, 72).round();
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
            mods.range.exp(2).scale(0.2, 0.8);
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
            mods.activity.normalize(0, 1).log(10);
        } else {
            mods.activity.normalize().log(10);
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
            mods.density.scale(1, 32).exp(5);
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
            mods[dest] = dtm.array(src).classify();
        } else {
            if (src instanceof Array) {
                mods[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
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
                            cv = dtm.val.pq(cv, scale, true);
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