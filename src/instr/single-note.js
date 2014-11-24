(function () {
    var m = dtm.model2('single-note');

    m.complexity = 1;

    m.play = function (nn) {
        var osc = actx.createOscillator();
        var amp = actx.createGain();

        osc.connect(amp);
        amp.connect(out());

        osc.frequency.value = dtm.val.mtof(nn);
        osc.start(now());
        osc.stop(now() + 0.15);

        var del = actx.createDelay();
        del.delayTime.setValueAtTime(.25, 0);

        var delAmp = actx.createGain();
        delAmp.gain.setValueAtTime(.22, 0);

        amp.connect(del);
        del.connect(delAmp);
        delAmp.connect(del);
        delAmp.connect(out());

        amp.gain.value = 0.2;
        amp.gain.setTargetAtTime(0, now(), 0.1);

        return m;
    }
})();