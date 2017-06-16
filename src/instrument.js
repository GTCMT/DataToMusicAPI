// dtm.i = dtm.instr = function () {
//     var instr = new Instr();
//     return instr;
// };
//
// function Instr() {
//     function instr() {
//         return this;
//     }
//
//     var params = {
//         dur: 0.1
//     };
//
//     var m = dtm.music().for(params.dur).rep()
//         .amp(dtm.decay().expc(10));
//
//     // var uni = dtm.model('unipolar');
//
//     instr.play = function () {
//         m.play();
//
//         return instr;
//     };
//
//     instr.stop = function () {
//         m.stop();
//
//         return instr;
//     };
//
//     function mapArgs(argObject) {
//         if (argsAreSingleVals(argObject)) {
//             return argsToArray(argObject);
//         } else if (argObject.length === 0) {
//             return null;
//         } else if (argObject.length === 1) {
//             return argObject[0];
//         }
//     }
//
//     instr.pitch = function () {
//         var args = mapArgs(arguments);
//
//         if (args) {
//             m.note(dtm.model('unipolar')(args).range(60,90).block());
//         }
//         return instr;
//     };
//
//     instr.speed = function () {
//         var args = mapArgs(arguments);
//
//         if (args) {
//             m.interval(dtm.model('unipolar')(args).range(0.5, 0.05).block());
//         }
//
//         return instr;
//     };
//
//     instr.__proto__ = Instr.prototype;
//     return instr;
// }
//
// Instr.prototype = Object.create(Function.prototype);
//
// dtm.instr.create = function () {
//
// };

dtm.i = dtm.instr = function () {
    var instr = new Instr();
    return instr;
};

function Instr() {
    var params = {
        dur: 0.1
    };

    var instr = dtm.music().for(params.dur).rep()
        .amp(dtm.decay().expc(10));

    // var uni = dtm.model('unipolar');

    // instr.play = function () {
    //     instr.play();
    //
    //     return instr;
    // };
    //
    // instr.stop = function () {
    //     instr.stop();
    //
    //     return instr;
    // };

    function mapArgs(argObject) {
        if (argsAreSingleVals(argObject)) {
            return argsToArray(argObject);
        } else if (argObject.length === 0) {
            return null;
        } else if (argObject.length === 1) {
            return argObject[0];
        }
    }

    instr.pitch = function () {
        var args = mapArgs(arguments);

        if (args) {
            instr.note(dtm.model('unipolar')(args).range(60,90).block());
        }
        return instr;
    };

    instr.speed = function () {
        var args = mapArgs(arguments);

        if (args) {
            instr.interval(dtm.model('unipolar')(args).range(0.5, 0.05).block());
        }

        return instr;
    };

    // instr.__proto__ = Instr.prototype;
    return instr;
}

Instr.prototype = Object.create(Function.prototype);

dtm.instr.create = function () {

};