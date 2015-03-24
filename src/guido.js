dtm.guido = {
    //type: 'dtm.guido',
    //parts: [],
    //numParts: 1,

    pitchClass: {
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
    },

    diatonic: {
        'c': 0,
        'd': 2,
        'e': 4,
        'f': 5,
        'g': 7,
        'a': 9,
        'b': 11,
        '_': null
    },

    nnToPitch: function (nn) {
        var pc = dtm.guido.pitchClass[dtm.val.mod(nn, 12)];
        var oct = (nn - dtm.val.mod(nn, 12)) / 12 - 4;
        return pc + oct.toString();
    },

    pitchToNn: function (sym) {
        var elems = sym.split('');

        var acc = 0;
        var oct = 0;

        var pc = dtm.guido.diatonic[elems[0]];

        if (elems.length === 2) {
            oct = (parseInt(elems[1]) + 4) * 12;
        } else if (elems.length > 2) {
            if (elems[1] == '#') {
                acc = 1;
            } else if (elems[1] == '&') {
                acc = -1;
            }

            if (elems.length === 3) {
                if (elems[1] == '-') {
                    oct = (parseInt(elems[1]+elems[2]) + 4) * 12;
                } else {
                    oct = (parseInt(elems[2]) + 4) * 12;
                }
            } else if (elems.length === 4) {
                oct = (parseInt(elems[2] + elems[3]) + 4) * 12;
            }
        }

        return pc + acc + oct;
    }

    //guido.dur = {
    //    1: '/1',
    //    2: '/'
    //};

    //guido.setup = function () {
    //    return guido;
    //};
    //
    //guido.format = function () {
    //    return guido;
    //};
    //
    //guido.test = function (arr) {
    //    var res = [];
    //
    //    _.forEach(arr, function (val, idx) {
    //        res[idx] = [guido.pc[_.random(-1, 11)], '*', val + '/16'].join('');
    //    });
    //
    //    res = res.join(' ');
    //    console.log(res);
    //
    //    return guido;
    //};
    //
    //guido.meow = function (rhythm, pitches) {
    //    var res = [];
    //
    //    for (var i = 0; i < rhythm.length; i++) {
    //        if (pitches[i] instanceof Array) {
    //            var chord = [];
    //            _.forEach(pitches[i], function (val, idx) {
    //                chord[idx] = [guido.pc[val], '*', rhythm[i] + '/16'].join('');
    //            });
    //            res[i] = '{' + chord.join(', ') + '}';
    //        } else {
    //            res[i] = [guido.pc[pitches[i]], '*', rhythm[i] + '/16'].join('');
    //        }
    //    }
    //
    //    res = res.join(' ');
    //    console.log(res);
    //    return guido;
    //};
};