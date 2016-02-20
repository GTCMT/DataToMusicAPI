(function bipolarModel() {
    var m = dtm.model('bipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (isString(arg)) {
                a.set(arg).split().classify();
            } else if (isArray(arg)) {
                if (isNumOrFloat32Array(arg)) {
                    a.set(arg);
                } else {
                    a.set(arg).split().classify();
                }
            } else if (isDtmArray(arg)) {
                a = arg.clone();

                if (a.get('type') === 'string') {
                    a.classify();
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumArray(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().classify();
            }
        }

        return a.normalize(min, max).range(-1, 1);
    });

    m.domain = function () {
        if (argsAreSingleVals(arguments) && arguments.length == 2) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                min = args[0];
                max = args[1];
            }
        } else if (argIsSingleArray(arguments)) {
            if (isNumArray(arguments[0]) && arguments[0].length == 2) {
                min = arguments[0][0];
                max = arguments[0][1];
            }
        }
    };

    return m;
})();