(function () {
    var m = dtm.model('clave', 'instr').register();

    //var darr = dtm.transform;
    //m.motif = {};
    //m.motif.beats = darr.itob([3, 3, 4, 2, 4]);
    //m.motif.target = darr.itob([2, 1, 2, 1]);
    //m.motif.midx = 0;

    //var cl = dtm.clock(80);
    //cl.subDiv(16);
    //cl.setTime('2/4');

    var params = {
        modules: {
            voice: dtm.synth(),
            base: dtm.array([3,3,4,2,4]).itob(),
            target: dtm.array([2,1,2,1]).itob(),
            res: dtm.array([3,3,4,2,4]).itob(),
            morph: dtm.array(0)
        }
    };

    m.output = function (c) {
        c.div(16);

        var v = params.modules.voice;

        var m = params.modules.morph.get('next');
        var r = params.modules.res.get('next');

        if (r) {
            v.play();
        }
    };

    m.mod.morph = function (src, mode) {
        mapper(src, 'morph');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.morph.normalize(0, 1);
        } else {
            params.modules.morph.normalize();
        }
    };

    m.mod.target = function (src, mode) {
        mapper(src, 'target');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            //params.modules.target.normalize(0, 1);
        } else {
            //params.modules.target.normalize();
        }
    };

    //m.play = function () {
    //    var idx = 0;
    //
    //    cl.add(function () {
    //        var src = actx.createBufferSource();
    //        var amp = actx.createGain();
    //        src.connect(amp);
    //        amp.connect(out());
    //        src.buffer = noise;
    //        src.loop = true;
    //
    //        m.motif.morphed = darr.morph(m.motif.beats, m.motif.target, m.motif.midx);
    //
    //        if (idx >= m.motif.morphed.length) {
    //            idx = 0;
    //        }
    //
    //        amp.gain.setValueAtTime(0.5 * dtm.value.expCurve(m.motif.morphed[idx], 20), now());
    //        amp.gain.linearRampToValueAtTime(0, now() + 0.02);
    //
    //        src.start(now());
    //
    //        idx = (idx + 1) % m.motif.morphed.length;
    //    });
    //
    //    cl.start();
    //};

    //m.mod = function (val) {
    //    m.motif.midx = val;
    //};

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
                params.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
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