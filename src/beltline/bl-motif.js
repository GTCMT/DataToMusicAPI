(function () {
    var m = dtm.model('bl-motif', 'motif');

    m.params.isPercussion = false;
    m.params.rhythm = null;
    m.params.pitches = null;
    m.params.weights = null;

    var pc = {
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

    var generateRhythm = function (arr) {
        var a = dtm.array(arr);
        var intv = a.fit(32).rescale(0, 1).round().btoi().get();

        //var res = [];
        //for (var i = 0; i < 32/4; i++) {
        //
        //}

        //seq = seq.join(' ');


        return intv;
    };

    var generatePitch = function (arr, intv) {
        var a = dtm.array(arr);
        var p = a.fit(intv.length).rescale(-6, 11).round().get();

        var seq = [];

        for (var i = 0; i < intv.length; i++) {
            if (p[i] < 0) {
                p[i] = -1;
            }
            seq[i] = pc[p[i]] + '*' + intv[i] + '/16';
        }

        return seq;
    };

    m.generate = function (arr) {
        var temp = [];
        for (var ch = 0; ch < 3; ch++) {
            temp[ch] = [];

            for (var i = 0; i < arr.length; i++) {
                temp[ch][i] = _.random(0, 1, true);
            }

            temp[ch] = generatePitch(temp[ch], generateRhythm(temp[ch]));

            temp[ch] = temp[ch].join(' ');
        }

        var intervals = generateRhythm(arr);
        var seq = generatePitch(arr, intervals);


        seq = seq.join(' ');
        //seq = '[\\meter<"4/4"> ' + seq + ' \\newLine' + ' _*2/1' + ']';

        var res = '{' +
            '[\\instr<"Flute", dx=-1.65cm, dy=-0.5cm>\\meter<"4/4"> \\clef<"g"> ' + seq + '],' +
            '[\\instr<"Cello", dx=-1.65cm, dy=-0.5cm>\\meter<"4/4"> \\clef<"f"> ' + temp[0] + '],' +
            '[\\instr<"Piano", dx=-1.65cm, dy=-1.75cm> \\meter<"4/4"> \\clef<"g"> ' + temp[1] + '],' +
            '[\\meter<"4/4"> \\clef<"f"> ' + temp[2] + ']}';

        return res;
    };
})();