(function bipolarModel() {
    var m = dtm.model('bipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (typeof(arg) === 'string') {
                a.set(arg).split().histo();
            } else if (typeof(arg) === 'object') {
                if (isArray(arg)) {
                    if (isNumArray(arg)) {
                        a.set(arg);
                    } else {
                        a.set(arg).split().histo();
                    }
                } else if (isDtmObj(arg)) {
                    a.set(arg);

                    if (a.get('type') !== 'number') {
                        a.histo();
                    }
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumArray(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().histo();
            }
        }

        return a.normalize(min, max).range(-1, 1);
    });

    m.domain = function () {
        min = arguments[0];
        max = arguments[1];
    };

    return m;
})();