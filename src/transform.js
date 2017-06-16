// /**
//  * @fileOverview Utility functions for single-dimensional arrays. Singleton.
//  * @module transform
//  */

// singleton helper functions
dtm.transform = {
    /* SCALERS */

    /**
     * Normalizes an numerical array into 0-1 range.
     * @function module:transform#normalize
     * @param arr {array} One-dimensional numerical array.
     * @param [min] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [max] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {array} Normalized numerical array.
     * @example
     *
     * var seq = [-10, 1, -6, 1, -9, 10, -8, 8];
     *
     * dtm.transform.normalize(seq);
     * -> [0, 0.55, 0.2, 0.55, 0.05, 1, 0.1, 0.9]
     */
    normalize: function (arr, min, max) {
        if (isNumOrFloat32Array(arr)) {
            if (!isNumber(min)) {
                min = getMin(arr);
            }

            if (!isNumber(max)) {
                max = getMax(arr);
            }

            var denom = 1;

            if (max === min) {
                if (min > 0 && min <= 1) {
                    min = 0;
                } else if (min > 1) {
                    min -= 1;
                }
            } else {
                denom = max - min;
            }

            return arr.map(function (val) {
                return (val - min) / denom;
            });
        }
    },
    // normalize: function (arr, min, max) {
    //     if (!isNumber(min)) {
    //         min = getMin(arr);
    //     }
    //
    //     if (!isNumber(max)) {
    //         max = getMax(arr);
    //     }
    //
    //     var data = new Float32Array(arr);
    //     var ptr = Module._malloc(data.byteLength);
    //     var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
    //     view.set(data);
    //
    //     Module.ccall('normalize', null, ['number', 'number', 'number', 'number'], [ptr, data.length, min, max]);
    //
    //     Module._free(ptr);
    //     return view;
    // },

    fft: function (arr) {
        var data = new Float32Array(arr);
        var ptr = Module._malloc(data.byteLength);
        var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
        view.set(data);

        Module.ccall('fft', null, ['number', 'number'], [ptr, data.length]);

        Module._free(ptr);
        return view;
    },

    /**
     * Modifies the range of an array.
     * @function module:transform#rescale
     * @param arr {array}
     * @param min {number}
     * @param max {number}
     * @param [dmin] {number}
     * @param [dmax] {number}
     * @returns array {array}
     * @example
     *
     * dtm.transform.rescale([2, 1, 8, 9, 1, 3, 6, 9], -1, 1);
     * -> [-0.75, -1, 0.75, 1, -1, -0.5, 0.25, 1]
     */
    rescale: function (arr, min, max, dmin, dmax) {
        var normalized = dtm.transform.normalize(arr, dmin, dmax);
        var res = [];

        for (var i = 0, l = normalized.length; i < l; i++) {
            res[i] = truncateDigits(rescale(normalized[i], min, max));
        }

        return res;
    },

    /**
     * Applies an exponential curve to a normalized (0-1) array.
     * @function module:transform#expCurve
     * @param arr
     * @param [factor=1] {number}
     * @returns {Array}
     */
    expCurve: function (arr, factor) {
        factor = factor || 1;
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            res[i] = expCurve(arr[i], factor);
        }

        return res;
    },

    /**
     * Applies a logarithmic curve to a normalized (0-1) array.
     * @function module:transform#logCurve
     * @param arr
     * @param [factor=1] {number}
     * @returns {Array}
     */
    logCurve: function (arr, factor) {
        factor = factor || 1;
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            res[i] = logCurve(arr[i], factor);
        }

        return res;
    },

    /**
     * Stretches or shrinks the input numerical array to a target length.
     * @function module:transform#fit
     * @param arr {array} Input numerical array.
     * @param len {number} Target length.
     * @param [interp='linear'] {string} Interpolation mode. Choices: 'linear', 'step', 'zeros'
     * @returns {array}
     * @example
     * var input = [2, 6, -3, 9];
     *
     * dtm.transform.fit(input, 6);
     * -> [2, 4.4, 4.2, -1.2, 1.8, 9]
     *
     * @example
     * var input = [1, -2, -6, 6];
     *
     * dtm.transform.fit(input, 3);
     * -> [1, -4, 6]
     */
    fit: function (arr, len, interp) {
        // interp: step, linear, cubic, etc.
        interp = interp || 'linear';

        if (len < 1) {
            len = 1;
        } else {
            len = Math.round(len);
        }

        var res = null;
        if (isNumArray(arr)) {
            res = new Array(len);
        } else if (isFloat32Array(arr)) {
            res = new Float32Array(len);
        } else {
            return null;
        }

        var i = 0;
        //res.length = len;
        var mult = len / arr.length;

        var inNumItv = arr.length - 1;
        var outNumItv = len - 1;
        var intermLen = inNumItv * outNumItv + 1;

        if (interp === 'linear' && intermLen > 104857600) {
            interp = 'step';
        }

        switch (interp) {
            default:
            case 'linear':
                var intermArr = null;

                if (isNumArray(arr)) {
                    intermArr = new Array(intermLen);
                } else if (isFloat32Array(arr)) {
                    intermArr = new Float32Array(intermLen);
                }

                var c = 0;
                for (var j = 0; j < inNumItv; j++) {
                    for (i = 0; i < outNumItv; i++) {
                        intermArr[c] = arr[j] + (arr[j + 1] - arr[j]) * (i / outNumItv);
                        c++;
                    }
                }
                intermArr[c] = arr[j];

                for (var k = 0; k < outNumItv; k++) {
                    res[k] = intermArr[k * inNumItv];
                }
                res[k] = intermArr[intermLen - 1];

                // TODO: not working correctly with data.map
                // var data = new Float32Array(len);
                // data.set(arr);
                // var ptr = Module._malloc(data.byteLength);
                // var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
                // view.set(data);
                //
                // Module.ccall('linearInterp', null, ['number', 'number', 'number'], [ptr, arr.length, len]);
                //
                // Module._free(ptr);
                // res = view;
                break;

            case 'step':
            case 'hold':
                for (i = 0; i < len; i++) {
                    res[i] = arr[Math.floor(i / mult)];
                }
                break;
            case 'zeros':
            case 'zeroes':
                var prevIdx = -1;

                for (i = 0; i < len; i++) {
                    if (prevIdx !== Math.floor(i / mult)) {
                        prevIdx = Math.floor(i / mult);
                        res[i] = arr[prevIdx];
                    } else {
                        res[i] = 0;
                    }
                }
                break;
            case 'decay':
                break;

            case 'cos':
            case 'cosine':
                if (arr.length >= len) {
                    res = dtm.transform.fit(arr, len, 'linear');
                } else {
                    var i = 0;
                    for (var p = 0; p < (arr.length-1); p++) {
                        var curX = p * Math.ceil(len/(arr.length-1));
                        var curY = arr[p];
                        var nextX = (p+1) * Math.ceil(len/(arr.length-1));
                        var nextY = arr[p+1];

                        for (var k = curX; k < nextX; k++) {
                            var ratio = (k - curX) / (nextX - 1 - curX);
                            var mu2 = (1 - Math.cos(ratio * Math.PI)) / 2.0;
                            res[i] = curY * (1 - mu2) + nextY * mu2;
                            i++;
                        }
                    }
                }
                break;
            case 'cubic':
                if (arr.length >= len) {
                    res = dtm.transform.fit(arr, len, 'linear');
                } else {
                    var i = 0;
                    for (var p = 0; p < (arr.length-1); p++) {
                        var curX = p * Math.ceil(len / (arr.length-1));
                        var curY = arr[p];
                        var nextX = (p + 1) * Math.ceil(len / (arr.length-1));
                        var nextY = arr[p + 1];

                        var y0 = 0;
                        var y1 = curY;
                        var y2 = nextY;
                        var y3 = 0;

                        if (p === 0) {
                            y0 = arr[arr.length-1];
                            y3 = arr[p+2];
                        } else if (p === arr.length-2) {
                            y0 = arr[p-1];
                            y3 = arr[0];
                        } else {
                            y0 = arr[p-1];
                            y3 = arr[p+2];
                        }

                        var a0 = y3 - y2 - y0 + y1;
                        var a1 = y0 - y1 - a0;
                        var a2 = y2 - y0;
                        var a3 = y1;

                        for (var k = curX; k < nextX; k++) {
                            var mu = (k - curX) / (nextX - 1 - curX);
                            var mu2 = mu * mu;
                            res[i] = a0*mu*mu2 + a1*mu2 + a2*mu + a3;
                            i++;
                        }
                    }
                }
                break;

            case 'pad':
                break;
        }
        return res;
    },

    /**
     * Stretches or shrinks the input array by the given factor.
     * @function module:transform#stretch
     * @param arr {array} Input numerical array.
     * @param factor {number} Time stretching factor. Should be positve.
     * @param [interp='linear'] {string} Interpolation mode. Choices: 'linear', 'step', 'zeros'
     * @returns {array}
     * @example
     *
     * var input = [4, -2, 4, 3];
     *
     * dtm.transform.stretch(input, 2.5);
     * -> [4, 2, 0, -2, 0, 2, 4, 3.666, 3.333, 3]
     */
    stretch: function (arr, factor, interp) {
        if (!isString(interp)) {
            interp = 'linear';
        }

        var targetLen = Math.round(arr.length * factor);
        if (targetLen == 0) {
            targetLen = 1;
        }

        return dtm.transform.fit(arr, targetLen, interp);
    },

    ola: function (arr, stretchFactor, blockSize, hopSize, window) {
        if (!isNumber(stretchFactor)) {
            stretchFactor = 1.0;
        } else {
            if (stretchFactor < 0.0) {
                stretchFactor = 1.0;
            }
        }
        if (isNumber(blockSize)) {
            blockSize = Math.round(blockSize);

            if (blockSize > arr.length) {
                blockSize = arr.length;
            } else if (blockSize < 1) {
                blockSize = 1;
            }
        }
        if (!isNumber(hopSize)) {
            hopSize = blockSize;
        } else {
            hopSize = Math.round(hopSize);
            if (hopSize < 1) {
                hopSize = 1;
            }
        }

        if (!isString(window)) {
            window = 'hamming'
        }

        var res = dtm.gen('zeros', Math.round(arr.length * stretchFactor));
        for (var i = 0; i < (arr.length - blockSize) / hopSize; i++) {

        }
    },

    limit: function (arr, min, max) {
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            var temp = arr[i];
            if (temp < min) {
                temp = min;
            }
            if (temp > max) {
                temp = max;
            }
            res[i] = temp;
        }
        return res;
    },

    fitSum: function (arr, tgt, round) {
        if (!isBoolean(round)) {
            round = false;
        }

        var summed = sum(arr);

        if (summed === 0) {
            arr = dtm.transform.add(arr, 0.000001);
            summed = sum(arr);
        }

        if (round) {
            tgt = Math.round(tgt);
        }

        var res = dtm.transform.mult(arr, 1/summed * tgt);

        if (round) {
            res = dtm.transform.round(res);

            if (sum(res) !== tgt) {
                var n = 1;
                var rem = sum(res) - tgt;
                var add = rem < 0;

                if (add) {
                    while (rem < 0) {
                        res[mod(arr.length-n, arr.length)]++;
                        rem++;
                        n++;
                    }
                } else {
                    while (rem > 0) {
                        if (res[arr.length-n] > 0) {
                            res[mod(arr.length-n, arr.length)]--;
                            rem--;
                            n++;
                        } else {
                            n++;
                        }
                    }
                }
            }
        }

        return res;
    },

    /**
     * Adds a value to the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then element-wise addition is performed.
     * @function module:transform#add
     * @param input {array}
     * @param factor {number|array}
     * @param [interp='linear] {string}
     * @returns {array}
     */
    add: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] + factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] + factor[i];
            }
        }

        return res;
    },

    subtract: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] - factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] - factor[i];
            }
        }

        return res;
    },

    /**
     * Multiplies the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then the dot product is returned.
     * @function module:transform#mult
     * @param input {array}
     * @param factor {number|array}
     * @param [interp='linear] {string}
     * @returns {array}
     */
    mult: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] * factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] * factor[i];
            }
        }

        return res;
    },

    div: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] / factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] / factor[i];
            }
        }

        return res;
    },

    /**
     * Power operation on the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then element-wise power operation is performed.
     * @function module:transform#pow
     * @param input {array} Base values.
     * @param factor {number|array} Exponent value or array.
     * @param [interp='linear'] {string}
     * @returns {Array}
     */
    pow: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(input[i], factor);
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(input[i], factor[i]);
            }
        }

        return res;
    },

    /**
     * @function module:transform#powof
     * @param input {array} Exponent values.
     * @param factor {number|array} Base value or array.
     * @param [interp='linear'] {string}
     * @returns {Array}
     */
    powof: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(factor, input[i]);
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(factor[i], input[i]);
            }
        }

        return res;
    },

    log: function (input, base, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(base)) {
            base = Math.E;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(base)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.log(input[i]) / Math.log(base);
            }
        } else if (isNumOrFloat32Array(base)) {
            if (input.length > base.length) {
                base = dtm.transform.fit(base, input.length, interp);
            } else if (input.length < base.length) {
                input = dtm.transform.fit(input, base.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.log(input[i]) / Math.log(base[i]);
            }
        }

        return res;
    },


    /* ARITHMETIC */

    /**
     * Rounds the float values to the nearest integer values or the nearest multiplication of the factor "to".
     * @function module:transform#round
     * @param input {array} Numerical array
     * @param to {number}
     * @returns {Array}
     */
    round: function (input, to) {
        var res = null;
        var i, l;
        if (isNumArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (!isNumber(to)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.round(input[i]);
            }
        } else {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.round(input[i] / to) * to;
            }
        }
        return res;
    },

    /**
     * Floor quantizes the float values to the nearest integer values.
     * @function module:transform#round
     * @param input {array} Numerical array
     * @returns {Array}
     */
    floor: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = Math.floor(input[i]);
        }
        return res;
    },

    /**
     * Ceiling quantizes the float values to the nearest integer values.
     * @function module:transform#round
     * @param input {array} Numerical array
     * @returns {Array}
     */
    ceil: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = Math.ceil(input[i]);
        }
        return res;
    },

    hwr: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = (input[i] < 0) ? 0 : input[i];
        }

        return res;
    },

    fwr: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = (input[i] < 0) ? Math.abs(input[i]) : input[i];
        }

        return res;
    },

    mod: function (input, divisor) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = mod(input[i], divisor);
        }

        return res;
    },

    removeZeros: function (input) {
        var res = [];

        for (var i = 0; i < input.length; i++) {
            if (input[i] !== 0) {
                res.push(input[i]);
            }
        }

        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    diff: function (input) {
        var res = [];

        for (var i = 1; i < input.length; i++) {
            res.push(input[i] - input[i-1]);
        }

        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    /* LIST OPERATIONS */

    /**
     * Creates a horizontal reverse of the input array.
     * @function module:transform#reverse
     * @param {array} input One-dimensional array. Could be any type.
     * @returns {array}
     * @example
     *
     * var input = [4, 1, 2, 7, 5, 0, 6, 3];
     *
     * dtm.transform.reverse(input);
     * -> [3, 6, 0, 5, 7, 2, 1, 4]
     */
    reverse: function (input) {
        var res = [];
        for (var i = input.length - 1; i >= 0; --i) {
            res.push(input[i]);
        }
        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    /**
     * Vertical invertion.
     * @function module:transform#invert
     * @param {array} input One-dimensional numerical array
     * @param {number} [center] If not present, the mean of the input array is used as the center point.
     * @returns {array}
     * @example
     *
     * var input = [4, 0, 3, 1, 2, 7, 5, 6];
     *
     * dtm.transform.invert(input);
     * -> [3, 7, 4, 6, 5, 0, 2, 1]
     */
    invert: function (input, center) {
        if (!isNumber(center)) {
            center = mean(input);
        }

        var res = [];

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = center - (input[i] - center);
        }
        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    /**
     * Randomizes the order of the contents of an array.
     * @function module:transform#shuffle
     * @param arr
     * @returns {Array}
     */
    shuffle: function (arr) {
        for (var i = arr.length-1; i >= 1; i--) {
            var j = Math.round(Math.random() * i);
            var temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;
        }
        return arr;
    },

    /**
     * Sorts the contents of a numerical array.
     * @function module:transform#sort
     * @param arr {array}
     * @returns {array}
     */
    sort: function (arr) {
        var res = arr.sort(function (a, b) {
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0
            }
        });
        if (isFloat32Array(arr)) {
            return toFloat32Array(res);
        } else {
            return res;
        }
    },

    /**
     * Repeats the contents of an array.
     * @param input
     * @param count
     * @returns {Array}
     */
    repeat: function (input, count) {
        var res = [];

        if (!isInteger(count) || count < 1) {
            count = 1;
        }

        for (var i = 0; i < count; i++) {
            res = concat(res, input);
        }

        return res;
    },

    // TODO: it should just have one behavior
    /**
     * Truncates some values either at the end or both at the beginning and the end of the given array.
     * @function module:transform#truncate
     * @param arr {number}
     * @param arg1 {number}
     * @param [arg2]
     * @returns {Array}
     */
    truncate: function (arr, arg1, arg2) {
        var res = [];
        if (!isEmpty(arg2)) {
            for (var i = 0; i < (arr.length - (arg1 + arg2)); i++) {
                res[i] = arr[arg1 + i];
            }
        } else {
            for (var j = 0; j < (arr.length - arg1); j++) {
                res[j] = arr[j];
            }
        }
        return res;
    },

    getBlock: function (arr, start, size, wrap) {
        var res = [];
        var idx = 0;

        // TODO: non-wrapping zero-padded version
        for (var i = 0; i < size; i++) {
            idx = mod(i + start, arr.length);
            res[i] = arr[idx];
        }

        return res;
    },

    window: function (arr, type) {
        switch (type) {
            case 'rect':
            case 'rectangle':
            case 'rectangular':
                return arr;
            default:
                break;
        }
        var phase = 0;
        var res = null;
        if (isArray(arr)) {
            res = new Array(arr.length);
        } else if (isFloat32Array(arr)) {
            res = new Float32Array(arr.length);
        }

        for (var i = 0; i < arr.length; i++) {
            phase = i/(arr.length-1);

            switch (type) {
                case 'tri':
                case 'triangle':
                case 'triangular':
                    res[i] = arr[i] * (1 - Math.abs(phase * 2 - 1));
                    break;
                case 'hamm':
                case 'hamming':
                    var alpha = 0.54;
                    var beta = 0.46;
                    res[i] = arr[i] * (alpha - beta * Math.cos(2 * Math.PI * phase));
                    break;

                // maybe these are redundant
                case 'rect':
                case 'rectangle':
                case 'rectangular':
                default:
                    res[i] = arr[i];
                    break;
            }
        }

        return res;
    },

    //linslide: function (arr, up, down) {
    //    var res = [arr[0]];
    //
    //    if (!isInteger(up)) {
    //        up = 0;
    //    }
    //
    //    if (!isInteger(down)) {
    //        down = 0;
    //    }
    //
    //    for (var i = 1; i < arr.length; i++) {
    //        if (arr[i] < arr[i-1]) {
    //            res[i] = (arr[i-1] + arr[i]) / 2.0;
    //        } else {
    //            res[i] = arr[i];
    //        }
    //    }
    //    return res;
    //},

    /**
     * Shifts the positions of array contents.
     * @function module:transform#shift
     * @param arr
     * @param amount {number}
     * @returns {Array}
     */
    shift: function (arr, amount) {
        var res = [];

        for (var i = 0; i < arr.length; i++) {
            var j = mod((i + amount), arr.length);
            res[i] = arr[j];
        }
        return res;
    },

    /**
     * Variable length array morphing!
     * @function module:transform#morph
     * @param srcArr {array}
     * @param tgtArr {array}
     * @param [interp='linear'] {string}
     * @param [morphIdx=0.5] {float}
     */
    morph: function (srcArr, tgtArr, morphIdx, interp) {
        if (!isNumber(morphIdx)) {
            morphIdx = 0.5;
        }

        var srcLen = srcArr.length;
        var tgtLen = tgtArr.length;
        var resLen = Math.round((tgtLen - srcLen) * morphIdx + srcLen);

        return morphFixed(dtm.transform.fit(srcArr, resLen, interp), dtm.transform.fit(tgtArr, resLen), morphIdx);
    },

    /* UNIT CONVERTIONS */
    // CHECK: maybe should say Note To Beats
    /**
     * Converts a beat sequence (e.g. [1, 0, 1, 0]) into a sequence of note qualities.
     * @function module:transform#notesToBeats
     * @param input
     * @param resolution
     * @returns {Array}
     */
    notesToBeats: function (input, resolution) {
        var res = [];
        var idx = 0;

        for (var i = 0, l = input.length; i < l; i++) {
            var note = resolution / input[i];
            for (var j = 0; j < note; j++) {
                if (j === 0) {
                    res[idx] = 1;
                } else {
                    res[idx] = 0;
                }
                idx++;
            }
        }

        return res;
    },

    /**
     * Converts a periodic beat sequence into a note quality sequence.
     * @function module:transform#beatsToNotes
     * @param input
     * @param resolution
     * @returns {Array}
     */
    beatsToNotes: function (input, resolution) {
        var res = [];
        var prevVal = 0;
        var note = 1;
        var noteOn = false;

        for (var i = 0; i < input.length - 1; i++) {
            if (input[i + 1] !== 0) {
                res.push(resolution / note);
                note = 1;
            } else {
                note++;
            }
        }

        res.push(resolution / note);

        return res;
    },

    /**
     * Converts an interval sequence into a beat sequence.
     * @function module:transform#intervalToBeats
     * @param intervals {array}
     * @param ampseq {array}
     * @returns {Array}
     */
    intervalsToBeats: function (intervals, ampseq) {
        var res = [];
        var idx = 0;

        for (var i = 0, l = intervals.length; i < l; i++) {
            for (var j = 0; j < intervals[i]; j++) {
                if (j === 0) {
                    if (ampseq) {
                        res[idx] = ampseq[mod(i, ampseq.length)];
                    } else {
                        res[idx] = 1;
                    }
                } else {
                    res[idx] = 0;
                }
                idx++;
            }
        }

        return res;
    },

    /**
     * Converts a beat sequence into an interval sequence.
     * @function module:transform#beatsToIntervals
     * @param input
     * @returns {Array}
     */
    beatsToIntervals: function (input) {
        var res = [];
        var prevVal = 0;
        var note = 1;
        var noteOn = false;

        for (var i = 0; i < input.length - 1; i++) {
            if (input[i + 1] !== 0) {
                res.push(note);
                note = 1;
            } else {
                note++;
            }
        }

        res.push(note);

        return res;
    },

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:transform#beatsToIndices
     * @param input
     * @returns {Array}
     */
    beatsToIndices: function (input) {
        var res = [];

        for (var i = 0; i < input.length; i++) {
            if (input[i] !== 0) {
                res.push(i);
            }
        }

        return res;
    },

    /**
     * @function module:transform#indicesToBeats
     * @param input
     * @param [seqLen] The length of the returned beat sequence. If not present, it will be the minimum power of two number to represent the beat sequence.
     */
    indicesToBeats: function (input, seqLen) {
        input = dtm.transform.sort(input);

        if (!isNumber(seqLen)) {
            var f = 0, len = 1;
            while (input[input.length-1] >= len) {
                len = Math.pow(2, ++f);
            }
        } else {
            len = seqLen;
        }

        var res = dtm.gen('const', 0).size(len).get();

        for (var i = 0; i < input.length; i++) {
            if (input[i] >= seqLen) {
                break;
            }

            res[input[i]] = 1;
        }

        return res;
    },

    calcBeatsOffset: function (src, tgt) {
        var res = [];
        var offset = 0;
        var countFromSrc = false;
        var countFromTgt = false;

        for (var i  = 0; i < src.length; i++) {
            if (src[i] === 1 && !countFromTgt) {
                countFromSrc = true;
            } else if (tgt[i] === 1 && !countFromSrc) {
                countFromTgt = true;
            }

            if (countFromSrc) {
                if (tgt[i] === 1) {
                    res.push(offset);
                    countFromSrc = countFromTgt = false;
                    offset = 0;
                } else {
                    offset++;
                }
            } else if (countFromTgt) {
                if (src[i] === 1) {
                    res.push(offset);
                    countFromSrc = countFromTgt = false;
                    offset = 0;
                } else {
                    offset--;
                }
            }
        }

        return res;
    },

    applyOffsetToBeats: function (src, offset) {
        var res = dtm.gen('zeroes', src.length).get();
        var curSelection = 0;

        for (var i = 0; i < src.length; i++) {
            if (src[i] === 1) {
                res[i + offset[curSelection]] = 1;
                curSelection++;
            }
        }

        return res;
    },

    /**
     * Analyzes the linear-regression evenness and modulates.
     * @function module:transform:lreModulation
     * @param input
     * @param degree
     */
    lreModulation: function (input, degree, mode) {
        var res = [];
        var nonZeros = 0;
        var curOnset = 0;
        var evenness = 0;

        for (var i = 0; i < input.length; i++) {
            res[i] = 0;

            if (input[i] !== 0) {
                nonZeros++;
            }
        }

        var unit = input.length / nonZeros;

        var intervals = [];
        for (var j = 0; j < input.length; j++) {
            if (input[j] !== 0) {
                var offset = j - unit * curOnset;
                intervals.push(Math.round(unit * curOnset + offset * (degree-0.5) * 2));
                curOnset++;
            }
        }

        for (var k = 0; k < intervals.length; k++) {
            var idx = intervals[k];
            if (idx < 0) {
                idx = 0;
            } else if (idx >= input.length) {
                idx = input.length - 1;
            }
            res[idx] = 1;
        }

        return res;
    },
    
    editDistance: function (array, target) {
        return array.map(function (v) {
            return levenshteinDistance(v, target);
        });
    },

    pitchQuantize: function (input, scale, round) {
        var res = [];

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = pq(input[i], scale, round);
        }

        return res;
    },

    // CHECK: redundant with analyzer.unique
    unique: function (input) {
        return unique(input);
    },

    classId: function (input) {
        var res = [];
        var sortedClasses = listClasses(input).sort();
        var classIds = {};

        for (var i = 0, l = sortedClasses.length; i < l; i++) {
            classIds[sortedClasses[i]] = i;
        }

        for (var j = 0, m = input.length; j < m; j++) {
            res[j] = classIds[input[j]];
        }

        return res;
    },

    stringify: function (input) {
        var res = [];
        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = input[i].toString();
        }

        return res;
    },

    tonumber: function (input) {
        var res = [];
        for (var i = 0, l = input.length; i < l; i++) {
            if (isString(input[i])) {
                res[i] = parseFloat(input[i]);
            } else if (isBoolean(input[i])) {
                res[i] = input[i] ? 1.0 : 0.0;
            } else {
                res[i] = NaN;
            }
        }
        return res;
    },

    mtof: function (input) {
        var res;

        if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        } else {
            res = new Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = mtof(input[i]);
        }
        return res;
    },

    ftom: function (input) {
        var res;

        if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        } else {
            res = new Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = ftom(input[i]);
        }
        return res;
    },

    split: function (input, separator) {
        if (!isString(separator)) {
            separator = '';
        }

        var res = [];
        if (isArray(input)) {
            for (var i = 0, l = input.length; i < l; i++) {
                if (isNumber(input[i])) {
                    input[i] = input[i].toString();
                }
                res = res.concat(input[i].split(separator));
            }
        }
        return res;
    },
    
    convolve: function () {
        
    }
};

/**
 * A shorthand for the notesToBeats() function.
 * @function module:transform#ntob
 */
dtm.transform.ntob = dtm.transform.notesToBeats;

/**
 * A shorthand for the beatsToNotes() function.
 * @function module:transform#bton
 */
dtm.transform.bton = dtm.transform.beatsToNotes;

/**
 * A shorthand for the intervalsToBeats() function.
 * @function module:transform#itob
 */
dtm.transform.itob = dtm.transform.intervalsToBeats;

/**
 * A shorthand for the beatsToIntervals() function.
 * @function module:transform#btoi
 */
dtm.transform.btoi = dtm.transform.beatsToIntervals;

dtm.transform.abs = dtm.transform.fwr;
dtm.transform.randomize = dtm.transform.shuffle;

function morphFixed (srcArr, tgtArr, morphIdx) {
    if (!isNumber(morphIdx)) {
        morphIdx = 0.5;
    }

    var newArr = [];

    for (var i = 0, l = srcArr.length; i < l; i++) {
        newArr[i] = (tgtArr[i] - srcArr[i]) * morphIdx + srcArr[i];
    }

    return newArr;
}

dtm.tr = dtm.transform;