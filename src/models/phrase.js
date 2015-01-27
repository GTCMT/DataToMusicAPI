(function () {
    var m = dtm.model('phrase', 'phrase');

    m.rhythm = dtm.model('rhythm');
    m.scale = dtm.model('scale');

    m.models = {
        scale: m.scale
    };
})();