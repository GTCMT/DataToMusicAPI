(function () {
    var m = dtm.model('decatur-piano', 'instr').register();

    var params = {
        name: 'Piano',
        voice: 'poly',
        callbacks: [],

        measures: 4,
        time: '4/4',

        staves: 2,
        //clef: 'g',

        updateFreq: 1/4,

        durFx: ['rest', 'stacc', 'half', 'normal', 'tenuto', 'slur'],
        dynFx: ['pp', 'p', 'mp', 'mf', 'f', 'ff']
    };

    var mods = {
        volume: dtm.array(1),
        scale: dtm.array().fill('seq', 12),
        rhythm: dtm.array(1),
        pitch: dtm.array().fill('line', 8, 60, 72).round(),
        //transp: dtm.array(0),
        //chord: dtm.array(0),

        repeats: null,
        step: null,

        subdiv: dtm.array(8),
        pos: dtm.array(0),

        note: dtm.array().fill('consts', 8, 8),
        dur: dtm.array().fill('ones', 8),
        dyn: dtm.array().fill('zeros', 8)
    };

    var g = dtm.guido;
    var osc = dtm.osc;

    m.output = function (c) {
        //var time = params.time.split('/');
        //var len = time[0] / time[1] *  params.measures;

        var numNotes = 8;
        var seq = [];
        var pc = [];
        var oct = [];

        var slurOn = false;
        var accum = 0;
        var fixImaginaryLines = false;
        var pre, post;

        var div = mods.subdiv.get();
        var p = mods.pitch.clone().fit(numNotes, 'step').get();
        var len = mods.note.clone().fit(numNotes, 'step').fitSum(params.measures * mods.subdiv.get(0), true).get();

        var dur = mods.dur.clone().fit(numNotes, 'step').scale(0, 5).round().get();
        var dyn = mods.dyn.clone().fit(numNotes, 'step').get();

        for (var i = 0; i < numNotes; i++) {
            seq[i] = '';

            if (len[i] > 1 && len[i] + (accum % 4) > 4) {
                fixImaginaryLines = true;
                post = (len[i] + accum) % 4;

                if (post == 0) {
                    post = 4;
                }
                pre = len[i] - post;
            }
            accum += len[i];

            pc[i] = g.pitchClass[dtm.val.mod(p[i], 12)];
            oct[i] = (p[i] - dtm.val.mod(p[i], 12)) / 12 - 4;

            // pitch
            var pitch = pc[i] + oct[i].toString();

            // note len & duration
            if (params.durFx[dur[i]] == 'rest') {
                pitch = '_';

                if (slurOn) {
                    seq[i] += ')';
                    slurOn = false;
                }
            }

            if (params.durFx[dur[i]] == 'slur') {
                if (!slurOn && i !== numNotes-1) {
                    seq[i] += '\\slur(';
                    slurOn = true;
                }
            }

            if (params.durFx[dur[i]] == 'half') {
                //if (len[i] === 3) {
                //    seq[i] += pitch + '*' + len[i]-1 + '/' + div[0] + '_*' + len[i]-2 + '/' + div[0];
                //} else {
                //    seq[i] += pitch + '*' + len[i] + '/' + div[0]*2 + '_*' + len[i] + '/' + div[0]*2;
                //}
                if (fixImaginaryLines) {
                    seq[i] += pitch + '*' + pre + '/' + div[0]*2 + '_*' + pre + '/' + div[0]*2;
                    seq[i] += pitch + '*' + post + '/' + div[0]*2 + '_*' + post + '/' + div[0]*2;
                } else {
                    seq[i] += pitch + '*' + len[i] + '/' + div[0]*2 + '_*' + len[i] + '/' + div[0]*2;
                }

            } else if (params.durFx[dur[i]] == 'rest') {
                if (fixImaginaryLines) {
                    seq[i] += pitch + '*' + pre + '/' + div[0];
                    seq[i] += pitch + '*' + post + '/' + div[0];
                } else {
                    seq[i] += pitch + '*' + len[i] + '/' + div[0];
                }
            } else {
                if (fixImaginaryLines) {
                    seq[i] += '\\tie(' + pitch + '*' + pre + '/' + div[0];
                    seq[i] += pitch + '*' + post + '/' + div[0] + ')';
                } else {
                    seq[i] += pitch + '*' + len[i] + '/' + div[0];
                }
            }

            if (params.durFx[dur[i]] == 'stacc') {
                seq[i] = '\\stacc(' + seq[i] + ')';
            } else if (params.durFx[dur[i]] == 'tenuto') {
                seq[i] = '\\ten(' + seq[i] + ')';
            }

            if ((params.durFx[dur[i]] != 'slur' && slurOn) || i == numNotes-1 && slurOn) {
                seq[i] += ')';
                slurOn = false;
            }

            if (i > 0) {
                if (dyn[i] != dyn[i-1] && params.durFx[dur[i]] != 'rest') {
                    seq[i] = '\\intens<"' + params.dynFx[dyn[i]] + '", dx=-0.3, dy=-4> ' + seq[i];
                }
            } else {
                if (params.durFx[dur[i]] != 'rest') {
                    seq[i] = '\\intens<"' + params.dynFx[dyn[i]] + '", dx=-0.3, dy=-4> ' + seq[i];
                }
            }

            fixImaginaryLines = false;
        }

        seq = seq.join(' ');

        var name = '\\instr<"' + params.name + '", dx=-1.65cm, dy=-2.0cm>';
        var gClef = '\\clef<"g">';
        var fClef = '\\clef<"f">';
        var time = '\\meter<"' + params.time + '">';

        //var autoBreak = '\\autoBreak<system="off",page="off">'; not working
        var autoBreak = '\\set<autoSystemBreak="off">';
        console.log('[' + autoBreak + name + gClef + time + seq + ' \\repeatEnd],' + '[' + autoBreak + fClef + time + seq + ' \\repeatEnd]');

        // MEMO: \repeatBegin at the beginning breaks the score (bug)
        osc.send('/guido/score', [params.name, '[' + autoBreak + name + gClef + time + seq + ' \\repeatEnd],' + '[' + autoBreak + fClef + time + seq + ' \\repeatEnd]']);

        return m.parent;
    };

    m.mod.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.mod.dur = function (src, literal) {
        mapper(src, 'dur');
        if (!literal) {
            mods.dur.normalize();
        }
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (literal) {
            mods.pitch.round();
        } else {
            mods.pitch.normalize().rescale(60, 90).round();
        }

        return m.parent;
    };

    m.mod.subDiv = function (src, literal) {
        mapper(src, 'subdiv');

        if (literal) {
            mods.subdiv.round();
        } else {
            mods.subdiv.normalize().scale(1, 5).round().powof(2);
        }
        return m.parent;
    };

    m.mod.len = m.mod.div = m.mod.subdiv = m.mod.subDiv;

    m.mod.note = function (src, literal) {
        mapper(src, 'note');

        if (literal) {
            mods.note.round();
        } else {
            mods.note.fitSum(params.measures * mods.subdiv.get(0), true);
        }

        return m.parent;
    };

    m.mod.dyn = function (src, literal) {
        mapper(src, 'dyn');

        if (!literal) {
            mods.dyn.scale(0, 5).round();
        }

        return m.parent;
    };

    m.mod.magic = function (src, literal) {
        return m.parent;
    };

    m.mod.test = function (src1, src2, literal) {
        if (!literal) {

        }

        return m.parent;
    };

    m.mod.name = function (src) {
        params.name = src;
        return m.parent;
    };

    m.mod.clef = function (src) {
        params.clef = src;
        return m.parent;
    };

    m.mod.staves = function (num) {
        params.staves = num;
        return m.parent;
    };

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

    return m;
})();