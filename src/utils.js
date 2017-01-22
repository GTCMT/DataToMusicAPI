/**
 * @module utils
 */

/* TYPE CHECKING */
function isNaN(value) {
    return value !== value;
}

/**
 * Returns true for undefined, null, and NaN values
 * @param value
 * @returns {boolean}
 */
function isEmpty(value) {
    if (typeof(value) === 'undefined') {
        return true;
    } else if (value === null) {
        return true;
    } else return (typeof(value) === 'number' && isNaN(value));
}

/**
 * Returns true if the value is a number and is not NaN
 * @param value
 * @returns {boolean}
 */
function isNumber(value) {
    return (typeof(value) === 'number' && !isNaN(value));
}

/**
 * Checks if the value is a number and is an integer value
 * @param value
 * @returns {boolean}
 */
function isInteger(value) {
    if (isNumber(value)) {
        return Number.isInteger(value);
    } else {
        return false;
    }
}

/**
 * Checks if the value is a string
 * @param value
 * @returns {boolean}
 */
function isString(value) {
    return typeof(value) === 'string';
}

function toString(value) {
    if (isNumber(value)) {
        return value.toString();
    } else {
        return value;
    }
}

/**
 * Checks if the value is a boolean value
 * @param value
 * @returns {boolean}
 */
function isBoolean(value) {
    return typeof(value) === 'boolean';
}

/**
 * Checks if the value is a function
 * @param value
 * @returns {boolean}
 */
function isFunction(value) {
    return typeof(value) === 'function' && !value.hasOwnProperty('meta');
}

/**
 * Checks if the value is an instance of Promise
 * @param obj
 * @returns {boolean}
 */
function isPromise(obj) {
    if (isObject(obj)) {
        if (obj.constructor === Promise) {
            return true;
        }
    } else {
        return false;
    }
}

/**
 * Checks if the value is an object and not null object
 * @param val
 * @returns {boolean}
 */
function isObject(val) {
    return (typeof(val) === 'object' && val !== null);
}

/**
 * Checks if the value is primitive single value
 * @param val
 * @returns {boolean}
 */
function isSingleVal(val) {
    return (!isArray(val) && !isDtmObj(val) && !isFunction(val) && !isEmpty(val));
}

/**
 * Checks if a value is any kind of array
 * @private
 * @param val
 * @returns {boolean}
 */
function isArray(val) {
    return Array.isArray(val) || isFloat32Array(val);
    // return !isEmpty(val) && val.constructor === Array || isFloat32Array(val);
}

/**
 * Checks if the value is a Float32Array
 * @param val
 * @returns {boolean}
 */
function isFloat32Array(val) {
    var res = false;
    if (!isEmpty(val)) {
        // if (val.constructor.name === 'Float32Array' && val.length > 0) {
        if (val.constructor === Float32Array && val.length > 0) {
            res = true;
        }
    }
    return res;
}

/**
 * Checks if the value is a regular number array
 * @param val
 * @returns {boolean}
 */
function isNumArray(val) {
    var res = false;
    if (isArray(val) && !isFloat32Array(val) && val.length > 0) {
        res = val.every(function (v) {
            return isNumber(v);
        });
    }
    return res;
}

/**
 * Checks if the object is a string array with values like ['1', '2', '3.45']
 * @param val
 * @returns {boolean}
 */
function isParsableNumArray(val) {
    var res = false;
    if (isStringArray(val)) {
        res = val.every(function (val) {
            return !isNaN(parseFloat(val));
        })
    }
    return res;
}

/**
 * Checks if the array consists of the generic object type (i.e., {}) items
 * @param val
 * @returns {boolean}
 */
function isObjArray(val) {
    var res = false;
    if (isArray(val) && val.length > 0) {
        res = val.every(function (v) {
            return isObject(v) && !isDtmObj(v);
        });
    }
    return res;
}

/**
 * Checks if the value is either a regular or typed number array
 * @param val
 * @returns {boolean}
 */
function isNumOrFloat32Array(val) {
    return isFloat32Array(val) || isNumArray(val);
}

/**
 * Checks if the value is an array with mixed value types (e.g., numbers and strings mixed)
 * @param val
 * @returns {boolean}
 */
