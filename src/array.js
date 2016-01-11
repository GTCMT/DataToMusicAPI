/**
 * @fileOverview Single dimensional array with built-in transformation functions.
 * @module array
 */

/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.array can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:array.array
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.array = function () {
    // private
    var params = {
        name: '',
        type: null, // number, string, boolean, coll, mixed, date
        length: null,
        min: null,
        max: null,
        mean: null,
        std: null,
        mode: null,

        value: [],
        original: null,
        normalized: null,
        classes: null,
        numClasses: null,

        index: 0,
        step: 1,

        parent: null,

        hash: '',
        processed: 0
    };

    var array = {};
    //var array = function () {};

    array.meta = {
        type: 'dtm.array',
        getParams: function () {
            return params;
        },
        addParams: function (paramsExt) {
            objForEach(paramsExt, function (val, key) {
                params[key] = val;
            });
        }
    };

    // TODO: list different query params in detail in the documentation
    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name|key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
     * @returns {number|array|string}
     */
    array.get = function (param) {
        if (isNumber(param)) {
            // TODO: support multiple single val arguments
            return params.value[dtm.value.mod(param, params.len)];

            //if (param < 0 || param >= params.len) {
            //    dtm.log('Index out of range');
            //    return params.value[dtm.value.mod(param, params.len)];
            //} else {
            //    return params.value[param];
            //}
        } else if (isNumArray(param) || (isDtmArray(param) && isNumArray(param.get()))) {
            var indices = isDtmArray(param) ? param.get() : param;
            var res = []; // TODO: support typed array?

            // TODO: only accept integers

            indices.forEach(function (i) {
                res.push(params.value[dtm.value.mod(i, params.len)]);
            });

            return res;

        } else if (isString(param)) {
            switch (param) {
                case 'getters':
                case 'help':
                case '?':
                    return 'name|key, type, len|length, min|minimum, max|maximum, extent|minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram'.split(', ');

                case 'methods':
                case 'functions':
                    return Object.keys(array);

                case 'name':
                case 'key':
                    return params.name;

                case 'type':
                    if (isNumArray(params.value)) {
                        return 'number';
                    } else if (isStringArray(params.value)) {
                        return 'string';
                    } else {
                        return params.type;
                    }

                case 'parent':
                    return params.parent;

                case 'len':
                case 'length':
                    return params.len;

                case 'hash':
                    return params.hash;

                case 'processed':
                    return params.processed;

                case 'nested':
                    return params.value.map(function (v) {
                        if (isDtmArray(v)) {
                            return v.get();
                        } else {
                            return v;
                        }
                    });

                /* STATS */
                case 'minimum':
                case 'min':
                    return dtm.analyzer.min(params.value);

                case 'maximum':
                case 'max':
                    return dtm.analyzer.max(params.value);

                case 'extent':
                case 'minmax':
                case 'range':
                    return [dtm.analyzer.min(params.value), dtm.analyzer.max(params.value)];

                case 'mean':
                case 'average':
                case 'avg':
                    return dtm.analyzer.mean(params.value);

                case 'mode':
                    return dtm.analyzer.mode(params.value);
                case 'median':
                    return dtm.analyzer.median(params.value);
                case 'midrange':
                    return dtm.analyzer.midrange(params.value);

                case 'standardDeviation':
                case 'std':
                    return dtm.analyzer.std(params.value);
                case 'pstd':
                    return dtm.analyzer.pstd(params.value);

                case 'variance':
                case 'var':
                    return dtm.analyzer.var(params.value);
                case 'populationVariance':
                case 'pvar':
                    return dtm.analyzer.pvar(params.value);

                case 'sumAll':
                case 'sum':
                    return dtm.analyzer.sum(params.value);

                case 'rms':
                    return dtm.analyzer.rms(params.value);

                case 'pdf':
                    break;


                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return params.value[params.index];

                case 'next':
                    // TODO: increment after return
                    if (isEmpty(arguments[1])) {
                        params.index = dtm.value.mod(params.index + params.step, params.len);
                        return params.value[params.index];
                    } else if (isNumber(arguments[1]) && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        params.index = dtm.value.mod(params.index + params.step, params.len);
                        blockArray = dtm.transform.getBlock(params.value, params.index, arguments[1]);
                        return dtm.array(blockArray);
                    } else {
                        return array;
                    }

                case 'prev':
                case 'previous':
                    params.index = dtm.value.mod(params.index - params.step, params.len);
                    return params.value[params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    params.index = dtm.val.randi(0, params.len);
                    return params.value[params.index];

                case 'urn':
                    break;

                case 'index':
                case 'idx':
                    return params.index;

                case 'hop':
                case 'hopSize':
                case 'step':
                case 'stepSize':
                    return params.step;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'block':
                    var start, size, blockArray;
                    if (isArray(arguments[1])) {
                        start = arguments[1][0];
                        size = arguments[1][1];
                        blockArray = dtm.transform.getBlock(params.value, start, size);
                        return dtm.array(blockArray);
                    } else if (isNumber(arguments[1]) && isNumber(arguments[2])) {
                        start = arguments[1];
                        size = arguments[2];
                        blockArray = dtm.transform.getBlock(params.value, start, size);
                        return dtm.array(blockArray);
                    } else {
                        // CHECK: ???
                        return params.value;
                    }

                case 'blockNext':
                    // TODO: incr w/ the step size AFTER RETURN
                    params.index = dtm.value.mod(params.index + params.step, params.len);
                    blockArray = dtm.transform.getBlock(params.value, params.index, arguments[1]);
                    return dtm.array(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    if (isEmpty(params.normalized)) {
                        params.normalized = dtm.transform.normalize(params.value);
                    }
                    if (isInteger(arguments[1])) {
                        return params.normalized[dtm.value.mod(arguments[1], params.len)];
                    } else {
                        return params.normalized;
                    }

                case 'sorted':
                case 'sort':
                    return dtm.transform.sort(params.value);

                case 'uniques':
                case 'unique':
                case 'uniq':
                    return dtm.transform.unique(params.value);

                case 'classes':
                    return dtm.analyzer.classes(params.value);

                case 'classID':
                case 'classId':
                    return dtm.transform.classId(params.value);

                case 'string':
                case 'stringify':
                    return dtm.transform.stringify(params.value);

                case 'numClasses':
                case 'numUniques':
                case 'numUniqs':
                    return dtm.analyzer.classes(params.value).length;

                case 'unif':
                case 'uniformity':
                    return dtm.analyzer.uniformity(params.value);

                case 'histogram':
                case 'histo':
                    return dtm.analyzer.histo(params.value);

                default:
                    if (params.hasOwnProperty(param)) {
                        return params[param];
                    } else {
                        return params.value;
                    }
            }
        } else {
            return params.value;
        }
    };

    /**
     * Sets or overwrites the contents of the array object.
     * @function module:array#set
     * @returns {dtm.array}
     */
    array.set = function () {
        if (arguments.length === 0) {
            return array;
        }

        if (argsAreSingleVals(arguments)) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                params.value = new Float32Array(args);
            } else {
                params.value = args;
            }
        } else {
            // if set arguments include any array-like object
            if (arguments.length === 1) {
                if (isNumber(arguments[0])) {
                    params.value = new Float32Array([arguments[0]]);
                } else if (isNumArray(arguments[0])) {
                    params.value = new Float32Array(arguments[0]);
                } else if (isNestedArray(arguments[0])) {
                    params.value = new Array(arguments[0].length);
                    arguments[0].forEach(function (v, i) {
                        params.value[i] = dtm.array(v).parent(array);
                    });
                } else if (isNestedWithDtmArray(arguments[0])) {
                    params.value = arguments[0];
                    params.value.forEach(function (v) {
                        v.parent(array);
                    });
                } else if (isDtmArray(arguments[0])) {
                    params.value = arguments[0].get();
                    // set parent in the child
                } else if (isNestedDtmArray(arguments[0])) {
                    params.value = arguments[0].get();
                    params.value.forEach(function (v) {
                        v.parent(array);
                    });
                } else if (isString(arguments[0])) {
                    params.value = [arguments[0]]; // no splitting
                    checkType(params.value);
                } else {
                    params.value = arguments[0];
                }
            } else {
                params.value = new Array(arguments.length);

                argsForEach(arguments, function (v, i) {
                    if (isDtmArray(v)) {
                        params.value[i] = v;
                    } else {
                        params.value[i] = dtm.array(v);
                    }
                    params.value[i].parent(array);
                });
            }
        }

        if (isEmpty(params.original)) {
            params.original = params.value;

            // CHECK: type checking - may be redundant
            checkType(params.value);
        } else {
            params.processed++;
        }

        params.len = params.value.length;
        params.index = params.len - 1;

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#name
     * @param name {string}
     * @returns {dtm.array}
     */
    array.name = function (name) {
        if (isString(name)) {
            params.name = name;
        }
        return array;
    };

    /**
     * Sets the value type of the array content. Should be either 'number' or 'string'?
     * @function mudule:array#valuetype
     * @param arg
     * @returns {dtm.array}
     */
    array.valuetype = function (arg) {
        if (isString(arg)) {
            params.type = arg;
        }
        return array;
    };

    function generateHash(arr) {

    }

    function checkType(arr) {
        //var summed = dtm.analyzer.sum(arr);
        //var res;
        //
        //if (isNaN(summed)) {
        //    res = 'string';
        //} else {
        //    if (summed.toString().indexOf('.') > -1) {
        //        res = 'float';
        //    } else {
        //        res = 'int';
        //    }
        //}

        // TODO: workaround for a missing value
        if (!isNumber(arr[0])) {
            if (isObject(arr[0])) {
                params.type = 'collection';
            } else {
                params.type = typeof(arr[0]);
            }
        } else {
            //params.type = 'number';
            params.type = typeof(arr[0]);
        }

        //array.type = res;
    }

    /**
     * Sets the size of the iteration step.
     * @function module:array#step
     * @param val {number}
     * @returns {dtm.array}
     */
    array.step = function (val) {
        if (isInteger(val) && val > 0) {
            params.step = val;
        }
        return array;
    };

    /**
     * Sets the current index within the array for the iterator. Value exceeding the max or min value will be wrapped around.
     * @function module:array#index
     * @param val {number}
     * @returns {dtm.array}
     */
    array.index = function (val) {
        if (isNumber(val)) {
            params.index = dtm.value.mod(Math.round(val), params.len);
        }
        return array;
    };


    /* GENERATORS */
    /**
     * Returns a clone of the array object. It can be used when you don't want to reference the same array object from different places.
     * @function module:array#clone
     //* @memberOf module:array
     * @returns {dtm.array}
     */
    array.clone = function () {
        var newArr = dtm.array(params.value).name(params.name);

        // CHECK: this may cause troubles!
        newArr.index(params.index);
        newArr.step(params.step);

        if (params.type === 'string') {
            newArr.classes = params.classes;
            newArr.setType('string');
        }
        return newArr;
    };

    ///**
    // * @alias module:array#clone
    // * @memberOf module:array
    // */
    array.c = array.clone;

    /**
     * blah blah
     * @instance
     * @memberOf module:array
     * @name clonetest
     * @alias c, cl
     * @returns {dtm.array}
     */
    function clonetest() {

    }

    array.parent = function (obj) {
        if (isDtmArray(obj)) {
            params.parent = obj;
        }
        return array;
    };

    // TODO: array.block (and window) should transform the parent array into nested child array

    array.nest = function () {
        if (!isDtmArray(params.value)) {
            array.set([dtm.array(params.value)]);
            params.value[0].parent(array);
        }
        return array;
    };

    array.unnest = function () {
        var flattened = [];
        params.value.forEach(function (v) {
            if (isDtmArray(v)) {
                flattened = concat(flattened, v.get());
            }
        });

        if (isNumOrFloat32Array(flattened)) {
            flattened = toFloat32Array(flattened);
        }
        return array.set(flattened);
    };

    array.flatten = array.unblock = array.unnest;

    /**
     * Morphs the array values with a target array / dtm.array values. The lengths can be mismatched.
     * @function module:array#morph
     * @param tgtArr {array | dtm.array}
     * @param [morphIdx=0.5] {number} between 0-1
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.morph = function (tgtArr, morphIdx, interp) {
        if (!isArray(tgtArr)) {
            if (isDtmArray(tgtArr)) {
                tgtArr = tgtArr.get();
            }
        }

        if (!isNumber(morphIdx)) {
            morphIdx = 0.5;
        }

        if (isNumArray(params.value) && isNumArray(tgtArr)) {
            array.set(dtm.transform.morph(params.value, tgtArr, morphIdx, interp));
        }
        return array;
    };

    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:array#reset
     * @returns {dtm.array}
     */
    array.reset = function () {
        return array.set(params.original);
    };

    array.r = array.reset;

    /**
     * Clears all the contents of the array object.
     * @function module:array#flush | clear
     * @returns {dtm.array}
     */
    array.flush = function () {
        return array.set([]);
    };

    array.clear = array.flush;

    /* SCALARS */

    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:array#normalize
     * @param [arg1] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [arg2] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {dtm.array}
     */
    array.normalize = function (arg1, arg2) {
        if (isNestedDtmArray(array)) {
            return array;
        }

        var min, max, args;
        if (isNumber(arg1) && isNumber(arg2)) {
            min = arg1;
            max = arg2;
        } else {
            if (isNumOrFloat32Array(arg1)) {
                args = arg1;
            } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
                args = arg1.get();
            }

            if (isNumOrFloat32Array(args)) {
                if (args.length === 2) {
                    min = args[0];
                    max = args[1];
                } else if (args.length > 2) {
                    min = dtm.analyzer.min(args);
                    max = dtm.analyzer.max(args);
                }
            }
        }

        return array.set(dtm.transform.normalize(params.value, min, max));
    };

    array.n = array.normalize;

    /**
     * Modifies the range of the array. Shorthand: array.sc
     * @function module:array#scale
     * @param arg1 {number|array|dtm.array} The target minimum value of the scaled range.
     * @param arg2 {number|array|dtm.array} The target maximum value of the scaled range.
     * @param [arg3] {number} The minimum of the domain (original) value.
     * @param [arg4] {number} The maximum of the domain value.
     * @returns {dtm.array}
     * @example
     * // Specifying the output range
     * dtm.array([1, 2, 3]).scale([0, 10]).get();
     * // or
     * dtm.array([1, 2, 3]).scale(0, 10).get();
     * -> [0, 5, 10]
     *
     * // Specifying the domain values (the second array in the argument)
     * dtm.array([1, 2, 3]).scale([0, 10], [0, 5]).get();
     * // or
     * dtm.array([1, 2, 3]).scale(0, 10, 0, 5).get();
     * -> [2, 4, 6]
     */
    array.scale = function (arg1, arg2, arg3, arg4) {
        var min, max, dmin, dmax;

        // TODO: better typecheck order

        if (isNumber(arg1)) {
            min = arg1;
        } else if (isNumArray(arg1)) {
            if (arg1.length >= 2) {
                min = arg1[0];
                max = arg1[1];
            }
            if (arg1.length > 2) {
                min = dtm.analyzer.min(arg1);
                max = dtm.analyzer.max(arg1);
            }
        } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
            if (arg1.get('len') === 2) {
                min = arg1.get(0);
                max = arg1.get(1);
            } else if (arg1.get('len') > 2) {
                min = arg1.get('min');
                max = arg1.get('max');
            }
        } else {
            return array;
        }

        if (isNumber(arg2)) {
            max = arg2;
        } else if (isNumArray(arg2) && arg2.length === 2) {
            dmin = arg2[0];
            dmax = arg2[1];
        }

        if (isNumber(arg3)) {
            dmin = arg3;
        } else if (isNumArray(arg3) && arg3.length === 2) {
            dmin = arg3[0];
            dmax = arg3[1];
        }

        if (isNumber(arg4)) {
            dmax = arg4;
        }

        return array.set(dtm.transform.rescale(params.value, min, max, dmin, dmax));
    };
    array.sc = array.scale;

    /**
     * Caps the array value range at the min and max values. Only works with a numerical array.
     * @function module:array#limit | clip
     * @param [min=0]
     * @param [max=1]
     * @returns {dtm.array}
     */
    array.limit = function (min, max) {
        if (params.type === 'number') {
            min = min || 0;
            max = max || 1;
            return array.set(dtm.transform.limit(array.get(), min, max));
        } else {
            return array;
        }
    };

    array.clip = array.limit;

    /**
     * Scales the array with an exponential curve.
     * @function module:array#expcurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.array}
     */
    array.expcurve = function (factor, min, max) {
        if (isEmpty(min)) {
            min = array.get('min');
        }
        if (isEmpty(max)) {
            max = array.get('max');
        }

        var arr = dtm.transform.expCurve(array.get('normalized'), factor);
        return array.set(dtm.transform.rescale(arr, min, max));
    };

    array.exp = array.expcurve;

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:array#log | logCurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.array}
     */
    array.logcurve = function (factor, min, max) {
        if (isEmpty(min)) {
            min = array.get('min');
        }
        if (isEmpty(max)) {
            max = array.get('max');
        }

        var arr = dtm.transform.logCurve(array.get('normalized'), factor);
        return array.set(dtm.transform.rescale(arr, min, max));
    };

    array.log = array.logcurve;

    // TODO: design & implement
    /**
     * Log curve and exp curve combined
     * @param factor
     * @param [min]
     * @param [max]
     */
    array.curve = function (factor, min, max) {
        return array;
    };

    // TODO: there might be a memory leak / some inefficiency
    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:array#fit
     * @param len {number} Integer
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.fit = function (len, interp) {
        return array.set(dtm.transform.fit(params.value, len, interp));
    };

    array.f = array.fit;

    /**
     * Multiplies the length of the array by the given factor.
     * @function module:array#stretch
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.stretch = function (factor, interp) {
        return array.set(dtm.transform.stretch(params.value, factor, interp));
    };

    array.str = array.stretch;

    array.summarize = function () {
        return array;
    };

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:array#fitsum
     * @param tgt {number} If the round argument is true, the target value is also rounded.
     * @param [round=false] {boolean}
     * @returns {dtm.array}
     */
    array.fitsum = function (tgt, round, min) {
        return array.set(dtm.transform.fitSum(params.value, tgt, round));
    };

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.add = function (factor, interp) {
        if (isDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.add(params.value, factor, interp));
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.mult = function (factor, interp) {
        if (isDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.mult(params.value, factor, interp));
    };

    array.dot = array.mult;

    /**
     * @function module:array#pow
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.pow = function (factor, interp) {
        if (isDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.pow(params.value, factor, interp));
    };

    /**
     * Applys the array contents as the power to the argument as the base
     * @function module:array#powof
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.powof = function (factor, interp) {
        if (isDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.powof(params.value, factor, interp));
    };


    /* LIST OPERATIONS*/

    // TODO: support for the optional 'this' argument (see the JS Array documentation)
    /**
     * Performs JS Array.map function to the array values.
     * @function module:array#map
     * @param callback
     * @returns {dtm.array}
     */
    array.map = function (callback) {
        return array.set(params.value.map(callback));
    };

    array.foreach = function (callback) {
        params.value.forEach(callback);
        return array;
    };

    array.forEach = array.foreach;

    array.filter = function (callback) {
        return array.set(params.value.filter(callback));
    };

    array.reduce = function (callback) {
        return array.set(params.value.reduce(callback));
    };

    // TODO: these should be in the get method
    array.some = function (callback) {
        return params.value.some(callback);
    };

    array.every = function (callback) {
        return params.value.every(callback);
    };

    array.subarray = function () {
        return array;
    };

    // TODO: regexp-like processing???
    array.match = function () {
        return array;
    };

    array.replace = function (tgt, val) {
        // TODO: type and length check
        // TODO: if val is an array-ish, fill the tgt w/ the array elements
        if (isSingleVal(val)) {
            if (isSingleVal(tgt)) {
                return array.set(params.value.map(function (v) {
                    if (v === tgt) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isArray(tgt)) {
                return array.set(params.value.map(function (v) {
                    if (tgt.some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isDtmArray(tgt)) {
                return array.set(params.value.map(function (v) {
                    if (tgt.get().some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isFunction(tgt)) {
                return array.set(params.value.map(function (v) {
                    if (tgt(v)) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            }
        } else {
            return array;
        }
    };

    // TODO: impelemnt
    array.replaceat = function (idx, val) {
        return array;
    };

    // TODO: support typed array
    array.select = function () {
        var indices, res = [];
        if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (isNumOrFloat32Array(arguments[0])) {
            indices = arguments[0];
        } else if (isDtmArray(arguments[0]) && isNumOrFloat32Array(arguments[0].get())) {
            indices = arguments[0].get();
        }

        if (!isNumOrFloat32Array(indices)) {
            return array;
        } else {
            indices.forEach(function (i) {
                res.push(params.value[dtm.value.mod(i, params.len)]);
            });
            return array.set(res);
        }
    };

    array.sel = array.select;

    /**
     * Sorts the contents of numerical array.
     * @function module:array#sort
     * @returns {dtm.array}
     */
    array.sort = function () {
        return array.set(dtm.transform.sort(params.value));
    };

    // TODO: nested array and concat?
    /**
     * Concatenates new values to the contents.
     * @function module:array#concat | append
     * @param arr {array | dtm.array} A regular array or a dtm.array object.
     * @returns {dtm.array}
     */
    array.concat = function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            params.value = concat(params.value, arr.get());
        } else {
            params.value = concat(params.value, arr);
        }
        return array.set(params.value);
    };

    array.append = array.concat;

    /**
     * Repeats the contents of the current array.
     * @function module:array#repeat | rep
     * @param count {number} Integer
     * @returns {dtm.array}
     */
    array.repeat = function (count) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        return array.set(dtm.transform.repeat(params.value, count));
    };

    array.rep = array.repeat;

    array.fitrep = function (count, interp) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        return array.set(dtm.transform.fit(dtm.transform.repeat(params.value, count), params.len, interp));
    };

    array.frep = array.fitrep;

    /**
     * @function module:array#pad
     * @param val
     * @param length
     * @returns {{type: string}}
     */
    array.pad = function (val, length) {
        var test = [];
        for (var i = 0; i < length; i++) {
            test.push(val);
        }

        return array.concat(test);
    };

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @function module:array#truncate | slice
     * @param arg1 {number} Start bits to truncate. If the arg2 is not present, it will be the End bits to truncate.
     * @param [arg2] {number} End bits to truncate.
     * @returns {dtm.array}
     */
    array.truncate = function (arg1, arg2) {
        return array.set(dtm.transform.truncate(params.value, arg1, arg2));
    };

    array.slice = array.truncate;

    // TODO: accept option as arg? for numBlocks, pad, overlap ratio, etc.
    array.block = function (len, hop, window, pad) {
        if (!isInteger(len) || len < 1) {
            len = 1;
        } else if (len > params.len) {
            len = params.len;
        }
        if (!isInteger(hop) || hop < 1) {
            hop = len;
        }
        if (isEmpty(window)) {
            window = 'rectangular';
        }

        var newArr = [];
        var numBlocks = Math.floor((params.len - len) / hop) + 1;

        for (var i = 0; i < numBlocks; i++) {
            newArr[i] = dtm.array(params.value.slice(i*hop, i*hop+len)).window(window).parent(array);
        }

        return array.set(newArr);
    };

    array.ola = function (hop) {
        if (!isInteger(hop) || hop < 1) {
            hop = 1;
        }

        if (isNestedWithDtmArray(params.value)) {
            var len = hop * (params.len-1) + params.value[0].get('len');
            var newArr = new Array(len);
            newArr.fill(0);

            params.value.forEach(function (a, i) {
                a.foreach(function (v, j) {
                    newArr[i*hop+j] += v;
                });
            });

            return array.set(newArr);
        } else {
            return array;
        }
    };

    /**
     * Applies a window function to the array. May be combined with array.block() operation.
     * @function module:array#window
     * @param type
     * @returns {dtm.array}
     */
    array.window = function (type) {
        return array.set(dtm.transform.window(params.value, type));
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {number} Integer
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        return array.set(dtm.transform.shift(params.value, amount));
    };

    /**
     * Appends an reversed array at the tail.
     * @function module:array#mirror
     * @returns {{type: string}}
     */
    array.mirror = function () {
        return array.concat(dtm.transform.reverse(params.value));
    };

    array.mir = array.mirror;

    /**
     * Flips the array contents horizontally.
     * @function module:array#reverse | rev
     * @returns {dtm.array}
     */
    array.reverse = function () {
        return array.set(dtm.transform.reverse(params.value));
    };

    array.rev = array.reverse;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert | inv | flip
     * @param [center=meanVal] {number}
     * @returns {dtm.array}
     */
    array.invert = function (center) {
        return array.set(dtm.transform.invert(params.value, center));
    };

    /**
     * Same as array.invert().
     * @function module:array#inv
     * @type {Function}
     */
    array.inv =  array.invert;

    /**
     * Randomizes the order of the array.
     * @function module:array#shuffle | random | randomize | rand
     * @returns {dtm.array}
     */
    array.shuffle = function () {
        return array.set(dtm.transform.shuffle(params.value));
    };

    array.randomize = array.shuffle;

    array.blockShuffle = function (blockSize) {
        return array;
    };

    array.reorder = function () {
        var indices;

        if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (argIsSingleArray(arguments)) {
            indices = arguments[0];
        }

        if (isNumOrFloat32Array(indices)) {
            var newArr = new Array(indices.length);
            indices.forEach(function (v, i) {
                newArr[i] = array.get(v);
            });
        }
        return array.set(newArr);
    };

    array.order = array.reorder;

    /**
     * Adds new value(s) at the end of the array, and removes the oldest value(s) at the beginning of the array. The size of the array is unchanged.
     * @function module:array#queue | fifo
     * @param input {number|array}
     * @returns {dtm.array}
     */
    array.queue = function (input) {
        if (isNumber(input)) {
            params.value.push(input);
            params.value.shift();
        } else if (isFloat32Array(input)) {
            params.value = Float32Concat(params.value, input);
            params.value = params.value.splice(input.length);
        } else if (isArray(input)) {
            if (isFloat32Array(params.value)) {
                params.value = Float32Concat(params.value, input);
                params.value = Float32Splice(params.value, input.length);
            } else {
                params.value = params.value.concat(input);
                params.value = params.value.splice(input.length);
            }
        } else if (isDtmArray(input)) {
            params.value = params.value.concat(input.get());
            params.value = params.value.splice(input.get('len'));
        }
        return array.set(params.value);
    };

    array.fifo = array.queue;

    /* ARITHMETIC */

    /**
     * Rounds float values of the array to integer values.
     * @function module:array#round
     * @param to {number}
     * @returns {dtm.array}
     */
    array.round = function (to) {
        return array.set(dtm.transform.round(params.value, to));
    };

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:array#floor
     * @returns {dtm.array}
     */
    array.floor = function () {
        return array.set(dtm.transform.floor(params.value));
    };

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:array#ceil
     * @returns {dtm.array}
     */
    array.ceil = function () {
        return array.set(dtm.transform.ceil(params.value));
    };

    /**
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:array#hwr
     * @returns {dtm.array}
     */
    array.hwr = function () {
        return array.set(dtm.transform.hwr(params.value));
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr | abs
     * @returns {dtm.array}
     */
    array.fwr = function () {
        return array.set(dtm.transform.fwr(params.value));
    };

    array.abs = array.fwr;

    //array.derivative = function (order) {
    //    return array;
    //};

    /**
     * @function module:array#diff
     * @returns {dtm.array}
     */
    array.diff = function (order, pad) {
        if (!isInteger(order) || order < 1) {
            order = 1;
        }
        for (var i = 0; i < order; i++) {
            params.value = dtm.transform.diff(params.value);
        }

        if (isSingleVal(pad)) {
            for (var i = 0; i < order; i++) {
                params.value = concat(params.value, pad);
            }
        }
        return array.set(params.value);
    };

    /**
     * Removes zeros from the sequence.
     * @function module:array#removezeros
     * @returns {dtm.array}
     */
    array.removezeros = function () {
        return array.set(dtm.transform.removeZeros(params.value));
    };

    /* NOMINAL */

    /**
     * Generates a histogram from a nominal array, such as the string type.
     * @function module:array#histogram
     * @returns {dtm.array}
     */
    array.histogram = function () {
        // CHECK: this is hacky
        params.type = 'string'; // re-set the type to string from number
        return array.set(toFloat32Array(dtm.analyzer.histo(params.value)));
    };
    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:array#uniq | unique
     * @returns {dtm.array}
     */
    array.unique = function () {
        return array.set(dtm.transform.unique(params.value));
    };

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:array#classify
     * @param by
     * @returns {dtm.array}
     */
    array.classify = function (by) {
        return array.set(dtm.transform.classId(params.value));
    };

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:array#stringify | tostring
     * @returns {dtm.array}
     */
    array.stringify = function () {
        return array.set(dtm.transform.stringify(params.value));
    };

    /**
     * Converts string or boolean values to numerical values.
     * @function module:array#tonumber | toNumber
     * @returns {dtm.array}
     */
    array.tonumber = function () {
        return array.set(toFloat32Array(dtm.transform.tonumber(params.value)));
    };

    array.toFloat32 = function () {
        if (isNumArray(params.value)) {
            array.set(toFloat32Array(params.value));
        }
        return array;
    };

    // CHECK: occurrence or value??
    array.morethan = function () {
        return array;
    };

    array.lessthan = function () {
        return array;
    };

    /* STRING OPERATIONS */

    /**
     * Separates the array items into new array using the separator
     * @param [separator=''] {string}
     * @returns dtm.array
     */
    array.split = function (separator) {
        return array.set(dtm.transform.split(params.value, separator));
    };

    /* MUSICAL */

    /**
     * Pitch quantize the array values. Shorthand: array.pq
     * @function module:array#pitchquantize
     * @param scale {array|dtm.array} A numerical or string (solfa -- e.g., 'do' or 'd' instead of 0) denoting the musical scale degrees.
     * @returns {dtm.array}
     */
    array.pitchquantize = function (scale) {
        if (isEmpty(scale)) {
            scale = dtm.gen('range', 12).get();
        } else if (isDtmArray(scale) && isNumOrFloat32Array(scale.get())) {
            scale = scale.get();
        } else if (isNumOrFloat32Array(scale)) {

        }

        return array.set(dtm.transform.pq(params.value, scale));
    };

    array.mtof = function () {
        return array.set(dtm.transform.mtof(params.value));
    };

    array.ftom = function () {
        return array.set(dtm.transform.ftom(params.value));
    };

    //array.transpose = function (val) {
    //    return array;
    //};



    /* UNIT CONVERTERS */

    /**
     * Converts note values into a beat sequence.
     * @function module:array#notesToBeats | ntob
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.notesToBeats = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.notesToBeats(params.value, resolution));
    };

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.beatsToNotes(params.value, resolution));
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats | itob
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        return array.set(dtm.transform.intervalsToBeats(params.value));
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals | btoi
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        return array.set(dtm.transform.beatsToIntervals(params.value));
    };
    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToIndices | btoid
     * @returns {dtm.array}
     */
    array.beatsToIndices = function () {
        return array.set(dtm.transform.beatsToIndices(params.value));
    };

    /**
     * function module:array#indicesToBeats | idtob
     * @param [len]
     * @returns {dtm.array}
     */
    array.indicesToBeats = function (len) {
        return array.set(dtm.transform.indicesToBeats(params.value, len));
    };


    /* aliases */

    array.histo = array.histogram;
    array.uniq = array.unique;
    array.class = array.classify;
    array.tostring = array.stringify;
    array.tonum = array.tonumber;
    array.mt = array.morethan;
    array.lt = array.lessthan;
    array.pq = array.pitchquantize;
    array.ntob = array.notesToBeats;
    array.bton = array.beatsToNotes;
    array.itob = array.intervalsToBeats;
    array.btoi = array.beatsToIntervals;
    array.btoid = array.beatsToIndices;
    array.idtob = array.indicesToBeats;



    /* dtm.generator placeholders */
    // these are not really necessary, but prevents typeError when calling dtm.gen functions on pure dtm.array object
    array.type = function () { return array; };
    array.len = function () { return array; };


    // set the array content here
    array.set.apply(this, arguments);

    return array;
};

dtm.a = dtm.array;