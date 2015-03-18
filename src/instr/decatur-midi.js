(function () {
    var m = dtm.m('decatur-midi', 'instr').register();

    var params = {
        name: 'Flute',
        callbacks: [],

        measures: 4,
        time: '4/4',

        bpm: dtm.master.clock.get('bpm'),
        div: 16
    };

    var mods = {
        repeat: dtm.a(1),
        pitch: dtm.array().fill('line', 8, 60, 72).round(),
        scale: dtm.array().fill('seq', 12),

        note: dtm.array().fill('consts', 8, 8),
        dur: dtm.array().fill('ones', 8)
    };

    m.output = function (c) {
        c.div(params.div);
        var evList = [];
        var unit = 60 / params.bpm * 4 / params.div;

        var rep = mods.repeat.get(0);
        var numNotes = params.div * params.measures;
        var pLen = Math.round(numNotes/rep);
        var sc = mods.scale.get();
        var p = mods.pitch.clone().fit(pLen, 'linear').round().pq(sc, true);
        var nArr = mods.note.clone().scale(0.1, 1).fit(pLen, 'step').fitSum(pLen, true);

        var dur = mods.dur.clone().fit(pLen, 'linear').scale(0, 5).round().normalize();
        var del = 0;

        for (var i = 0; i < numNotes; i++) {
            var note = nArr.get('next');
            var pitch = p.get('next');
            var durMod = dur.get('next');

            if (note !== 0) {
                if (durMod !== 0) {
                    evList.push([del * unit, note * durMod * unit * 0.95, pitch]);
                }
                del += note;
            }
        }

        if (c.get('beat') % numNotes === 0) {
            for (var i = 0; i < numNotes; i++) {
                dtm.osc.send('/decatur/midi', evList[i]);
            }
        }
        return m.parent;
    };

    m.param.div = function (val) {
        params.div = val;
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (literal) {
            mods.pitch.round();
        } else {
            mods.pitch.normalize();

            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96).round();
            } else if (params.name === 'Cello') {
                mods.pitch.rescale(36, 81).round();
            } else {
                mods.pitch.rescale(60, 96).round();
            }
        }

        return m.parent;
    };

    m.mod.scale = function (src, literal) {
        mapper(src, 'scale');

        if (!literal) {
            mods.scale.normalize().scale(0,11).round().unique().sort()
        }

        return m.parent;
    };

    m.mod.pq = m.mod.scale;


    m.mod.repeat = function (src, literal) {
        mapper(src, 'repeat');

        return m.parent;
    };

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