/**
 * @fileOverview Single dimensional array with built-in transformation functions.
 * @module array
 */

/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.array can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:array.array
 * @param arr {array}
 * @param [name] {string}
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.array = function (arr, name) {
    // private
    var params = {
        name: '',
        type: null, // int, float, string, coll, mixed, date
        length: null,
        min: null,
        max: null,
        mean: null,
        std: null,
        mode: null,

        value: [],
        original: null,
        normalized: [],
        classes: null,
        histogram: null,
        numClasses: null,

        index: 0
    };

    // public
    var array = {
        type: 'dtm.array'
    };

    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string}
     * @returns {number|array|string}
     */
    array.get = function (param, opt) {
        var out;
        var type = typeof(param);

        if (type === 'number') {
            if (param < 0 || param >= params.length) {
                dtm.log('Index out of range');
                out = params.value[dtm.value.mod(param, params.length)];
            } else {
                out = params.value[param];
            }
        } else {
            switch (param) {
                case 'name':
                case 'key':
                    out = params.name;
                    break;
                case 'type':
                    out = params.type;
                    break;
                case 'len':
                case 'length':
                    out = params.length;
                    break;

                case 'min':
                    out = dtm.analyzer.min(params.value);
                    break;
                case 'max':
                    out = dtm.analyzer.max(params.value);
                    break;
                case 'mean':
                case 'average':
                case 'avg':
                    out = dtm.analyzer.mean(params.value);
                    break;
                case 'mode':
                    out = dtm.analyzer.mode(params.value);
                    break;
                case 'median':
                    out = dtm.analyzer.median(params.value);
                    break;
                case 'midrange':
                    out = dtm.analyzer.midrange(params.value);
                    break;
                case 'std':
                    out = dtm.analyzer.std(params.value);
                    break;
                case 'pstd':
                    out = dtm.analyzer.pstd(params.value);
                    break;
                case 'var':
                    out = dtm.analyzer.var(params.value);
                    break;
                case 'pvar':
                    out = dtm.analyzer.pvar(params.value);
                    break;

                case 'index':
                case 'idx':
                    out = params.index;
                    break;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    out = params.value[params.index];
                    break;

                case 'next':
                    params.index = dtm.value.mod(++params.index, params.length);
                    out = params.value[params.index];
                    break;

                case 'prev':
                case 'previous':
                    params.index = dtm.value.mod(--params.index, params.length);
                    out = params.value[params.index];
                    break;

                case 'palindrome':
                    break;

                case 'random':
                    out = params.value[_.random(0, params.length - 1)];
                    break;

                case 'urn':
                    break;

                case 'original':
                    out = params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    out = dtm.transform.normalize(params.value);
                    break;
                case 'classes':
                    break;
                case 'numClasses':
                    break;
                case 'histo':
                    break;

                default:
                    out = params.value;
                    break;
            }
        }

        return out;
    };
    /**
     * Sets or overwrites the contents of the array object.
     * @function module:array#set
     * @param input {array}
     * @param [name] {string}
     * @returns {dtm.array}
     */
    array.set = function (input, name) {
        if (typeof(name) !== 'undefined') {
            array.setName(name);
        }

        // TODO: error checking
        params.value = input;

        if (params.original === null) {
            params.original = input;
        }

        // CHECK: type checking - may be redundant
        checkType(input);

        if (params.type === 'number' || params.type === 'int' || params.type === 'float') {
            _.forEach(params.value, function (val, idx) {
                params.value[idx] = Number.parseFloat(val);
            });

            params.normalized = dtm.transform.normalize(input);
            params.min = dtm.analyzer.min(input);
            params.max = dtm.analyzer.max(input);
            params.mean = dtm.analyzer.mean(input);
            params.std = dtm.analyzer.std(input);
            params.mode = dtm.analyzer.mode(input);
        }

        if (params.type === 'string') {
            histo();
            params.mode = dtm.analyzer.mode(params.classes);
        }

        params.length = input.length;

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#setName
     * @param name {string}
     * @returns {dtm.array}
     */
    array.setName = function (name) {
        params.name = name.toString();
        return array;
    };

    if (typeof(arr) !== 'undefined') {
        if (typeof(arr) === 'string') {
            arr = arr.split('');
        }

        checkType(arr);
        array.set(arr, name);
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
            params.type = 'number';
        }

        //array.type = res;
    }


    // TODO: need this in transformer???
    ///**
    // * Generates a histogram from a nominal array, such as the string type.
    // * @function module:array#histo
    // * @returns {dtm.array}
    // */
    array.histo = histo;

    function histo() {
        params.classes = _.clone(params.value);
        params.histogram = _.countBy(params.value);
        //array.numClasses =

        _.forEach(params.classes, function (val, idx) {
            params.value[idx] = params.histogram[val];
        });

        array.set(params.value);
        params.type = 'string'; // re-set the type to string from number... hacky!

        return array;
    }

    /**
     * Returns a clone of the array object. It can be used when you don't want to reference the same array object from different places.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        // this doesn't work
        //return dtm.clone(array);

        var newArr = dtm.array(params.value, params.name);
        if (params.type === 'string') {
            newArr.classes = params.classes;
            newArr.histogram = _.clone(params.histogram);
            newArr.params.type = 'string';
        }
        return newArr;
    };

    // CHECK: is this only for the array ojbect?
    /**
     * Fills the contents of the array with
     * @function module:array#fill
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=8] {integer}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.fill = function (type, len, min, max) {
        params.value = dtm.transform.generate(type, len, min, max);
        array.set(params.value);
        return array;
    };

    /**
     * Same as the fill() function.
     * @function module:array#generate
     * @param type {string} Choices: 'line', 'noise'/'random', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=2] {integer}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.generate = array.fill;

    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:array#normalize
     * @param [min] {number}
     * @param [max] {number}
     * @returns {dtm.array}
     */
    array.normalize = function (min, max) {
        params.value = dtm.transform.normalize(params.value, min, max);
        array.set(params.value);
        return array;
    };

    /**
     * Modifies the range of the array.
     * @function module:array#rescale
     * @param min {number}
     * @param max {number}
     * @returns {dtm.array}
     */
    array.rescale = function (min, max) {
        params.value = dtm.transform.rescale(params.value, min, max);
        array.set(params.value);
        return array;
    };

    /**
     * Same as array.rescale().
     * @function module:array#range
     * @type {Function}
     */
    array.range = array.scale = array.rescale;

    // TODO: implement this
    array.limit = function (min, max) {
        return array;
    };

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param val {number}
     * @returns {dtm.array}
     */
    array.add = function (val) {
        array.set(dtm.transform.add(params.value, val));
        return array;
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param val {number}
     * @returns {dtm.array}
     */
    array.mult = function (val) {
        array.set(dtm.transform.mult(params.value, val));
        return array;
    };

    /**
     * Flips the array contents horizontally.
     * @function module:array#mirror
     * @returns {dtm.array}
     */
    array.mirror = function () {
        params.value = dtm.transform.mirror(params.value);
        array.set(params.value);
        return array;
    };

    /**
     * Same as array.mirror().
     * @function module:array#reverse
     * @type {Function}
     */
    array.reverse = array.mirror;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert
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
    array.flip = array.invert;

    /**
     * Randomizes the order of the array.
     * @function module:array#shuffle
     * @returns {dtm.array}
     */
    array.shuffle = function () {
        params.value = dtm.transform.shuffle(params.value);
        array.set(params.value);
        return array;
    };

    /**
     * Same as array.shuffle().
     * @function module:array#randomize
     * @type {Function}
     */
    array.randomize = array.shuffle;

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
     * @function module:array#concat
     * @param arr {array | dtm.array} A regular array or a dtm.array object.
     * @returns {dtm.array}
     */
    array.concat = function (arr) {
        arr = arr || [];
        var temp = params.value;
        if (arr instanceof Array) {
            temp = temp.concat(arr);
        } else if (arr.type === 'dtm.array') {
            temp = temp.concat(arr.value);
        }
        array.set(temp);
        return array;
    };

    /**
     * Repeats the contents of the current array.
     * @function module:array#repeat
     * @param count {integer}
     * @returns {dtm.array}
     */
    array.repeat = function (count) {
        params.value = dtm.transform.repeat(params.value, count);
        array.set(params.value);
        return array;
    };

    /**
     * Same as array.repeat().
     * @function module:array#rep
     * @type {Function}
     */
    array.rep = array.repeat;

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @param arg1 {integer} Start bits to truncate. If the arg2 is not present, it will be the End bits to truncate.
     * @param [arg2] {integer} End bits to truncate.
     * @function module:array#truncate
     * @returns {dtm.array}
     */
    array.truncate = function (arg1, arg2) {
        params.value = dtm.transform.truncate(params.value, arg1, arg2);
        array.set(params.value);
        return array;
    };

    /**
     * Rounds float values of the array to integer values.
     * @function module:array#round
     * @returns {dtm.array}
     */
    array.round = function () {
        params.value = dtm.transform.round(params.value);
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
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {integer}
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        params.value = dtm.transform.shift(params.value, amount);
        array.set(params.value);
        return array;
    };

    /**
     * Scales the array with an exponential curve.
     * @function module:array#expCurve
     * @param factor {number}
     * @returns {dtm.array}
     */
    array.expCurve = function (factor) {
        var min = params.min;
        var max = params.max;
        var arr = dtm.transform.expCurve(params.normalized, factor);
        array.set(dtm.transform.rescale(arr, min, max));
        return array;
    };

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:array#logCurve
     * @param factor {number}
     * @returns {dtm.array}
     */
    array.logCurve = function (factor) {
        var min = params.min;
        var max = params.max;
        var arr = dtm.transform.logCurve(params.normalized, factor);
        array.set(dtm.transform.rescale(arr, min, max));
        return array;
    };

    // TODO: there might be a memory leak / some inefficiency
    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:array#fit
     * @param len {integer}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.fit = function (len, interp) {
        params.value = dtm.transform.fit(params.value, len, interp);
        array.set(params.value);
        return array;
    };

    /**
     * Multiplies the length of the array by the given factor.
     * @function module:array#stretch
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.stretch = function (factor, interp) {
        params.value = dtm.transform.stretch(params.value, factor, interp);
        array.set(params.value);
        return array;
    };

    /**
     * Morphs the array values with a target array / dtm.array values. The lengths can be mismatched.
     * @function module:array#morph
     * @param tgtArr {array | dtm.array}
     * @param morphIdx {number} between 0-1
     * @returns {dtm.array}
     */
    array.morph = function (tgtArr, morphIdx) {
        if (typeof(tgtArr) !== 'array') {
            if (tgtArr.type === 'dtm.array') {
                tgtArr = tgtArr.value;
            }
        }
        params.value = dtm.transform.morph(params.value, tgtArr, morphIdx);
        array.set(params.value);
        return array;
    };

    /**
     * Converts note values into a beat sequence.
     * @function module:array#notesToBeats
     * @param [resolution=4] {integer}
     * @returns {dtm.array}
     */
    array.notesToBeats = function (resolution) {
        resolution = resolution || 4;
        params.value = dtm.transform.notesToBeats(params.value, resolution);
        array.set(params.value);
        return array;
    };

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes
     * @param [resolution=4] {integer}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        params.value = dtm.transform.beatsToNotes(params.value, resolution);
        array.set(params.value);
        return array;
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        params.value = dtm.transform.intervalsToBeats(params.value);
        array.set(params.value);
        return array;
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        params.value = dtm.transform.beatsToIntervals(params.value);
        array.set(params.value);
        return array;
    };

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToIndices
     * @returns {dtm.array}
     */
    array.beatsToIndices = function () {
        params.value = dtm.transform.beatsToIndices(params.value);
        array.set(params.value);
        return array;
    };

    /**
     * Shorthand for notesToBeats() function.
     * @function module:array#ntob
     * @param resolution {integer}
     * @returns {dtm.array}
     */
    array.ntob = array.notesToBeats;

    /**
     * Shorthand for beatsToNotes() function.
     * @function module:array#bton
     * @param resolution {integer}
     * @returns {dtm.array}
     */
    array.bton = array.beatsToNotes;

    /**
     * Shorthand for intevalsToBeats() function.
     * @function module:array#itob
     * @returns {dtm.array}
     */
    array.itob = array.intervalsToBeats;

    /**
     * Shorthand for beatsToIntervals() function.
     * @function module:array#btoi
     * @returns {dtm.array}
     */
    array.btoi = array.beatsToIntervals;

    // CHECK: this is different from the trnsf function
    /**
     * Pitch quantize the array values.
     * @function module:array#pq
     * @param {array | string | numbers}
     * @returns {dtm.array}
     */
    array.pq = function () {
        var scale;

        if (arguments.length === 0) {
            scale = _.range(12);
        } else if (arguments[0] instanceof Array) {
            scale = arguments[0];
        } else if (typeof(arguments[0]) === 'string') {
            scale = dtm.scales[arguments[0].toLowerCase()];
        } else {
            scale = arguments;
        }
        return array.set(dtm.transform.pq(params.value, scale));
    };

    array.pitchQuantize = array.pq;

    array.transpose = function (val) {
        return array;
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
     * @function module:array#fwr
     * @returns {dtm.array}
     */
    array.fwr = function () {
        array.set(dtm.transform.fwr(params.value));
        return array;
    };

    /**
     * Same as the array.fwr() function.
     * @function module:array#abs
     * @returns {dtm.array}
     */
    array.abs = array.fwr;

    array.summarize = function () {
        return array;
    };

    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:array#reset
     * @returns {dtm.array}
     */
    array.reset = function () {
        array.set(params.original);
        return array;
    };

    array.original = array.reset;

    return array;
};

dtm.a = dtm.arr = dtm.array;