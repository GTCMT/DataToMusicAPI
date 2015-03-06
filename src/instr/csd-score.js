(function () {
    var m = dtm.model('csd-score', 'instr').register();

    m.modules = {
        pitch: dtm.a(72),
        div: dtm.a(16)
    };

    m.output = function (c) {
        var p = m.modules.pitch.get('next');
        var div = m.modules.div.get('next');
        c.div(div);

        dtm.osc.send('/csd/event', ['i1', 0, 0.1, p]);
        return m.parent;
    };

    m.setter.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (!literal) {
            m.modules.pitch.normalize().rescale(60, 90).round();
        }

        return m.parent;
    };

    m.setter.div = function (src, literal) {
        mapper(src, 'div');

        if (!literal) {
            m.modules.div.normalize().scale(1, 5).round().powof(2);
        }
        return m.parent;
    };

    // TODO: this needs to be a core function?
    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            m.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            m.modules[dest] = dtm.array(src).classify();
        } else {
            if (src instanceof Array) {
                m.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    m.modules[dest] = src.clone().classify();
                } else {
                    m.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                m.modules[dest] = src;
            }
        }
    }

    return m;
})();