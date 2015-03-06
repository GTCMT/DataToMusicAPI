dtm.guido = function () {
    var guido = {
        type: 'dtm.guido',
        parts: [],
        numParts: 1
    };

    guido.pc = {
        '-1': '_',
        'r': '_',
        0: 'c',
        1: 'd&',
        2: 'd',
        3: 'e&',
        4: 'e',
        5: 'f',
        6: 'f#',
        7: 'g',
        8: 'a&',
        9: 'a',
        10: 'b&',
        11: 'b'
    };

    //guido.dur = {
    //    1: '/1',
    //    2: '/'
    //};

    guido.setup = function () {
        return guido;
    };

    guido.format = function () {
        return guido;
    };

    guido.test = function (arr) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = [guido.pc[_.random(-1, 11)], '*', val + '/16'].join('');
        });

        res = res.join(' ');
        console.log(res);

        return guido;
    };

    guido.meow = function (rhythm, pitches) {
        var res = [];

        for (var i = 0; i < rhythm.length; i++) {
            if (pitches[i] instanceof Array) {
                var chord = [];
                _.forEach(pitches[i], function (val, idx) {
                    chord[idx] = [guido.pc[val], '*', rhythm[i] + '/16'].join('');
                });
                res[i] = '{' + chord.join(', ') + '}';
            } else {
                res[i] = [guido.pc[pitches[i]], '*', rhythm[i] + '/16'].join('');
            }
        }

        res = res.join(' ');
        console.log(res);
        return guido;
    };

    return guido;
};