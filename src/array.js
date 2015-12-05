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
        original: [],
        normalized: [],
        classes: null,
        histogram: null,
        numClasses: null,

        index: 0,
        step: 1,

        parent: null,

        hash: '',
        processed: 0
    };

    // public
    var array = {
        type: 'dtm.array'
    };

    array.meta = {
        type: 'dtm.array'
    };

    // TODO: list different query params in detail in the documentation
    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name|key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
     * @returns {number|array|string}
     */
    array.get = function (param) {
        if (typeof(param) === 'number') {
            if (param < 0 || param >= params.length) {
                dtm.log('Index out of range');
                return params.value[dtm.value.mod(param, params.length)];
            } else {
                return params.value[param];
            }
        } else {
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
                    return params.type;
                
                case 'len':
                case 'length':
                    return params.length;

                case 'hash':
                    return params.hash;

                case 'processed':
                    return params.processed;


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
                    if (arguments[1] === undefined) {
                        params.index = dtm.value.mod(params.index + params.step, params.length);
                        return params.value[params.index];
                    } else if (typeof(arguments[1]) === 'number' && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        params.index = dtm.value.mod(params.index + params.step, params.length);
                        blockArray = dtm.transform.getBlock(params.value, params.index, arguments[1]);
                        return dtm.array(blockArray);
                    } else {
                        return array;
                    }

                case 'prev':
                case 'previous':
                    params.index = dtm.value.mod(params.index - params.step, params.length);
                    return params.value[params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    params.index = _.random(0, params.length - 1);
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
                    if (arguments[1].constructor === Array) {
                        start = arguments[1][0];
                        size = arguments[1][1];
                        blockArray = dtm.transform.getBlock(params.value, start, size);
                        return dtm.array(blockArray);
                    } else if (typeof(arguments[1]) === 'number' && typeof(arguments[2]) === 'number') {
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
                    params.index = dtm.value.mod(params.index + params.step, params.length);
                    blockArray = dtm.transform.getBlock(params.value, params.index, arguments[1]);
                    return dtm.array(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    return dtm.transform.normalize(params.value);

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
                    return params.value;
            }
        }
    };

    /**
     * Sets or overwrites the contents of the array object.
     * @function module:array#set
     * @returns {dtm.array}
     */
    array.set = function () {
        if (arguments.length === 1) {
            if (arguments[0] === undefined) {
                params.value = [];
            } else if (typeof(arguments[0]) === 'number') {
                params.value = [arguments[0]];
            } else if (arguments[0].constructor === Array) {
                params.value = arguments[0];
            } else if (arguments[0].constructor === Float32Array) {
                params.value = arguments[0];
            } else if (arguments[0].type === 'dtm.array') {
                params.value = arguments[0].get();
            } else if (typeof(arguments[0]) === 'string') {
                params.value = [arguments[0]]; // no splitting
                checkType(params.value);
            }

            if (params.original.length === 0) {
                params.original = params.value;

                // CHECK: type checking - may be redundant
                checkType(params.value);
            } else {
                params.processed++;
            }

            generateHash(params.value);

            params.length = params.value.length;
            params.index = params.length - 1;
        } else if (arguments.length > 1) {
            params.value = [];
            for (var i = 0; i < arguments.length; i++) {
                // assuming each item is not an array / other array-ish types
                params.value[i] = arguments[i];
            }
            //if (typeof(arguments[0]) === 'string') {
            //    params.value = dtm.gen.apply(this, arguments).get();
            //    checkType(params.value);
            //} else {
            //
            //}
        }

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#name
     * @param name {string}
     * @returns {dtm.array}
     */
    array.name = function (name) {
        if (!name) {
            name = '';
        }
        params.name = name.toString();
        return array;
    };

    /**
     * Sets the value type of the array content. Should be either 'number' or 'string'?
     * @funciton mudule:array#setType
     * @param arg
     * @returns {dtm.array}
     */
    array.setType = function (arg) {
        params.type = arg.toString();
        return array;
    };

    array.set.apply(this, arguments);

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
        if (isNaN(arr[0])) {
            if (typeof(arr[0]) === 'object') {
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
     * @function module:array#step | stepSize
     * @param val {number}
     * @returns {dtm.array}
     */
    array.step = function (val) {
        params.step = Math.round(val);
        return array;
    };

    array.stepSize = array.step;

    /**
     * Sets the current index within the array for the iterator. Value exceeding the max or min value will be wrapped around.
     * @function module:array#index | setIndex
     * @param val {number}
     * @returns {dtm.array}
     */
    array.index = function (val) {
        params.index = dtm.value.mod(Math.round(val), params.length);
        return array;
    };

    array.setIndex = array.index;



    /* GENERATORS */

    /**
     * Fills the contents of the array with
     * @function module:array#fill | gen | generate
     * @param type {string} Choices: line, noise | random, gaussian | gauss | normal, sin | sine, cos | cosine, zeroes, ones
     * @param [len=8] {number}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.fill = function (type, len, min, max) {
        //params.value = dtm.transform.generate(type, len, min, max);
        params.value = dtm.transform.generator.apply(this, arguments);
        array.set(params.value);
        return array;
    };

    array.gen = array.generator = array.fill;

    /**
     * Returns a clone of the array object. It can be used when you don't want to reference the same array object from different places.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        // this doesn't work
        //return dtm.clone(array);

        var newArr = dtm.array(params.value).name(params.name);

        // CHECK: this may cause troubles!
        newArr.index(params.index);
        newArr.step(params.step);

        if (params.type === 'string') {
            newArr.classes = params.classes;
            newArr.histogram = _.clone(params.histogram);
            newArr.setType('string');
        }
        return newArr;
    };
    array.d = array.dup = array.dupe = array.duplicate = array.c = array.copy = array.clone;

    array.parent = function (clone) {
        if (typeof(clone) !== 'boolean') {
            clone = true;
        }
        if (params.parent !== null) {
            if (clone) {
                return array.parent.clone();
            } else {
                return array.parent;
            }
        } else {
            return array;
        }
    };

    /**
     * Morphs the array values with a target array / dtm.array values. The lengths can be mismatched.
     * @function module:array#morph
     * @param tgtArr {array | dtm.array}
     * @param [morphIdx=0.5] {number} between 0-1
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.morph = function (tgtArr, morphIdx, interp) {
        if (typeof(tgtArr) !== 'array') {
            if (tgtArr.type === 'dtm.array') {
                tgtArr = tgtArr.get();
            }
        }

        if (typeof(morphIdx) === 'undefined') {
            morphIdx = 0.5;
        }

        params.value = dtm.transform.morph(params.value, tgtArr, morphIdx, interp);
        array.set(params.value);
        return array;
    };

    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:array#reset | original
     * @returns {dtm.array}
     */
    array.reset = function () {
        array.set(params.original);
        return array;
    };

    array.original = array.r = array.reset;

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
     * @function module:array#normalize | normal | nml
     * @param [min] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [max] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {dtm.array}
     */
    array.normalize = function (min, max) {
        if (min !== undefined) {
            if (min.constructor === Array) {
                max = min[1];
                min = min[0];
            }
        }
        params.value = dtm.transform.normalize(params.value, min, max);
        array.set(params.value);
        return array;
    };

    array.nml = array.normal = array.normalize;

    /**
     * Modifies the range of the array.
     * @function module:array#rescale | scale | range
     * @param min {number} The target minimum value of the scaled range.
     * @param max {number} The target maximum value of the scaled range.
     * @param [dmin] {number} The minimum of the domain (original) value range.
     * @param [dmax] {number} The maximum of the domain value range.
     * @returns {dtm.array}
     */
    array.rescale = function (min, max, dmin, dmax) {
        var min_, max_, dmin_, dmax_;

        // TODO: accept dtm.array

        if (typeof(min) === 'number') {
            min_ = min;
        } else if (typeof(min) === 'object') {
            if (min.constructor === Array) {
                if (min.length >= 2) {
                    if (typeof(min[0]) === 'number') {
                        min_ = min[0];
                    }
                    if (typeof(min[1] === 'number')) {
                        max_ = min[1];
                    }
                }
                if (min.length === 4) {
                    if (typeof(min[2]) === 'number') {
                        dmin_ = min[2];
                    }
                    if (typeof(min[3] === 'number')) {
                        dmax_ = min[3];
                    }
                }
            }
        } else {
            return array;
        }

        if (typeof(max) === 'number') {
            max_ = max;
        } else if (typeof(max) === 'object') {
            if (max.constructor === Array) {
                if (typeof(max[0]) === 'number') {
                    dmin_ = max[0];
                }
                if (typeof(max[1] === 'number')) {
                    dmax_ = max[1];
                }
            }
        }

        if (typeof(dmin) === 'number') {
            dmin_ = dmin;
        } else if (typeof(dmin) === 'object') {
            if (dmin.constructor === Array) {
                if (typeof(dmin[0]) === 'number') {
                    dmin_ = dmin[0];
                }
                if (typeof(dmin[1] === 'number')) {
                    dmax_ = dmin[1];
                }
            }
        }

        if (typeof(dmax) === 'number') {
            dmax_ = dmax;
        }

        params.value = dtm.transform.rescale(params.value, min_, max_, dmin_, dmax_);
        array.set(params.value);
        return array;
    };
    array.range = array.scale = array.rescale;

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
     * @function module:array#exp | expon | expCurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.array}
     */
    array.expCurve = function (factor, min, max) {
        if (typeof(min) === 'undefined') {
            min = array.get('min');
        }
        if (typeof(max) === 'undefined') {
            max = array.get('max');
        }

        var arr = dtm.transform.expCurve(array.get('normalized'), factor);
        array.set(dtm.transform.rescale(arr, min, max));
        return array;
    };

    array.exp = array.expon = array.expCurve;

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:array#log | logCurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.array}
     */
    array.logCurve = function (factor, min, max) {
        if (typeof(min) === 'undefined') {
            min = array.get('min');
        }
        if (typeof(max) === 'undefined') {
            max = array.get('max');
        }

        var arr = dtm.transform.logCurve(array.get('normalized'), factor);
        array.set(dtm.transform.rescale(arr, min, max));
        return array;
    };

    array.log = array.logCurve;

    // TODO: there might be a memory leak / some inefficiency
    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:array#fit | fitLen
     * @param len {number} Integer
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.fit = function (len, interp) {
        params.value = dtm.transform.fit(params.value, len, interp);
        array.set(params.value);
        return array;
    };
    array.fitLen = array.fit;

    /**
     * Multiplies the length of the array by the given factor.
     * @function module:array#stretch | str
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.stretch = function (factor, interp) {
        params.value = dtm.transform.stretch(params.value, factor, interp);
        array.set(params.value);
        return array;
    };

    array.str = array.stretch;

    array.summarize = function () {
        return array;
    };

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:array#fitSum | fitsum
     * @param tgt {number} If the round argument is true, the target value is also rounded.
     * @param [round=false] {boolean}
     * @returns {dtm.array}
     */
    array.fitSum = function (tgt, round) {
        return array.set(dtm.transform.fitSum(params.value, tgt, round));
    };

    array.fitsum = array.fitSum;

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.add = function (factor, interp) {
        if (factor.type === 'dtm.array') {
            factor = factor.get();
        }
        array.set(dtm.transform.add(params.value, factor, interp));
        return array;
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.mult = function (factor, interp) {
        if (factor.type === 'dtm.array') {
            factor = factor.get();
        }
        array.set(dtm.transform.mult(params.value, factor, interp));
        return array;
    };

    array.dot = array.mult;

    /**
     * @function module:array#pow
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.pow = function (factor, interp) {
        if (factor.type === 'dtm.array') {
            factor = factor.get();
        }
        array.set(dtm.transform.pow(params.value, factor, interp));
        return array;
    };

    /**
     * Applys the array contents as the power to the argument as the base
     * @function module:array#powof
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.powof = function (factor, interp) {
        if (factor.type === 'dtm.array') {
            factor = factor.get();
        }
        return array.set(dtm.transform.powof(params.value, factor, interp));
    };


    /* LIST OPERATIONS*/

    /**
     * Performs JS Array.map function to the array values.
     * @function module:array#map
     * @param callback
     * @returns {dtm.array}
     */
    array.map = function (callback) {
        array.set(params.value.map(callback));
        return array;
    };

    /**
     * Sorts the contents of numerical array.
     * @function module:array#sort
     * @returns {dtm.array}
     */
    array.sort = function () {
        params.value = dtm.transform.sort(params.value);
        array.set(params.value);
        return array;
    };

    /**
     * Concatenates new values to the contents.
     * @function module:array#concat | append
     * @param arr {array | dtm.array} A regular array or a dtm.array object.
     * @returns {dtm.array}
     */
    array.concat = function (arr) {
        if (typeof(arr) === 'undefined') {
            arr = [];
        }
        var temp = params.value;
        if (arr.constructor === Array || typeof(arr) === 'number') {
            temp = temp.concat(arr);
        } else if (arr.type === 'dtm.array') {
            temp = temp.concat(arr.get());
        }
        array.set(temp);
        return array;
    };

    array.append = array.cat = array.concat;

    /**
     * Repeats the contents of the current array.
     * @function module:array#repeat | rep
     * @param count {number} Integer
     * @returns {dtm.array}
     */
    array.repeat = function (count) {
        params.value = dtm.transform.repeat(params.value, count);
        array.set(params.value);
        return array;
    };

    array.rep = array.repeat;

    array.fitRep = function (count) {
        params.value = dtm.transform.fit(dtm.transform.repeat(params.value, count), params.length);
        array.set(params.value);
        return array;
    };

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

        params.value = params.value.concat(test);
        array.set(params.value);
        return array;
    };

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @function module:array#truncate | slice
     * @param arg1 {number} Start bits to truncate. If the arg2 is not present, it will be the End bits to truncate.
     * @param [arg2] {number} End bits to truncate.
     * @returns {dtm.array}
     */
    array.truncate = function (arg1, arg2) {
        params.value = dtm.transform.truncate(params.value, arg1, arg2);
        array.set(params.value);
        return array;
    };

    array.slice = array.truncate;

    /**
     * Returns a smaller segment of the array. Similar to get('block', ...), but more destructive.
     * @function module:array#block
     * @param start {number|array} The starting index of the block.
     * @param [size=1] {number} The size of the block.
     * @param [clone=true] {boolean} This retains the original array object.
     * @returns {dtm.array}
     */
    array.block = function (start, size, clone) {
        if (clone !== 'boolean') {
            clone = true;
        }

        var blockArray;
        if (start.constructor === Array) {
            blockArray = dtm.transform.getBlock(params.value, start[0], start[1]);
        } else if (typeof(start) === 'number' && typeof(size) === 'number') {
            blockArray = dtm.transform.getBlock(params.value, start, size);
        } else {
            // CHECK: ???
            return array;
        }

        if (clone) {
            return array.clone().set(blockArray);
        } else {
            return array.set(blockArray);
        }
    };

    /**
     * Applies a window function to the array. May be combined with array.block() operation.
     * @function module:array#window
     * @param type
     * @returns {dtm.array}
     */
    array.window = function (type) {
        params.value = dtm.transform.window(params.value, type);
        array.set(params.value);
        return array;
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {number} Integer
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        params.value = dtm.transform.shift(params.value, amount);
        array.set(params.value);
        return array;
    };

    /**
     * Flips the array contents horizontally.
     * @function module:array#mirror | reverse | rev
     * @returns {dtm.array}
     */
    array.mirror = function () {
        params.value = dtm.transform.mirror(params.value);
        array.set(params.value);
        return array;
    };

    array.rev = array.reverse = array.mirror;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert | inv | flip
     * @param [center=meanVal] {number}
     * @returns {dtm.array}
     */
    array.invert = function (center) {
        params.value = dtm.transform.invert(params.value, center);
        array.set(params.value);
        return array;
    };

    /**
     * Same as array.invert().
     * @function module:array#flip
     * @type {Function}
     */
    array.flip = array.inv =  array.invert;

    /**
     * Randomizes the order of the array.
     * @function module:array#shuffle | random | randomize | rand
     * @returns {dtm.array}
     */
    array.shuffle = function () {
        params.value = dtm.transform.shuffle(params.value);
        array.set(params.value);
        return array;
    };

    array.rand = array.random = array.randomize = array.shuffle;


    array.blockShuffle = function (blockSize) {
        return array;
    };

    /**
     * Adds new value(s) at the end of the array, and removes the oldest value(s) at the beginning of the array. The size of the array is unchanged.
     * @function module:array#queue | fifo
     * @param input {number|array}
     * @returns {dtm.array}
     */
    array.queue = function (input) {
        if (typeof(input) === 'number') {
            params.value.push(input);
            params.value.shift();
        } else if (input.constructor === Array) {
            params.value = params.value.concat(input);
            params.value = params.value.splice(input.length);
        } else if (input.type === 'dtm.array') {
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
        params.value = dtm.transform.round(params.value, to);
        array.set(params.value);
        return array;
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
        array.set(dtm.transform.hwr(params.value));
        return array;
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr | abs
     * @returns {dtm.array}
     */
    array.fwr = function () {
        array.set(dtm.transform.fwr(params.value));
        return array;
    };

    array.abs = array.fwr;

    //array.derivative = function (order) {
    //    return array;
    //};

    /**
     * @function module:array#diff
     * @returns {dtm.array}
     */
    array.diff = function () {
        return array.set(dtm.transform.diff(params.value));
    };

    /**
     * Removes zeros from the sequence.
     * @function module:array#removeZeros
     * @returns {dtm.array}
     */
    array.removeZeros = function () {
        return array.set(dtm.transform.removeZeros(params.value));
    };

    /* NOMINAL */

    /**
     * Generates a histogram from a nominal array, such as the string type.
     * @function module:array#histo | hist | histogram
     * @returns {dtm.array}
     */
    array.histo = function () {
        array.set(dtm.analyzer.histo(params.value));

        // CHECK: this is hacky
        params.type = 'string'; // re-set the type to string from number

        return array;
    };

    array.histogram = array.hist = array.histo;

    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:array#uniq | unique
     * @returns {dtm.array}
     */
    array.unique = function () {
        array.set(dtm.transform.unique(params.value));
        return array;
    };

    array.uniq = array.unique;

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:array#classId | class | classify
     * @param by
     * @returns {dtm.array}
     */
    array.classId = function (by) {
        return array.set(dtm.transform.classId(params.value));
    };

    array.class = array.classify = array.classId;

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:array#stringify | tostring
     * @returns {dtm.array}
     */
    array.stringify = function () {
        return array.set(dtm.transform.stringify(params.value));
    };

    array.tostring = array.stringify;

    /**
     * Converts string or boolean values to numerical values.
     * @function module:array#tonumber | toNumber
     * @returns {dtm.array}
     */
    array.tonumber = function () {
        return array.set(dtm.transform.tonumber(params.value));
    };

    array.toNum = array.tonum = array.toNumber = array.tonumber;

    array.toFloat32 = function () {
        var newArr = new Float32Array(array.get('len'));
        return array.set(newArr);
    };

    // CHECK: occurrence or value??
    array.morethan = function () {
        return array;
    };

    array.mt = array.morethan;

    array.lessthan = function () {
        return array;
    };

    array.lt = array.lessthan;

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

    // CHECK: this is different from the trnsf function
    /**
     * Pitch quantize the array values.
     * @function module:array#pq | pitchQuantize | pitchScale
     * @param scale {array|string}
     * @param [round=false] {boolean}
     * @returns {dtm.array}
     */
    array.pq = function (scale, round) {
        var scales = {
            "major": [0, 4, 7],
            "minor": [0, 3, 7],
            "maj7": [0, 4, 7, 11],
            "-7": [0, 3, 7, 10],
            "7": [0, 4, 7, 10],
            "7sus4": [0, 5, 7, 10]
        };

        if (arguments.length === 0) {
            scale = _.range(12);
        } else if (scale.constructor === Array) {

        } else if (typeof(scale) === 'string') {
            scale = scales[scale.toLowerCase()];
        }

        return array.set(dtm.transform.pq(params.value, scale, round));
    };

    array.pitchScale = array.pitchQuantize = array.pq;

    array.mtof = function () {
        return array.set(dtm.transform.mtof(params.value));
    };

    array.ftom = function () {
        return synth;
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
        params.value = dtm.transform.notesToBeats(params.value, resolution);
        array.set(params.value);
        return array;
    };

    array.ntob = array.notesToBeats;

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        params.value = dtm.transform.beatsToNotes(params.value, resolution);
        array.set(params.value);
        return array;
    };

    array.bton = array.beatsToNotes;

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats | itob
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        params.value = dtm.transform.intervalsToBeats(params.value);
        array.set(params.value);
        return array;
    };

    array.itob = array.intervalsToBeats;

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals | btoi
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        params.value = dtm.transform.beatsToIntervals(params.value);
        array.set(params.value);
        return array;
    };

    array.btoi = array.beatsToIntervals;

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToIndices | btoid
     * @returns {dtm.array}
     */
    array.beatsToIndices = function () {
        params.value = dtm.transform.beatsToIndices(params.value);
        array.set(params.value);
        return array;
    };

    array.btoid = array.beatsToIndices;

    /**
     * function module:array#indicesToBeats | idtob
     * @param [len]
     * @returns {dtm.array}
     */
    array.indicesToBeats = function (len) {
        return array.set(dtm.transform.indicesToBeats(params.value, len));
    };

    array.idtob = array.indicesToBeats;

    return array;
};

dtm.a = dtm.arr = dtm.array;

var generators = ['line', 'rise', 'decay', 'fall', 'seq', 'sequence', 'series', 'range', 'noise', 'random', 'rand', 'randi', 'gaussian', 'gaussCurve', 'gauss', 'normal', 'zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts', 'repeat', 'string', 'str', 'sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'fibonacci'];

generators.forEach(function (type) {
    dtm[type] = function () {
        var args = [type];

        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return dtm.array.apply(this, args);
    }
});