(function () {
    var m = dtm.model('rhythm-seq');
    m.complexity = 2;

    var buffer = dtm.synth2.noise(4192);

    var motif = {};
    motif.seq = [1, 0.2, 0.5, 0.2];
    motif.seqIdx = 0;

    var freq = 3000;
    m.setFreq = function (val) {
        freq = val;
    };

    m.play = function () {
        var src = actx.createOscillator();
        var amp = actx.createGain();
        src.connect(amp);
        amp.connect(out());

        src.frequency.setValueAtTime(1000, now());
        src.frequency.linearRampToValueAtTime(50, now() + 0.01);
        amp.gain.vlaue = 0.5;
        amp.gain.linearRampToValueAtTime(0, now() + 0.01);

        src.start(now());
        src.stop(now() + 0.01);
    }

    m.run = function () {
        var pCl = m.getParentClock();
        console.log(pCl.bpm);

        return m;
    }

})();