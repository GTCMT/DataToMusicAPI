(function () {

/**
 * @fileOverview
 * @module core
 */

// TODO: load WebAudio on demand
/* Shared WebAudio Stuff */
var actx = new (window.AudioContext || window.webkitAudioContext)();
var now = function () { return actx.currentTime; };
var out = function () { return actx.destination; };
var clMult = 0.01;
var clockBuf = actx.createBuffer(1, Math.round(actx.sampleRate * clMult), actx.sampleRate);

/**
 * Returns the singleton dtm object.
 * @name module:core#dtm
 * @type {object}
 */
var dtm = {
    version: '0.0.1',

    logger: false,
    log: function (arg) {
        if (dtm.logger) {
            console.log(arg);
        }
    },

    //instrColl: [],
    //activeInstrs: [],

    modelColl: [],
    clocks: [],

    sampleRate: actx.sampleRate,
    sr: actx.sampleRate,

    params: {},

    // TODO: a function to list currently loaded objects, such as data, arrays, models... - for console livecoding situation

    ///**
    // * Returns a singleton audio context object.
    // * @function getAudioContext
    // * @returns {object} Audio Context
    // * @example
    // *
    // * var actx = dtm.getAudioContext();
    // */
    getAudioContext: function () {
        return actx
    },

    ///**
    // * Returns the name of available models
    // * @function getModelNames
    // * @returns {Array}
    // */
    getModelNames: function () {
        return _.pluck(dtm.modelCol, 'name');
    },

    ajaxGet: ajaxGet,
    jsonp: jsonp,

    clone: clone,

    start: function () {

    }
};

//dtm.buffs = {
//    verbIr: makeIr(2)
//};

this.dtm = dtm;

function jsonp(url, cb) {
    var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[cbName] = function (data) {
        delete window[cbName];
        document.body.removeChild(script);
        var keys = _.keys(data);
        _.forEach(keys, function (val) {
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

dtm.loadData = function (url, cb) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        var ext = url.split('.').pop();

        switch (ext) {
            case 'txt':
            case 'csv':
//            req.responseType = 'blob';
                break;
            case 'json':
                xhr.responseType = 'json';
                break;
            case 'wav':
            case 'aif':
            case 'aiff':
            case 'ogg':
            case 'mp3':
                xhr.responseType = 'arraybuffer';
                break;
            default:
                xhr.responseType = 'blob';
                break;
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                if (typeof(cb) !== 'undefined') {
                    cb(xhr.response);
                }

                resolve(xhr.response);
            } else {
                reject(xhr.status);
            }
        };

        xhr.send();
    });
};


dtm.loadAudio = function (url, cb) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4 && xhr.status == 200) {
                //var buf = xhr.response;
                //console.log(String.fromCharCode.apply(null, new Float32Array(buf)));

                actx.decodeAudioData(xhr.response, function (buf) {
                    resolve(buf);

                    if (typeof(cb) !== 'undefined') {
                        cb(buf);
                    }
                });
            }
        };

        xhr.send();
    });
};

function loadBuffer(arrayBuf) {
    var buffer = {};
    actx.decodeAudioData(arrayBuf, function (buf) {
        buffer = buf;
    });

    return buffer;
}


function clone(obj) {
    //return JSON.parse(JSON.stringify(obj));
    return _.cloneDeep(obj); // CHECK: broken????????
}


function append() {

}

function appendNoDupes() {

}

dtm.scales = {
    "Major": [0, 4, 7],
    "minor": [0, 3, 7],
    "Maj7": [0, 4, 7, 11],
    "-7": [0, 3, 7, 10],
    "7": [0, 4, 7, 10],
    "7sus4": [0, 5, 7, 10]
};
dtm.osc = function () {
    var myOsc = {};

    myOsc.setup = function () {
        myOsc.oscPort = new osc.WebSocketPort({
            url: 'ws://localhost:8081'
        });

        myOsc.oscPort.open();

        return myOsc;
    };

    myOsc.write = function (input) {
        myOsc.oscPort.send({
            address: '/guido/score',
            args: ['set', input]
        });

        return myOsc;
    };

    myOsc.send = myOsc.write;

    return myOsc;
};
/**
 * @fileOverview Analyze a thing or two about an array. Singleton.
 * @module analyzer
 */

dtm.analyzer = {
    type: 'dtm.analyzer',

    /**
     * Checks the data type of the input array.
     * @function module:analyzer#checkType
     * @param arr {array}
     * @returns type {string}
     */
    checkType: function (arr) {
        var sum = _.reduce(arr, function (num, sum) {
            return num + sum;
        });

        if (isNaN(sum) || typeof(sum) === 'string') {
            return 'string';
        } else {
            // TODO: won't work in cases like [0.7, 0.3]
            if (sum.toString().indexOf('.') > -1) {
                return 'float';
            } else {
                return 'int';
            }
        }
    },

    /**
     * Returns the minimum value of numeric array.
     * @function module:analyzer#min
     * @param arr {number}
     * @returns {T}
     */
    min: function (arr) {
        return _.min(arr);
    },

    /**
     * Returns the maximum value of numeric array.
     * @function module:analyzer#max
     * @param arr {number}
     * @returns {T}
     */
    max: function (arr) {
        return _.max(arr);
    },

    // CHECK: ugly!
    /**
     * Returns the mean of a numeric array.
     * @function module:analyzer#mean
     * @param arr {array} Input numerical array.
     * @returns val {number} Single mean value.
     * @example
     *
     * dtm.transform.mean([8, 9, 4, 0, 9, 2, 1, 6]);
     * -> 4.875
     */
    mean: function (arr) {
        var type = dtm.anal.checkType(arr);

        var sum = _.reduce(arr, function (num, sum) {
            return num + sum;
        });

        //if (type === 'int') {
        //    var sum = _.reduce(arr, function (num, sum) {
        //        return Number.parseInt(num) + Number.parseInt(sum);
        //    });
        //
        //    return sum / _.size(arr);
        //} else if (type === 'float') {
        //    var sum = _.reduce(arr, function (num, sum) {
        //        return Number.parseFloat(num) + Number.parseFloat(sum);
        //    });
        //
        //    return sum / _.size(arr);
        //} else {
        //    return null;
        //}

        return sum / _.size(arr);
    },

    /**
     * Returns the most frequent value of the array.
     * @function module:analyzer#mode
     * @param arr {array}
     * @returns {value}
     */
    mode: function (arr) {
        var uniqs = _.uniq(arr);
        var max = 0;
        var num = 0;
        var res = null;

        var histo = _.countBy(arr);

        _.forEach(uniqs, function (val) {
            num = histo[val];

            if (num > max) {
                res = val;
                max = num;
            }
        });

        return res;
    },

    /**
     * Returns the median of numerical array.
     * @function module:analyzer#median
     * @param arr
     * @returns {number}
     */
    median: function (arr) {
        var sorted = arr.sort();
        var len = arr.length;

        if (len % 2 === 0) {
            return (sorted[len/2 - 1] + sorted[len/2]) / 2
        } else {
            return sorted[Math.floor(len/2)];
        }
    },

    /**
     * Returns the midrange of numerical array.
     * @function module:analyzer#midrange
     * @param arr
     * @return {number}
     */
    midrange: function (arr) {
        var max = dtm.analyzer.max(arr);
        var min = dtm.analyzer.min(arr);
        return (max + min) / 2;
    },

    // TODO: num string parsing
    /**
     * Simple summation.
     * @function module:analyzer#sum
     * @param arr
     * @returns {Mixed|*}
     */
    sum: function (arr) {
        var sum = _.reduce(arr, function (num, sum) {
            //if (!isNaN(num) && !isNaN(sum)) {
            //    if (num.toString().indexOf('.') > -1) {
            //        num = Number.parseFloat(num);
            //        sum = Number.parseFloat(sum);
            //    } else {
            //        num = Number.parseInt(num);
            //        sum = Number.parseInt(sum);
            //    }
            //}
            return num + sum;
        });

        return sum;
    },

    /**
     * Variance.
     * @function module:analyzer#var
     * @param arr
     * @returns {*}
     */
    var: function (arr) {
        var mean = dtm.analyzer.mean(arr);

        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow((mean - val), 2);
        });

        return dtm.analyzer.sum(res) / (arr.length-1);
    },

    /**
     * Standard Deviation.
     * @function module:analyzer#std
     * @param arr
     * @returns {*}
     */
    std: function (arr) {
        return Math.sqrt(dtm.analyzer.var(arr));
    },

    /**
     * Population Variance.
     * @function module:analyzer#pvar
     * @param arr
     * @returns {*}
     */
    pvar: function (arr) {
        var mean = dtm.analyzer.mean(arr);

        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow((mean - val), 2);
        });

        return dtm.analyzer.mean(res);
    },

    /**
     * Population Standard Deviation.
     * @function module:analyzer#pstd
     * @param arr
     * @returns {number}
     */
    pstd: function (arr) {
        return Math.sqrt(dtm.analyzer.pvar(arr));
    },

    /**
     * Root-Mean-Square value of given numerical array.
     * @function module:analyzer#rms
     * @param arr {array}
     * @returns rms {number}
     */
    rms: function (arr) {
        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow(val, 2);
        });

        return Math.sqrt(dtm.analyzer.mean(res));
    },

    ///**
    // * Auto-correlation (WIP)
    // * @function module:analyzer#autoCorr
    // * @param arr {array}
    // * @returns arr {array}
    // */
    autoCorr: null
};

//dtm.analyzer.pvariance = dtm.analyzer.pvar;
dtm.anal = dtm.analyzer;

function blockWise(arr, blockSize, hopSize, cb) {
    // or return promise

    return {};
}
/**
 * @fileOverview Utility functions for single-dimensional arrays. Singleton.
 * @module transform
 */

