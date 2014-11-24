(function () {
    var m = dtm.model2('short-noise');

    m.complexity = 2;

    var buffer = dtm.synth2.noise(4192);

    var seq = [1, 0.2, 0.5, 0.2];
    var seqIdx = 0;

    var freq = 3000;
    m.setFreq = function (val) {
        freq = val;
    };

    m.play = function () {
        var src = actx.createBufferSource();
        var hpf = actx.createBiquadFilter();
        var amp = actx.createGain();

        src.connect(hpf);
        hpf.connect(amp);
        amp.connect(out());

        var startTime = now();

        src.buffer = buffer;
        src.loop = true;
        src.start(startTime);
        src.stop(startTime + 0.5);

        hpf.type = 'highpass';
        hpf.frequency.value = freq;

        amp.gain.value = 0.1 * seq[seqIdx];
        amp.gain.setTargetAtTime(0, startTime + 0.001, 0.022);

        seqIdx = (seqIdx + 1) % seq.length;

        return m;
    };
    
    m.modulate = function () {
        
    }
})();