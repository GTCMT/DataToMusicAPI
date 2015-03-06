(function () {
    var m = dtm.model('testInstr', 'instr').register();

    m.setter.doThis = function () {
        console.log('doing this');
        return m.parent;
    };

    m.setter.testSetter = function (src, adapt) {
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