// this is singleton helper functions
dtm.transform = {
    type: 'dtm.transform',

    /**
     * Generates values for a new array.
     * @function module:transform#generate
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=8] {integer}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {Array}
     *
     * @example
     * dtm.transform.generate('line', 8, -4, 3);
     * -> [-4, -3, -2, -1, 0, 1, 2, 3]
     *
     * @example
     * dtm.transform.generate('random', 8, 3, 5);
     * -> [0.775, 0.864, 0.394, 0.280, 0.921, 0.827, 0.230, 0.066]
     *
     * @example
     * dtm.transform.generate('sine', 8, 0, 10);
     * -> [5, 8.909, 9.874, 7.169, 2.830, 0.125, 1.090, 5]
     */
    generate: function (type, len, min, max) {
        if (typeof(len) === 'undefined') {
            len = 8;
        }

        if (typeof(min) === 'undefined') {
            min = 0;
        }

        if (typeof(max) === 'undefined') {
            max = 1;
        }

        var res = [];

        switch (type) {
            case 'line':
                var incr = (max - min) / (len-1);

                for (var i = 0; i < len; i++) {
                    res[i] = min + incr * i;
                }
                break;

            case 'seq':
            case 'sequence':
                if (!min) {
                    min = 0;
                }
                for (var i = 0; i < len; i++) {
                    res[i] = i + min;
                }
                break;

            case 'range':
                if (!min) {
                    min = 0;
                }
                min = Math.round(min);
                max = Math.round(max);
                for (var i = 0; i < max-min; i++) {
                    res[i] = i + min;
                }
                break;

            case 'noise':
            case 'random':
                for (var i = 0; i < len; i++) {
                    res[i] = _.random(min, max, true);
                }
                break;

            case 'gaussian':
            case 'gauss':
            case 'normal':
                for (var i = 0; i < len; i++) {
                    var x = -Math.PI + (Math.PI * 2 / len) * i;
                    res[i] = Math.pow(Math.E, -0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI) / 0.4 * (max-min) + min;
                }
                break;

            case 'sin':
            case 'sine':
                for (var i = 0; i < len; i++) {
                    var incr = Math.PI * 2 / (len-1);
                    var val = Math.sin(incr * i);
                    val = (val+1)/2 * (max-min) + min;
                    res[i] = val;
                }
                break;

            case 'cos':
            case 'cosine':
                for (var i = 0; i < len; i++) {
                    var incr = Math.PI * 2 / (len-1);
                    var val = Math.cos(incr * i);
                    val = (val+1)/2 * (max-min) + min;
                    res[i] = val;
                }
                break;

            case 'zeros':
            case 'zeroes':
                for (var i = 0; i < len; i++) {
                    res[i] = 0;
                }
                break;

            case 'ones':
                for (var i = 0; i < len; i++) {
                    res[i] = 1;
                }
                break;

            default:
                break;
        }

        return res;
    },

    /**
     * Normalizes an numerical array into 0-1 range.
     * @function module:transform#normalize
     * @param vals {array} One-dimensional numerical array.
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
        if (typeof(min) === 'undefined') {
            min = _.min(arr);
        }

        if (typeof(max) === 'undefined') {
            max = _.max(arr);
        }

        var newArr = _.map(arr, function (val) {
            return (val - min) / (max - min);
        });

        return newArr;
    },

    /**
     * Modifies the range of an array.
     * @function module:transform#rescale
     * @param array {array}
     * @param min {number}
     * @param max {number}
     * @returns array {array}
     * @example
     *
     * dtm.transform.rescale([2, 1, 8, 9, 1, 3, 6, 9], -1, 1);
     * -> [-0.75, -1, 0.75, 1, -1, -0.5, 0.25, 1]
     */
    rescale: function (arr, min, max) {
        var normalized = dtm.transform.normalize(arr);
        var res = [];

        _.forEach(normalized, function (val, idx) {
            res[idx] = dtm.value.rescale(val, min, max);
        });

        return res;
    },

    /**
     * Adds a value to the array contents.
     * @function module:transform#add
     * @param arr
     * @param factor
     * @returns {Array}
     */
    add: function (arr, factor) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = val + factor;
        });

        return res;
    },

    /**
     * Multiplies the array contents.
     * @function module:transform#mult
     * @param arr
     * @param factor
     * @returns {Array}
     */
    mult: function (arr, factor) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = val * factor;
        });

        return res;
    },

    /**
     * Creates a horizontal mirror of the input array.
     * @function module:transform#mirror
     * @param {array} vals One-dimensional array. Could be any type.
     * @returns {array}
     * @example
     *
     * var input = [4, 1, 2, 7, 5, 0, 6, 3];
     *
     * dtm.transform.mirror(input);
     * -> [3, 6, 0, 5, 7, 2, 1, 4]
     */
    mirror: function (arr) {
        var res = [];
        for (var i = arr.length - 1; i >= 0; --i) {
            res.push(arr[i]);
        }
        return res;
    },

    /**
     * Vertical invertion.
     * @function module:transform#invert
     * @param {array} vals One-dimensional numerical array
     * @param {number} [center] If not present, the mean of the input array is used as the center point.
     * @returns {array}
     * @example
     *
     * var input = [4, 0, 3, 1, 2, 7, 5, 6];
     *
     * dtm.transform.invert(input);
     * -> [3, 7, 4, 6, 5, 0, 2, 1]
     */
    invert: function (arr, center) {
        // CHECK: center = 0 will give the default value...
        center = center || dtm.analyzer.mean(arr);

        var res = [];
        _.forEach(arr, function (val, idx) {
            res[idx] = center - (val - center);
        });
        return res;
    },

    /**
     * Randomizes the order of the contents of an array.
     * @function module:transform#shuffle
     * @param arr
     * @returns {Array}
     */
    shuffle: function (arr) {
        return _.shuffle(arr);
    },

    /**
     * Sorts the contents of a numerical array.
     * @function module:transform#sort
     * @param arr {array}
     * @returns {array}
     */
    sort: function (arr) {
        return arr.sort();
    },

    /**
     * Repeats the contents of an array.
     * @param arr
     * @param count
     * @returns {Array}
     */
    repeat: function (arr, count) {
        var res = [];

        if (!count) {
            count = 1;
        }
        for (var i = 0; i < count; i++) {
            res = res.concat(arr);
        }
        return res;
    },

    /**
     * Truncates some values either at the end or both at the beginning and the end of the given array.
     * @function module:transform#truncate
     * @param arr
     * @param arg1
     * @param [arg2]
     * @returns {Array}
     */
    truncate: function (arr, arg1, arg2) {
        var res = [];
        if (typeof(arg2) !== 'undefined') {
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

    /**
     * Rounds the float values to the nearest integer values.
     * @function module:transform#round
     * @param arr {array} Numerical array
     * @returns {Array}
     */
    round: function (arr) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = Math.round(val);
        });
        return res;
    },

    /**
     * Floor quantizes the float values to the nearest integer values.
     * @function module:transform#round
     * @param arr {array} Numerical array
     * @returns {Array}
     */
    floor: function (arr) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = Math.floor(val);
        });
        return res;
    },

    /**
     * Ceiling quantizes the float values to the nearest integer values.
     * @function module:transform#round
     * @param arr {array} Numerical array
     * @returns {Array}
     */
    ceil: function (arr) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = Math.floor(val);
        });
        return res;
    },

    /**
     * Shifts the positions of array contents.
     * @function module:transform#shift
     * @param arr
     * @param amount {integer}
     * @returns {Array}
     */
    shift: function (arr, amount) {
        var res = [];

        for (var i = 0; i < arr.length; i++) {
            var j = dtm.value.mod((i + amount), arr.length);
            res[i] = arr[j];
        }
        return res;
    },

    /**
     * Applys an exponential curve to a normalized (0-1) array.
     * @function module:transform#expCurve
     * @param arr
     * @param [factor=1] {number}
     * @returns {Array}
     */
    expCurve: function (arr, factor) {
        factor = factor || 1;
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = dtm.value.expCurve(val, factor);
        });
        return res;
    },

    /**
     * Applys a logarithmic curve to a normalized (0-1) array.
     * @function module:transform#logCurve
     * @param arr
     * @param [factor=1] {number}
     * @returns {Array}
     */
    logCurve: function (arr, factor) {
        factor = factor || 1;
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = dtm.value.logCurve(val, factor);
        });
        return res;
    },

    /**
     * Stretches or shrinks the input numerical array to a target length.
     * @function module:transform#fit
     * @param arr {array} Input numerical array.
     * @param len {integer} Target length.
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

        var res = [];
        res.length = len;
        var mult = len / arr.length;

        if (interp === 'linear') {
            inNumItv = arr.length - 1;
            outNumItv = len - 1;

            intermLen = inNumItv * outNumItv + 1;
            intermArr = [];
            intermArr.length = intermLen;

            var c = 0;
            for (var j = 0; j < inNumItv; j++) {
                for (var i = 0; i < outNumItv; i++) {
                    intermArr[c] = arr[j] + (arr[j + 1] - arr[j]) * (i / outNumItv);
                    c++;
                }
            }
            intermArr[c] = arr[j];

            for (var k = 0; k < outNumItv; k++) {
                res[k] = intermArr[k * inNumItv];
            }
            res[k] = intermArr[intermLen - 1];
        } else if (interp === 'step') {
            for (var i = 0; i < len; i++) {
                res[i] = arr[Math.floor(i / mult)];
            }

        } else if (interp === 'zeros') {
            var prevIdx = -1;

            for (var i = 0; i < len; i++) {
                if (prevIdx !== Math.floor(i / mult)) {
                    prevIdx = Math.floor(i / mult);
                    res[i] = arr[prevIdx];
                } else {
                    res[i] = 0;
                }
            }
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
        interp = interp || 'linear';

        var targetLen = Math.round(arr.length * factor);
        if (targetLen == 0) {
            targetLen = 1;
        }

        return dtm.transform.fit(arr, targetLen, interp);
    },

    /**
     * Variable length array morphing!
     * @function module:transform#morph
     * @param srcArr {array}
     * @param tgtArr {array}
     * @param [morphIdx=0.5] {float}
     */
    morph: function (srcArr, tgtArr, morphIdx) {
        if (typeof(morphIdx) === 'undefined') {
            morphIdx = 0.5;
        }

        var srcLen = srcArr.length;
        var tgtLen = tgtArr.length;
        var resLen = Math.round((tgtLen - srcLen) * morphIdx + srcLen);

        return morphFixed(dtm.transform.fit(srcArr, resLen), dtm.transform.fit(tgtArr, resLen), morphIdx);
    },

    interleave: function (srcArr, tgtArr) {


    },

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

        _.forEach(input, function (val) {
            var note = resolution / val;
            for (var i = 0; i < note; i++) {
                if (i === 0) {
                    res[idx] = 1;
                } else {
                    res[idx] = 0;
                }
                idx++;
            }
        });

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
     * @param input
     * @returns {Array}
     */
    intervalsToBeats: function (input) {
        var res = [];
        var idx = 0;

        _.forEach(input, function (val) {
            var note = val;
            for (var i = 0; i < note; i++) {
                if (i === 0) {
                    res[idx] = 1;
                } else {
                    res[idx] = 0;
                }
                idx++;
            }
        });

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

    indicesToBeats: function (input) {
        var res = [];

        for (var i = 0; i < input.length; i++) {

        }
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
        var res = dtm.array().fill('zeroes', src.length).get();
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

    pq: function (input, scale) {
        var res = [];
        _.forEach(input, function (val, idx) {
            res[idx] = dtm.value.pq(val, scale);
        });

        return res;
    },

    hwr: function (input) {
        var res = [];
        _.forEach(input, function (val, idx) {
            res[idx] = (val < 0) ? 0 : val;
        });

        return res;
    },

    fwr: function (input) {
        var res = [];
        _.forEach(input, function (val, idx) {
            res[idx] = (val < 0) ? Math.abs(val) : val;
        });

        return res;
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

dtm.transform.fill = dtm.transform.generate;
dtm.transform.abs = dtm.transform.fwr;
dtm.transform.randomize = dtm.transform.shuffle;

function morphFixed (srcArr, tgtArr, morphIdx) {
    if (typeof(morphIdx) === 'undefined') {
        morphIdx = 0.5;
    }

    var newArr = [];

    _.forEach(srcArr, function (val, idx) {
        newArr[idx] = (tgtArr[idx] - val) * morphIdx + val;
    });

    return newArr;
}

dtm.tr = dtm.transform;
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
        name: '', // or key?
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
        //var newVal = dtm.transform.fit(params.value, len, interp);
        //delete array;
        //return dtm.array(newVal);

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
     * A shorthand for iterating through the array values. For more details and other iteration methods, please check the dtm.iterator.
     * @param [param='value'] {string}
     * @returns {value}
     */
    array.next = function (param) {
        if (typeof(param) === 'undefined') {
            param = 'value'
        }
        var out = array[param][params.index];
        params.index = dtm.value.mod(params.index + 1, params.length);
        return out;
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

    return array;
};

dtm.a = dtm.arr = dtm.array;
/**
 * @fileOverview Collection object. Right now, empty.
 * @module collection
 */

/**
 * Creates a new instance of dtm.collection object
 * @function module:collection.collection
 * @returns dtm.collection {object}
 */
dtm.collection = function () {
    var coll = {
        type: 'dtm.collection',
        keys: [],
        types: [],
        values: []
    };

    coll.set = function () {
        return coll;
    };

    coll.update = function () {
        return coll;
    };

    coll.map = function () {
        return coll;
    };

    return coll;
};

dtm.coll = dtm.collection;

// TODO: transformation module for this???
/**
 * @fileOverview Utility functions for single value input. Singleton.
 * @module value
 */

dtm.value = {
    type: 'dtm.value',

    /**
     * Rescales a single normalized (0-1) value.
     *
     * @function module:value#rescale
     * @param val {float} Value between 0-1.
     * @param min {number} Target range minimum.
     * @param max {number} Target range maximum.
     * @param [round=false] {boolean} If true, the output will be rounded to an integer.
     * @returns {number}
     */
    rescale: function (val, min, max, round) {
        round = round || false;

        var res = val * (max - min) + min;

        if (round) {
            res = Math.round(res);
        }

        return res;
    },

    /**
     * @function module:value#expCurve
     * @param val {float} Value between 0-1.
     * @param factor {float} Steepness. It should be above 1.
     * @returns {number}
     */
    expCurve: function (val, factor) {
        factor = factor <= 1 ? 1.000001 : factor;
        return (Math.exp(val * Math.log(factor)) - 1.) / (factor - 1.);
    },

    /**
     * @function module:value#logCurve
     * @param val {float} Value between 0-1.
     * @param factor {float} Steepness. It should be above 1.
     * @returns {number}
     */
    logCurve: function (val, factor) {
        factor = factor <= 1 ? 1.000001 : factor;
        return (Math.log(val * (factor - 1.) + 1.)) / (Math.log(factor));
    },

    /**
     * MIDI note number to frequncy convertion.
     * @function module:value#mtof
     * @param nn {integer} Note number
     * @returns {number}
     */
    mtof: function (nn) {
        return 440. * Math.pow(2, (nn - 69) / 12.);
    },

    /**
     * Scale or pitch-quantizes the input value to the given models.scales.
     * @function module:value#pq
     * @param nn {integer} Note number
     * @param scale
     * @returns {*}
     */
    pq: function (nn, scale) {
        if (typeof(scale) === 'undefined') {
            scale = [0, 2, 4, 5, 7, 9, 11];
        }

        var pc = nn % 12;
        var oct = nn - pc;
        var idx = Math.floor(pc / 12. * scale.length);
        return oct + scale[idx];
    },

    /**
     * A modulo (remainder) function that is not broken like the JS implementation.
     * @param n {number} Divident
     * @param m {number} Divisor
     * @returns {number}
     */
    mod: function mod(n, m) {
        return ((n % m) + m) % m;
    },

    incr: function incr() {

    },

    randi: function (min, max) {
        return _.random(min, max);
    },

    random: function (min, max) {
        return _.random(min, max, true);
    }
};

dtm.val = dtm.value;
//dtm.v = dtm.value;
/**
 * @fileOverview Array iterator.
 * @module iterator
 */

// CHECK: iterator may have its own clock??? run() function...

/**
 * Creates a new instance of iterator. A dtm.array object or JavaScript array (single dimension) can be loaded.
 *
 * @function module:iterator.iterator
 * @param [arg] {dtm.array|array}
 * @returns {{className: string, value: Array, idx: number, len: number}}
 */
dtm.iterator = function (arg) {
    var iter = {
        type: 'dtm.iterator',

        /**
         * The stored array object.
         * @name module:iterator#array
         * @type {dtm.array}
         */
        array: null,
        //value: [],

        /**
         * The current index of the iterrator.
         * @name module:iterator#idx
         * @type {integer}
         */
        idx: 0,

        // CHECK: this might not be the case.
        /**
         * The length of the iterator. It should be the same as the array length.
         * @name module:iterator#len
         * @type {integer}
         */
        len: 0,

        order: null,
        range: {},
        modIdx: []
    };

    /**
     * Sets a dtm.array or a plain array object (which gets converted to a dtm.array) as the content of the iterator.
     * @function module:iterator#set
     * @param input {dtm.array | array}
     * @returns {dtm.iter}
     */
    iter.set = function (input) {
        if (typeof(input) !== 'undefined') {
            iter.len = input.length; // CHECK: may need update this frequently

            if (input.type === 'dtm.array') {
                iter.array = input;
                //iter.value = input.value;
            } else {
                iter.array = dtm.array(input);
                //iter.value = input;
            }
        }

        return iter;
    };

    iter.set(arg);

    /**
     * Moves the current index forward and returns a content of the array.
     * @function module:iterator#next
     * @param [arrayParam=value] {string} Choices: 'value', 'classes', etc.
     * @returns {value}
     */
    iter.next = function (arrayParam) {
        if (typeof(arrayParam) === 'undefined') {
            arrayParam = 'value'
        }
        var out = iter.array[arrayParam][iter.idx];
        iter.idx = dtm.value.mod(iter.idx + 1, iter.array.length);
        return out;
    };

    /**
     * Goes to the previous index and returns an array content.
     * @function module:iterator#prev
     * @param [arrayParam=value] {string}
     * @returns {value}
     */
    iter.prev = function (arrayParam) {
        if (typeof(arrayParam) === 'undefined') {
            arrayParam = 'value'
        }
        var out = iter.array[arrayParam][iter.idx];
        iter.idx = dtm.value.mod(iter.idx - 1, iter.array.length);
        return out;
    };

    // CHECK: the order of the iter and return, other methods too
    /**
     * Jumps to a specified index and returns a value.
     * @function module:iterator#jump
     * @param idx {integer}
     * @param [arrayParam=value] {string}
     * @returns {value}
     */
    iter.jump = function (idx, arrayParam) {
        if (typeof(arrayParam) === 'undefined') {
            arrayParam = 'value'
        }

        var out = iter.array[arrayParam][iter.idx];
        iter.idx = dtm.value.mod(idx, iter.array.length);
        return out;
    };

    /**
     * Goes to a random position and returns the value.
     * @function module:iterator#random
     * @param [arrayParam=value] {string}
     * @returns {value}
     */
    iter.random = function (arrayParam) {
        if (typeof(arrayParam) === 'undefined') {
            arrayParam = 'value'
        }

        // CHECK: would it spill out?
        iter.idx = Math.floor(Math.random() * iter.array.length);
        return iter.array[arrayParam][iter.idx];
    };

    // TODO: ...
    iter.urn = function () {
        var range = _.range(iter.array.length - 1);
        iter.modIdx = dtm.transform.shuffle(range);
    };

    /**
     * Does a step-wise random walk.
     * @function module:iterator#drunk
     * @param [stepSize=1] {integer}
     * @param [repeat=false] {boolean} If set true, it can sometimes repeat the same value.
     * @param [arrayParam='value'] {string}
     * @returns {value}
     */
    iter.drunk = function (stepSize, repeat, arrayParam) {
        if (typeof(stepSize) === 'undefined') {
            stepSize = 1;
        }

        if (typeof(repeat) === 'undefined') {
            repeat = false;
        }

        if (typeof(arrayParam) === 'undefined') {
            arrayParam = 'value'
        }

        var min = 1;
        if (repeat) { min = 0; }

        var val = _.random(min, stepSize);
        if (_.random(0, 1)) {
            val = -val;
        }

        iter.idx = dtm.value.mod(iter.idx + val, iter.array.length);
        return iter.array[arrayParam][iter.idx];
    };

    iter.setRange = function () {

    };

    iter.previous = iter.prev;

    return iter;
};

/**
 * Creates a new instance of iterator.
 *
 * @function module:iterator.iter
 * @param [arg] {dtm.array|array}
 * @returns {{className: string, value: Array, idx: number, len: number}}
 */
dtm.it = dtm.iter = dtm.iterator;
/**
 * @fileOverview Parses random stuff. Singleton.
 * @module parser
 */

dtm.parser = {
    type: 'dtm.parser',

    parseCsv: function (data) {
        return parser;
    },


    /**
     * @function module:parser#csvToJson
     * @category Parser
     * @param csv {string}
     * @returns {array} Array of JSON objects
     * @example
     *
     * var dummyCsv =
     *     'foo, bar, buz\r' +
     *     '123, 456.78, hey\r' +
     *     '789, 444.44, hoo';
     *
     * var dummyJson = p.csvToJson(dummyCsv);
     *
     * console.log(dummyJson);
     * -> [{foo: 123, bar: 456.78, buz:'hey'}, {foo: 789, bar: 444.44, buz:'hoo'}]
     */
    csvToJson: function (csv) {
        var lines = csv.split("\r"); // \r for Macs
        var result = [];
        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            if (currentline.length > 1) {
                for (var j = 0; j < headers.length; j++) {
                    var val = currentline[j];
                    if (!isNaN(val)) {
                        val = Number.parseFloat(val);
                    }
                    obj[headers[j]] = val;
                }

                result.push(obj);
            }
        }

        return result; //JavaScript object
//        return JSON.stringify(result); //JSON
    },

    /**
     * Parses the value types from a given row of a collection.
     * @function module:parser#valueTypes
     * @param row {array}
     * @returns {array}
     */
    valueTypes: function (row) {
        var types = [];

        _.forEach(row, function (val, idx) {
            var parsedVal = parseFloat(val);

            if (isNaN(parsedVal)) {
                types.push('string');
            } else {
                if (val.indexOf('.') > -1) {
                    types.push('float');
                } else {
                    types.push('int');
                }
            }
        });

        return types;
    },

    // CHECK: this only works w/ json...
    /**
     * Returns the column & row size of the collection
     * @function module:parser#getSize
     * @param json
     * @returns {array}
     */
    getSize: function (json) {
        var col = _.size(json[0]); // header
        var row = _.size(json);
        return [col, row];
    }
};
/**
 * @fileOverview Data object.
 * @module data
 */

/**
 * Creates a new dtm.data object, if the argument is empty, or a promise object, if the argument is a URL.
 * @function module:data.data
 * @param [arg] {string} URL to load or query the data
 * @param callback {function}
 * @returns {dtm.data | promise}
 */
dtm.data = function (arg, cb, type) {
    var data = {
        type: 'dtm.data',

        //value: null,
        //type: null, // ???: csv, json, etc.

        /**
         * The data stored as a collection / array of objects.
         * @name module:data#coll
         * @type {array}
         */
        coll: [],

        /**
         * The data stored as a series of dtm.array object.
         * @name module:data#arrays
         * @type {object}
         */
        arrays: {},

        // TODO: enclose non-functions here
        params: {
            /**
             * List of available keys.
             * @name module:data#keys
             * @type {array}
             */
            keys: [],

            /**
             * List of keys and their data types.
             * @name module:data#types
             * @type {object}
             */
            types: {},
            /**
             * The row (data points) and collumn (keys) size.
             * @name module:data#size
             * @type {object}
             */
            size: {}
        },

        /**
         * This can be used for promise callback upon loading data.
         * @name module:data#promise
         * @type {object}
         */
        promise: null
    };

    //if (type !== 'undefined') {
    //    // array, csv, json
    //    switch (type) {
    //        case 'array':
    //            break;
    //
    //        case 'CSV':
    //        case 'csv':
    //            break;
    //
    //        case 'JSON':
    //        case 'json':
    //
    //            break;
    //        default:
    //            break;
    //    }
    //}

    // TODO: make a dict for well-known APIs to load data nicely
    /**
     * Loads data from file, or query using URL for Rest-ful API. Passes the result data to the given callback function or the promise object.
     * @function module:data#load
     * @param url {string}
     * @param [cb] {function} A callback function.
     * @returns promise {promise}
     */
    data.load = function (url, cb) {
        data.promise = new Promise(function (resolve, reject) {
            var ext = url.split('.').pop(); // checks the extension

            if (ext === 'json') {
                var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
                window[cbName] = function (res) {
                    delete window[cbName];
                    document.body.removeChild(script);

                    var keys = _.keys(res);

                    _.forEach(keys, function (val) {
                        // CHECK: this is a little too case specific
                        if (val !== 'response') {
                            data.coll = res[val];
                            data.params.keys = _.keys(data.coll[0]);
                            setArrays();
                            setTypes();
                            setSize();

                            resolve(data);
                            if (typeof(cb) !== 'undefined') {
                                cb(data);
                            }
                        }
                    });
                    //cb(data);
                };

                var script = document.createElement('script');
                script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
                document.body.appendChild(script);

            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);

                switch (ext) {
                    case 'txt':
                    case 'csv':
                        break;
                    //case 'json':
                    //    xhr.responseType = 'json';
                    //    break;
                    case 'wav':
                    case 'aif':
                    case 'aiff':
                    case 'ogg':
                    case 'mp3':
                        xhr.responseType = 'arraybuffer';
                        break;
                    default:
                        //xhr.responseType = 'blob';
                        break;
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        if (xhr.responseType === 'arraybuffer') {
                            actx.decodeAudioData(xhr.response, function (buf) {
                                for (var c = 0; c < buf.numberOfChannels; c++) {
                                    var floatArr = buf.getChannelData(c);
                                    data.arrays['ch_' + c] = dtm.array(Array.prototype.slice.call(floatArr), 'ch_' + c);
                                }

                                //setArrays();
                                //setTypes();
                                //setSize();

                                resolve(data);

                                if (typeof(cb) !== 'undefined') {
                                    cb(data);
                                }
                            });
                        } else {
                            if (ext === 'csv') {
                                data.coll = dtm.parser.csvToJson(xhr.response);
                            } else {
                                // TODO: this only works for shodan
                                data.coll = JSON.parse(xhr.response)['matches'];
                            }
                            data.params.keys = _.keys(data.coll[0]);
                            setArrays();
                            setTypes();
                            setSize();

                            resolve(data);

                            if (typeof(cb) !== 'undefined') {
                                cb(data);
                            }
                        }
                    }
                };

                xhr.send();
            }
        });

        // CHECK: this doesn't work
        data.promise.get = function (arg) {
            data.promise.then(function (d) {
                data = d;
                return d.get(arg);
            });
            return data.promise;
        };

        return data.promise;
    };

    //data.jsonp = function (url, cb) {
    //    data.promise = new Promise(function (resolve, reject) {
    //        var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    //        window[cbName] = function (res) {
    //            delete window[cbName];
    //            document.body.removeChild(script);
    //            var keys = _.keys(res);
    //            _.forEach(keys, function (val) {
    //                if (val !== 'response') {
    //                    data.coll = res[val];
    //                    data.keys = _.keys(data.coll[0]);
    //                    setArrays();
    //                    setTypes();
    //                    setSize();
    //
    //                    resolve(data);
    //                    if (typeof(cb) !== 'undefined') {
    //                        cb(data);
    //                    }
    //                }
    //            });
    //            //cb(data);
    //        };
    //
    //        var script = document.createElement('script');
    //        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
    //        document.body.appendChild(script);
    //    });
    //
    //    return data.promise;
    //};

    data.set = function (res) {
        data.coll = res;
        data.params.keys = _.keys(data.coll[0]);
        setArrays();
        setTypes();
        setSize();
    };

    function setArrays() {
        _.forEach(data.params.keys, function (key) {
            var a = dtm.array(_.pluck(data.coll, key), key);
            data.arrays[key] = a;
        })
    }

    function setTypes() {
        _.forEach(data.params.keys, function (key) {
            data.params.types[key] = data.arrays[key].params.type;
        })
    }

    function setSize() {
        data.params.size.col = data.params.keys.length;
        data.params.size.row = data.coll.length;
    }

    /**
     * Returns a clone of dtm.array object from the data.
     * @param id {string|integer} Key (string) or index (integer)
     * @returns {dtm.array}
     */
    data.get = function (id) {
        if (typeof(id) === 'number') {
            if (id >= 0 && id < data.params.size['col']) {
                return data.arrays[data.params.keys[id]].clone();
            } else {
                dtm.log('data.get(): index out of range');
                return data;
            }
        } else if (typeof(id) === 'string') {
            if (data.params.keys.indexOf(id) > -1) {
                return data.arrays[id].clone();
            } else {
                dtm.log('data.get(): key does not exist');
                return data;
            }
        } else {
            return data;
        }
    };

    //data.capture = function () {
    //    return new Promise(function (resolve, reject) {
    //
    //    });
    //};

    /**
     * Returns a clone of the data object itself. It can be used when you don't want to reference the same data object from different places.
     * @function module:data#clone
     * @returns {dtm.data}
     */
    data.clone = function () {
        // CHECK: this may be broken
        return dtm.clone(data);
    };

    data.map = function () {
        return data;
    };

    data.stream = function (uri, rate) {
        return data;
    };

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            return data.load(arg);
        }
    } else {
        return data;
    }
};

