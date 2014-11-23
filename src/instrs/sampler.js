(function () {
    var m = dtm.model('sampler');
    m.complexity = 2;

    m.loop = false;

    var buffer = actx.createBuffer(1, 1000, 44100);

    // testing promise right here
    m.loadBuffer = function (arrBuf) {
//        buffer = loadBuffer(arrBuf);
        return new Promise(function (resolve, reject) {
            actx.decodeAudioData(arrBuf, function (buf) {
                buffer = buf;
                resolve(buffer);
            });
        });

//        return m;
    };

    m.play = function () {
        var src = actx.createBufferSource();
        var amp = actx.createGain();
        src.connect(amp);
        amp.connect(out());

        src.buffer = buffer;
        src.loop = m.loop;

        amp.gain.value = 0.5;

        src.start(now());

        return m;
    };
})();