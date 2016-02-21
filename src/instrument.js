dtm.instr = function () {
    var instr = function () {
        return instr;
    };

    var params = {
        dur: 0.1
    };

    var s = dtm.synth().dur(params.dur).rep()
        .amp(dtm.decay().expc(10));
    var uni = dtm.model('unipolar');

    instr.play = function () {
        s.play();

        return instr;
    };

    instr.stop = function () {
        s.stop();

        return instr;
    };

    instr.pitch = function () {
        var args;
        if (argsAreSingleVals(arguments)) {
            args = argsToArray(arguments);
        } else if (arguments.length === 1) {
            args = arguments[0];
        }

        s.nn(dtm.model('unipolar')(args).range(60,90).block());
        return instr;
    };

    instr.speed = function () {
        var args;
        if (argsAreSingleVals(arguments)) {
            args = argsToArray(arguments);
        } else if (arguments.length === 1) {
            args = arguments[0];
        }

        s.int(dtm.model('unipolar')(args).range(0.5, 0.05).block());
        return instr;
    };

    return instr;
};

dtm.i = dtm.instr;