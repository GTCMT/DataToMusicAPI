(function () {
    var m = dtm.model('instr', 'instr');

    m.play = function () {
        console.log('playing!');
        return m;
    };

    m.stop = function () {
        return m;
    };
})();