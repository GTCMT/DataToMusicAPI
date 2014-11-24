(function () {
    var m = dtm.model2('tamborim');

    var c = dtm.clock(440, 48);

    m.motif = {
        original: dtm.array([1, 1, 1, 1]).fit(48, 'zeros'),
        target: dtm.array([1, 0, 1, 1, 1, 0]).fit(48, 'zeros'),
        midx: 0
    };

    //m.morphed = dtm.transform.morph(m.motif.original, m.motif.target, m.motif.midx);

    var idx = 0;

    m.run = function () {
        c.add(function () {
            m.morphed = dtm.transform.morph(m.motif.original.value, m.motif.target.value, m.motif.midx);

            if (idx >= m.morphed.length) {
                idx = idx - m.morphed.length;
            }

            //c.bpm(120 + m.motif.midx * 60);
            //var delay = (1 - m.morphed[idx]) * 1 / c.params.bpm / m.morphed.length;

            if (m.morphed[idx] == 1) {
                dtm.syn().decay(0.05).play();
            }

            idx++;
            //console.log(m.morphed);
        }).start();

        return m;
    };

    m.modulate = function (val) {
        m.motif.midx = val;
        return m;
    };

    return m;
})();