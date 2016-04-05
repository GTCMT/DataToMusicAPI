(function () {
    var i = dtm.model('image-scan').register();
    var data = dtm.a();
    var dur = 30;
    var scale = dtm.a([0,4,5,7,10,14]);
    var numVoices = 100;

    i.data = function (d) {
        data = d.t();

        return i;
    };

    i.play = function () {
        setTimeout(function () {
            new Promise(function (resolve, reject) {
                var mu = data().each.mean().flatten().r(0,70,0,1).save();
                var sc = dtm.scale()
                    .filter(function (s) {
                        return s.get('name') !== 'chromatic';
                    })
                    .max(function (s) {
                        return mu().pq(s).snr().get(0);
                    }).flatten();
                resolve(sc);
            }).then(function (scale) {
                data.r(0,70,0,1).pq(scale);

                data.forEach(function(a,i){
                    if (i % Math.ceil(data.len/numVoices) === 0) {
                        dtm.syn().play().dur(dur)
                            .amp(3/numVoices).nn(30)
                            .nn.add(a)
                            .nn.add(dtm.rand(-0.2,0.2))
                            .pan(i/data.len * 2 - 1)
                            .amp.mult(dtm.rise())
                            .delay();
                    }
                });
            });
        }, 0);
        return i;
    };

    i.dur = function (val) {
        dur = val;
        return i;
    };

    i.pq = function (scale) {
        scale = dtm.scale(scale);
        return i;
    };

    i.scale = i.pq;

    i.numVoices = function (num) {
        numVoices = num;
        return i;
    };

    i.voice = i.voices = i.numVoices;

    return i;
})();