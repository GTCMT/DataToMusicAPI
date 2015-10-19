dtm.generator = function () {
    var params = {
        type: null,
        len: 8,
        min: 0.0,
        max: 1.0,
        step: 0.0,
        amp: 1.0,
        cycle: 1.0,
        phase: 0.0,
        const: 0.0,
        interval: 1.0,
        string: '',
        res: [],
        pack: false, // into dtm.array
        typed: true // Float32Array
    };

    var generator = function () {

    };

    generator.type = 'dtm.generator';

    var types = {
        all: [
            'line', 'saw', 'rise',
            'decay', 'fall', 'invSaw',
            'seq', 'sequence', 'series',
            'range',
            'fibonacci',
            'noise', 'random', 'rand', 'randi',
            'gauss', 'gaussian', 'gaussCurve', 'normal',
            'sin', 'sine', 'cos', 'cosine',
            'tri', 'triangle',
            'zeros', 'zeroes', 'ones',
            'constant', 'constatns', 'const', 'consts',
            'repeat',
            'string', 'str', 's',
            'character', 'characters', 'chars', 'char', 'c'
        ],
        oscil: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise'],
        linish: ['line', 'saw', 'rise', 'decay', 'fall', 'invSaw'],
        noLength: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'range'],
        noMinMax: [],
        noMinMaxDir: ['rise', 'decay', 'fall', 'noise', 'random', 'rand', 'randi'],
        string: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c']
    };

    function isTypeOf(type) {
        return types[type].indexOf(params.type) > -1;
    }

    generator.get = function (param) {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                if (key === param) {
                    return params[param];
                }
            }
        }

        if (param === undefined) {
            if (params.pack) {
                if (params.typed) {
                    return dtm.array(new Float32Array(params.res));
                } else {
                    return dtm.array(params.res);
                }
            } else {
                if (params.typed) {
                    return new Float32Array(params.res);
                } else {
                    return params.res;
                }
            }
        }

        return generator;
    };

    function process() {
        function line(len, min, max, cycle) {
            var res = new Float32Array(len);
            var incr = (max - min) / (len-1);

            for (var i = 0; i < len; i++) {
                res[i] = min + incr * i;
            }

            return res;
        }

        function sin(len, min, max, amp, cycle, offset) {
            var res = new Array(len);
            for (var i = 0; i < len; i++) {
                var phase = dtm.value.mod(i/(len-1) + offset, 1.0);
                var val = Math.sin(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        function cos(len, min, max, amp, cycle, offset) {
            var res = new Array(len);
            for (var i = 0; i < len; i++) {
                var phase = dtm.value.mod(i/(len-1) + offset, 1.0);
                var val = Math.cos(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        function random(len, min, max, amp, round) {
            var res = new Array(len);
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

        function series() {

        }

        // TODO: incomplete
        function range(min, max, interval) {
            var len = Math.abs(Math.round(max) - Math.round(min)) + 1;
            var interval = (max - min) / (len - 1);
            var res = new Array(len);

            for (var i = 0; i < len; i++) {
                res[i] = Math.round(min) + i * interval;
            }

            return res;
        }

        function fibonacci(len) {
            var res = new Array(len);
            res[0] = 1;

            if (len > 1) {
                res[1] = 1;
                for (var i = 2; i < len; i++) {
                    res[i] = res[i-1] + res[i-2];
                }
            }
            return res;
        }

        params.res = [];

        var sorted;
        if (isTypeOf('noMinMaxDir')) {
            sorted = dtm.transform.sort([params.min, params.max]);
        }

        switch (params.type) {
            case 'line':
            case 'saw':
                params.res = line(params.len, params.min, params.max);
                break;

            case 'rise':
                params.res = line(params.len, sorted[0], sorted[1]);
                break;

            case 'decay':
            case 'fall':
                params.res = line(params.len, sorted[1], sorted[0]);
                break;

            case 'sin':
            case 'sine':
                params.res = sin(params.len, params.min, params.max, params.amp, params.cycle, 0.0);
                break;

            case 'cos':
            case 'cosine':
                params.res = cos(params.len, params.min, params.max, params.amp, params.cycle, 0.00);
                break;

            case 'rand':
            case 'random':
                params.res = random(params.len, sorted[0], sorted[1], 1.0, false);
                break;
            case 'noise':
                params.res = random(params.len, sorted[0], sorted[1], params.amp, false);
                break;

            case 'randi':
                params.res = random(params.len, sorted[0], sorted[1], 1.0, true);
                break;

            case 'range':
                params.res = range(params.min, params.max, params.interval);
                break;

            case 'fibonacci':
                params.res = fibonacci(params.len);
                break;

            case 'string':
            case 'str':
            case 's':
            case 'characters':
            case 'character':
            case 'chars':
            case 'char':
            case 'c':
                params.res = params.string.split('');
                break;

            default:
                break;
        }
    }

    generator.type = function (type) {
        if (typeof(type) === 'string') {
            if (types.all.indexOf(type) > -1) {
                params.type = type;
            }
        }

        process();
        return generator;
    };

    generator.len = function (length) {
        var len = parseInt(length);
        if (!isNaN(len) && len > 0) {
            params.len = len;
        }

        process();
        return generator;
    };

    generator.min = function (min) {
        var val = parseFloat(min);
        if (!isNaN(val)) {
            params.min = val;
        }
        return generator;
    };

    generator.max = function (max) {
        var val = parseFloat(max);
        if (!isNaN(val)) {
            params.max = val;
        }
        return generator;
    };

    generator.minMax = function (min, max) {
        generator.min(min);
        generator.max(max);
        return generator;
    };

    generator.amp = function (amp) {
        var val = parseFloat(amp);
        if (!isNaN(val)) {
            params.amp = val;
        }
    };

    generator.cycle = function (cycle) {
        var val = parseFloat(cycle);
        if (!isNaN(val)) {
            params.cycle = val;
        }
    };
    generator.freq = generator.cycle;


    generator.const = function (value) {
        return generator;
    };

    var iter;
    if (arguments.length >= 1) {
        if (typeof(arguments[0]) === 'object') {
            if (!Array.isArray(arguments[0])) {
                for (iter in arguments[0]) {
                    if (arguments[0].hasOwnProperty(iter)) {
                        if (params.hasOwnProperty(iter)) {
                            params[iter] = arguments[0][iter];
                        }
                    }
                }
            }
        } else {
            generator.type(arguments[0]);
        }

        if (typeof(arguments[1]) === 'object') {
            if (!Array.isArray(arguments[1])) {
                for (iter in arguments[1]) {
                    if (arguments[1].hasOwnProperty(iter)) {
                        if (params.hasOwnProperty(iter)) {
                            params[iter] = arguments[1][iter];
                        }
                    }
                }
            }
        }
    }

    if (arguments.length <= 2) {
        if (isTypeOf('oscil')) {
            generator.min(-1.0);
            generator.max(1.0);
        } else {
            generator.min(0.0);
            generator.max(1.0);
        }
    }

    if (arguments.length >= 2) {
        if (isTypeOf('noLength')) {
            if (isTypeOf('string')) {
                if (typeof(arguments[1]) === 'string') {
                    params.string = arguments[1];
                    params.typed = false;
                } else {
                    params.string = String(arguments[1]);
                }
            } else if (params.type === 'range') {
                if (Array.isArray(arguments[1])) {
                    if (arguments[1].length === 1) {
                        generator.max(arguments[1][0]);
                    } else if (arguments[1].length === 2) {
                        generator.min(arguments[1][0]);
                        generator.max(arguments[1][1]);
                    }
                } else {
                    if (arguments.length === 3) {
                        generator.min(arguments[1]);
                        generator.max(arguments[2]);
                    }
                }
            }
        } else {
            generator.len(arguments[1]);

            if (isTypeOf('oscil')) {
                if (arguments.length >= 3) {
                    if (Array.isArray(arguments[2])) {
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
                    generator.min(-1.0);
                    generator.max(1.0);
                    generator.amp(arguments[2]);
                }

                if (arguments.length === 4) {
                    if (Array.isArray(arguments[3])) {
                        if (arguments[3].length === 2) {
                            generator.min(arguments[3][0]);
                            generator.max(arguments[3][1]);
                        }
                    } else {
                        generator.min(-1.0);
                        generator.max(1.0);
                        generator.cycle(arguments[3]);
                    }
                }
            } else {
                if (arguments.length >= 3) {
                    if (Array.isArray(arguments[2])) {
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

dtm.gen = dtm.generator;