dtm.d = dtm.data;

/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

/**
 * Creates a new instance of clock. Don't put "new".
 * @function module:clock.clock
 * @param [bpm=60] {number} Tempo in beats-per-minute. Recommended value range is around 60-140.
 * @param [subDiv=4] {integer} Sub division / tick speed. Recommended: 4, 8, 16, etc.
 * @returns {dtm.clock} a new clock object
 * @example
 *
 * var cl = dtm.clock(120);
 * cl.start();
 */
dtm.clock = function (bpm, subDiv, time) {
    var clock = {
        type: 'dtm.clock',

        interval: 1,

        time: [4, 4],
        beat: 0,

        list: [],

        params: {
            isOn: false,
            sync: false,
            bpm: 60,
            subDiv: 4,
            random: 0,
            swing: 0.5
        },

        // CHECK: just for debugging
        callbacks: []
    };

    clock.params.tempo = clock.params.bpm;

    // private
    var callbacks = [];

    // member?
    var curTime = 0.0;

    /**
     * Set the main parameters of the clock.
     * @function module:clock#set
     * @param bpm {number}
     * @param [subDiv] {number}
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv) {
        if (typeof(bpm) !== 'undefined') {
            clock.params.bpm = bpm;
            clock.params.sync = false;
        }
        if (typeof(params.subDiv) !== 'undefined') {
            clock.params.subDiv = subDiv;
        }

        return clock;
    };

    /**
     * Sets the clock to be synced to the master clock. When set true, the tempo/BPM in itself is ignored.
     * @function module:clock#sync
     * @param [bool=true] {boolean}
     * @returns {dtm.clock}
     */
    clock.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }

        clock.params.sync = bool;
        return clock;
    };

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param val {number} BPM value
     * @returns {dtm.clock} self
     * @chainable
     * @example
     *
     * var cl = dtm.createClock();
     * cl.setBpm(90);
     */
    clock.bpm = function (val) {
        if (!arguments || !val) {
            clock.params.bpm = 60;
            return clock;
        }
        clock.params.bpm = val;
        clock.tempo = val;
        return clock;
    };

    /**
     * Same as bpm().
     * @function module:clock#tempo
     */
    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {integer} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subDiv = function (val) {
        val = val || 4;
        clock.params.subDiv = val;
        return clock;
    };

    clock.div = clock.subdiv = clock.subDiv;

    clock.setTime = function (input) {
        if (typeof(input) === 'Array') {
            clock.time = input;
        } else if (typeof(input) === 'string') {
            clock.time = input.split('/');
        }
        return clock;
    };

    /**
     * Registers a callback function to selected or all ticks of the clock.
     * @function module:clock#add
     * @param cb {function} Callback function.
     * @param [name] {string}
     * @returns {dtm.clock} self
     */
    clock.add = function (cb, name) {
        // prevent adding identical functions
        var dupe = false;

        if (typeof(name) === 'string') {
            _.forEach(clock.callbacks, function (stored) {
                if (stored.name == name) {
                    dtm.log('clock.add(): identical function exists in the callback list');

                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        } else {
            _.forEach(clock.callbacks, function (stored) {
                if (_.isEqual(stored, cb)) {
                    dtm.log('clock.add(): identical function exists in the callback list');

                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        }

        return clock;
    };

    clock.register = clock.reg = clock.add;

    ///**
    // * Registers a callback function to selected or all ticks of the clock.
    // * @function module:clock#add
    // * @param cb {function} Callback function.
    // * @param [beats] {array} Sequence of beat numbers (int) on which the callback function should be called. The default is the every beat.
    // * @returns {dtm.clock} self
    // */
    //clock.addToBeats = function (cb, iArr) {
    //    if (arguments.length == 1) {
    //        // CHECK: broken - changing the subdiv later should change this too?
    //        // maybe disable the registration for certain beats
    //        beats = _.range((clock.params.subDiv * clock.time[0] / clock.time[1]));
    //    }
    ////        if (_.findKey(cb, 'modelName')) {
    ////            cb.addParentClock(clock); // CHECK: risky
    ////        }
    ////
    ////        console.log(_.findKey(cb, 'modelName'));
    //
    //    clock.callbacks.push([cb, beats]);
    //    return clock;
    //};

    /**
     * @function module:clock#remove
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.remove = function (id) {
        if (typeof(id) === 'function') {
            dtm.log('removing a calblack function');
            _.remove(clock.callbacks, function (cb) {
                return _.isEqual(cb, id);
            });
        } else if (typeof(id) === 'string') {
            dtm.log('removing a calblack function: ' + id);
            _.remove(clock.callbacks, function (cb) {
                return cb.name == id;
            });
        }

        return clock;
    };

    /**
     * @function module:clock#rem
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.rem = clock.remove;

    /**
     * Modifies or replaces the content of a callback function while the clock may be running. Note that the target callback needs to be a named function.
     * @function module:clock#modify
     * @param id {function|string}
     * @param [fn] {function}
     * @returns {dtm.clock}
     */
    clock.modify = function (id, fn) {
        if (typeof(id) === 'function') {
            dtm.log('modifying the callback: ' + id.name);
            clock.remove(id.name);
            clock.add(id);
        } else if (typeof(id) === 'string') {
            dtm.log('modifying the callback: ' + id);
            clock.remove(id);

            // CHECK: don't add if the same name doesn't already exist
            if (fn.name == '') {
                // fn.name is read-only!
                var temp = new Function(
                    'return function ' + id + fn.toString().slice(8)
                )();
                clock.add(temp);
            } else {
                clock.add(fn);
            }
        }
        return clock;
    };

    clock.replace = clock.mod = clock.modify;

    /**
     * Starts the clock.
     * @function module:clock#start
     * @returns {dtm.clock} self
     */
    clock.start = function (timeErr) {
        dtm.log('starting a clock');

        if (clock.params.isOn !== true) {
            clock.params.isOn = true;
            clock.tick();

            if (!clock.params.isMaster) {
                dtm.clocks.push(clock);
            }
        }
        return clock;
    };

    clock.run = clock.play = clock.start;

    var clockSrc;

    /**
     * Makes the clock tick once.
     * @param [timeErr=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timeErr) {
        timeErr = timeErr || 0;
//            if (isNaN(timeErr)) {
//                timeErr = 0;
//            }
        if (clock.params.isOn) {

            if (!clock.params.sync && !clock.params.isMaster) {
                clockSrc = actx.createBufferSource();
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                var freq = clock.params.bpm / 60.0 * (clock.params.subDiv / 4.0);
                //var pbRate = 1/(1/freq - Math.abs(timeErr));

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * clock.params.random * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - clock.params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= clock.params.swing / 0.5;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = now() - curTime;
                    //clock.tick(error);
                    clock.tick();
//                curTime = now();
                };

                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (clock.params.subDiv * clock.time[0] / clock.time[1]);

                return clock;

            } else if (clock.params.sync && !clock.params.isMaster) {

                return clock;
            } else if (clock.params.isMaster) {
                clockSrc = actx.createBufferSource();
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                var freq = clock.params.bpm / 60.0 * (clock.params.subDiv / 4.0);

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * clock.params.random * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - clock.params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= clock.params.swing / 0.5;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = now() - curTime;
                    clock.tick();

                    //return function (cb) {
                    //    cb();
                    //};
                };

                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (clock.params.subDiv * clock.time[0] / clock.time[1]);
            }

        }
    };

    // TODO: stopping system should remove these callbacks?
    clock.tickSynced = function () {
        if (clock.params.sync && clock.params.isOn) {
            if (dtm.master.clock.beat % Math.round(480/clock.params.subDiv) === 0) {
                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });
            }
        }
        return clock;
    };

    /**
     * Stops the clock.
     * @function module:clock#stop
     * @returns {dtm.clock} self
     */
    clock.stop = function () {
        dtm.log('stopping a clock');
        if (clock.params.isOn === true) {
            clock.params.isOn = false;
        }
        return clock;
    };

    clock.clear = function () {
        clock.callbacks = [];
        return clock;
    };

    /**
     * Applies swing to the every 2nd beat. (E.g. The 2nd 16th note in a 8th note interval).
     * @function module:clock#swing
     * @param [amt=0.5] {number} Percentage of swing. (E.g. 0.5(50%): straight, 0.75: hard swing, 0.4: pushed)
     * @returns {dtm.clock}
     */
    clock.swing = function (amt) {
        clock.params.swing = amt || 0.5;
        return clock;
    };

    clock.shuffle = clock.swing;


    /**
     * Randomize the timings of the ticks.
     * @function module:clock#randomize
     * @param amt {number} Amount of randomization per beat (0-1).
     * @returns {dtm.clock}
     */
    clock.randomize = function (amt) {
        clock.params.random = amt || 0;
        return clock;
    };

    clock.random = clock.randomize;
    clock.rand = clock.randomize;

    clock.resetNextBeat = function () {
        clock.beat = 0;
        return clock;
    };

    clock.flush = function () {
        return clock;
    };

    clock.when = function (arr, cb) {
        if (typeof(arr) !== 'undefined') {
            if (arr.indexOf(clock.beat) > -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.notWhen = function (arr, cb) {
        if (typeof(arr) !== 'undefined') {
            if (arr.indexOf(clock.beat) == -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    if (!clock.params.isMaster && typeof(dtm.master) !== 'undefined') {
        dtm.master.clock.add(clock.tickSynced);
    }

    if (typeof(bpm) === 'number') {
        clock.params.bpm = bpm;
        clock.params.sync = false;
    } else if (typeof(bpm) === 'boolean') {
        clock.params.sync = bpm;
    }

    if (typeof(subDiv) !== 'undefined') {
        clock.params.subDiv = subDiv;
    }

    if (typeof(time) !== 'undefined') {
        clock.params.time = time;
    }

    return clock;
};

dtm.c = dtm.clock;
/**
 * @fileOverview The instrument object that makes some complex musical gestures. It can contain multiple models, and be modulated in various ways.
 * @module instr
 */

/**
 * Creates a new instance of dtm.instr object. If given a name, it either creates a new instrument with the name, or loads from the pre-registered instrument model collection.
 * @function module:instr.instr
 * @param [arg] {string|dtm.model}
 * @returns {dtm.instr}
 */
dtm.instr = function (arg) {
    var instr = {
        type: 'dtm.instrument',
        params: {
            name: null,
            isPlaying: false,
            poly: false,

            modDest: [],

            sync: true,
            clock: dtm.clock(true, 8),
            subDivision: 16,

            models: {
                voice: dtm.synth()
            },

            instrModel: null
        }
    };

    /**
     * Sets a model for one of the parameters of the instrument.
     * @function module:instr#model
     * @param model {string|dtm.model|dtm.array}
     * @param [target='any'] {string}
     * @returns {dtm.instr}
     */
    instr.model = function () {
        var arg = arguments[0];
        var categ = 'any'; // TODO: WIP

        if (typeof(arguments[1]) === 'string') {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (arg instanceof Array) {
            if (categ) {
                instr.params.models[categ] = dtm.array(arg);
            } else {
                instr.params.models['any'] = dtm.array(arg);
            }
        } else if (typeof(arg) === 'object') {
            if (arg.type === 'dtm.model') {
                if (arg.params.categ === 'instr') {
                    // CHECK: ...
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    instr.params.models[categ] = arg;
                    instr.params.modDest.push(arg);
                } else if (arg.params.categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                    instr.params.models[arg.params.categ] = arg;
                    instr.params.modDest.push(arg);
                } else if (categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    instr.params.models[categ] = arg;
                    instr.params.modDest.push(arg);
                }

            } else if (arg.type === 'dtm.array') {
                instr.params.models[categ] = arg;
            }
        } else if (typeof(arg) === 'string') {
            var model = _.find(dtm.modelColl, {params: {
                name: arg
            }});

            if (typeof(model) !== 'undefined') {
                if (!categ) {
                    categ = model.params.categ;
                }

                dtm.log('assigning model "' + model.params.name + '" to category "' + categ + '"');
                instr.params.models[categ] = model;
                instr.params.modDest.push(model);
            }
        }

        return instr;
    };

    /**
     * Sets the main voice / WebAudio synthesizer for the instrument.
     * @param arg {string|dtm.synth}
     * @returns {dtm.instr}
     */
    instr.voice = function (arg) {
        if (typeof(arg) === 'string') {
            instr.params.models.voice.set(arg);
        }
        return instr;
    };

    /**
     * Starts performing the instrument.
     * @function module:instr#play
     * @returns {dtm.instr}
     */
    instr.play = function () {
        // can only play single voice / instance
        if (instr.params.isPlaying !== true) {
            instr.params.isPlaying = true;
            dtm.log('playing: ' + instr.params.name);

            if (!instr.params.instrModel) {
                instr.params.clock.add(function defInstr() {
                    var v = instr.params.models.voice;

                    // CHECK: only for dtm.arrays
                    if (typeof(instr.params.models.beats) !== 'undefined') {
                        if (instr.params.models.beats.next()) {
                            if (typeof(instr.params.models.melody) !== 'undefined') {
                                v.nn(instr.params.models.melody.next());
                            }

                            v.play();
                        }
                    } else {
                        //if (typeof(instr.params.models.melody) !== 'undefined') {
                        //    v.nn(instr.params.models.melody.next());
                        //}

                        if (typeof(instr.params.models.pitch) !== 'undefined') {
                            var nn = instr.params.models.pitch.next();
                            nn = dtm.val.rescale(nn, 60, 100, true);
                            v.nn(nn);
                        }

                        v.play();
                    }
                }).start(); // ???
            }

            if (instr.params.instrModel) {
                if (instr.params.instrModel.params.categ === 'instr') {
                    instr.params.instrModel.stop();
                    instr.params.instrModel.play();
                }
            }

            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        }

        return instr;
    };

    instr.start = instr.run = instr.play;

    instr.stop = function () {
        if (instr.params.isPlaying === true) {
            instr.params.isPlaying = false;
            dtm.log('stopping: ' + instr.params.name);

            if (instr.params.instrModel) {
                if (instr.params.instrModel.params.categ === 'instr') {
                    instr.params.instrModel.stop();
                }
            }

            instr.params.clock.stop();
            instr.params.clock.clear();
        }
        return instr;
    };

    instr.clock = function (bpm, subDiv, time) {
        instr.params.clock.bpm(bpm);
        instr.params.clock.subDiv(subDiv);
        return instr;
    };

    instr.bpm = function (val) {
        instr.params.clock.bpm(val);
        return instr;
    };

    instr.tempo = instr.bpm;

    instr.subDiv = function (val) {
        instr.params.clock.subDiv(val);
        return instr;
    };

    instr.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }
        instr.params.clock.sync(bool);
        instr.params.sync = bool;
        return instr;
    };


    /**
     * Modulates the parameter(s) of the instrument.
     * @function module:instr#mod
     * @arg {number}
     * @returns {dtm.instr}
     */
    instr.mod = function () {
        if (typeof(arguments[0]) === 'number') {
            if (arguments.length === 1) {
                var val = arguments[0];
                _.forEach(instr.params.modDest, function (dest) {
                    // MEMO: don't use arguments[n] in forEach
                    dest.mod(val);
                })
            } else {
                _.forEach(arguments, function (val, idx) {
                    if (instr.params.modDest[idx]) {
                        instr.params.modDest[idx].mod(val);
                    }
                })
            }

        } else if (typeof(arguments[0]) === 'string') {
            if (typeof(arguments[1] === 'number') && typeof(instr.params[arguments[0]]) !== 'undefined') {
                instr.params[arguments[0]] = arguments[1]; // CHECK: ???????
            }

        } else if (typeof(arguments[0]) === 'object') {
            var keys = _.keys(arguments[0]);
            console.log(keys);
        }

        return instr;
    };

    instr.modulate = instr.mod;

    instr.map = function (src, dest) {
        // testing w/ array...
        if (src.type === 'dtm.array') {

            // assigning an array here is not so smart...
            instr.params.models[dest] = src.normalize();
        }
        // use global index from the master

        return instr;
    };

    instr.get = function (key) {
        return instr.params[key];
    };

    instr.getModel = function (key) {
        return instr.params.models[key];
    };

    instr.setModel = function (src, dest) {
        instr.params.models[dest] = src;
        return instr;
    };

    instr.clone = function () {
        return instr;
    };

    instr.load = function (arg) {
        if (typeof(arg) === 'string') {
            var model = _.find(dtm.modelColl, {params: {
                name: arg,
                categ: 'instr'
            }});

            if (typeof(model) !== 'undefined') {
                dtm.log('loading instrument model: ' + arg);
                instr.params.instrModel = model;
                instr.params.name = arg;
                //instr.params.models = model.models;
                instr.model(model);
                //instr.play = instr.params.instrModel.play;
                //instr.run = instr.params.instrModel.run;

                // CHECK: not good
                instr.params.modDest.push(model);
            } else {
                dtm.log('registering a new instrument: ' + arg);
                instr.params.name = arg;
                instr.params.categ = 'instr';
                dtm.modelColl.push(instr);
            }

        } else if (typeof(arg) !== 'undefined') {
            if (arg.params.categ === 'instr') {
                instr.params.instrModel = arg; // TODO: check the class name
                instr.model(arg);
            }
        }

        return instr;
    };

    instr.load(arg);

    return instr;
};

dtm.i = dtm.instr;
/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

// TODO: modeling - sharing information...

/**
 * @function module:model.model
 * @param [name] {string} Give it a unique name.
 * @param [categ] {string}
 * @returns a new model instance
 */
dtm.model = function (name, categ) {
    var model = {
        type: 'dtm.model',

        // assigning array or data/coll???
        //array: null,
        //data: null,

        params: {
            name: null,
            categ: 'any',
            categories: [],
            //voice: null
        },

        models: {}
    };

    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        model.params.categ = categ;
        return model;
    };

    model.load = function (name) {
        if (typeof(name) === 'string') {
            var load = _.find(dtm.modelColl, {params: {name: name}});

            if (typeof(load) !== 'undefined') {
                dtm.log('overriding an existing model: ' + name);
                model = load;

            } else {
                if (typeof(categ) === 'string') {
                    model.params.categ = categ;
                }

                dtm.log('registering a new model: ' + name);
                model.params.name = name;
                dtm.modelColl.push(model);
            }
        }

        return model;
    };

    model.mod = function (val) {
        return model;
    };

    //model.get = function (key) {
    //    return model.params[key];
    //};

    model.modulate = model.mod;

    // CHECK: mapping an automatic modulation source???
    model.map = function (arrobj) {

        return model;
    };

    // for instr-type models
    model.start = function () {
        return model;
    };

    model.stop = function () {
        return model;
    };

    model.morphArrays = function (arrObj1, arrObj2, midx) {
        return model;
    };

    model.clone = function () {
        return model;
    };

    model.load(name);

    return model;
};

dtm.m = dtm.model;
/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module synth
 */

/**
 * Creates a new instance of synthesizer object. Wraps WebAudio functions somehow.
 * @function module:synth.synth
 * @param [type='sine'] {string} Choices: 'sine', 'saw', 'square', 'triange', 'noise', 'click', 'sampler', etc...
 * @returns {dtm.synth}
 */
dtm.synth = function (type) {
    var synth = {
        type: 'dtm.synth',

        buffer: null,

        envelope: {
            attack: 0.001,
            decay: 0.001,
            sustain: 1,
            release: 0.001
        },

        params: {
            type: 'sine',
            isPlaying: false,
            gain: 0.5,

            duration: 1,

            freq: 440,
            noteNum: 69,

            adsr: [0.001, 0.2, 0, 0.001],

            detune: {
                isOn: false,
                amount: 0,
                spread: 0
            },

            lpf: {
                isOn: false,
                cof: 4000,
                res: 1
            },

            delay: {
                isOn: false,
                amount: 0,
                time: 0.3,
                sync: false,
                note: 6,
                feedback: 0.3,
                stereo: false
            },

            verb: {
                isOn: false,
                amount: 0
            },

            comb: {
                isOn: false,
                amount: 0,
                nn: 69
            }
        },

        /**
         * A JavaScript promise object with play() function extended. Used for the audio sample loading.
         * @name module:synth#promise
         * @type {object}
         */
        promise: null
    };

    var noise = makeNoise(8192);

    /**
     * Sets the ADSR envelope for the main amplitude.
     * @function module:synth#adsr
     * @param attack {number} Attack time in seconds.
     * @param decay {number} Decay time in seconds.
     * @param sustain {number} Sustain level between 0-1.
     * @param release {number} Release time in seconds.
     * @returns {dtm.synth}
     */
    synth.adsr = function () {
        // TODO: take indiv values OR array

        if (typeof(arguments) !== 'undefeined') {
            synth.params.adsr[0] = arguments[0] || 0.001;
            synth.params.adsr[1] = arguments[1] || 0.001;
            synth.params.adsr[2] = arguments[2];
            synth.params.adsr[3] = arguments[3] || 0.001;
        }

        return synth;
    };

    /**
     * Loads an audio sample eaither from a URL, an ArrayBuffer, or Webaudio buffer data. When loading from URL or un-decoded ArrayBuffer, it will return a promise object which passes the dtm.synth object to the callback with decoded buffer being loaded. You could call the play() function directly on the promise, but the timing of the playback is not guaranteed as immediate. If given a WebAudio buffer, it returns the dtm.synth object. It will also set the current synth type to 'sampler'.
     * @function module:synth#load
     * @param arg {string|arraybuffer|buffer}
     * @param [cb] {function}
     * @returns {promise | dtm.synth}
     */
    synth.load = function (arg, cb) {
        synth.params.type = 'sampler';

        if (arg.constructor.name === 'AudioBuffer') {
            synth.buffer = arg;
            return synth;
        } else {
            var promise = new Promise(function (resolve, reject) {
                if (typeof(arg) === 'string') {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', arg, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            actx.decodeAudioData(xhr.response, function (buf) {
                                synth.buffer = buf;
                                resolve(synth);

                                if (typeof(cb) !== 'undefined') {
                                    cb(buf);
                                }
                            });
                        }
                    };

                    xhr.send();
                } else if (arg.constructor.name === 'ArrayBuffer') {
                    actx.decodeAudioData(arg, function (buf) {
                        synth.buffer = buf;
                        resolve(synth);

                        if (typeof(cb) !== 'undefined') {
                            cb(synth);
                        }
                    });
                } else if (arg instanceof Array) {
                    var buf = actx.createBuffer(1, arg.length, dtm.sr);
                    var content = buf.getChannelData(0);
                    _.forEach(content, function (val, idx) {
                        content[idx] = arg[idx];
                    });

                    synth.buffer = buf;
                    resolve(synth);

                    if (typeof(cb) !== 'undefined') {
                        cb(synth);
                    }
                }
            });

            promise.play = function () {
                promise.then(function (s) {
                    s.play();
                });
            };

            synth.promise = promise;
            return promise;
        }
    };

    /**
     * Starts playing the dtm.synth object.
     * @function module:synth#play
     * @param [del=0] {number} Delay in seconds for the playback.
     * @param [dur] {number} Duration of the playback in seconds.
     * @returns {dtm.synth}
     */
    synth.play = function (del, dur) {
        del = del || 0;
        dur = dur || synth.params.duration;

        var startT = now() + del;
        var src;

        //var noise = makeNoise();

        if (synth.params.type === 'noise') {
            src = actx.createBufferSource();
            src.buffer = noise;
            src.loop = true;
        } else if (synth.params.type === 'sampler') {
            src = actx.createBufferSource();
            src.buffer = synth.buffer;
            src.playbackRate = 1;
            src.loop = false;
        } else if (synth.params.type === 'click') {
            src = actx.createBufferSource();
            var buf = actx.createBuffer(1, 2, dtm.sr);
            var contents = buf.getChannelData(0);
            contents[1] = 1;
            src.buffer = buf;
            src.playbackRate = 1;
            src.loop = false;
        } else {
            src = actx.createOscillator();
            src.frequency.setValueAtTime(synth.params.freq, startT);
        }

        switch (synth.params.type) {
            case 'sine':
                src.type = 'sine';
                break;
            case 'saw':
                src.type = 'sawtooth';
                break;
            case 'square':
                src.type = 'square';
                break;
            case 'triange':
                src.type = 'triangle';
                break;
            default:
                break;
        }

        var amp = actx.createGain();

        if (synth.params.lpf.isOn) {
            var lpf = actx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.setValueAtTime(synth.params.lpf.cof, startT);
            lpf.Q.setValueAtTime(synth.params.lpf.res, startT);
            src.connect(lpf);
            lpf.connect(amp);
        } else {
            src.connect(amp);
        }

        if (synth.params.comb.isOn) {
            var comb = actx.createDelay();
            comb.delayTime.setValueAtTime(1/dtm.val.mtof(synth.params.comb.nn), startT);

            var combAmp = actx.createGain();
            combAmp.gain.setValueAtTime(synth.params.comb.amount, startT);

            var combFb = actx.createGain();
            combFb.gain.setValueAtTime(0.95, startT);

            amp.connect(comb);
            comb.connect(combAmp);
            comb.connect(combFb);
            combFb.connect(comb);
            combAmp.connect(out());
        }

        if (synth.params.delay.isOn) {
            var delay = actx.createDelay();
            delay.delayTime.setValueAtTime(synth.params.delay.time, startT);

            var delAmp = actx.createGain();
            delAmp.gain.setValueAtTime(synth.params.delay.amount, startT);

            var delFb = actx.createGain();
            delFb.gain.setValueAtTime(synth.params.delay.feedback, startT);

            amp.connect(delay);
            delay.connect(delAmp);
            delay.connect(delFb);
            delFb.connect(delay);
            delAmp.connect(out());
        }

        // TODO: not chaning the effects...
        if (synth.params.verb.isOn) {
            var verb = actx.createConvolver();
            verb.buffer = dtm.buffs.verbIr;

            var verbAmp = actx.createGain();
            verbAmp.gain.setValueAtTime(synth.params.verb.amount, startT);

            amp.connect(verb);
            verb.connect(verbAmp);
            verbAmp.connect(out());
        }

        amp.connect(out());

        var susLevel = synth.params.adsr[2] * synth.params.gain;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(synth.params.gain, startT, synth.params.adsr[0]);
        amp.gain.setTargetAtTime(susLevel, startT+synth.params.adsr[0], synth.params.adsr[1]);

        var relStart = startT + synth.params.adsr[0] + synth.params.adsr[1] + dur;
        amp.gain.setTargetAtTime(0, relStart, synth.params.adsr[3]);

        src.start(startT);
        src.stop(relStart + synth.params.adsr[3] + 0.3);

        return synth;
    };

    synth.run = function () {
        return synth;
    };

    synth.stop = function (del) {
        del = del || 0;
        return synth;
    };

    /**
     * Sets the MIDI note number to be played.
     * @function module:synth#nn
     * @param nn {integer}
     * @returns {dtm.synth}
     */
    synth.nn = function (nn) {
        nn = nn || 69;

        synth.params.noteNum = nn;
        synth.params.freq = dtm.value.mtof(nn);

        return synth;
    };

    /**
     * Sets the frequency of the note to be played.
     * @function module:synth#freq
     * @param freq {number}
     * @returns {dtm.synth}
     */
    synth.freq = function (freq) {
        synth.params.freq = freq;
        return synth;
    };

    /**
     * Sets the amplitude of the note.
     * @function module:synth#amp
     * @param val {number} Amplitude between 0-1.
     * @returns {dtm.synth}
     */
    synth.amp = function (val) {
        synth.params.gain = val;
        return synth;
    };

    /**
     * Sets the duration for the each note.
     * @function module:synth#dur
     * @param val {number} Duration in seconds.
     * @returns {dtm.synth}
     */
    synth.dur = function (val) {
        synth.params.duration = val;
        return synth;
    };

    synth.attr = function (obj) {
        var keys = _.keys(obj);

        _.forEach(keys, function (key) {
            if (typeof(synth[key]) !== 'undefined') {
                synth[key] = obj[key];
            }
        });

        return synth;
    };

    synth.attack = function (val) {
        synth.params.adsr[0] = val;
        return synth;
    };

    synth.decay = function (val) {
        synth.params.adsr[1] = val;
        return synth;
    };

    synth.sustain = function (val) {
        synth.params.adsr[2] = val;
        return synth;
    };

    synth.release = function (val) {
        synth.params.adsr[3] = val;
        return synth;
    };

    synth.atk = synth.attack;
    synth.dcy = synth.decay;
    synth.sus = synth.sustain;
    synth.rel = synth.release;

    /**
     * Applies a Low Pass Filter.
     * @param cof {number} Cutoff Frequency in Hz.
     * @param res {number} Q or resonance level.
     * @returns {dtm.synth}
     */
    synth.lpf = function (cof, res) {
        synth.params.lpf.isOn = true;
        synth.params.lpf.cof = cof || 4000;
        synth.params.lpf.res = res || 1;
        return synth;
    };

    /**
     * Applies a reverb to the voice.
     * @function module:synth#verb
     * @param amt {number} 0-1
     * @returns {dtm.synth}
     */
    synth.verb = function (amt) {
        synth.params.verb.isOn = true;
        synth.params.verb.amount = amt;
        return synth;
    };

    /**
     * Same as synth.verb().
     * @function module:synth#reverb
     * @type {Function}
     */
    synth.reverb = synth.verb;

    // TODO: stereo mode
    /**
     * Applies a feedback delay.
     * @function module:synth#delay
     * @param amt {number} The amount or amplitude of the delay (0-1).
     * @param [time=0.3] {number} Delay time in seconds.
     * @param [fb=0.3] {number} Feedback amount in 0-1.
     * @param [stereo=false] {boolean} Stereo switch.
     * @returns {dtm.synth}
     */
    synth.delay = function (amt, time, fb, stereo) {
        synth.params.delay.isOn = true;
        synth.params.delay.amount = amt || 0;
        synth.params.delay.time = time || 0.3;
        synth.params.delay.feedback = fb || 0.3;
        synth.params.delay.stereo = stereo || false;

        return synth;
    };

    /**
     * Applies a resonating comb filter.
     * @param amt
     * @param nn
     * @returns {dtm.synth}
     */
    synth.comb = function (amt, nn) {
        synth.params.comb.isOn = true;
        synth.params.comb.amount = amt || 0;
        synth.params.comb.nn = nn || 69;
        return synth;
    };

    /**
     * Sets the wavetable or mode of the dtm.synth.
     * @function module:synth#set
     * @param type {string|array} Choices: sine, saw, square, triangle, noise, click, sampler
     * @returns {dtm.synth}
     */
    synth.set = function (type) {
        switch (type) {
            case 'sin':
            case 'sine':
                synth.params.type = 'sine';
                break;
            case 'saw':
            case 'sawtooth':
                synth.params.type = 'saw';
                break;
            case 'sq':
            case 'square':
                synth.params.type = 'square';
                break;
            case 'tri':
            case 'triangle':
                synth.params.type = 'triangle';
                break;
            case 'wn':
            case 'noise':
                synth.params.type = 'noise';
                break;
            case 'click':
                synth.params.type = 'click';
                break;
            case 'sampler':
                synth.params.type = 'sampler';
                break;
            default:
                break;
        }

        return synth;
    };

    synth.type = synth.wt = synth.set;
    synth.set(type);

    return synth;
};

dtm.s = dtm.syn = dtm.synth;

function makeNoise(bufLen) {
    bufLen = bufLen || 4192;

    var buffer = actx.createBuffer(1, bufLen, dtm.sr);
    var contents = buffer.getChannelData(0);

    _.forEach(_.range(bufLen), function (idx) {
        contents[idx] = _.random(-1, 1, true);
    });

    return buffer;
}

function makeIr(decay) {
    var bufLen = Math.round(decay * dtm.sr) || dtm.sr;

    var buffer = actx.createBuffer(2, bufLen, dtm.sr);
    var left = buffer.getChannelData(0);
    var right = buffer.getChannelData(1);

    var exp = 10;
    _.forEach(_.range(bufLen), function (idx) {
        left[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen-idx)/bufLen, exp), -1, 1);
        right[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen-idx)/bufLen, exp), -1, 1);
    });

    return buffer;
}

dtm.makeIr = makeIr;
dtm.buffs = {
    verbIr: dtm.makeIr(2)
};

///**
// * @fileOverview WebAudio helper functions...
// * @module synth
// */

dtm.synth2 = {
    type: 'dtm.synth2',

    osc: function osc(amp, freq, wt) {
        amp = amp || 1;
        freq = freq || 440;
        wt = wt || 'sine';

        var src = actx.createOscillator();
        var gain = actx.createGain();

        var osc = {
            src: src,
            amp: gain,
            play: function () {
                osc.src.start(now());
                osc.src.stop(now() + 1);
            },
            getGainNode: function () {
                return osc.amp;
            }
        };

        osc.src.connect(osc.amp);
        osc.amp.connect(actx.destination);
        osc.amp.gain.value = amp;

        if (typeof(freq) === 'number') {
            osc.src.frequency.value = freq;
        } else {
            // TODO: this won't let you set the base frequency

            freq.getGainNode().disconnect();
            freq.getGainNode().connect(osc.src.frequency);
            freq.play();
        }

        return osc;
    },

    noise: function noise(bufLen) {
        bufLen = bufLen || 4192;

        var buffer = actx.createBuffer(1, bufLen, actx.sampleRate);
        var contents = buffer.getChannelData(0);

        _.forEach(_.range(bufLen), function (idx) {
            contents[idx] = _.random(-1, 1, true);
        });

        return buffer;
    },


    // FIXME: not working
    bufferSource: function (src, amp) {
        src = actx.createBufferSource();
        amp = actx.createGain();
        src.connect(amp);
        amp.connect(out());
        src.loop = true;

        return [src, amp];
    },

    sine: function () {

    },

    adsr: function () {

    }
};


/**
 * @fileOverview Data streaming object. This will be interfacing / querying the streamed data at the server.
 * @module stream
 */

dtm.stream = function () {
    var stream = {
        type: 'dtm.stream'
    };

    stream.query = function (url, cb) {
        //cb();

        ajaxGet(url, function (res) {
            cb();
            console.log(res);
        });
    };

    stream.connect = function () {
        return stream;
    };

    stream.disconnect = function () {
        return stream;
    };

    return stream;
};

dtm.str = dtm.stream;

function runningAvg() {

}

function capture(len, cb) {

}
///**
// * @fileOverview A voice is an instance of musical model. It is used to make actual sounds.
// * @module voice
// */

///**
// * Creats a new instance of voice, using the existing model name (string) or a model object.
// *
// * @function module:voice.voice
// * @param name {string|object}
// * @returns {object} a new voice
// */
dtm.voice = function (arg) {
    var voice = {
        type: 'dtm.voice',

        ///**
        // * @name module:voice#model
        // * @type {object}
        // */
        model: null,
        modelName: null, // TODO: this is maybe redundant

        transposition: 0,
        scale: [],
        clock: dtm.clock(),

        master: dtm.master
    };

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            // TODO: maybe should assign model to the field instead
            voice.modelName = arg;

            // TODO: hmm
            voice.model = _.find(dtm.modelCol, {name: voice.modelName});

        } else {
            voice.model = arg;
            voice.modelName = arg.name;
        }
    }


    ///**
    // * @function module:voice#getModel
    // * @returns {object} model
    // */
    voice.getModel = function () {
        return voice.model;
    };

    // CHECK: maybe this is redundant
    ///**
    // * @function module:voice#getModelName
    // * @returns {string} model name
    // */
    voice.getModelName = function () {
        return voice.modelName;
    };



    var verbLen = 44100 * 0.3;
    var ir = actx.createBuffer(1, verbLen, 44100);
    _.forEach(ir, function (val, idx) {
        ir.getChannelData(0)[idx] = _.random(-1, 1, true) * (verbLen-idx) / verbLen;
    });
    var verb = actx.createConvolver();
    verb.buffer = ir;

    voice.sendVerb = function (fVal) {
        return voice;
    };

    voice.setDelay = function (fVal) {
        return voice;
    };

    // TODO: maybe fix this redundancy
    if (voice.modelName !== null) {
        ///**
        // * @function module:voice#play
        // * @param [nn]
        // */
        voice.play = function (nn) {
            return _.find(dtm.modelCol, {name: voice.modelName}).play(nn);
        };

        ///**
        // * @function module:voice#run
        // * @param [clock]
        // * @returns {Object}
        // */
        voice.run = function (clock) {
            if (typeof(clock) === 'undefined') {
                clock = voice.clock;
            }
            _.find(dtm.modelCol, {name: voice.modelName}).run(clock);
            return voice.model;
        };

        ///**
        // * @function module:voice#modulate
        // * @param val
        // * @returns {*}
        // */
        voice.modulate = function (val) {
            return _.find(dtm.modelCol, {name: voice.modelName}).modulate(val);
        };

        voice.getParentClock = function () {
            return _.find(dtm.modelCol, {name: voice.modelName}).getParentClock();
        };

        voice.addParentClock = function (pCl) {
            console.log('test');
            _.find(dtm.modelCol, {name: voice.modelName}).addParentClock(pCl);
        };

        //voice.motif = voice.model.motif;
    }

    voice.clone = function () {
        // CHECK: this may not work, use constructor instead
        return dtm.clone(voice);
    };

    dtm.master.numActiveModels += 1;
    dtm.master.totalComplexity += _.find(dtm.modelCol, {name: voice.modelName}).complexity;
    dtm.master.voices.push(voice);

    return voice;
};

