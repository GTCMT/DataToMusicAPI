(function () {
    var m = dtm.model('testInstr', 'instr').register();

    m.mod.doThis = function () {
        console.log('doing this');
        return m.parent;
    };

    m.mod.testSetter = function (src, adapt) {
        console.log('testing');

        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        if (adapt) {

        } else {

        }

        return m.parent;
    };

    return m;
})();