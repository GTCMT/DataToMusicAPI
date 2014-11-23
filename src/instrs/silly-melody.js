(function () {
    var m = dtm.model('silly-melody');

    m.motif = {
        rhythm: dtm.createArray([4, 8, 7, 3, 16, 16, 9]),
        beats: null,

        transpose: 72,
        pitch: dtm.createArray([0, 4, 7]),

        target: dtm.createArray([0]),
        morphed: [0],
        morphIdx: 0
    };

    m.playNote = function (nn, gain) {
        var osc = actx.createOscillator();
        var amp = actx.createGain();
        osc.connect(amp);
        amp.connect(out());

        amp.gain.setValueAtTime(0.5, now());
        osc.frequency.value = mtof(nn);
        osc.start(now());
        osc.stop(now() + 0.2);
    };

    var cl = dtm.createClock(120, 16);
    var idx = 0;
    var midx = 0;
    var ridx = 0;
    m.motif.beats = m.motif.rhythm.ntob(16).values;

    m.run = function () {
        if (midx >= m.motif.morphed.length) {
            midx = 0;
        }

        cl.add(function () {

            if (m.motif.beats[ridx] !== 0) {
                m.playNote(m.motif.morphed[midx] + m.motif.transpose);

                midx = dtm.value.mod((midx+1), m.motif.morphed.length);
            }

            ridx = dtm.value.mod((ridx+1), m.motif.rhythm.length);
        });

        cl.start();
    };

    m.modulate = function (val) {
        m.motif.morphIdx = val;
        m.motif.morphed = dtm.array.morph(m.motif.pitch.values, m.motif.target.values, val);
    }

})();