dtm.v = dtm.voice;
/**
 * @fileOverview Singleton master (conductor) module. Wants to oversee and control everything, but not quite there yet.
 * @module master
 */

dtm.master = {
    type: 'dtm.master',

    params: {
        data: null,
        index: 0,

        level: 0.5,
        mute: false,

        tempo: 120,
        time: [4, 4],

        beat: 0,
        measure: 0,
        section: 0,

        scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        cummulatedRhythm: null,

        transposition: 0,
        chord: null,
        tonalFunc: null,

        numSynthVoices: 0
    },


    /**
     * Total complexity thing.
     * @name module:master#totalComplexity
     * @type {integer}
     */
    totalComplexity: 0,
    complexityLimit: 10,
    numActiveModels: 0, // or active voices??

    activeInstrs: [],
    voices: [],
    numVoices: 0,
    models: [],

    /**
     * Returns the master clock (singleton).
     * @function module:master#clock
     * @returns clock {object}
     */
    clock: dtm.clock(60, 480).sync(false),

    start: function () {
        return dtm.master;
    },

    /**
     * Stops and deletes all the running clock.
     * @function module:master#stop
     */
    stop: function () {
        _.forEach(dtm.clocks, function (c) {
            c.stop();
            c.clear();
            //_.forEach(c, function (d) {
            //    d.callbacks = [];
            //})
        });

        _.forEach(dtm.master.activeInstrs, function (i) {
            i.stop();
        });

        dtm.clocks = [];
        dtm.master.voices = [];

        dtm.master.activeInstrs = [];
    },

    /**
     * Transpose all the voices that are synced to the master.
     * @function module:master#transpose
     * @param val
     * @returns {*}
     */
    transpose: function (val) {
        dtm.master.transposition = val;
        return dtm.master;
    },

    /**
     * Pitch quantize all the voices that are synced to the master.
     * @function module:master#pq
     * @returns {*}
     */
    pq: function () {
        var scale;

        if (arguments.length === 0) {
            scale = _.range(12);
        } else if (typeof(arguments[0]) === 'array') {
            scale = arguments[0];
        } else if (typeof(arguments[0]) === 'string') {
            scale = dtm.scales[arguments[0].toLowerCase()];
        } else {
            scale = arguments;
        }

        dtm.master.scale = scale;

        // TODO: update all the voices as well?

        return dtm.master;
    },

    data: function (d) {
        if (typeof(d) !== 'undefined') {
            dtm.master.params.data = d;
        }

        return dtm.master;
    },

    form: function () {

    },

    model: function () {
        return dtm.master;
    },

    get: function (arg) {
        var out;

        switch (arg) {
            case 'index':
                out = dtm.master.params.index;
                break;
            default:
                out = null;
                break;
        }
        return out;
    },

    state: null,

    reset: null
};

