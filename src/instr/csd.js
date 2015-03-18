(function () {
    var m = dtm.model('csd', 'instr').register();

    var mods = {
        pitch: dtm.a(60),
        div: dtm.a(8)
    };

    var csd = null;
    if (typeof(csound) !== 'undefined') {
        csd = csound;
    }

    m.output = function (c) {
        var p = mods.pitch.get('next');
        c.div(mods.div.get('next'));

        csd.Event('i1 0 0.2 ' + p);
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (!literal) {
            mods.pitch.normalize().scale(60, 90);
        }

        return m.parent;
    };

    m.mod.div = function (src, literal) {
        mapper(src, 'div');

        if (!literal) {
            mods.div.normalize().scale(0, 5).round().powof(2);
        }

        return m.parent;
    };

    m.mod.file = function (src, literal) {
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