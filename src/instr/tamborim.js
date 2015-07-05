(function () {
    var m = dtm.model('tamborim', 'instr').register();

    var subDiv = 4 * 8;
    var bpm = 800;
    //var c = dtm.clock(bpm, subDiv).sync(false);

    m.motif = {
        original: dtm.array([1, 1, 1, 1]).fit(subDiv, 'zeros'),
        target: dtm.array([1, 0, 1, 1, 1, 0]).fit(subDiv, 'zeros'),
        midx: 0
    };

    //m.morphed = dtm.transform.morph(m.motif.original, m.motif.target, m.motif.midx);

    var idx = 0;
    var offset = dtm.tr.calcBeatsOffset(m.motif.original.get(), m.motif.target.get());
    var noOffset = dtm.array().fill('zeroes', offset.length).get();

    var curNote = 0;

    m.output = function (c) {
        c.bpm(bpm).div(subDiv).start(); // CHECK: needs start for some reason
        m.curOffset = dtm.transform.morph(noOffset, offset, m.motif.midx);
        m.curOffset = dtm.transform.round(m.curOffset);

        var morphed = dtm.tr.applyOffsetToBeats(m.motif.original.get(), m.curOffset);
        //c.bpm(bpm + m.motif.midx * 60);
        //c.bpm(bpm + m.motif.midx * 60);
        //var delay = (1 - m.morphed[idx]) * 1 / c.params.bpm / m.morphed.length;

        if (morphed[idx] === 1) {
            if (curNote === 2) {
                dtm.syn('noise').decay(0.02).lpf(4000).amp(1.2).play();
            } else {
                dtm.syn('noise').decay(0.02).lpf(1000).amp(1.2).play();
            }

            curNote = dtm.value.mod(curNote + 1, 4);
        }

        idx = dtm.value.mod(idx + 1, subDiv);

        return m;
    };

    //m.stop = function () {
    //    c.stop();
    //    return m;
    //};
    //

    m.mod.mod = function (val) {
        m.motif.midx = val;
        return m;
    };

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