dtm.master.clock.params.isMaster = true;
dtm.master.clock.start();
dtm.guido = function () {
    var guido = {
        tupe: 'dtm.guido',
        parts: [],
        numParts: 1
    };

    guido.pc = {
        '-1': '_',
        'r': '_',
        0: 'c',
        1: 'd&',
        2: 'd',
        3: 'e&',
        4: 'e',
        5: 'f',
        6: 'f#',
        7: 'g',
        8: 'a&',
        9: 'a',
        10: 'b&',
        11: 'b'
    };

    guido.setup = function () {
        return guido;
    };

    guido.format = function () {
        return guido;
    };

    guido.test = function (arr) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = [guido.pc[_.random(-1, 11)], '*', val + '/16'].join('');
        });

        res = res.join(' ');
        console.log(res);

        return guido;
    };

    guido.meow = function (rhythm, pitches) {
        var res = [];

        for (var i = 0; i < rhythm.length; i++) {
            if (pitches[i] instanceof Array) {
                var chord = [];
                _.forEach(pitches[i], function (val, idx) {
                    chord[idx] = [guido.pc[val], '*', rhythm[i] + '/16'].join('');
                });
                res[i] = '{' + chord.join(', ') + '}';
            } else {
                res[i] = [guido.pc[pitches[i]], '*', rhythm[i] + '/16'].join('');
            }
        }

        res = res.join(' ');
        console.log(res);
        return guido;
    };

    return guido;
};
dtm.inscore = function () {
    var inscore = {
        type: 'dtm.inscore',
        oscPort: {}
    };

    inscore.setup = function () {
        inscore.oscPort = new osc.WebSocketPort({
            url: 'ws://localhost:8081'
        });

        inscore.oscPort.open();

        return inscore;
    };

    inscore.test = function (beats) {
        var seq = [];
        var pattern = [];

        // 4/4, 8th notes, 1 measure
        for (var i = 0; i < beats.length; i++) {
            var foo;

            if (dtm.value.mod(i, 2) === 0) {
                var down, up;
                down = beats[i];
            } else {
                up = beats[i];
                pattern = [down, up].join(', ');

                switch (pattern) {
                    case '1, 0':
                        seq.push('a/4');
                        break;
                    case '1, 1':
                        seq.push('a/8');
                        seq.push('a/8');
                        break;
                    case '0, 0':
                        seq.push('_/4');
                        break;
                    case '0, 1':
                        seq.push('_/8');
                        seq.push('a/8');
                        break;
                    default:
                        break;
                }
            }
        }

        seq = seq.join(' ');

        //for (var i = 0; i < 5; i++) {
        //    seq[i] = String.fromCharCode("a".charCodeAt(0) + Math.floor((Math.random() * 8)));
        //}

        //seq = seq.join(' ');

        inscore.oscPort.send({
            address: '/ITL/scene/score',
            args: ['write', seq]
        });

        return inscore;
    };

    inscore.write = function (input) {
        inscore.oscPort.send({
            address: '/ITL/scene/score',
            args: ['write', input]
        });

        return inscore;
    };

    return inscore;
};
(function () {
    var m = dtm.model('rhythm', 'rhythm');

    var defIntervals = [4, 4, 4, 4];
    var div = 16;

    m.set = function (arr) {
        defIntervals = arr;
        return m;
    };

    m.get = function () {
        return defIntervals;
    };
})();
(function () {
    var m = dtm.model('chord', 'chord');

    //m.params = {
    //    key: null
    //};

    m.get = function () {
        return [0, 4, 7, 11];
    };
})();
(function () {
    var m = dtm.model('scale', 'scale');

    var scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    m.get = function () {
        return scale;
    };

    m.set = function (arr) {
        scale = arr;
        return m;
    };

    m.reset = function () {
        scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return m;
    };
})();
(function () {
    var m = dtm.model('phrase', 'phrase');

    m.rhythm = dtm.model('rhythm');
    m.scale = dtm.model('scale');

    m.models = {
        scale: m.scale
    };
})();
(function () {
    var m = dtm.model('instr', 'instr');

    m.play = function () {
        console.log('playing!');
        return m;
    };

    m.stop = function () {
        return m;
    };
})();
(function () {
    var m = dtm.model('form', 'form');
});
(function () {
    var m = dtm.model('song', 'song');

    m.models = {
        form: dtm.model('form')
    };

    m.run = function () {
        return m;
    };

})();
// a synthetic scale model for generic models.scales
(function () {
    // CHECK: how to inherit from the scale model?
    var m = dtm.model('synthetic', 'scale');

    // tetra chords
    var tc = [[1, 2, 2], [2, 1, 2], [2, 2, 1]];

    m.params.upper = 0;
    m.params.lower = 0;
    m.params.scale = [0, 2, 4, 5, 7, 9, 11];

    m.mod = function (lower, upper) {
        // expect the inputs to be in the range of 0-1
        lower = Math.round(lower * 2);
        upper = Math.round(upper * 2);

        m.params.scale[0] = 0;

        for (var i = 0; i < 3; i++) {
            m.params.scale[i+1] = m.params.scale[i] + tc[lower][i];
        }

        m.params.scale[4] = 7;

        for (var j = 0; j < 2; j++) {
            m.params.scale[j+5] = m.params.scale[j+4] + tc[upper][j];
        }

        return m;
    };

    m.get = function () {
        return m.params.scale;
    };
})();



})();