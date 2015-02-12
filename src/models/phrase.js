(function () {
    var m = dtm.model('phrase', 'phrase');

    m.rhythm = function (input) {
        m.models.rhythm = input;
        return m;
    };

    m.toneRow = function (input) {
        m.models.toneRow = input;
        return m;
    };

    m.synthesize = function () {
        var len = 0;
        m.models.rhythm.beatsToIndices();
        m.models.toneRow.fit(m.models.rhythm.get('len'));

        m.set();
        return m;
    };
})();