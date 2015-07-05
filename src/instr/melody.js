(function () {
    var m  = dtm.model('melody', 'instr').register();

    var params = {
        m: {
            pitches: dtm.a([72, 74, 76])
        }
    };

    m.output = function (c) {
        c.div(16);

        dtm.syn().nn(params.m.pitches.get('next')).play();
    };

    return m; // this returns itself when the instrument reinstantiates the model from dtm.modelCallers[]
})();