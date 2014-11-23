(function () {
    var m = dtm.model('clave');
    m.complexity = 1;

    var src = function () {

    };

    var darr = dtm.transform;

    m.motif.beats = darr.itob([3, 3, 4, 2, 4]);
    m.motif.target = darr.itob([2, 1, 2, 1]);
    m.motif.midx = 0;

    var cl = dtm.clock(80);
    cl.setSubDiv(16);
    cl.setTime('2/4');

    var noise = dtm.synth2.noise(4192);

    m.run = function () {
        var idx = 0;

        cl.add(function () {
            var src = actx.createBufferSource();
            var amp = actx.createGain();
            src.connect(amp);
            amp.connect(out());
            src.buffer = noise;
            src.loop = true;

            m.motif.morphed = darr.morph(m.motif.beats, m.motif.target, m.motif.midx);

            if (idx >= m.motif.morphed.length) {
                idx = 0;
            }

            amp.gain.setValueAtTime(0.5 * dtm.value.expCurve(m.motif.morphed[idx], 20), now());
            amp.gain.linearRampToValueAtTime(0, now() + 0.02);

            src.start(now());

            idx = (idx + 1) % m.motif.morphed.length;
        });

        cl.start();
    };

    m.modulate = function (val) {
        m.motif.midx = val;
    }

    return m;
})();