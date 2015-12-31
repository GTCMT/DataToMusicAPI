/**
 * @fileOverview A module for generating array object with certain shapes, extends the dtm.array module
 * @module generator
 */

/**
 * @function module:generator.generator
 * @returns {dtm.generator}
 */
dtm.generator = function () {
    var paramsExt = {
        type: null,
        length: 8,
        min: 0.0,
        max: 1.0,

        start: 0.0,
        end: 1.0,
        //step: 0.0,
        amp: 1.0,
        cycle: 1.0,
        phase: 0.0,
        const: 0.0,
        interval: null,
        string: '',
        value: [],
        pack: false, // into dtm.array
        typed: true // Float32Array
    };

    // extend the dtm.array module
    var generator = dtm.array();

    var params = generator.meta.getParams();
    objForEach(paramsExt, function (val, key) {
        params[key] = val;
    });

    generator.meta = {
        type: 'dtm.generator'
    };

    var types = {
        all: [
            'line', 'saw', 'rise',
            'decay', 'fall', 'invSaw',
            'adsr', 'ADSR',
            'seq', 'sequence', 'series',
            'range',
            'scale', 'mode', 'chord',
            'fibonacci',
            'noise', 'random', 'rand', 'randi',
            'gauss', 'gaussian', 'gaussCurve', 'normal',
            'sin', 'sine', 'cos', 'cosine',
            'tri', 'triangle',
            'zeros', 'zeroes', 'ones',
            'constant', 'constants', 'const', 'consts',
            'repeat',
            'string', 'str', 's', 'text',
            'character', 'characters', 'chars', 'char', 'c'
        ],
        oscil: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq'],
        const: ['zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts'],
        linish: ['line', 'saw', 'rise', 'decay', 'fall', 'invSaw'],
        noLength: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'range', 'seq', 'scale', 'mode', 'chord'],
        noRange: [],
        noMinMax: [],
        noMinMaxDir: ['rise', 'decay', 'fall', 'noise', 'random', 'rand', 'randi'],
        string: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'text']
    };

    var scales = {
        chromatic: {
            names: ['chromatic', 'chr'],
            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        },
        major: {
            names: ['major', 'maj'],
            values: [0, 2, 4, 5, 7, 9, 11]
        },
        minor: {
            names: ['minor', 'min'],
            values: [0, 2, 3, 5, 7, 8, 10]
        },
        wholetone: {
            names: ['wholetone', 'whole', 'wt'],
            values: [0, 2, 4, 6, 8, 10]
        }
    };

    function isTypeOf(type) {
        return types[type].indexOf(params.type) > -1;
    }

    // dtm.gen().get(): using dtm.array get instead

    function process() {
        function line(len, min, max, cycle) {
            var res = new Float32Array(len);
            var incr = (max - min) / (len-1);

            for (var i = 0; i < len; i++) {
                res[i] = min + incr * i;
            }

            return res;
        }

        // TODO: should use Float32Array

        function sin(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = dtm.value.mod(i/(len-1) + offset / cycle, 1.0);
                var val = Math.sin(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        function cos(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = dtm.value.mod(i/(len-1) + offset, 1.0);
                var val = Math.cos(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        // TODO: implement
        function square(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            return res;
        }

        function random(len, min, max, amp, round) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var val = Math.random() * (max - min) + min;
                if (round) {
                    res[i] = Math.round(val) * amp;
                } else {
                    res[i] = val * amp;
                }
            }
            return res;
        }

        function constant(len, val) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                res[i] = val;
            }
            return res;
        }

        // TODO: implement
        function series() {
            //return res;
        }

        // TODO: broekn
        function sequence(start, end, interval) {
            if (!isNumber(interval) && interval === 0.0) {
                interval = 1.0;
            }

            var steps = Math.floor((end - start) / interval) + 1;
            params.length = steps;
            //console.log(steps);
            var res = new Float32Array();

            for (var i = 0; i < steps; i++) {
                res[i] = start + interval * i;
            }
            return res;
        }

        function range(start, end, interval) {
            if (!isNumber(interval) || interval === 0.0) {
                interval = 1.0;
            }

            if (end >= start) {
                interval = Math.abs(interval);
            } else {
                interval = -Math.abs(interval);
            }

            var len = Math.ceil(Math.abs(end - start) / Math.abs(interval));
            var res = new Float32Array(len);

            for (var i = 0; i < len; i++) {
                res[i] = start + i * interval;
            }

            return res;
        }

        function scale(name) {
            var scale = 'chromatic';
            if (isString(name)) {
                scale = name;
            }
        }

        // TODO: typed?
        function fibonacci(len) {
            var res = new Float32Array(len);
            res[0] = 1;

            if (len > 1) {
                res[1] = 1;
                for (var i = 2; i < len; i++) {
                    res[i] = res[i-1] + res[i-2];
                }
            }
            return res;
        }

        params.value = [];

        var sorted;
        if (isTypeOf('noMinMaxDir')) {
            sorted = dtm.transform.sort([params.min, params.max]);
        }

        // TODO: params or paramsExt?
        switch (params.type) {
            case 'line':
            case 'saw':
                params.value = line(params.length, params.min, params.max);
                break;

            case 'rise':
                params.value = line(params.length, sorted[0], sorted[1]);
                break;

            case 'decay':
            case 'fall':
                params.value = line(params.length, sorted[1], sorted[0]);
                break;

            case 'sin':
            case 'sine':
                params.value = sin(params.length, params.min, params.max, params.amp, params.cycle, paramsExt.phase);
                break;

            case 'cos':
            case 'cosine':
                params.value = cos(params.length, params.min, params.max, params.amp, params.cycle, 0.00);
                break;

            case 'rand':
            case 'random':
                params.value = random(params.length, sorted[0], sorted[1], 1.0, false);
                break;
            case 'noise':
                params.value = random(params.length, sorted[0], sorted[1], params.amp, false);
                break;

            case 'randi':
                params.value = random(params.length, sorted[0], sorted[1], 1.0, true);
                break;

            case 'range':
                params.value = range(paramsExt.start, paramsExt.end, paramsExt.interval);
                break;

            case 'seq':
                params.value = sequence(params.min, params.max);
                break;

            case 'fibonacci':
                params.value = fibonacci(params.length);
                break;

            case 'zeros':
            case 'zeroes':
                params.value = constant(params.length, 0);
                break;

            case 'ones':
                params.value = constant(params.length, 1);
                break;

            case 'const':
                params.value = constant(params.length, params.const);
                break;

            case 'string':
            case 'str':
            case 's':
            case 'characters':
            case 'character':
            case 'chars':
            case 'char':
            case 'c':
                params.value = params.string.split('');
                break;

            default:
                break;
        }
    }

    /**
     * Sets the method of generating a shape
     * @function module:generator#type
     * @param type {string}
     * @returns {array}
     */
    generator.type = function (type) {
        if (isString(type)) {
            if (types.all.indexOf(type) > -1) {
                params.type = type;
            }
        }

        process(); // TODO: gets called too many times?
        return generator;
    };

    /**
     * @function module:generator#len | size
     * @param length
     * @returns {array}
     */
    generator.len = function (length) {
        var len = parseInt(length);
        if (!isNaN(len) && len > 0) {
            params.length = len;
        }

        process();
        return generator;
    };

    generator.size = generator.len;

    /**
     * @function module:generator#min
     * @param min
     * @returns {array}
     */
    generator.min = function (min) {
        var val = parseFloat(min);
        if (!isNaN(val)) {
            params.min = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#max
     * @param max
     * @returns {array}
     */
    generator.max = function (max) {
        var val = parseFloat(max);
        if (!isNaN(val)) {
            params.max = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#range
     * @param arg1 {number|array|dtm.array} A min value or an array of min and max values
     * @param [arg2] {number} A max value
     * @returns {array}
     */
    generator.range = function (arg1, arg2) {
        var args;

        if (isDtmObj(arg1)) {
            args = arg1.get();
        } else if (argIsSingleArray(arguments)) {
            args = arguments[0];
        } else if (argsAreSingleVals(arguments)) {
            args = argsToArray(arguments);
        }

        if (isNumArray(args)) {
            if (args.length === 2) {
                generator.min(args[0]);
                generator.max(args[1]);
            } else if (args.length > 2) {
                generator.min(dtm.analyzer.min(args));
                generator.max(dtm.analyzer.max(args));
            }
            process();
        }
        return generator;
    };

    generator.start = function (val) {
        if (isNumber(val)) {
            paramsExt.start = val;
        }
        process();
        return generator;
    };

    generator.end = function (val) {
        if (isNumber(val)) {
            paramsExt.end = val;
        }
        process();
        return generator;
    };

    generator.interval = function (val) {
        if (isNumber(val)) {
            paramsExt.interval = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#amp
     * @param amp
     * @returns {array}
     */
    generator.amp = function (amp) {
        var val = parseFloat(amp);
        if (!isNaN(val)) {
            params.amp = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#cycle | cycles | freq
     * @param cycle
     * @returns {array}
     */
    generator.cycle = function (cycle) {
        var val = parseFloat(cycle);
        if (!isNaN(val)) {
            params.cycle = val;
        }
        process();
        return generator;
    };
    generator.freq = generator.cycle;

    generator.phase = function (phase) {
        if (isNumber(phase)) {
            paramsExt.phase = phase;
        }
        process();
        return generator;
    };

    generator.offset = generator.phase;

    /**
     * @function module:generator#const
     * @param value
     * @returns {array}
     */
    generator.const = function (value) {
        if (isSingleVal(value)) {
            params.const = value;
        }
        return generator;
    };


    // TODO: do more readable type check

    if (arguments.length >= 1) {
        if (isObject(arguments[0])) {
            if (!isArray(arguments[0])) {
                objForEach(arguments[0], function (iter) {
                    if (params.hasOwnProperty(iter)) {
                        params[iter] = arguments[0][iter];
                    }
                });
            }
        } else {
            // set the generator type from arg 0
            if (isString(arguments[0])) {
                generator.type(arguments[0]);
            }
        }

        if (isObject(arguments[1])) {
            if (!isArray(arguments[1])) {
                objForEach(arguments[1], function (iter) {
                    if (params.hasOwnProperty(iter)) {
                        params[iter] = arguments[1][iter];
                    }
                });
            }
        }
    }

    if (arguments.length <= 2) {
        if (isTypeOf('oscil')) {
            generator.range(-1.0, 1.0);
        } else {
            generator.range(0.0, 1.0);
        }
    }

    if (arguments.length >= 2) {
        if (isTypeOf('noLength')) {
            if (isTypeOf('string')) {
                if (isString(arguments[1])) {
                    params.string = arguments[1];
                    params.typed = false;
                } else {
                    params.string = String(arguments[1]);
                }
            } else if (params.type === 'range') {
                if (isNumArray(arguments[1])) {
                    if (arguments[1].length === 1) {
                        generator.start(0.0);
                        generator.end(arguments[1][0]);
                    } else if (arguments[1].length >= 2) {
                        generator.start(arguments[1][0]);
                        generator.end(arguments[1][1]);
                    }

                    if (arguments[1].length === 3) {
                        generator.interval(arguments[1][2]);
                    }
                } else {
                    if (arguments.length === 2 && isNumber(arguments[1])) {
                        generator.start(0.0);
                        generator.end(arguments[1]);
                    } else if (arguments.length >= 3) {
                        if (isNumber(arguments[1])) {
                            generator.start(arguments[1]);
                        }
                        if (isNumber(arguments[2])) {
                            generator.end(arguments[2]);
                        }
                    }

                    if (arguments.length === 4) {
                        generator.interval(arguments[3]);
                    }
                }
            } else if (params.type === 'seq') {
                // TODO: incomplete
                generator.range(arguments[1], arguments[2]);
            } else if (params.type === 'scale') {

            }
        } else {
            // set the length from arg 1
            generator.len(arguments[1]);

            if (isTypeOf('oscil')) {
                if (arguments.length >= 3) {
                    if (isArray(arguments[2])) {
                        if (arguments[2].length === 1) {
                            generator.amp(arguments[2][0]);
                        } else if (arguments[2].length === 2) {
                            generator.min(arguments[2][0]);
                            generator.max(arguments[2][1]);
                        }
                    } else {
                        generator.amp(arguments[2]);
                    }
                }

                if (arguments.length === 3) {
                    // set as amplitude
                    generator.range(-1.0, 1.0);
                    generator.amp(arguments[2]);
                }

                if (arguments.length === 4) {
                    if (isArray(arguments[3])) {
                        if (arguments[3].length === 2) {
                            generator.min(arguments[3][0]);
                            generator.max(arguments[3][1]);
                        }
                    } else {
                        generator.range(-1.0, 1.0);
                        generator.cycle(arguments[3]);
                    }
                }
            } else if (isTypeOf('const')) {
                if (isSingleVal(arguments[2])) {
                    params.const = arguments[2];
                }
            } else {
                if (arguments.length >= 3) {
                    if (isArray(arguments[2])) {
                        if (arguments[2].length === 1) {
                            generator.max(arguments[2][0]);
                        } else if (arguments[2].length === 2) {
                            generator.min(arguments[2][0]);
                            generator.max(arguments[2][1]);
                        }
                    } else {
                        if (arguments.length === 3) {
                            // set as 0 - max
                            generator.min(0);
                            generator.max(arguments[2]);
                            generator.amp(1.0);
                        }

                        if (arguments.length >= 4) {
                            generator.min(arguments[2]);
                            generator.max(arguments[3]);
                        }
                    }
                }
            }
        }
    }

    process();
    return generator;
};

dtm.g = dtm.gen = dtm.generator;

var generators = ['line', 'rise', 'decay', 'fall', 'seq', 'sequence', 'series', 'range', 'noise', 'random', 'rand', 'randi', 'gaussian', 'gaussCurve', 'gauss', 'normal', 'zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts', 'repeat', 'string', 'str', 'sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'fibonacci'];

generators.forEach(function (type) {
    dtm[type] = function () {
        var args = argsToArray(arguments);
        return dtm.generator.apply(this, args);
    }
});