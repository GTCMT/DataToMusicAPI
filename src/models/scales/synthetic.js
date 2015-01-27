// a synthetic scale model for generic models.scales
(function () {
    // CHECK: how to inherit from the scale model?
    var m = dtm.model('synthetic', 'scale');

    // tetra chords
    var tc = [[1, 2, 2], [2, 1, 2], [2, 2, 1]];

    m.params.upper = 0;
    m.params.lower = 0;
    m.params.scale = [0, 2, 4, 5, 7, 9, 11];

    m.mod = function (lower, upper) {
        // expect the inputs to be in the range of 0-1
        lower = Math.round(lower * 2);
        upper = Math.round(upper * 2);

        m.params.scale[0] = 0;

        for (var i = 0; i < 3; i++) {
            m.params.scale[i+1] = m.params.scale[i] + tc[lower][i];
        }

        m.params.scale[4] = 7;

        for (var j = 0; j < 2; j++) {
            m.params.scale[j+5] = m.params.scale[j+4] + tc[upper][j];
        }

        return m;
    };

    m.get = function () {
        return m.params.scale;
    };
})();


