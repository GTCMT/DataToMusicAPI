(function () {
    var m = dtm.model('unipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (typeof(arg) === 'string') {
                a.set(arg).split().histo();
            } else if (isArray(arg)) {
                if (isNumOrFloat32Array(arg)) {
                    a.set(arg);
                } else {
                    a.set(arg).split().histo();
                }
            } else if (isDtmArray(arg)) {
                a = arg.clone();

                if (a.get('type') === 'string') {
                    a.histo();
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumOrFloat32Array(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().histo();
            }
        }

        return a.normalize(min, max);
    });

    m.domain = function () {
        if (argsAreSingleVals(arguments) && arguments.length == 2) {
            var args = argsToArray(arguments);
            if (isNumOrFloat32Array(args)) {
                min = args[0];
                max = args[1];
            }
        } else if (argIsSingleArray(arguments)) {
            if (isNumOrFloat32Array(arguments[0]) && arguments[0].length == 2) {
                min = arguments[0][0];
                max = arguments[0][1];
            }
        }
    };

    return m;
})();