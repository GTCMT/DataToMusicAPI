(function () {
    var m = dtm.m('decatur-midi', 'instr').register();

    var params = {
        name: 'Flute',
        callbacks: [],

        measures: 4,
        time: '4/4',

        bpm: dtm.master.clock.get('bpm'),
        div: 16,
        update: 1,
        repeat: 2,
        repMap: [2, 3, 3, 3, 4, 5, 5, 6, 6, 6, 7, 7, 8, 9],

        divMap: [16, 8, 4, 8, 16, 8, 16],
        range: {
            'Flute': [60, 75, 93],
            'Piano': [60, 72, 84],
            'PianoL': [36, 48, 60],
            'Cello': [36, 48, 72],
            'Pad': [36, 54, 72],
            'Pulse': [60, 75, 93]
        },
        scale: [[0, 2, 7, 9], [2, 5, 7], [0, 2, 5, 7, 10], [0, 2, 5, 7], [0, 2, 4, 7, 9], [0, 2, 4, 6, 7], [2, 4, 6, 7, 9]]
    };

    var mods = {
        pitch: dtm.array().fill('normal', 8, 60, 72).round(),
        range: dtm.array(0.3),
        scale: dtm.array(params.scale[params.scale.length-1]),
        scaleSel: dtm.array(2),
        transp: dtm.array(0),

        div: dtm.a(Math.round(params.divMap.length/2)),
        repeat: dtm.a(2),
        activity: dtm.array(1),
        note: dtm.array().fill('line', 8),
        dur: dtm.array().fill('zeros', 8)
    };

    m.output = function (c) {
        c.div(params.div);
        params.bpm = dtm.master.clock.get('bpm');
        var evList = [];
        var unit = 60 / params.bpm * 4 / params.div;

        var rep = params.repeat;
        var numNotes = params.div * params.measures;
        var pLen = Math.round(numNotes/rep);
        var sc = mods.scale.get();

        var p = mods.pitch.clone().fit(pLen, 'linear');

        var range = mods.range.clone().fit(pLen, 'step');
        var low = Math.round((params.range[params.name][0] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        var high = Math.round((params.range[params.name][2] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);

        p.rescale(low, high).round().pq(sc, true);
        var nArr = mods.note.clone().scale(0.1, 1).fit(pLen, 'linear').fitSum(pLen, true);

        var acArr = mods.activity.clone().fit(pLen, 'linear').round();

        var dur = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round().normalize();
        var del = 0;

        var tr = mods.transp.get('next');

        for (var j = 0; j < params.update; j++) {
            nArr.index(0);
            p.index(0);
            dur.index(0);
            acArr.index(0);

            del = numNotes * j;

            for (var i = 0; i < numNotes; i++) {
                var note = nArr.get('next');
                var pitch = p.get('next');
                var durMod = dur.get('next');
                var ac = acArr.get('next');

                if (note !== 0) {
                    if (durMod !== 0 && ac !== 0) {
                        evList.push([del * unit + dtm.val.rand(0, 0.01), note * durMod * unit * 0.95, pitch + tr]);
                    }
                    del += note;
                }
            }
        }

        if (c.get('beat') % (numNotes * params.update) === 0) {
            for (var i = 0; i < evList.length; i++) {
                if (typeof(evList[i]) !== 'undefined') {
                    dtm.osc.send('/decatur/midi', [params.name].concat(evList[i]));
                }
            }
        }
        return m.parent;
    };

    m.param.name = function (src) {
        params.name = src;
        return m.parent;
    };

    m.param.update = function (val) {
        params.update = val;
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (literal) {
            mods.pitch.round();
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

    m.mod.range = function (src, literal) {
        mapper(src, 'range');
        if (literal) {

        } else {
            mods.range.exp(2).scale(0.2, 0.8);
        }

        return m.parent;
    };

    m.mod.transpose = function (src, literal) {
        mapper(src, 'transp');

        if (!literal) {

        }
        return m.parent;
    };

    m.mod.transp = m.mod.transpose;

    m.mod.scale = function (src, literal) {
        if (literal) {
            mapper(src, 'scale');
        } else {
            mapper(src, 'scaleSel');
            mods.scaleSel.rescale(0, params.scale.length-1).round();
            mods.scale.set(params.scale[mods.scaleSel.get('mode')])
        }

        return m.parent;
    };

    m.mod.pq = m.mod.scale;

    m.mod.div = function (src, literal) {
        mapper(src, 'div');

        if (literal) {
            params.div = mods.div.round().get('mode');
        } else {
            mods.div.range(0, params.divMap.length-1).round();
            params.div = params.divMap[mods.div.get('mode')];
        }
        return m.parent;
    };

    m.mod.repeat = function (src, literal) {
        mapper(src, 'repeat');

        if (literal) {
            params.repeat = src;
        } else {
            mods.repeat.rescale(0, params.repMap.length-1).round();
            params.repeat = params.repMap[mods.repeat.get('mode')];
        }

        return m.parent;
    };

    m.mod.rep = m.mod.repeat;

    m.mod.activity = function (src, literal) {
        mapper(src, 'activity');

        if (!literal) {
            mods.activity.normalize().log(10);
        }

        return m.parent;
    };

    m.mod.ac = m.mod.activity;

    m.mod.note = function (src, literal) {
        mapper(src, 'note');

        if (literal) {
            mods.note.round();
        }
        return m.parent;
    };

    m.mod.dur = function (src, literal) {
        mapper(src, 'dur');

        if (!literal) {
            mods.dur.scale(0, 5).round().normalize();
        }

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