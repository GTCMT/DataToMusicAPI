(function () {
    var m = dtm.model('scale', 'scale');

    var scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    //m.get = function () {
    //    return scale;
    //};

    m.set = function (arr) {
        scale = arr;
        return m;
    };

    m.reset = function () {
        scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return m;
    };
})();