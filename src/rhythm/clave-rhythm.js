(function () {
    var m = dtm.model('clave', 'beats');

    m.source = dtm.tr.itob([3, 3, 4, 2, 4]);
    m.target = dtm.tr.itob([2, 1, 2, 1]);
    m.midx = 0;
    m.beats = dtm.array(dtm.tr.morph(m.source, m.target, m.midx));

    m.mod = function (val) {
        m.midx = val;
        m.beats.set(dtm.tr.morph(m.source, m.target, m.midx));
    };

    m.next = function () {
        return m.beats.round().next();
    };

})();