function isMixedArray(val) {
    return isArray(val) && !isStringArray(val) && !isBoolArray(val) && !isNumOrFloat32Array(val) && !isNestedArray(val) && !isNestedWithDtmArray(val);
}

/**
 * Checks if the value is a multi-dimensional array
 * @param val
 * @returns {boolean}
 */
function isNestedArray(val) {
    var res = false;
    if (isArray(val)) {
        // res = val.some(function (v) {
        //     return isArray(v);
        // });
        for (var i = 0, l = val.length; i < l; i++) {
            if (isArray(val[i])) {
                return true;
            }
        }
    }
    return res;
}

/**
 * Checks if the value is a nested (regular) array consist of the dtm.array instances
 * @param val
 * @returns {boolean}
 */
function isNestedWithDtmArray(val) {
    var res = false;
    if (isArray(val)) {
        res = val.some(function (v) {
            return isDtmArray(v);
        });
    }
    return res;
}

function getMaxArrayDepth(val) {
    if (isArray(val)) {
        var depth = 1;
        var list = [];

        for (var i = 0, l = val.length; i < l; i++) {
            if (isArray(val[i])) {
                list.push(getMaxArrayDepth(val[i]));
            }
        }

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

function getMaxDtmArrayDepth(val) {
    if (isDtmArray(val)) {
        var depth = 1;
        var list = [];
        val.forEach(function (v) {
            if (isDtmArray(v)) {
                list.push(getMaxDtmArrayDepth(v));
            }
        });

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

function getMaxDepth(arr) {
    var depth, list, i, l;
    if (isArray(arr)) {
        depth = 1;
        list = [];

        for (i = 0, l = arr.length; i < l; i++) {
            if (isArray(arr[i]) || isDtmArray(arr[i])) {
                list.push(getMaxDepth(arr[i]));
            }
        }

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }

        return depth;
    } else if (isDtmArray(arr)) {
        // depth = 1;
        // list = [];
        //
        // for (i = 0, l = arr.val.length; i < l; i++) {
        //     if (isArray(arr.val[i]) || isDtmArray(arr.val[i])) {
        //         list.push(getMaxDepth(arr.val[i]));
        //     }
        // }
        //
        // if (list.length > 0) {
        //     depth += Math.max.apply(this, list);
        // }
        //
        // return depth;
        return arr.params.depth;
    } else {
        return 0;
    }
}

/**
 * Checks if the value is an instance of DTM object
 * @param val
 * @returns {boolean}
 */
function isDtmObj(val) {
    if (isObject(val) || typeof(val) === 'function') {
        return val.hasOwnProperty('meta');
    } else {
        return false;
    }
}

function isDtmSynth(val) {
    if (isObject(val) || typeof(val) === 'function') {
        if (val.hasOwnProperty('meta')) {
            return val.meta.type === 'dtm.synth' || val.meta.type === 'dtm.music';
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isDtmData(val) {
    if (isObject(val) || typeof(val) === 'function') {
        if (val.hasOwnProperty('meta')) {
            return (val.meta.type === 'dtm.data' || val.meta.type === 'dtm.generator');
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isNestedDtmData(val) {
    if (isDtmData(val)) {
        return val.every(function (v) {
            return isDtmData(v);
        });
    } else {
        return false;
    }
}

function isNumDtmData(obj) {
    return isDtmData(obj) && isNumOrFloat32Array(obj.get());
}

function isNestedNumDtmData(obj) {
    return isNestedDtmData(obj) && obj.get().every(function (a) { return isNumDtmData(a)});
}

/**
 * Checks if the value is an instance of dtm.array
 * @param val
 * @returns {boolean}
 */
function isDtmArray(val) {
    if (isObject(val) || typeof(val) === 'function') {
        if (val.hasOwnProperty('meta')) {
            return ['dtm.array', 'dtm.data', 'dtm.generator'].indexOf(val.meta.type) !== -1;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Checks if the value is an instance of dtm.array with children dtm.arrays
 * @param val
 * @returns {boolean}
 */
function isNestedDtmArray(val) {
    if (isDtmArray(val)) {
        return val.params.nested;
        // return val.every(function (v) {
        //     return isDtmArray(v);
        // });
    } else {
        return false;
    }
}

function isNumDtmArray(obj) {
    return isDtmArray(obj) && isNumOrFloat32Array(obj.get());
}

function isNestedNumDtmArray(obj) {
    return isNestedDtmArray(obj) && obj.get().every(function (a) { return isNumDtmArray(a)});
}

/**
 * Checks if the value is a string array
 * @param val
 * @returns {boolean}
 */
function isStringArray(val) {
    var res = false;
    if (isArray(val)) {
        res = val.every(function (v) {
            return isString(v);
        });
    }
    return res;
}

/**
 * Checks if the value is a boolean array
 * @param val
 * @returns {boolean}
 */
function isBoolArray(val) {
    var res = false;
    if (isArray(val)) {
        res = val.every(function (v) {
            return isBoolean(v);
        });
    }
    return res;
}

/**
 * Checks if the given array has any "empty" values
 * @param array
 * @returns {boolean}
 */
function hasMissingValues(array) {
    // assuming the input is an array with length > 0
    return array.some(function (v) {
        return isEmpty(v);
    });
}

// TODO: implement
function arrayCompare(first, second) {

}

function objCompare(first, second) {
    var res = false;
    if (isFunction(first) && isFunction(second)) {
        return first.toString() === second.toString();
    } else if (isObject(first) && isObject(second)) {
        return JSON.stringify(first) === JSON.stringify(second);
    }

    return res;
}

/**
 * Converts the arguments object into a regular array
 * @param args {object} The arguments object of the caller function
 * @returns {Array}
 */
function argsToArray(args) {
    var res = [];
    for (var i = 0; i < args.length; i++) {
        res[i] = args[i];
    }
    return res;
}

/**
 * Iterates over the arguments object of the caller function
 * @param args {object} The arguments object
 * @param fn {function} A callback function with same arguments of Array.forEach
 */
function argsForEach(args, fn) {
    for (var i = 0, l = args.length; i < l; i++) {
        fn.apply(this, args[i]);
    }
}

/**
 * Checks if the arguments object consist of a single array item
 * @param args {object} The arguments object
 * @returns {boolean}
 */
function argIsSingleArray(args) {
    return (args.length === 1 && isArray(args[0]));
}

function argsAreSingleVals(args) {
    var res = false;
    if (!argIsSingleArray(args) && args.length > 0) {
        var argsArr = argsToArray(args);
        res = argsArr.every(function (a) {
            return isSingleVal(a);
        });
    }
    return res;
}

/**
 * Converts various number or array types into a Float32Array. Returns null if not convertible.
 * @param src
 * @returns {Float32Array|null}
 */
function toFloat32Array(src) {
    if (isNumber(src)) {
        return new Float32Array([src]);
    } else if (isDtmObj(src)) {
        if (isDtmArray(src)) {
            if (isNumArray(src.get())) {
                return new Float32Array(src.get());
            } else if (isFloat32Array(src.get())) {
                return src.get();
            } else if (isNestedWithDtmArray(src.get())) {
                return toFloat32Array(src.get('next')); // TODO: may not be ideal
            }
        } else if (src.meta.type === 'dtm.model') {
            return new Float32Array(src.get());
        }
    } else if (isNumOrFloat32Array(src)) {
        if (isFloat32Array(src)) {
            return src;
        } else {
            // var typedArray = new Float32Array(src.length);
            // for (var i = 0, l = src.length; i < l; i++) {
            //     typedArray[i] = src[i];
            // }
            // return typedArray;
            return new Float32Array(src);
        }
    } else {
        return null;
    }
}

// TODO: test
function fromFloat32Array(src) {
    return Array.prototype.slice.call(src);
}

function Float32Concat(first, second) {
    var firstLen = first.length;
    var res = new Float32Array(firstLen + second.length);

    res.set(first);
    res.set(second, firstLen);

    return res;
}

// TODO: other concat types (e.g., string array + typed array)
function concat(first, second) {
    if (isFloat32Array(first) || isFloat32Array(second)) {
        if (isNumber(first)) {
            first = new Float32Array([first]);
        }
        if (isNumber(second)) {
            second = new Float32Array([second]);
        }

        return Float32Concat(first, second);
    } else {
        return first.concat(second);
    }
}

function Float32Splice(array, start, deleteCount) {
    console.log(array.length - deleteCount);
    var res = new Float32Array(array.length - deleteCount);
    var temp = Array.prototype.slice.call(array);
    temp.splice(start, deleteCount);
    res.set(temp);

    return res;
}

function splice(array, start, deleteCount) {
    if (isFloat32Array(array)) {
        return Float32Splice(array, start, deleteCount);
    } else {
        array.splice(start, deleteCount);
        return array;
    }
}

function truncateDigits(value) {
    var digits = 10;
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}

function Float32Map(array, cb) {
    var res = new Float32Array(array.length);

    for (var i = 0, l = array.length; i < l; i++) {
        res[i] = cb(array[i]);
    }

    return res;
}

function deferCallback(cb, time) {
    var defer = 0;
    if (isNumber(time) && time > 0) {
        defer = time;
    }

    if (isFunction(cb)) {
        return function () {
            var args = arguments;
            setTimeout(function () {
                cb.apply(this, args);
            }, defer);
        }
    }
}

function cloneArray(input) {
    if (isArray(input) || isFloat32Array(input)) {
        return input.slice(0);
    }
}

function print(input) {
    var formatted = null;
    if (isNestedDtmArray(input) || isNestedWithDtmArray(input)) {
        input.forEach(function (a) {
            console.log(a.get('name'), a.get());
        });
    } else if (isDtmArray(input)) {
        console.log(input.get('name'), input.get());
    } else {
        console.log(input);
    }
    return input;
}

//function append() {
//
//}
//
//function appendNoDupes() {
//
//}

function objForEach(obj, callback) {
    var res = [];
    if (typeof(obj) === 'object') {
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && typeof(callback) === 'function') {
                res.push(callback(obj[key], key));
            }
        }
        return res;
    }
}

function numProperties(obj) {
    var count = 0;
    if (isObject(obj)) {
        objForEach(obj, function () {
            count++;
        });
    }
    return count;
}

function loadBuffer(arrayBuf) {
    var buffer = {};
    actx.decodeAudioData(arrayBuf, function (buf) {
        buffer = buf;
    });

    return buffer;
}

/**
 * Returns the minimum value of numeric array.
 * @param arr {number}
 * @returns {number}
 */
function getMin(arr) {
    if (isNumOrFloat32Array(arr)) {
        return Math.min.apply(this, arr);
    }
}

/**
 * Returns the maximum value of numeric array.
 * @param arr {number}
 * @returns {number}
 */
function getMax(arr) {
    if (isNumOrFloat32Array(arr)) {
        return Math.max.apply(this, arr);
    }
}

/**
 * Returns the mean of a numeric array.
 * @param arr {array} Input numerical array.
 * @returns val {number} Single mean value.
 * @example
 *
 * dtm.transform.mean([8, 9, 4, 0, 9, 2, 1, 6]);
 * -> 4.875
 */
function mean(arr) {
    if (isNumOrFloat32Array(arr)) {
        return sum(arr) / arr.length;
    }
}

/**
 * Returns the most frequent value of the array.
 * @param arr {array}
 * @returns {value}
 */
function mode(arr) {
    var uniqs = unique(arr);
    var max = 0;
    var num = 0;
    var res = null;

    var histo = countOccurrences(arr);

    for (var i = 0, l = uniqs.length; i < l; i++) {
        num = histo[uniqs[i]];

        if (num > max) {
            res = uniqs[i];
            max = num;
        }
    }

    return res;
}

/**
 * Returns the median of numerical array.
 * @param arr
 * @returns {number}
 */
function median(arr) {
    var sorted = arr.sort();
    var len = arr.length;

    if (mod(len, 2) === 0) {
        return (sorted[len/2 - 1] + sorted[len/2]) / 2
    } else {
        return sorted[Math.floor(len/2)];
    }
}

/**
 * Returns the midrange of numerical array.
 * @param arr
 * @return {number}
 */
function midrange(arr) {
    var max = getMax(arr);
    var min = getMin(arr);
    return (max + min) / 2;
}

/**
 * Simple summation.
 * @param arr
 * @returns {number}
 */
function sum(arr) {
    if (isNestedWithDtmArray(arr)) {
        return sum(arr.map(function (a) {
            return sum(a.get());
        }))
    } else {
        return arr.reduce(function (num, sum) {
            return num + sum;
        });

        // var data = new Float32Array(arr);
        // var ptr = Module._malloc(data.byteLength);
        // var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
        // view.set(data);
        //
        // var res = Module.ccall('sum', null, ['number', 'number'], [ptr, data.length]);
        //
        // Module._free(ptr);
        // return res;
    }
}

/**
 * Variance.
 * @param arr
 * @returns {*}
 */
function variance(arr) {
    var meanVal = mean(arr);

    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow((meanVal - arr[i]), 2);
    }

    // TODO: divide-by-zero error
    return sum(res) / (arr.length-1);
}

/**
 * Standard Deviation.
 * @param arr
 * @returns {*}
 */
function std(arr) {
    return Math.sqrt(variance(arr));
}

/**
 * Population Variance.
 * @param arr
 * @returns {*}
 */
function pvar(arr) {
    var meanVal = mean(arr);

    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow((meanVal - arr[i]), 2);
    }

    return mean(res);
}

/**
 * Population Standard Deviation.
 * @param arr
 * @returns {number}
 */
function pstd(arr) {
    return Math.sqrt(pvar(arr));
}

function meanSquare(arr) {
    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow(arr[i], 2);
    }

    return mean(res);
}

/**
 * Root-Mean-Square value of given numerical array.
 * @param arr {array}
 * @returns rms {number}
 */
function rms(arr) {
    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow(arr[i], 2);
    }

    return Math.sqrt(mean(res));
}

function unique(input) {
    var res = [];

    for (var i = 0, l = input.length; i < l; i++) {
        if (res.indexOf(input[i]) === -1) {
            res.push(input[i]);
        }
    }

    return res;
}

/**
 * Counts occurrences of each class in the list.
 * @param input {array}
 * @returns {array}
 */
function histo(input) {
    var res = [];
    var classes = cloneArray(input);
    var histogram = countOccurrences(input);

    for (var i = 0, l = classes.length; i < l; i++) {
        res[i] = histogram[classes[i]];
    }

    return res;
}

function countOccurrences(input) {
    var res = {};
    for (var i = 0, l = input.length; i < l; i++) {
        if (!res.hasOwnProperty(input[i])) {
            res[input[i]] = 1;
        } else {
            res[input[i]]++;
        }
    }
    return res;
}

/**
 * List unique items as "class" in sorted order.
 * @param input {array}
 * @returns {array}
 */
function listClasses(input) {
    return unique(input).sort();
}

function uniformity(input) {
    return listClasses(input).length / input.length;
}

function intersection(arr1, arr2) {
    return arr1.filter(function (n) {
        return arr2.indexOf(n) !== -1;
    });
}

/* SINGLE-VALUE CALCULATION */
/**
 * Rescales a single normalized (0-1) value.
 *
 * @param val {float} Value between 0-1.
 * @param min {number} Target range minimum.
 * @param max {number} Target range maximum.
 * @param [round=false] {boolean} If true, the output will be rounded to an integer.
 * @returns {number}
 */
function rescale(val, min, max, round) {
    round = round || false;

    var res = val * (max - min) + min;

    if (round) {
        res = Math.round(res);
    }

    return res;
}

/**
 * @param val {float} Value between 0-1.
 * @param factor {float} Steepness. It should be above 1.
 * @returns {number}
 */
function expCurve(val, factor) {
    factor = factor <= 1 ? 1.000001 : factor;
    return (Math.exp(val * Math.log(factor)) - 1.) / (factor - 1.);
}

/**
 * @param val {float} Value between 0-1.
 * @param factor {float} Steepness. It should be above 1.
 * @returns {number}
 */
function logCurve(val, factor) {
    factor = factor <= 1 ? 1.000001 : factor;
    return (Math.log(val * (factor - 1.) + 1.)) / (Math.log(factor));
}

/**
 * MIDI note number to frequency conversion.
 * @param nn {number} Note number
 * @returns {number}
 */
function mtof(nn) {
    return 440.0 * Math.pow(2, (nn - 69) / 12.);
}

/**
 * Frequency to MIDI note number conversion.
 * @param freq {number} Note number
 * @returns {number}
 */
function ftom(freq) {
    return Math.log2(freq / 440.0) * 12 + 69;
}

/**
 * Scale or pitch-quantizes the input value to the given models.scales.
 * @param nn {number} Note number
 * @param scale {array} An array of either number or string
 * @param [round=false] {boolean}
 * @returns {*}
 */
function pq(nn, scale, round) {
    var solfa = {
        0: ['do', 'd'],
        1: ['di', 'ra'],
        2: ['re', 'r'],
        3: ['ri', 'me'],
        4: ['mi', 'm', 'fe'],
        5: ['fa', 'f'],
        6: ['fi', 'se'],
        7: ['sol', 's'],
        8: ['si', 'le'],
        9: ['la', 'l'],
        10: ['li', 'te'],
        11: ['ti', 't', 'de']
    };

    var sc = [];

    if (isNumOrFloat32Array(scale)) {
        sc = scale;
    } else if (isStringArray(scale)) {
        scale.forEach(function (v) {
            objForEach(solfa, function (deg, key) {
                if (deg.indexOf(v.toLowerCase()) > -1) {
                    sc.push(parseInt(key));
                }
            });
        })
    } else if (!isArray(scale)) {
        sc = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }

    if (isEmpty(round)) {
        round = false;
    }

    var pc = mod(nn, 12);
    var oct = nn - pc;
    var idx = Math.floor(pc / 12. * sc.length);
    var frac = 0.0;

    if (!round) {
        frac = mod(nn, 1);
    }
    return oct + sc[idx] + frac;
}

/**
 * A modulo (remainder) function.
 * @param n {number} Divident
 * @param m {number} Divisor
 * @returns {number}
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

function randi(arg1, arg2) {
    var min, max;
    if (!isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = 1.0;
    } else if (isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = arg1;
    } else if (isNumber(arg1) && isNumber(arg2)) {
        min = arg1;
        max = arg2;
    }

    return Math.floor(Math.random() * (max - min) + min);
}

function random(arg1, arg2) {
    var min, max;
    if (!isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = 1.0;
    } else if (isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = arg1;
    } else if (isNumber(arg1) && isNumber(arg2)) {
        min = arg1;
        max = arg2;
    }

    return Math.random() * (max - min) + min;
}

// a slight modification of https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    var cost = a[0] !== b[0] ? 1 : 0;

    return Math.min(
        levenshteinDistance(a.substr(1), b) + 1,
        levenshteinDistance(b.substr(1), a) + 1,
        levenshteinDistance(a.substr(1), b.substr(1)) + cost
    );
}

function alloc(arr) {
    var data = new Float32Array(arr);
    var ptr = Module._malloc(data.byteLength);
    var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
    view.set(data);
}

function free(ptr) {
    Module._free(ptr);
}

//function clone(obj) {
//    var copy;
//
//    // Handle the 3 simple types, and null or undefined
//    if (null == obj || "object" != typeof obj) {
//        return obj;
//    }
//
//    // Handle Date
//    if (obj instanceof Date) {
//        copy = new Date();
//        copy.setTime(obj.getTime());
//        return copy;
//    }
//
//    // Handle Array
//    if (obj instanceof Array) {
//        copy = [];
//        for (var i = 0, len = obj.length; i < len; i++) {
//            copy[i] = clone(obj[i]);
//        }
//        return copy;
//    }
//
//    // Handle Object
//    if (obj instanceof Object) {
//        if (isDtmArray(obj)) {
//            return obj.clone();
//        } else {
//            copy = {};
//            for (var attr in obj) {
//                if (obj.hasOwnProperty(attr)) {
//                    copy[attr] = clone(obj[attr]);
//                }
//            }
//            return copy;
//        }
//    }
//
//    throw new Error("Unable to copy obj! Its type isn't supported.");
//}

function clone(src) {
    return Object.assign({}, src);
}

function jsonp(url, cb) {
    var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[cbName] = function (data) {
        delete window[cbName];
        document.body.removeChild(script);
        var keys = Object.keys(data);
        keys.forEach(function (val) {
            if (val !== 'response') {
                console.log(data[val]);
            }
        });
        //cb(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
    document.body.appendChild(script);
}

function ajaxGet(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'text/xml');
    xhr.setRequestHeader('Content-Type', 'application/html');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    xhr.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");

    //req.setRequestHeader("Access-Control-Max-Age", "3600");


    var ext = url.split('.').pop();

    switch (ext) {
        case 'txt':
        case 'csv':
//            req.responseType = 'blob';
            break;
        case 'json':
            //xhr.responseType = 'json';
            break;
        case 'wav':
        case 'aif':
        case 'aiff':
        case 'ogg':
        case 'mp3':
            xhr.responseType = 'arraybuffer';
            break;

        case 'html':
            xhr.responseType = 'document';
            break;
        default:
            xhr.responseType = 'blob';
            break;
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //cb(xhr.response);
            console.log(xhr.response);
        } else {
            //console.log(xhr.status);
        }
    };

    xhr.send();
}

dtm.util = {};

/* TYPE CHECKING */
dtm.util.isEmpty = isEmpty;
dtm.util.isNumber = isNumber;
dtm.util.isInteger = isInteger;
dtm.util.isString = isString;
dtm.util.isBoolean = isBoolean;
dtm.util.isFunction = isFunction;
dtm.util.isPromise = isPromise;
dtm.util.isObject = isObject;
dtm.util.isSingleVal = isSingleVal;
dtm.util.isArray = isArray;
dtm.util.isFloat32Array = isFloat32Array;
dtm.util.isNumArray = isNumArray;
dtm.util.isNumOrFloat32Array = isNumOrFloat32Array;
dtm.util.isParsableNumArray = isParsableNumArray;
dtm.util.isObjArray = isObjArray;
dtm.util.isMixedArray = isMixedArray;
dtm.util.isStringArray = isStringArray;
dtm.util.isBoolArray = isBoolArray;
dtm.util.isNestedArray = isNestedArray;
dtm.util.isNestedWithDtmArray = isNestedWithDtmArray;
dtm.util.isDtmObj = isDtmObj;
dtm.util.isDtmSynth = isDtmSynth;
dtm.util.isDtmArray = isDtmArray;
dtm.util.isNestedDtmArray = isNestedDtmArray;
dtm.util.isNumDtmArray = isNumDtmArray;
dtm.util.isNestedNumDtmArray = isNestedNumDtmArray;
dtm.util.argIsSingleArray = argIsSingleArray;
dtm.util.argsAreSingleVals = argsAreSingleVals;

/* ANALYSIS */
dtm.util.getMaxArrayDepth = getMaxArrayDepth;
dtm.util.getMaxDtmArrayDepth = getMaxDtmArrayDepth;
dtm.util.getMaxDepth = getMaxDepth;
dtm.util.hasMissingValues = hasMissingValues;
//dtm.util.arrayCompare = arrayCompare;
dtm.util.numProperties = numProperties;

dtm.util.getMin = getMin;
dtm.util.getMax = getMax;
dtm.util.mean = mean;
dtm.util.mode = mode;
dtm.util.midrange = midrange;
dtm.util.sum = sum;
dtm.util.variance = variance;
dtm.util.pvar = pvar;
dtm.util.std = std;
dtm.util.pstd = pstd;
dtm.util.rms = rms;
dtm.util.unique = unique;
dtm.util.histo = histo;
dtm.util.countBy = countOccurrences;
dtm.util.listClasses = listClasses;
dtm.util.uniformity = uniformity;
dtm.util.intersection = intersection;

/* CONVERSION */
dtm.util.argsToArray = argsToArray;
dtm.util.toFloat32Array = toFloat32Array;
dtm.util.fromFloat32Array = fromFloat32Array;

/* SINGLE-VALUE CALCULATION */
dtm.util.mod = mod;
dtm.util.mtof = mtof;
dtm.util.ftom = ftom;

/* LIST OPERATION */
dtm.util.Float32Concat = Float32Concat;
dtm.util.concat = concat;
dtm.util.Float32splice = Float32Splice;
dtm.util.splice = splice;

/* ITERATION */
dtm.util.argsForEach = argsForEach;
dtm.util.objForEach = objForEach;
dtm.util.Float32Map = Float32Map;

/* MISC */
dtm.util.truncateDigits = truncateDigits;
dtm.util.deferCallback = deferCallback;
dtm.util.cloneArray = cloneArray;
dtm.util.print = print;