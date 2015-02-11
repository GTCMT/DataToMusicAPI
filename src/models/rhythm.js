(function () {
    var m = dtm.model('rhythm', 'rhythm');

    var defIntervals = [4, 4, 4, 4];
    var div = 16;

    m.set = function (arr) {
        defIntervals = arr;
        return m;
    };

    //m.get = function () {
    //    return defIntervals;
    //};
})();