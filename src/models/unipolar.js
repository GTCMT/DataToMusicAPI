(function () {
    var m = dtm.model('unipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (typeof(arg) === 'number') {
                a.set(arg);
            } else if (typeof(arg) === 'string') {
                a.set(arg).split().histo();
            } else if (typeof(arg) === 'object') {
                if (arg.constructor === Array || arg.constructor === Float32Array) {
                    a.set(arg);

                    if (a.get('type') !== 'number') {
                        a.histo();
                    }
                } else if (arg.hasOwnProperty('type') && arg.type === 'dtm.array') {
                    a.set(arg);

                    if (a.get('type') !== 'number') {
                        a.histo();
                    }
                }
            }
        } else if (arguments.length > 1) {
            var args = arguments;

            // TODO: proper type check

            if (typeof(args[0]) === 'number') {
                a.set(args);
            } else if (typeof(args[0]) === 'string') {
                a.set(args).histo();
            }
        }

        return a.normalize(min, max);
    });

    m.domain = function () {
        min = arguments[0];
        max = arguments[1];
    };

    return m;
})();