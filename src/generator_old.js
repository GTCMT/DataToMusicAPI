/**
 * @fileOverview A module for generating array object with certain shapes, extends the dtm.data module
 * @module generator
 */

/**
 * @function module:generator.generator
 * @returns {dtm.generator}
 */
dtm.generator = function () {
    var paramsExt = {
        type: null,
        min: 0.0,
        max: 1.0,

        start: 0.0,
        end: 1.0,
        interval: null,

        scale: undefined,
        transpose: 0,

        index: undefined,

        //step: 0.0,
        amp: 1.0,
        cycle: 1.0,
        phase: 0.0,
        const: 0.0,
        string: '',
        pack: false, // into dtm.data
        typed: true // Float32Array
    };

    // extend the dtm.data module
    var generator = dtm.data();

    var params = generator.meta.getParams();
    objForEach(paramsExt, function (val, key) {
        params[key] = val;
    });

    //generator.meta = {
    //    type: 'dtm.generator'
    //};

    // TODO: define params better
    // name, arg1, 2, 3, ..., length
    var tempParams = {
        oscil: {
            name: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq', 'harm', 'harmonic'],
            args: ['amp', 'freq', 'phase'],
            len: 4096
        },
        envelope: {
            name: [],
            args: [],
            len: 512
        }
    };

    var types = {
        all: [
            'line', 'saw', 'rise',
            'decay', 'fall', 'invSaw',
            'adsr', 'ADSR',
            'seq', 'sequence', 'series',
            'range', 'r',
            'scale', 'chord',
            'modal', 'modes', 'mode',
            'fibonacci',
            'noise', 'random', 'rand', 'rf', 'randi', 'ri',
            'gauss', 'gaussian', 'gaussCurve', 'normal',
            'sin', 'sine', 'cos', 'cosine',
            'tri', 'triangle',
            'sig', 'sigmoid', 'logistic',
            'zeros', 'zeroes', 'ones',
            'constant', 'constants', 'const', 'consts',
            'repeat',
            'string', 'str', 's', 'text', 'split',
            'character', 'characters', 'chars', 'char', 'c'
        ],
        oscil: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq', 'harm', 'harmonic'],
        const: ['zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts'],
        envelope: ['rise', 'decay', 'fall', 'ahr'],
        sequence: [],
        noLength: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'range', 'r', 'seq', 'scale', 'mode', 'chord', 'modal'],
        noRange: [],
        noMinMax: [],
        noMinMaxDir: ['rise', 'decay', 'fall', 'noise'],
        random: ['random', 'rand', 'rf', 'randi', 'ri'],
        string: ['string', 'split', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'text']
    };

    function isTypeCategOf(type) {
        return types[type].indexOf(params.type) > -1;
    }

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
                var phase = mod(i/(len-1) + offset / cycle, 1.0);
                var val = Math.sin(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        function cos(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = mod(i/(len-1) + offset, 1.0);
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

        // TODO: implement
        function tri(len, min, max, amp, cycle, offset) {}

        function sig(len, steepness) {
            return dtm.line(len).range(-Math.E, Math.E).map(function (v) {
                return 1/(1+Math.pow(Math.E,(-v*steepness)));
            });
        }

        function random(len, min, max, amp, floor) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var val = Math.random() * (max - min) + min;
                if (floor) {
                    res[i] = Math.floor(val) * amp;
                } else {
                    res[i] = val * amp;
                }
            }
            return res;
        }

        function constant(len, val) {
            var res;
            if (isNumber(val)) {
                res = new Float32Array(len);
            } else {
                res = new Array(len);
            }
            for (var i = 0; i < len; i++) {
                if (isNumOrFloat32Array(val)) {
                    res[i] = toFloat32Array(val);
                } else if (isDtmArray(val)) {
                    res[i] = val.parent(generator);
                } else {
                    res[i] = val;
                }
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
            generator.length = steps;
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

        function transposeScale(scale, factor) {
            var shifted = scale.map(function (v) {
                return mod(v + factor, 12);
            });

            return dtm.transform.sort(shifted);
        }

        function scale(name, transpose) {
            var res = [];

            var scales = {
                chromatic: {
                    names: ['chromatic', 'chr'],
                    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                },
                major: {
                    names: ['major', 'maj', 'ionian'],
                    values: [0, 2, 4, 5, 7, 9, 11]
                },
                minor: {
                    names: ['minor', 'min', 'aeolian'],
                    values: [0, 2, 3, 5, 7, 8, 10]
                },
                wholetone: {
                    names: ['wholetone', 'whole', 'wt'],
                    values: [0, 2, 4, 6, 8, 10]
                },
                majpenta: {
                    names: ['penta', 'pent', 'majpenta'],
                    values: [0, 2, 4, 7, 9]
                },
                dorian: {
                    names: ['dorian'],
                    values: [0, 2, 3, 5, 7, 9, 10]
                },
                phrygian: {
                    names: ['phrygian', 'phry'],
                    values: [0, 1, 3, 5, 7, 8, 10]
                },
                lydian: {
                    names: ['lydian', 'lyd'],
                    values: [0, 2, 4, 6, 7, 9, 11]
                },
                mixolydian: {
                    names: ['mixolydian', 'mixo'],
                    values: [0, 2, 4, 5, 7, 9, 10]
                },
                locrian: {
                    names: ['locrian', 'loc'],
                    values: [0, 1, 3, 5, 6, 8, 10]
                }
            };

            objForEach(scales, function (v, k) {
                if (!isEmpty(name)) {
                    if (v.names.indexOf(name.toLowerCase()) !== -1) {
                        res = new Float32Array(transposeScale(v.values, transpose));
                    }
                } else {
                    res.push(dtm.data(v.values).label(k));
                }
            });

            return res ? res : new Float32Array();
        }

        function chord(name, transpose) {
            var chords = {
                major: {
                    names: ['major', 'maj'],
                    values: [0, 4, 7, 11, 14, 18, 21]
                }
            };
        }

        function modal(index) {
            var modes = {
                'dahina tabla': [1, 2.89, 4.95, 6.99, 8.01, 9.02],
                'bayan tabla': [1, 2.0, 3.01, 4.01, 4.69, 5.63],
                'red cedar wood plate': [1, 1.47, 2.09, 2.56],
                'redwood wood plate': [1, 1.47, 2.11, 2.57],
                'douglas fir wood plate': [1, 1.42, 2.11, 2.47],
                'uniform wooden bar': [1, 2.572, 4.644, 6.984, 9.723, 12],
                'uniform aluminum bar': [1, 2.756, 5.423, 8.988, 13.448, 18.680],
                'xylophone': [1, 3.932, 9.538, 16.688, 24.566, 31.147],
                'vibraphone 1': [1, 3.984, 10.668, 17.979, 23.679, 33.642],
                'vibraphone 2': [1, 3.997, 9.469, 15.566, 20.863, 29.440],
                'chalandi plates': [1, 1.72581, 5.80645, 7.41935, 13.91935],
                'tibetan bowl (180mm)': [1, 2.77828, 5.18099, 8.16289, 11.66063, 15.63801, 19.99],
                'tibetan bowl (152 mm)': [1, 2.66242, 4.83757, 7.51592, 10.64012, 14.21019, 18.14027],
                'tibetan bowl (140 mm)': [1, 2.76515, 5.12121, 7.80681, 10.78409],
                'wine glass': [1, 2.32, 4.25, 6.63, 9.38],
                'small handbell': [1, 1.0019054878049, 1.7936737804878, 1.8009908536585, 2.5201981707317, 2.5224085365854, 2.9907012195122, 2.9940548780488, 3.7855182926829, 3.8061737804878, 4.5689024390244, 4.5754573170732, 5.0296493902439, 5.0455030487805, 6.0759908536585, 5.9094512195122, 6.4124237804878, 6.4430640243902, 7.0826219512195, 7.0923780487805, 7.3188262195122, 7.5551829268293],
                'spinel sphere with diameter of 3.6675mm': [1, 1.026513174725, 1.4224916858532, 1.4478690202098, 1.4661959580455, 1.499452545408, 1.7891839345101, 1.8768994627782, 1.9645945254541, 1.9786543873113, 2.0334612432847, 2.1452852391916, 2.1561524686621, 2.2533435661294, 2.2905090816065, 2.3331798413917, 0, 2.4567715528268, 2.4925556408289, 2.5661806088514, 2.6055768738808, 2.6692760296751, 2.7140956766436, 2.7543617293425, 2.7710411870043],
                'pot lid': [1, 3.2, 6.23, 6.27, 9.92, 14.15]
            };

            if (isString(index)) {
                if (index in modes) {
                    return toFloat32Array(modes[index]);
                } else {
                    return toFloat32Array(1);
                }
            } else if (isInteger(index)) {
                index = mod(index, Object.keys(modes).length);
                return toFloat32Array(modes[Object.keys(modes)[index]]);
            } else {
                var res = [];
                objForEach(modes, function (v, k) {
                    res.push(dtm.data(v).label(k));
                });
                return res;
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

        function gauss(len) {
            var res = new Float32Array(len);

            for (var i = 0; i < len; i++) {
                var x = -Math.PI + (Math.PI * 2 / len) * i;
                res[i] = Math.pow(Math.E, -0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI) / 0.4 * (params.max - params.min) + params.min;
            }

            return res;
        }

        generator.val = [];

        var sorted;
        if (isTypeCategOf('noMinMaxDir') || isTypeCategOf('random')) {
            sorted = dtm.transform.sort([params.min, params.max]);
        }

        // TODO: params or paramsExt?
        switch (params.type) {
            case 'line':
            case 'saw':
                generator.val = line(generator.length, params.min, params.max);
                break;

            case 'rise':
                generator.val = line(generator.length, sorted[0], sorted[1]);
                break;

            case 'decay':
            case 'fall':
                generator.val = line(generator.length, sorted[1], sorted[0]);
                break;

            case 'adsr':
            case 'ADSR':
                break;

            case 'sin':
            case 'sine':
                generator.val = sin(generator.length, params.min, params.max, params.amp, params.cycle, paramsExt.phase);
                break;

            case 'cos':
            case 'cosine':
                generator.val = cos(generator.length, params.min, params.max, params.amp, params.cycle, 0.00);
                break;

            case 'tri':
            case 'triangle':
                break;

            case 'harm':
            case 'harmonic':
                break;

            case 'rf':
            case 'rand':
            case 'random':
                generator.val = random(generator.length, sorted[0], sorted[1], 1.0, false);
                break;

            case 'noise':
                generator.val = random(generator.length, sorted[0], sorted[1], params.amp, false);
                break;

            case 'ri':
            case 'randi':
                generator.val = random(generator.length, sorted[0], sorted[1], 1.0, true);
                break;

            case 'r':
            case 'range':
                generator.val = range(paramsExt.start, paramsExt.end, paramsExt.interval);
                break;

            case 'seq':
                generator.val = sequence(params.min, params.max);
                break;

            case 'scale':
                generator.val = scale(paramsExt.scale, paramsExt.transpose);
                break;

            case 'modal':
            case 'modes':
            case 'mode':
                generator.val = modal(paramsExt.index);
                break;

            case 'fibonacci':
                generator.val = fibonacci(generator.length);
                break;

            case 'zeros':
            case 'zeroes':
                generator.val = constant(generator.length, 0);
                break;

            case 'ones':
                generator.val = constant(generator.length, 1);
                break;

            case 'const':
                generator.val = constant(generator.length, params.const);
                break;

            case 'string':
            case 'str':
            case 's':
            case 'characters':
            case 'character':
            case 'chars':
            case 'char':
            case 'c':
                generator.val = params.string.split('');
                break;

            default:
                break;
        }

        generator.length = generator.val.length;
        generator.meta.setOriginal(generator.val);
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
     * @function module:generator#size
     * @param length
     * @returns {array}
     */
    generator.size = function (length) {
        if (isString(length) && length[0] === 'a') {
            params.autolen = true;
            return generator;
        }

        var len = parseInt(length);
        if (!isNaN(len) && len > 0) {
            generator.length = len;
        }

        process();
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
    generator.oscamp = function (amp) {
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

    // overriding with array.freq
    // generator.freq = generator.cycle;

    // generator.phase conflicts with array.phase
    generator.offset = function (phase) {
        if (isNumber(phase)) {
            paramsExt.phase = phase;
        }
        process();
        return generator;
    };

    // generator.offset = generator.phase;

    /**
     * @function module:generator#const
     * @param value
     * @returns {array}
     */
    generator.const = function (value) {
        if (isSingleVal(value)) {
            params.const = value;
        }
        process();
        return generator;
    };

    generator.transpose = function (value) {
        if (isInteger(value)) {
            paramsExt.transpose = value;
        } else if (isDtmArray(value)) {
            paramsExt.transpose = value.get(0);
        }
        process();
        return generator;
    };

    // TODO: do more readable type check
    generator.length = 8;

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
        if (isTypeCategOf('oscil')) {
            params.min = -1.0;
            params.max = 1.0;
        } else {
            params.min = 0.0;
            params.max = 1.0;
        }
    }

    if (isTypeCategOf('envelope')) {
        generator.length = 128;
    }

    if (isTypeCategOf('random')) {
        generator.length = 1;
        params.min = 0.0;

        if (params.type === 'randi' || params.type === 'ri') {
            params.max = 2;
        } else {
            params.max = 1.0;
        }

        if (arguments.length >= 2 && isInteger(arguments[1])) {
            generator.length = arguments[1] > 0 ? arguments[1] : 1;
        }

        if (arguments.length === 3) {
            if (isNumber(arguments[2])) {
                params.max = arguments[2];
            } else if (isNumOrFloat32Array(arguments[2])) {

            } else if (isNumDtmArray(arguments[2])) {

            }
        } else if (arguments.length === 4) {
            if (isNumber(arguments[2])) {
                params.min = arguments[2];
            }
            if (isNumber(arguments[3])) {
                params.max = arguments[3];
            }
        }
    } else if (isTypeCategOf('oscil')) {
        generator.length = 4096;

        // TODO: temporary
        if (arguments.length === 2 && isInteger(arguments[1])) {
            generator.length = arguments[1] > 0 ? arguments[1] : 4096;
        }

        if (arguments.length >= 3) {
            if (isArray(arguments[2])) {
                if (arguments[2].length === 1) {
                    generator.oscamp(arguments[2][0]);
                } else if (arguments[2].length === 2) {
                    params.min = arguments[2][0];
                    params.max = arguments[2][1];
                }
            } else {
                generator.oscamp(arguments[2]);
            }
        }

        if (arguments.length === 3) {
            // set as amplitude
            params.min = -1.0;
            params.max = 1.0;
            generator.oscamp(arguments[2]);
        }

        if (arguments.length === 4) {
            if (isArray(arguments[3])) {
                if (arguments[3].length === 2) {
                    params.min = arguments[3][0];
                    params.max = arguments[3][1];
                }
            } else {
                params.min = -1.0;
                params.max = 1.0;
                generator.cycle(arguments[3]);
            }
        }
    } else if (arguments.length >= 2) {
        if (isTypeCategOf('string')) {
            if (isString(arguments[1])) {
                params.string = arguments[1];
                params.typed = false;
            } else {
                params.string = String(arguments[1]);
            }
        } else if (params.type === 'range' || params.type === 'r') {
            if (isNumArray(arguments[1])) {
                if (arguments[1].length === 1) {
                    // TODO: reduce the redundant process()
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
            params.min = arguments[1];
            params.max = arguments[2];
        } else if (params.type === 'scale') {
            if (isString(arguments[1])) {
                paramsExt.scale = arguments[1];
            }
            if (isInteger(arguments[2])) {
                paramsExt.transpose = arguments[2];
            }
            //process();
        } else if (params.type === 'modal' || params.type === 'modes' || params.type === 'mode') {
            paramsExt.index = arguments[1];
        } else if (isTypeCategOf('const')) {
            if (!isEmpty(arguments[1])) {
                params.const = arguments[1];
                generator.length = 1;
            }
        } else {
            // set the length from arg 1
            generator.size(arguments[1]);

            if (arguments.length >= 3) {
                if (isArray(arguments[2])) {
                    if (arguments[2].length === 1) {
                        params.max = arguments[2][0];
                    } else if (arguments[2].length === 2) {
                        params.min = arguments[2][0];
                        params.max = arguments[2][1];
                    }
                } else {
                    if (arguments.length === 3) {
                        // set as 0 - max
                        params.min = 0;
                        params.max = arguments[2];
                        generator.oscamp(1.0);
                    }

                    if (arguments.length >= 4) {
                        params.min = arguments[2];
                        params.max = arguments[3];
                    }
                }
            }
        }
    }

    process();
    return generator;
};

dtm.g = dtm.gen = dtm.generator;

// creating shorthand modules
var generators = ['line', 'rise', 'decay', 'fall', 'seq', 'sequence', 'series', 'range', 'r', 'noise', 'random', 'rand', 'rf', 'randi', 'ri', 'gaussian', 'gauss', 'normal', 'zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts', 'repeat', 'string', 'str', 'sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'fibonacci', 'decay', 'scale', 'modal', 'modes', 'mode', 'sig', 'sigmoid', 'logistic'];

generators.forEach(function (type) {
    dtm[type] = function () {
        var args = [type].concat(argsToArray(arguments));
        return dtm.generator.apply(this, args);
    }
});