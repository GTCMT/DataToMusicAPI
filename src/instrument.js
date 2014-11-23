dtm.instr = function (arg) {
    var instr = {
        className: 'dtm.instrument',
        params: {
            isPlaying: false,

            model: null,
            pitches: dtm.array([0, 4, 7, 11, 12, 11, 7, 4]).add(72),

            modDest: [],
            clock: dtm.clock()
        }
    };

    instr.params.modDest.push(instr.params.pitches);

    instr.play = function () {
        // can only play single voice / instance
        if (instr.params.isPlaying !== true) {
            instr.params.isPlaying = true;

            instr.params.clock.add(function () {
                dtm.synth().nn(instr.params.pitches.next()).play();
            }).start();

        }

        return instr;
    };

    instr.stop = function () {
        if (instr.params.isPlaying === true) {
            instr.params.isPlaying = false;

            instr.params.clock.stop();
        }
        return instr;
    };

    instr.clock = function () {
        return instr;
    };

    instr.mod = function () {
        if (typeof(arguments[0]) === 'number') {
            _.forEach(arguments, function (val, idx) {
                console.log(instr.params.modDest[idx]);
            })

        } else if (typeof(arguments[0]) === 'string') {
            if (typeof(arguments[1] === 'number') && typeof(instr.params[arguments[0]]) !== 'undefined') {
                instr.params[arguments[0]] = arguments[1]; // CHECK: ???????
            }

        } else if (typeof(arguments[0]) === 'object') {
            var keys = _.keys(arguments[0]);
            console.log(keys);
        }

        return instr;
    }

    instr.clone = function () {

    };

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            instr.params.model = _.find(dtm.modelCol, {name: arg});
            instr.play = instr.params.model.play;
            instr.run = instr.params.model.run; // CHECK
            instr.mod = instr.params.model.mod;
        } else {
            instr.params.model = arg;
        }
    }

    instr.start = instr.play;
    //instr.run = instr.play;

    return instr;
}