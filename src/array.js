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
    var params = {
        name: '',
        type: null, // number, string, boolean, coll, mixed, date
        len: null,
        autolen: false,

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

    var array = function () {
        return array.clone();
    }; // this makes .name() not overridable

    array.meta = {
        type: 'dtm.array',
        getParams: function () {
            return params;
        },
        addParams: function (paramsExt) {
            objForEach(paramsExt, function (val, key) {
                params[key] = val;
            });
        },
        setOriginal: function (arr) {
            params.original = arr;
        }
    };

    array.val = [];
    array.len = 0;

    function init () {

    }

    // TODO: list different query params in detail in the documentation
    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name|key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
     * @returns {number|array|string}
     */
    array.get = function (param) {
        if (isNumber(param)) {
            // TODO: support multiple single val arguments?
            return array.val[mod(param, array.len)];
        } else if (isNumArray(param) || (isDtmArray(param) && isNumArray(param.get()))) {
            var indices = isDtmArray(param) ? param.get() : param;
            var res = []; // TODO: support typed array?

            // TODO: only accept integers

            indices.forEach(function (i) {
                res.push(array.val[mod(i, array.len)]);
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
                case 'label':
                    return params.name;

                case 'names':
                case 'keys':
                case 'labels':
                    if (isNestedWithDtmArray(array.val)) {
                        return array.val.map(function (a) {
                            return a.get('name');
                        });
                    } else {
                        return params.name;
                    }

                case 'type':
                    if (isNumArray(array.val)) {
                        return 'number';
                    } else if (isFloat32Array(array.val)) {
                        return 'Float32Array'
                    } else if (isStringArray(array.val)) {
                        return 'string';
                    } else if (isNestedWithDtmArray(array.val)) {
                        return 'nested';
                    } else {
                        return 'mixed';
                    }

                case 'parent':
                    return params.parent;

                case 'len':
                case 'length':
                    return array.len;

                case 'size':
                    if (isNestedDtmArray(array)) {
                        return { row: array.val[0].get('len'), col: array.len };
                    } else {
                        return array.len;
                    }

                case 'autolen':
                    return params.autolen;

                case 'hash':
                    return params.hash;

                case 'processed':
                    return params.processed;

                case 'nested':
                    return array.val.map(function (v) {
                        if (isDtmArray(v)) {
                            return v.get();
                        } else {
                            return v;
                        }
                    });

                case 'row':
                    if (isInteger(arguments[1]) && isNestedWithDtmArray(array.val)) {
                        var idx = arguments[1];
                        var res = [];
                        array.val.forEach(function (a) {
                            res.push(a.get(idx));
                        });
                        if (isNumArray(res)) {
                            res = toFloat32Array(res);
                        }
                        return res;
                    } else {
                        break;
                    }

                /* STATS */
                case 'minimum':
                case 'min':
                    return getMin(array.val);

                case 'maximum':
                case 'max':
                    return getMax(array.val);

                case 'extent':
                case 'minmax':
                case 'range':
                    return [getMin(array.val), getMax(array.val)];

                case 'mean':
                case 'average':
                case 'avg':
                    return mean(array.val);

                case 'mode':
                    return mode(array.val);
                case 'median':
                    return median(array.val);
                case 'midrange':
                    return midrange(array.val);

                case 'standardDeviation':
                case 'std':
                    return std(array.val);
                case 'pstd':
                    return pstd(array.val);

                case 'variance':
                case 'var':
                    return variance(array.val);
                case 'populationVariance':
                case 'pvar':
                    return pvar(array.val);

                case 'sumAll':
                case 'sum':
                    return sum(array.val);

                case 'rms':
                    return rms(array.val);

                case 'pdf':
                    break;


                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return array.val[params.index];

                case 'next':
                    // TODO: increment after return
                    if (isEmpty(arguments[1])) {
                        params.index = mod(params.index + params.step, array.len);
                        return array.val[params.index];
                    } else if (isNumber(arguments[1]) && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        params.index = mod(params.index + params.step, array.len);
                        blockArray = dtm.transform.getBlock(array.val, params.index, arguments[1]);
                        return dtm.array(blockArray);
                    } else {
                        return array;
                    }

                case 'prev':
                case 'previous':
                    params.index = mod(params.index - params.step, array.len);
                    return array.val[params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    params.index = randi(0, array.len);
                    return array.val[params.index];

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
                        blockArray = dtm.transform.getBlock(array.val, start, size);
                        return dtm.array(blockArray);
                    } else if (isNumber(arguments[1]) && isNumber(arguments[2])) {
                        start = arguments[1];
                        size = arguments[2];
                        blockArray = dtm.transform.getBlock(array.val, start, size);
                        return dtm.array(blockArray);
                    } else {
                        // CHECK: ???
                        return array.val;
                    }

                case 'blockNext':
                    // TODO: incr w/ the step size AFTER RETURN
                    params.index = mod(params.index + params.step, array.len);
                    blockArray = dtm.transform.getBlock(array.val, params.index, arguments[1]);
                    return dtm.array(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    if (isEmpty(params.normalized)) {
                        params.normalized = dtm.transform.normalize(array.val);
                    }
                    if (isInteger(arguments[1])) {
                        return params.normalized[mod(arguments[1], array.len)];
                    } else {
                        return params.normalized;
                    }

                case 'sorted':
                case 'sort':
                    return dtm.transform.sort(array.val);

                case 'uniques':
                case 'unique':
                case 'uniq':
                    return dtm.transform.unique(array.val);

                case 'classes':
                    return listClasses(array.val);

                case 'classID':
                case 'classId':
                    return dtm.transform.classId(array.val);

                case 'string':
                case 'stringify':
                    return dtm.transform.stringify(array.val);

                case 'numClasses':
                case 'numUniques':
                case 'numUniqs':
                    return listClasses(array.val).length;

                case 'unif':
                case 'uniformity':
                    return uniformity(array.val);

                case 'histogram':
                case 'histo':
                    return histo(array.val);

                // TODO: implement
                case 'distribution':
                case 'dist':
                    return [];

                default:
                    if (params.hasOwnProperty(param)) {
                        return params[param];
                    } else {
                        return array.val;
                    }
            }
        } else {
            return array.val;
        }
    };

    /**
     * Returns an inner array specified by the index or the name. Note that this will always clone the array, so the further edit on the returned array will not affect the original array.
     * @function module:array:col
     * @param which
     * @returns {*}
     */
    array.col = function (which) {
        if (isNestedDtmArray(array)) {
            if (isString(which)) {
                var res;
                array.val.forEach(function (a) {
                    if (a.get('name') === which) {
                        res = a;
                    }
                });
                if (isEmpty(res)) {
                    res = array;
                }
                return res.clone();
            } else {
                return array.get(which).clone();
            }
        } else {
            return array.set(array.get(which)).label(array.get('name'));
        }
    };

    array.column = array.col;

    /**
     * Returns a row of a nested array by the index.
     * @param num
     * @returns {dtm.array}
     */
    array.row = function (num) {
        return array.set(array.get('row', num));
    };

    // TODO: conflicts with gen.transpose()
    array.transp = function () {
        if (isNestedDtmArray(array)) {
            var newArray = [];
            var i = 0;
            while (array.val.some(function (a) {
                return i < a.get('len');
            })) {
                // TODO: get('row', i)
                newArray.push(array.get('row', i));
                i++;
            }
            return array.set(newArray);
        } else {
            return array.block(1);
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
                array.val = new Float32Array(args);
            } else {
                array.val = args;
            }
        } else {
            // if set arguments include any array-like object
            if (arguments.length === 1) {
                if (isNumber(arguments[0])) {
                    array.val = toFloat32Array(arguments[0]);
                } else if (isNumArray(arguments[0])) {
                    array.val = toFloat32Array(arguments[0]);
                } else if (isNestedArray(arguments[0])) {
                    array.val = new Array(arguments[0].length);
                    arguments[0].forEach(function (v, i) {
                        array.val[i] = dtm.array(v).parent(array);
                    });
                } else if (isNestedWithDtmArray(arguments[0])) {
                    array.val = arguments[0];
                    array.val.forEach(function (v) {
                        if (isDtmArray(v)) {
                            v.parent(array);
                        }
                    });
                } else if (isDtmArray(arguments[0])) {
                    array.val = arguments[0].get();
                    // set parent in the child
                } else if (isNestedDtmArray(arguments[0])) {
                    array.val = arguments[0].get();
                    array.val.forEach(function (v) {
                        v.parent(array);
                    });
                } else if (isString(arguments[0])) {
                    array.val = [arguments[0]]; // no splitting
                    checkType(array.val);
                } else {
                    array.val = arguments[0];
                }
            } else {
                array.val = new Array(arguments.length);

                argsForEach(arguments, function (v, i) {
                    if (isDtmArray(v)) {
                        array.val[i] = v;
                    } else {
                        array.val[i] = dtm.array(v);
                    }
                    array.val[i].parent(array);
                });
            }
        }

        if (isEmpty(params.original)) {
            params.original = array.val;

            // CHECK: type checking - may be redundant
            //checkType(array.val);
        } else {
            params.processed++;
        }

        array.len = array.val.length;
        params.index = array.len - 1;

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#name
     * @param name {string}
     * @returns {dtm.array}
     */
    array.label = function (name) {
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
        //var summed = sum(arr);
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
            params.index = mod(Math.round(val), array.len);
        }
        return array;
    };


    /* GENERATORS */
    /**
     * Returns a copy of the array object. It can be used when you don't want to reference the same array object from different places. For convenience, you can also do arrObj() instead of arrObj.clone() to quickly return a copy.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        var newValue = [];
        if (isNestedWithDtmArray(array.val)) {
            newValue = array.val.map(function (a) {
                return a.clone();
            });
        } else {
            newValue = array.val;
        }
        var newArr = dtm.array(newValue).label(params.name);
        newArr.meta.setOriginal(params.original);

        // CHECK: this may cause troubles!
        newArr.index(params.index);
        newArr.step(params.step);

        if (params.type === 'string') {
            newArr.classes = params.classes;
            //newArr.setType('string');
        }
        return newArr;
    };

    array.parent = function (obj) {
        if (isDtmArray(obj)) {
            params.parent = obj;
        }
        return array;
    };

    // TODO: array.block (and window) should transform the parent array into nested child array

    array.nest = function () {
        if (!isDtmArray(array.val)) {
            array.set([dtm.array(array.val)]);
            array.val[0].parent(array);
        }
        return array;
    };

    array.unnest = function () {
        if (isNestedDtmArray(array)) {
            var flattened = [];
            array.val.forEach(function (v) {
                if (isDtmArray(v)) {
                    flattened = concat(flattened, v.get());
                }
            });

            if (isNumArray(flattened)) {
                flattened = toFloat32Array(flattened);
            }
            return array.set(flattened);
        } else {
            return array;
        }
    };

    array.flatten = array.ub = array.unblock = array.unnest;

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

        if (isNumArray(array.val) && isNumArray(tgtArr)) {
            array.set(dtm.transform.morph(array.val, tgtArr, morphIdx, interp));
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

    array.residue = function () {
        return array.set(dtm.transform.subtract(params.original, array.val));
    };

    array.res = array.residue;

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
            return array.map(function (a) {
                return a.normalize(arg1, arg2);
            });
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
                    min = getMin(args);
                    max = getMax(args);
                }
            }
        }

        return array.set(dtm.transform.normalize(array.val, min, max));
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
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.scale(arg1, arg2, arg3, arg4);
            });
        }

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
                min = getMin(arg1);
                max = getMax(arg1);
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

        return array.set(dtm.transform.rescale(array.val, min, max, dmin, dmax));
    };

    array.r = array.range = array.sc = array.scale;

    /**
     * Caps the array value range at the min and max values. Only works with a numerical array.
     * @function module:array#limit | clip
     * @param [min=0]
     * @param [max=1]
     * @returns {dtm.array}
     */
    array.limit = function (min, max) {
        if (isNumOrFloat32Array(array.val)) {
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

    array.expc = array.expcurve;

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:array#logc | logcurve
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

    array.logc = array.logcurve;

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
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.fit(len, interp);
            });
        }

        return array.set(dtm.transform.fit(array.val, len, interp));
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
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.stretch(factor, interp);
            })
        }

        return array.set(dtm.transform.stretch(array.val, factor, interp));
    };

    array.str = array.stretch;

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param factor {number|array|dtm.array}
     * @param [interp='step'] {string}
     * @returns {dtm.array}
     * @example
     * <div> hey </div>
     */
    array.add = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return array.set(dtm.transform.add(array.val, factor, interp));
        }
    };

    array.subtract = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return array.set(dtm.transform.subtract(array.val, factor, interp));
        }
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param factor {number|array|dtm.array}
     * @param [interp='step'] {string}
     * @returns {dtm.array}
     */
    array.mult = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.mult(factor.get('next'));
                } else {
                    return a.mult(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.mult(factor.get('next'));
                });
            }

            return array.set(dtm.transform.mult(array.val, factor, interp));
        }
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
        return array.set(dtm.transform.pow(array.val, factor, interp));
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
        return array.set(dtm.transform.powof(array.val, factor, interp));
    };

    /* CONVERSION WITH STATS */
    array.min = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('min');
            });
        } else {
            return array.set(array.get('min'));
        }
    };

    array.max = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('max');
            });
        } else {
            return array.set(array.get('max'));
        }
    };

    array.extent = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.set(a.get('extent'));
            });
        } else {
            return array.set(array.get('extent'));
        }
    };

    array.mean = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('mean');
            });
        } else {
            return array.set(array.get('mean'));
        }
    };

    array.avg = array.mean;

    array.mode = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('mode');
            });
        } else {
            return array.set(array.get('mode'));
        }
    };

    array.median = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('median');
            });
        } else {
            return array.set(array.get('median'));
        }
    };

    array.midrange = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('midrange');
            });
        } else {
            return array.set(array.get('midrange'));
        }
    };

    array.mid = array.midrange;

    array.std = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('std');
            });
        } else {
            return array.set(array.get('std'));
        }
    };

    array.pstd = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('pstd');
            });
        } else {
            return array.set(array.get('pstd'));
        }
    };

    array.var = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('var');
            });
        } else {
            return array.set(array.get('var'));
        }
    };

    array.pvar = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('pvar');
            });
        } else {
            return array.set(array.get('pvar'));
        }
    };

    array.rms = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.get('rms');
            });
        } else {
            return array.set(array.get('rms'));
        }
    };


    // TODO: not consistent with other stats-based conversions
    array.sum = function () {
        if (isNestedWithDtmArray(array.val)) {
            var maxLen = 0;
            array.val.forEach(function (a) {
                if (a.get('len') > maxLen) {
                    maxLen = a.get('len');
                }
            });

            var res = new Float32Array(maxLen);

            for (var i = 0; i < maxLen; i++) {
                array.val.forEach(function (a) {
                    if (i < a.get('len') && isNumber(a.get(i))) {
                        res[i] += a.get(i);
                    }
                });
            }

            return array.set(res);
        } else {
            var sum = array.val.reduce(function (a, b) {
                return a + b;
            });
            return array.set(sum);
        }
    };

    array.sumrow = function () {
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
        return array.set(dtm.transform.fitSum(array.val, tgt, round));
    };

    array.prod = function () {

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
        //return array.set(array.val.map(callback));
        return array.set(fromFloat32Array(array.val).map(callback));
    };

    array.foreach = function (callback) {
        array.val.forEach(callback);
        return array;
    };

    array.forEach = array.foreach;

    array.filter = function (callback) {
        return array.set(array.val.filter(callback));
    };

    array.reduce = function (callback) {
        return array.set(array.val.reduce(callback));
    };

    // TODO: these should be in the get method
    array.some = function (callback) {
        return array.val.some(callback);
    };

    array.every = function (callback) {
        return array.val.every(callback);
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
                return array.set(array.val.map(function (v) {
                    if (v === tgt) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isArray(tgt)) {
                return array.set(array.val.map(function (v) {
                    if (tgt.some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isDtmArray(tgt)) {
                return array.set(array.val.map(function (v) {
                    if (tgt.get().some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isFunction(tgt)) {
                return array.set(array.val.map(function (v) {
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
                res.push(array.val[mod(i, array.len)]);
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
        return array.set(dtm.transform.sort(array.val));
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
            array.val = concat(array.val, arr.get());
        } else {
            array.val = concat(array.val, arr);
        }
        return array.set(array.val);
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

        return array.set(dtm.transform.repeat(array.val, count));
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

        return array.set(dtm.transform.fit(dtm.transform.repeat(array.val, count), array.len, interp));
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
        return array.set(dtm.transform.truncate(array.val, arg1, arg2));
    };

    array.slice = array.truncate;

    // TODO: accept option as arg? for numBlocks, pad, overlap ratio, etc.
    array.block = function (len, hop, window, pad) {
        if (!isInteger(len) || len < 1) {
            len = 1;
        } else if (len > array.len) {
            len = array.len;
        }
        if (!isInteger(hop) || hop < 1) {
            hop = len;
        }
        if (isEmpty(window)) {
            window = 'rectangular';
        }

        var newArr = [];
        var numBlocks = Math.floor((array.len - len) / hop) + 1;

        for (var i = 0; i < numBlocks; i++) {
            newArr[i] = dtm.array(array.val.slice(i*hop, i*hop+len)).window(window).parent(array);
        }

        return array.set(newArr);
    };

    array.nest = array.b = array.block;

    array.ola = function (hop) {
        if (!isInteger(hop) || hop < 1) {
            hop = 1;
        }

        if (isNestedWithDtmArray(array.val)) {
            var len = hop * (array.len-1) + array.val[0].get('len');
            var newArr = new Array(len);
            newArr.fill(0);
            array.val.forEach(function (a, i) {
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
        return array.set(dtm.transform.window(array.val, type));
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {number} Integer
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        return array.set(dtm.transform.shift(array.val, amount));
    };

    /**
     * Appends an reversed array at the tail.
     * @function module:array#mirror
     * @returns {{type: string}}
     */
    array.mirror = function () {
        return array.concat(dtm.transform.reverse(array.val));
    };

    array.mir = array.mirror;

    /**
     * Flips the array contents horizontally.
     * @function module:array#reverse | rev
     * @returns {dtm.array}
     */
    array.reverse = function () {
        return array.set(dtm.transform.reverse(array.val));
    };

    array.rev = array.reverse;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert | inv | flip
     * @param [center=meanVal] {number}
     * @returns {dtm.array}
     */
    array.invert = function (center) {
        return array.set(dtm.transform.invert(array.val, center));
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
        return array.set(dtm.transform.shuffle(array.val));
    };

    array.randomize = array.shuffle;

    array.blockShuffle = function (blockSize) {
        return array;
    };

    array.reorder = function () {
        var indices;

        if (isDtmArray(arguments[0])) {
            indices = toFloat32Array(arguments[0]);
        } else if (argsAreSingleVals(arguments)) {
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
            array.val.push(input);
            array.val.shift();
        } else if (isFloat32Array(input)) {
            array.val = Float32Concat(array.val, input);
            array.val = array.val.splice(input.length);
        } else if (isArray(input)) {
            if (isFloat32Array(array.val)) {
                array.val = Float32Concat(array.val, input);
                array.val = Float32Splice(array.val, input.length);
            } else {
                array.val = array.val.concat(input);
                array.val = array.val.splice(input.length);
            }
        } else if (isDtmArray(input)) {
            array.val = array.val.concat(input.get());
            array.val = array.val.splice(input.get('len'));
        }
        return array.set(array.val);
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
        return array.set(dtm.transform.round(array.val, to));
    };

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:array#floor
     * @returns {dtm.array}
     */
    array.floor = function () {
        return array.set(dtm.transform.floor(array.val));
    };

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:array#ceil
     * @returns {dtm.array}
     */
    array.ceil = function () {
        return array.set(dtm.transform.ceil(array.val));
    };

    /**
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:array#hwr
     * @returns {dtm.array}
     */
    array.hwr = function () {
        return array.set(dtm.transform.hwr(array.val));
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr | abs
     * @returns {dtm.array}
     */
    array.fwr = function () {
        return array.set(dtm.transform.fwr(array.val));
    };

    array.abs = array.fwr;

    array.modulo = function (divisor) {
        return array.set(dtm.transform.mod(array.val, divisor));
    };

    array.mod = array.modulo;

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
            array.val = dtm.transform.diff(array.val);
        }

        if (isSingleVal(pad)) {
            for (var i = 0; i < order; i++) {
                array.val = concat(array.val, pad);
            }
        }
        return array.set(array.val);
    };

    /**
     * Removes zeros from the sequence.
     * @function module:array#removezeros
     * @returns {dtm.array}
     */
    array.removezeros = function () {
        return array.set(dtm.transform.removeZeros(array.val));
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
        return array.set(toFloat32Array(histo(array.val)));
    };
    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:array#uniq | unique
     * @returns {dtm.array}
     */
    array.unique = function () {
        return array.set(dtm.transform.unique(array.val));
    };

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:array#classify
     * @param by
     * @returns {dtm.array}
     */
    array.classify = function (by) {
        return array.set(dtm.transform.classId(array.val));
    };

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:array#stringify | tostring
     * @returns {dtm.array}
     */
    array.stringify = function () {
        return array.set(dtm.transform.stringify(array.val));
    };

    /**
     * Converts string or boolean values to numerical values.
     * @function module:array#tonumber | toNumber
     * @returns {dtm.array}
     */
    array.tonumber = function () {
        return array.set(toFloat32Array(dtm.transform.tonumber(array.val)));
    };

    array.toFloat32 = function () {
        if (isNumArray(array.val)) {
            array.set(toFloat32Array(array.val));
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
        return array.set(dtm.transform.split(array.val, separator));
    };

    /* MUSICAL */

    /**
     * Pitch quantize the array values. Shorthand: array.pq
     * @function module:array#pitchquantize
     * @param scale {array|dtm.array} A numerical or string (solfa -- e.g., 'do' or 'd' instead of 0) denoting the musical scale degrees.
     * @returns {dtm.array}
     */
    array.pitchquantize = function (scale) {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.pitchquantize(scale);
            });
        }

        if (isEmpty(scale)) {
            scale = dtm.gen('range', 12).get();
        } else if (isDtmArray(scale) && isNumOrFloat32Array(scale.get())) {
            scale = scale.get();
        } else if (isNumOrFloat32Array(scale)) {

        }

        return array.set(dtm.transform.pitchQuantize(array.val, scale));
    };

    array.mtof = function () {
        return array.set(dtm.transform.mtof(array.val));
    };

    array.ftom = function () {
        return array.set(dtm.transform.ftom(array.val));
    };



    /* UNIT CONVERTERS */

    /**
     * Converts note values into a beat sequence.
     * @function module:array#notesToBeats | ntob
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.notesToBeats = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.notesToBeats(array.val, resolution));
    };

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.beatsToNotes(array.val, resolution));
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats | itob
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        return array.set(dtm.transform.intervalsToBeats(array.val));
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals | btoi
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        return array.set(dtm.transform.beatsToIntervals(array.val));
    };
    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToIndices | btoid
     * @returns {dtm.array}
     */
    array.beatsToIndices = function () {
        return array.set(dtm.transform.beatsToIndices(array.val));
    };

    /**
     * function module:array#indicesToBeats | idtob
     * @param [len]
     * @returns {dtm.array}
     */
    array.indicesToBeats = function (len) {
        return array.set(dtm.transform.indicesToBeats(array.val, len));
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
    array.size = function () { return array; };


    // set the array content here
    array.set.apply(this, arguments);

    return array;
};

dtm.a = dtm.array;