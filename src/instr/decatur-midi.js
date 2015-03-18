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
        pitch: dtm.a().fill('random', 8, 60, 90).round(),
        scale: dtm.array().fill('seq', 12),

        dur: dtm.array().fill('ones', 8)
    };

    m.output = function (c) {
        c.div(params.div);

        var rep = mods.repeat.get(0);
        var evList = [];
        var delUnit = 60 / params.bpm * 4 / params.div;

        var numNotes = params.div * params.measures;
        var pLen = Math.round(numNotes/rep);
        var sc = mods.scale.get();
        var p = mods.pitch.clone().fit(pLen, 'linear').pq(sc, true);

        var dur = mods.dur.clone().fit(pLen, 'step');

        for (var i = 0; i < numNotes; i++) {
            evList.push([i * delUnit, delUnit * dur.get('next'), p.get('next')]);
        }

        // CHECK: should send only at fixed freq??????
        if (c.get('beat') % (params.div * params.measures) === 0) {
            for (var i = 0; i < numNotes; i++) {
                dtm.osc.send('/decatur/midi', evList[i]);
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

    m.mod.dur = function (src, literal) {
        mapper(src, 'dur');

        if (!literal) {
            mods.dur.normalize();
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