(function () {
    var m = dtm.model2('nice-chords');
    m.complexity = 5;

    var numVoices = 2;
    m.modulate = function (val) {
        numVoices = Math.round(val * 6) + 2;
    };

    var scale = [0, 2, 4, 7, 11];

    m.test = function () {
        return m;
    };

    // make it inheritable...
    m.setScale = function (arr) {
        scale = arr;
        return m;
    };

    m.play = function () {
        var amp = actx.createGain();
        var nn = Math.round(Math.random() * 30 + 60);
        var dur = 2;

//        var cd = m.master();

        var arr = [0, 1];
        for (var i = 0; Math.round(i < Math.random() * 13); i++) {
            arr.push(Math.random());
        }
        var real = new Float32Array(arr);
        var img = real;
        var timbre = actx.createPeriodicWave(real, img);

        for (var i = 0; i < numVoices; i++) {
            var osc = [];
            osc[i] = actx.createOscillator();
            osc[i].connect(amp);

            osc[i].frequency.setValueAtTime(mtof(pitchQ(nn + 3 * i, scale)), now());
            osc[i].setPeriodicWave(timbre);

            osc[i].start(now());
            osc[i].stop(now() + dur * .9);
        }

        amp.connect(out());

        var delta = 0.2;
        amp.gain.value = 0;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(0.15, now() + .001, dur - delta);
        amp.gain.setTargetAtTime(0, now() + dur - delta, delta);


        var del = actx.createDelay();
        del.delayTime.setValueAtTime(.3, 0);

        var delAmp = actx.createGain();
        delAmp.gain.setValueAtTime(.8, 0);

        amp.connect(del);
        del.connect(delAmp);
        delAmp.connect(del);
        delAmp.connect(out());

        return m;
    };

//    m.setTimbre(m.timbre());
})();