(function () {

/**
 * @fileOverview
 * @module core
 */

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

    logger: true,
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

    clone: clone
};

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
}


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
}

function loadBuffer(arrayBuf) {
    var buffer = {};
    actx.decodeAudioData(arrayBuf, function (buf) {
        buffer = buf;
    })

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
/**
 * @fileOverview Data streaming object. This will be interfacing / querying the streamed data at the server.
 * @module stream
 */

dtm.stream = function () {
    var stream = {};

    stream.query = function (url, cb) {
        //cb();

        ajaxGet(url, function (res) {
            cb();
            console.log(res);
        });
    };

    return stream;
};


function runningAvg() {

}

function capture(len, cb) {

}
/**
 * @fileOverview Analyze a thing or two about an array. Singleton.
 * @module analyzer
 */

dtm.analyzer = {
    className: 'dtm.analyzer',

    /**
     * Checks the data type of the input array.
     * @function module:analyzer#checkType
     * @param arr {array}
     * @returns type {string}
     */
    checkType: function (arr) {
        var sum = _.reduce(arr, function (num, sum) {
            num + sum;
        });

        if (typeof(sum) === 'string') {
            if (!isNaN(sum)) {
                if (sum.toString().indexOf('.') > -1) {
                    return 'float';
                } else {
                    return 'int';
                }
            } else {
                return 'string';
            }
        } else {
            return 'number';
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

    median: function (arr) {

    },

    midrange: function (arr) {

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
    className: 'dtm.transform',

    /**
     * Generates values for a new array.
     * @function module:transform#generate
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param len {integer}
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
            len = 2;
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


    sort: function (arr) {

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
        })
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
        })
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
        })
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
        })
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
        })
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

dtm.transform.abs = dtm.transform.fwr;

function morphFixed (srcArr, tgtArr, morphIdx) {
    if (typeof(morphIdx) === 'undefined') {
        morphIdx = 0.5;
    }

    var newArr = [];

    _.forEach(srcArr, function (val, idx) {
        newArr[idx] = (tgtArr[idx] - val) * morphIdx + val;
    });

    return newArr;
};

dtm.tr = dtm.transform;
/**
 * @fileOverview Single dimensional array with built-in transformation functions.
 * @module array
 */

// TODO: check if return is a new instance after chaining...
/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.array can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:array.array
 * @param arr {array}
 * @param [name] {string}
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.array = function (arr, name) {
    var array = {
        className: 'dtm.array',

        /**
         * The name of the array object.
         * @name module:array#name
         * @type {string}
         */
        name: '', // or key?

        /**
         * Numerical values of the array.
         * @name module:array#value
         * @type {array}
         */
        value: [],
        values: [],

        /**
         * Numerical values of the array rescaled to 0-1.
         * @name module:array#normalized
         * @type {array}
         */
        normalized: [],

        /**
         * Value type of the array object.
         * @name module:array#type
         * @type {string}
         */
        type: null, // int, float, string, coll, mixed, date

        /**
         * Length of the array.
         * @name module:array#length
         * @type {integer}
         */
        length: null,

        /**
         * Minimum value of the array.
         * @name module:array#min
         * @type {number}
         */
        min: null,

        /**
         * Maximum value of the array.
         * @name module:array#max
         * @type {number}
         */
        max: null,

        /**
         * Mean value of the array.
         * @name module:array#mean
         * @type {number}
         */
        mean: null,

        /**
         * Standard deviation.
         * @name module:array#std
         * @type {number}
         */
        std: null,

        /**
         * The most frequent value or class.
         * @name module:array#mode
         */
        mode: null,

        /**
         * When the data type is nominal / string, the string values are stored in this.
         * @name module:array#classes
         * @type array
         */
        classes: null,

        /**
         * Number of occurances per class.
         * @name module:array#histogram
         */
        histogram: null,
        numClasses: null,

        colls: null,

        index: 0,
    };

    //array.avg = array.mean;

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

        array.value = input;
        array.values = input;

        // CHECK: type checking - may be redundant
        checkType(input);

        if (array.type === 'number' || array.type === 'int' || array.type === 'float') {
            _.forEach(array.value, function (val, idx) {
                array.value[idx] = Number.parseFloat(val);
            });

            array.normalized = dtm.transform.normalize(input);
            array.min = dtm.analyzer.min(input);
            array.max = dtm.analyzer.max(input);
            array.mean = dtm.analyzer.mean(input);
            array.std = dtm.analyzer.std(input);
            array.mode = dtm.analyzer.mode(input);
        }

        if (array.type === 'string') {
            histo();
            array.mode = dtm.analyzer.mode(array.classes);
        }

        array.length = input.length;

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#setName
     * @param name {string}
     * @returns {dtm.array}
     */
    array.setName = function (name) {
        array.name = name.toString();
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
                array.type = 'collection';
            } else {
                array.type = typeof(arr[0]);
            }
        } else {
            array.type = 'number';
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
        array.classes = _.clone(array.value);
        array.histogram = _.countBy(array.value);
        //array.numClasses =

        _.forEach(array.classes, function (val, idx) {
            array.value[idx] = array.histogram[val];
        });

        array.set(array.value);
        array.type = 'string'; // re-set the type to string from number... hacky!

        return array;
    };

    /**
     * Returns a clone of the array object. It can be used when you don't want to reference the same array object from different places.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        // this doesn't work
        //return dtm.clone(array);

        var newArr = dtm.array(array.value, array.name);
        if (array.type === 'string') {
            newArr.classes = array.classes;
            newArr.histogram = _.clone(array.histogram);
            newArr.type = 'string';
        }
        return newArr;
    };


    // CHECK: is this only for the array ojbect?
    /**
     * Fills the contents of the array with
     * @function module:array#fill
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=2] {integer}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.fill = function (type, len, min, max) {
        array.value = dtm.transform.generate(type, len, min, max);
        array.set(array.value);
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
        array.value = dtm.transform.normalize(array.value, min, max);
        array.set(array.value);
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
        array.value = dtm.transform.rescale(array.value, min, max);
        array.set(array.value);
        return array;
    };

    /**
     * Same as array.rescale().
     * @function module:array#range
     * @type {Function}
     */
    array.range = array.rescale;

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
        array.set(dtm.transform.add(array.value, val));
        return array;
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param val {number}
     * @returns {dtm.array}
     */
    array.mult = function (val) {
        array.set(dtm.transform.mult(array.value, val));
        return array;
    };

    /**
     * Flips the array contents horizontally.
     * @function module:array#mirror
     * @returns {dtm.array}
     */
    array.mirror = function () {
        array.value = dtm.transform.mirror(array.value);
        array.set(array.value);
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
        array.value = dtm.transform.invert(array.value, center);
        array.set(array.value);
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
        array.value = dtm.transform.shuffle(array.value);
        array.set(array.value);
        return array;
    };

    array.concat = function () {
        return array;
    };

    array.repeat = function () {
        return array;
    };

    array.truncate = function () {
        return array;
    };

    /**
     * Rounds float values of the array to integer values.
     * @function module:array#round
     * @returns {dtm.array}
     */
    array.round = function () {
        array.value = dtm.transform.round(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:array#floor
     * @returns {dtm.array}
     */
    array.floor = function () {
        return array.set(dtm.transform.floor(array.value));
    };

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:array#ceil
     * @returns {dtm.array}
     */
    array.ceil = function () {
        return array.set(dtm.transform.ceil(array.value));
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {integer}
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        array.value = dtm.transform.shift(array.value, amount);
        array.set(array.value);
        return array;
    };

    /**
     * Scales the array with an exponential curve.
     * @function module:array#expCurve
     * @param factor {number}
     * @returns {dtm.array}
     */
    array.expCurve = function (factor) {
        var min = array.min;
        var max = array.max;
        var arr = dtm.transform.expCurve(array.normalized, factor);
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
        var min = array.min;
        var max = array.max;
        var arr = dtm.transform.logCurve(array.normalized, factor);
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
        //var newVal = dtm.transform.fit(array.value, len, interp);
        //delete array;
        //return dtm.array(newVal);

        array.value = dtm.transform.fit(array.value, len, interp);
        array.set(array.value);
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
        array.value = dtm.transform.stretch(array.value, factor, interp);
        array.set(array.value);
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
            if (tgtArr.className === 'dtm.array') {
                tgtArr = tgtArr.value;
            }
        }
        array.value = dtm.transform.morph(array.value, tgtArr, morphIdx);
        array.set(array.value);
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
        array.value = dtm.transform.notesToBeats(array.value, resolution);
        array.set(array.value);
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
        array.value = dtm.transform.beatsToNotes(array.value, resolution);
        array.set(array.value);
        return array;
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        array.value = dtm.transform.intervalsToBeats(array.value);
        array.set(array.value);
        return array;
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        array.value = dtm.transform.beatsToIntervals(array.value);
        array.set(array.value);
        return array;
    };

    array.beatsToIndices = function () {
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
        } else if (typeof(arguments[0]) === 'array') {
            scale = arguments[0];
        } else if (typeof(arguments[0]) === 'string') {
            scale = dtm.scales[arguments[0].toLowerCase()];
        } else {
            scale = arguments;
        }
        return array.set(dtm.transform.pq(array.value, scale));
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
        array.set(dtm.transform.hwr(array.value));
        return array;
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr
     * @returns {dtm.array}
     */
    array.fwr = function () {
        array.set(dtm.transform.fwr(array.value));
        return array;
    };

    /**
     * Same as the array.fwr() function.
     * @function module:array#abs
     * @returns {dtm.array}
     */
    array.abs = array.fwr;

    /**
     * A shorthand for iterating through the array values. For more details and other iteration methods, please check the dtm.iterator.
     * @param [param='value'] {string}
     * @returns {value}
     */
    array.next = function (param) {
        if (typeof(param) === 'undefined') {
            param = 'value'
        }
        var out = array[param][array.index];
        array.index = dtm.value.mod(array.index + 1, array.length);
        return out;
    };

    return array;
}

dtm.a = dtm.array;
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
        className: 'dtm.collection',
        keys: [],
        types: [],
        values: []
    };

    coll.set = function () {

    };

    coll.update = function () {

    };

    coll.map = function () {

    };

    return coll;
}

dtm.coll = dtm.collection;

// TODO: transformation module for this???
/**
 * @fileOverview Utility functions for single value input. Singleton.
 * @module value
 */

dtm.value = {
    className: 'dtm.value',

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
     * Scale or pitch-quantizes the input value to the given scale.
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
}

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
        className: 'dtm.iterator',

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
        modIdx: [],
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

            if (input.className === 'dtm.array') {
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

        iter.idx = dtm.value.mod(idx + val, iter.array.length);
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
dtm.iter = dtm.iterator;
dtm.i = dtm.iterator;
/**
 * @fileOverview Parses random stuff. Singleton.
 * @module parser
 */

dtm.parser = {
    className: 'dtm.parser',

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
        })

        return types;
    },

    // CHECK: this only works w/ json...
    getSize: function (json) {
        var col = _.size(json[0]); // header
        var row = _.size(json);
        return [col, row];
    }
}
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
        className: 'dtm.data',

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
        size: {},

        /**
         * This can be used for promise callback upon loading data.
         * @name module:data#promise
         * @type {object}
         */
        promise: null
    }

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
                            data.keys = _.keys(data.coll[0]);
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
                            data.keys = _.keys(data.coll[0]);
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

        return data.promise;
    };

    data.jsonp = function (url, cb) {
        data.promise = new Promise(function (resolve, reject) {
            var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            window[cbName] = function (res) {
                delete window[cbName];
                document.body.removeChild(script);
                var keys = _.keys(res);
                _.forEach(keys, function (val) {
                    if (val !== 'response') {
                        data.coll = res[val];
                        data.keys = _.keys(data.coll[0]);
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
        });

        return data.promise;
    };

    data.set = function (res) {
        data.coll = res;
        data.keys = _.keys(data.coll[0]);
        setArrays();
        setTypes();
        setSize();
    };

    function setArrays() {
        _.forEach(data.keys, function (key) {
            var a = dtm.array(_.pluck(data.coll, key), key);
            data.arrays[key] = a;
        })
    }

    function setTypes() {
        _.forEach(data.keys, function (key) {
            data.types[key] = data.arrays[key].type;
        })
    }

    function setSize() {
        data.size.cols = data.keys.length;
        data.size.rows = data.coll.length;
    }

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

// TODO: a subclock system that follows master's tempo / ticks

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
        className: 'dtm.clock',

        subDiv: 4,
        interval: 1,

        time: [4, 4],
        beat: 0,

        list: [],

        params: {
            isOn: false,
            bpm: 60,
            random: 0,
            swing: 50
        },

        // CHECK: just for debugging
        callbacks: []
    };

    clock.params.tempo = clock.params.bpm;

    // assign input arguments...
    _.forEach(arguments, function (val, idx) {
        switch (idx) {
            case 0: clock.params.bpm = val; break;
            case 1: clock.subDiv = val; break;
        }
    });

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
        }
        if (typeof(subDiv) !== 'undefined') {
            clock.subDiv = subDiv;
        }

        return clock;
    }

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param num {number} BPM value
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

    clock.setSubDiv = function (val) {
        val = val | 4;
        clock.subDiv = val;
        return clock;
    };

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
     * @param [beats] {array} Sequence of beat numbers (int) on which the callback function should be called. The default is the every beat.
     * @returns {dtm.clock} self
     */
    clock.add = function (cb, beats) {
        if (arguments.length == 1) {
            beats = _.range((clock.subDiv * clock.time[0] / clock.time[1]));
        }
//        if (_.findKey(cb, 'modelName')) {
//            cb.addParentClock(clock); // CHECK: risky
//        }
//
//        console.log(_.findKey(cb, 'modelName'));

        clock.callbacks.push([cb, beats]);
        return clock;
    };

//    clock.addToBeats = function (cb, iArr) {
//        callbacks.push([cb, iArr]);
//        return clock;
//    };

    /**
     * Starts the clock.
     * @function module:clock#start
     * @returns {dtm.clock} self
     */
    clock.start = function (timeErr) {
        if (clock.params.isOn !== true) {
            clock.params.isOn = true;
            clock.tick();

            dtm.clocks.push(clock);
        }
        return clock;
    };

    clock.run = clock.start;
    clock.play = clock.start;

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
            clockSrc = actx.createBufferSource();
            clockSrc.buffer = clockBuf;
            clockSrc.connect(out());

            var freq = clock.params.bpm / 60.0 * (clock.subDiv / 4.0);
//            var pbRate = 1/(1/freq - Math.abs(timeErr));

            clockSrc.playbackRate.value = freq * clMult;
            clockSrc.playbackRate.value += clockSrc.playbackRate.value * (clock.params.random / 100) * _.sample([1, -1]);

            if (clock.beat % 2 == 0) {
                clockSrc.playbackRate.value *= (100 - clock.params.swing) / 50;
            } else {
                clockSrc.playbackRate.value *= clock.params.swing / 50;
            }

            clockSrc.start(now() + 0.0000001);

            clockSrc.onended = function () {
                curTime += 1/freq;
                var error = now() - curTime;
                clock.tick(error);
//                curTime = now();
            };

            _.forEach(clock.callbacks, function (cb) {
                if (_.indexOf(cb[1], clock.beat) > -1) {
                    cb[0](clock);
                }
            });

            clock.beat = (clock.beat + 1) % (clock.subDiv * clock.time[0] / clock.time[1]);
        }

        return clock;
    };

    /**
     * Stops the clock.
     * @function module:clock#stop
     * @returns {dtm.clock} self
     */
    clock.stop = function () {
        if (clock.params.isOn === true) {
            clock.params.isOn = false;
        }
        return clock;
    };

    clock.clear = function () {
        clock.callbacks = [];
        return clock;
    }

    // TODO: use -1to1 ratio than %
    /**
     * Applies swing to the every 2nd beat. (E.g. The 2nd 16th note in a 8th note interval).
     * @function module:clock#swing
     * @param [amt=50] {number} Percentage of swing. (E.g. 50%: straight, 75%: hard swing, 40%: pushed)
     * @returns {dtm.clock}
     */
    clock.swing = function (amt) {
        clock.params.swing = amt || 50;
        return clock;
    };

    clock.shuffle = clock.swing;


    // TODO: use 0to1 ratio than %
    /**
     * Randomize the timings of the ticks.
     * @function module:clock#randomize
     * @param amt {number} Percentage of randomization per beat.
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

    return clock;
};
dtm.instr = function (arg) {
    var instr = {
        className: 'dtm.instrument',
        params: {
            name: null,
            isPlaying: false,
            //poly: false,

            modDest: [],
            clock: dtm.clock(),
            sync: false
        },

        instrModel: null,
        models: {},
        modelList: []
    };

    instr.model = function () {
        var arg = arguments[0];
        var categ = null; // TODO: WIP

        if (typeof(arguments[1]) === 'string') {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (typeof(arg) === 'object') {
            //console.log(_.find(arg, {params: categ}));
            if (arg.params.categ === 'instr') {

            } else if (categ) {
                dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                instr.models[categ] = arg;
                instr.params.modDest.push(arg);
            } else if (arg.params.categ !== 'any') {
                dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                instr.models[arg.params.categ] = arg;
                instr.params.modDest.push(arg);
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
                instr.models[categ] = model;
                instr.params.modDest.push(model);
            }
        }

        return instr;
    };

    instr.load = instr.model;

    instr.play = function () {
        // can only play single voice / instance
        if (instr.params.isPlaying !== true) {
            instr.params.isPlaying = true;
            dtm.log('playing: ' + instr.params.name);

            if (instr.instrModel.params.categ === 'instr') {
                instr.instrModel.stop();
                instr.instrModel.play();
            }

            instr.params.clock.start(); // ???


            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        }

        return instr;
    };

    instr.stop = function () {
        if (instr.params.isPlaying === true) {
            instr.params.isPlaying = false;

            if (instr.instrModel.params.categ === 'instr') {
                instr.instrModel.stop();
            }

            instr.params.clock.stop();
        }
        return instr;
    };

    //instr.beats = function (model) {
    //    instr.params.beats = model;
    //    return instr;
    //};

    instr.clock = function () {
        return instr;
    };

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

    instr.get = function (key) {
        return instr.params[key];
    };

    instr.clone = function () {

    };

    if (typeof(arg) === 'string') {
        var model = _.find(dtm.modelColl, {params: {
            name: arg,
            categ: 'instr'
        }});

        if (typeof(model) !== 'undefined') {
            dtm.log('loading instrument model: ' + arg);
            instr.instrModel = model;
            instr.params.name = arg;
            instr.models = model.models;
            //instr.play = instr.instrModel.play;
            //instr.run = instr.instrModel.run;
            //instr.mod = instr.instrModel.mod;
        } else {
            dtm.log('registering a new instrument: ' + arg);
            instr.params.name = arg;
            instr.params.categ = 'instr';
            dtm.modelColl.push(instr);
        }

    } else if (typeof(arg) !== 'undefined') {
        instr.instrModel = arg; // TODO: check the class name
    }

    instr.start = instr.play;
    instr.run = instr.play;

    return instr;
};
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
        className: 'dtm.model',

        // assigning array or data/coll???
        array: null,
        data: null,

        params: {
            name: null,
            categ: 'any',
            categories: [],
            voice: null
        }
    };

    model.categ = function (categ) {
        // CHECK: how can I re-register?
        model.params.categ = categ;
        return model;
    };

    model.load = function () {
        return model;
    };

    model.mod = function (val) {
        return model;
    };

    model.get = function (key) {
        return model.params[key];
    };

    model.modulate = model.mod;

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

    model.clone = function () {
        return model;
    };

    return model;
};
dtm.model2 = function (name) {
    var model = {
        className: 'dtm.model2',

        /**
         * @name module:model#name
         * @type {string}
         */
        name: null,

        /**
         * Whether if the model is synced to the master.
         * @name module:model#sync
         * @type {boolean}
         */
        sync: true,
        clock: null,
        data: null,
        parent: null,
        complexity: 0,
        motif: {
            pitches: dtm.array(),
            beats: dtm.array()
        },

        // CHECK: there might be multiple
        parentClock: null,

        master: dtm.master,

        params: {
            scale: _.range(12)
        }
    };

    // ???
    if (arguments.length) {
        model.name = name;
    }

    /**
     * @function module:model#setName
     * @param name {string}
     * @returns {dtm.model}
     */
    model.setName = function (name) {
        model.name = name;
        return model;
    };

    /**
     * @function module:model#play
     * @param nn
     * @returns {dtm.model}
     */
    model.play = function (nn) {
        console.log('play() function is not implemented!');
        return model;
    };

    /**
     * @function module:model#run
     * @param clock
     * @returns {dtm.model}
     */
    model.run = function (clock) {
        console.log('run() funciton is not implemented!');
        return model;
    };

    /**
     * @function module:model#stop
     * @returns {dtm.model}
     */
    model.stop = function () {
        return model;
    };

    // TODO: should add to a list
    model.addParentClock = function (pClock) {
        model.parentClock = pClock;
        return model;
    };

    model.getParentClock = function () {
        return model.parentClock;
    };

    model.extend = function () {
        return model;
    };

    model.inherit = function () {
        return model;
    };

    model.scale = function () {
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

        model.params.scale = scale;

        return model;
    };

    model.load = function (name) {
        return model;
    };

    model.clone = function () {
        // increment the num of active models?
        return model;
    };

    // registers the model to the model collection
    dtm.modelColl.push(model);
    return model;
};
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
        className: 'dtm.synth',

        type: 'sine',
        isPlaying: false,
        gain: 0.5,

        buffer: null,

        freq: 440,
        noteNum: 69,

        //adsr: [0, 0, 1, 0],
        // temp
        atk: 0.001,
        dcy: 0.2,
        sus: 0,
        rel: 0.001,

        envelope: {
            attack: 0.001,
            decay: 0.001,
            sustain: 1,
            release: 0.001,
        },

        params: {
            duration: 1,

            adsr: [],

            detune: {
                isOn: false,
                amount: 0,
                spread: 0
            },

            lpf: {
                isOn: false,
                cof: 4000,
                res: 1,
            },

            delay: {
                isOn: false,
                amount: 0,
                time: 0.3,
                feedback: 0.3,
                stereo: false
            },

            comb: {
                isOn: false,
                amount: 0,
                nn: 69,
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
            synth.atk = arguments[0] || 0.001;
            synth.dcy = arguments[1] || 0.001;
            synth.sus = arguments[2];
            synth.rel = arguments[3] || 0.001;
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
        synth.type = 'sampler';

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
                    var buf = actx.createBuffer(1, arg.length, actx.sampleRate);
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
        };
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

        if (synth.type === 'noise') {
            src = actx.createBufferSource();
            src.buffer = noise;
            src.loop = true;
        } else if (synth.type === 'sampler') {
            src = actx.createBufferSource();
            src.buffer = synth.buffer;
            src.playbackRate = 1;
            src.loop = false;
        } else if (synth.type === 'click') {
            src = actx.createBufferSource();
            var buf = actx.createBuffer(1, 2, actx.sampleRate);
            var contents = buf.getChannelData(0);
            contents[1] = 1;
            src.buffer = buf;
            src.playbackRate = 1;
            src.loop = false;
        } else {
            src = actx.createOscillator();
            src.frequency.setValueAtTime(synth.freq, startT);
        }

        switch (synth.type) {
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

        amp.connect(out());

        var susLevel = synth.sus * synth.gain;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(synth.gain, startT, synth.atk);
        amp.gain.setTargetAtTime(susLevel, startT+synth.atk, synth.dcy);

        var relStart = startT + synth.atk + synth.dcy + dur;
        amp.gain.setTargetAtTime(0, relStart, synth.rel);

        src.start(startT);
        src.stop(relStart + synth.rel + 0.3);

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
        synth.noteNum = nn;
        synth.freq = dtm.value.mtof(nn);

        return synth;
    };

    /**
     * Sets the amplitude of the note.
     * @function module:synth#amp
     * @param val {number} Amplitude between 0-1.
     * @returns {dtm.synth}
     */
    synth.amp = function (val) {
        synth.gain = val;
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
        synth.atk = val;
        return synth;
    };

    synth.decay = function (val) {
        synth.dcy = val;
        return synth;
    };

    synth.sustain = function (val) {
        synth.sus = val;
        return synth;
    };

    synth.release = function (val) {
        synth.rel = val;
        return synth;
    };

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

    synth.reverb = function () {
        return synth;
    };

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

    switch (type) {
        case 'sine':
            synth.type = 'sine';
            break;
        case 'saw':
        case 'sawtooth':
            synth.type = 'saw';
            break;
        case 'sq':
        case 'square':
            synth.type = 'square';
            break;
        case 'tri':
        case 'triangle':
            synth.type = 'triangle';
            break;
        case 'wn':
        case 'noise':
            synth.type = 'noise';
            break;
        case 'click':
            synth.type = 'click';
            break;
        case 'sampler':
            synth.type = 'sampler';
            break;
        default:
            break;
    }

    return synth;
};

dtm.syn = dtm.synth;
dtm.s = dtm.synth;

function makeNoise(bufLen) {
    bufLen = bufLen || 4192;

    var buffer = actx.createBuffer(1, bufLen, actx.sampleRate);
    var contents = buffer.getChannelData(0);

    _.forEach(_.range(bufLen), function (idx) {
        contents[idx] = _.random(-1, 1, true);
    });

    return buffer;
}
///**
// * @fileOverview WebAudio helper functions...
// * @module synth
// */

dtm.synth2 = {
    className: 'dtm.synth2',

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
 * @fileOverview A voice is an instance of musical model. It is used to make actual sounds.
 * @module voice
 */

/**
 * Creats a new instance of voice, using the existing model name (string) or a model object.
 *
 * @function module:voice.voice
 * @param name {string|object}
 * @returns {object} a new voice
 */
dtm.voice = function (arg) {
    var voice = {
        className: 'dtm.voice',

        /**
         * @name module:voice#model
         * @type {object}
         */
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


    /**
     * @function module:voice#getModel
     * @returns {object} model
     */
    voice.getModel = function () {
        return voice.model;
    };

    // CHECK: maybe this is redundant
    /**
     * @function module:voice#getModelName
     * @returns {string} model name
     */
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
        /**
         * @function module:voice#play
         * @param [nn]
         */
        voice.play = function (nn) {
            return _.find(dtm.modelCol, {name: voice.modelName}).play(nn);
        };

        /**
         * @function module:voice#run
         * @param [clock]
         * @returns {Object}
         */
        voice.run = function (clock) {
            if (typeof(clock) === 'undefined') {
                clock = voice.clock;
            }
            _.find(dtm.modelCol, {name: voice.modelName}).run(clock);
            return voice.model;
        };

        /**
         * @function module:voice#modulate
         * @param val
         * @returns {*}
         */
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
    className: 'dtm.master',

    params: {
        data: null
    },

    level: 0.5,
    mute: false,

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

    numSynthVoices: 0,

    /**
     * Returns the master clock (singleton).
     * @function module:master#clock
     * @returns clock {object}
     */
    clock: dtm.clock(120, 96).start(),
    tempo: 60,
    time: [4, 4],
    beat: 0,

    // or just call plain "beat", etc.
    curBeat: 0,
    curMeasure: 0,
    curSection: 0,

    scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    cummulatedRhythm: null,

    transposition: 0,
    chord: null,
    tonalFunc: null,

    start: function () {

    },

    // TODO: not clearing the clocks passed from a voice to model
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
    },

    form: function () {

    },

    state: null,

    reset: null
};

(function () {
    var m = dtm.model('clave', 'beats');

    m.source = dtm.tr.itob([3, 3, 4, 2, 4]);
    m.target = dtm.tr.itob([2, 1, 2, 1]);
    m.midx = 0.9;
    m.beats = dtm.array(dtm.tr.morph(m.source, m.target, m.midx));

    m.mod = function (val) {
        m.midx = val;
        m.beats.set(dtm.tr.morph(m.source, m.target, m.midx));
    };

    m.next = function () {
        return m.beats.round().next();
    };

})();
(function () {
    var m = dtm.model2('single-note');

    m.complexity = 1;

    m.play = function (nn) {
        var osc = actx.createOscillator();
        var amp = actx.createGain();

        osc.connect(amp);
        amp.connect(out());

        osc.frequency.value = dtm.val.mtof(nn);
        osc.start(now());
        osc.stop(now() + 0.15);

        var del = actx.createDelay();
        del.delayTime.setValueAtTime(.25, 0);

        var delAmp = actx.createGain();
        delAmp.gain.setValueAtTime(.22, 0);

        amp.connect(del);
        del.connect(delAmp);
        delAmp.connect(del);
        delAmp.connect(out());

        amp.gain.value = 0.2;
        amp.gain.setTargetAtTime(0, now(), 0.1);

        return m;
    }
})();
(function () {
    var m = dtm.model2('short-noise');

    m.complexity = 2;

    var buffer = dtm.synth2.noise(4192);

    var seq = [1, 0.2, 0.5, 0.2];
    var seqIdx = 0;

    var freq = 3000;
    m.setFreq = function (val) {
        freq = val;
    };

    m.play = function () {
        var src = actx.createBufferSource();
        var hpf = actx.createBiquadFilter();
        var amp = actx.createGain();

        src.connect(hpf);
        hpf.connect(amp);
        amp.connect(out());

        var startTime = now();

        src.buffer = buffer;
        src.loop = true;
        src.start(startTime);
        src.stop(startTime + 0.5);

        hpf.type = 'highpass';
        hpf.frequency.value = freq;

        amp.gain.value = 0.1 * seq[seqIdx];
        amp.gain.setTargetAtTime(0, startTime + 0.001, 0.022);

        seqIdx = (seqIdx + 1) % seq.length;

        return m;
    };
    
    m.modulate = function () {
        
    }
})();
(function () {
    var m = dtm.model2('nice-chords');
    m.complexity = 5;

    var numVoices = 2;
    m.modulate = function (val) {
        numVoices = Math.round(val * 6) + 2;
    };

    var scale = [0, 2, 4, 7, 11];

    m.test = function () {
        return m;
    };

    // make it inheritable...
    m.setScale = function (arr) {
        scale = arr;
        return m;
    };

    m.play = function () {
        var amp = actx.createGain();
        var nn = Math.round(Math.random() * 30 + 60);
        var dur = 2;

//        var cd = m.master();

        var arr = [0, 1];
        for (var i = 0; Math.round(i < Math.random() * 13); i++) {
            arr.push(Math.random());
        }
        var real = new Float32Array(arr);
        var img = real;
        var timbre = actx.createPeriodicWave(real, img);

        for (var i = 0; i < numVoices; i++) {
            var osc = [];
            osc[i] = actx.createOscillator();
            osc[i].connect(amp);

            osc[i].frequency.setValueAtTime(mtof(pitchQ(nn + 3 * i, scale)), now());
            osc[i].setPeriodicWave(timbre);

            osc[i].start(now());
            osc[i].stop(now() + dur * .9);
        }

        amp.connect(out());

        var delta = 0.2;
        amp.gain.value = 0;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(0.15, now() + .001, dur - delta);
        amp.gain.setTargetAtTime(0, now() + dur - delta, delta);


        var del = actx.createDelay();
        del.delayTime.setValueAtTime(.3, 0);

        var delAmp = actx.createGain();
        delAmp.gain.setValueAtTime(.8, 0);

        amp.connect(del);
        del.connect(delAmp);
        delAmp.connect(del);
        delAmp.connect(out());

        return m;
    };

//    m.setTimbre(m.timbre());
})();
(function () {
    var m = dtm.model2('rhythm-seq');
    m.complexity = 2;

    var buffer = dtm.synth2.noise(4192);

    var motif = {};
    motif.seq = [1, 0.2, 0.5, 0.2];
    motif.seqIdx = 0;

    var freq = 3000;
    m.setFreq = function (val) {
        freq = val;
    };

    m.play = function () {
        var src = actx.createOscillator();
        var amp = actx.createGain();
        src.connect(amp);
        amp.connect(out());

        src.frequency.setValueAtTime(1000, now());
        src.frequency.linearRampToValueAtTime(50, now() + 0.01);
        amp.gain.vlaue = 0.5;
        amp.gain.linearRampToValueAtTime(0, now() + 0.01);

        src.start(now());
        src.stop(now() + 0.01);
    }

    m.run = function () {
        var pCl = m.getParentClock();
        console.log(pCl.bpm);

        return m;
    }

})();
(function () {
    var m = dtm.model2('sampler');
    m.complexity = 2;

    m.loop = false;

    var buffer = actx.createBuffer(1, 1000, 44100);

    // testing promise right here
    m.loadBuffer = function (arrBuf) {
//        buffer = loadBuffer(arrBuf);
        return new Promise(function (resolve, reject) {
            actx.decodeAudioData(arrBuf, function (buf) {
                buffer = buf;
                resolve(buffer);
            });
        });

//        return m;
    };

    m.play = function () {
        var src = actx.createBufferSource();
        var amp = actx.createGain();
        src.connect(amp);
        amp.connect(out());

        src.buffer = buffer;
        src.loop = m.loop;

        amp.gain.value = 0.5;

        src.start(now());

        return m;
    };
})();
(function () {
    var m = dtm.model2('clave-instr');
    m.complexity = 1;

    var darr = dtm.transform;

    m.motif.beats = darr.itob([3, 3, 4, 2, 4]);
    m.motif.target = darr.itob([2, 1, 2, 1]);
    m.motif.midx = 0;

    var cl = dtm.clock(80);
    cl.setSubDiv(16);
    cl.setTime('2/4');

    var noise = dtm.synth2.noise(4192);

    m.run = function () {
        var idx = 0;

        cl.add(function () {
            var src = actx.createBufferSource();
            var amp = actx.createGain();
            src.connect(amp);
            amp.connect(out());
            src.buffer = noise;
            src.loop = true;

            m.motif.morphed = darr.morph(m.motif.beats, m.motif.target, m.motif.midx);

            if (idx >= m.motif.morphed.length) {
                idx = 0;
            }

            amp.gain.setValueAtTime(0.5 * dtm.value.expCurve(m.motif.morphed[idx], 20), now());
            amp.gain.linearRampToValueAtTime(0, now() + 0.02);

            src.start(now());

            idx = (idx + 1) % m.motif.morphed.length;
        });

        cl.start();
    };

    m.modulate = function (val) {
        m.motif.midx = val;
    };

    return m;
})();
(function () {
    var m = dtm.model2();

    var noise = dtm.synth2.noise(8192);

    m.play = function () {

    }
})();
(function () {
    var m = dtm.model2('tamborim');

    var c = dtm.clock(440, 48);

    m.motif = {
        original: dtm.array([1, 1, 1, 1]).fit(48, 'zeros'),
        target: dtm.array([1, 0, 1, 1, 1, 0]).fit(48, 'zeros'),
        midx: 0
    };

    //m.morphed = dtm.transform.morph(m.motif.original, m.motif.target, m.motif.midx);

    var idx = 0;

    m.run = function () {
        c.add(function () {
            m.morphed = dtm.transform.morph(m.motif.original.value, m.motif.target.value, m.motif.midx);

            if (idx >= m.morphed.length) {
                idx = idx - m.morphed.length;
            }

            //c.bpm(120 + m.motif.midx * 60);
            //var delay = (1 - m.morphed[idx]) * 1 / c.params.bpm / m.morphed.length;

            if (m.morphed[idx] == 1) {
                dtm.syn().decay(0.05).play();
            }

            idx++;
            //console.log(m.morphed);
        }).start();

        return m;
    };

    m.modulate = function (val) {
        m.motif.midx = val;
        return m;
    };

    return m;
})();
(function () {
    var i  = dtm.instr('silly-melody'); // ????

    //var m  = dtm.model('silly-melody').categ('instr');

    i.models = {
        pitches: dtm.array([0, 4, 7, 11, 12, 11, 7, 4]).add(72),
        beats: dtm.array([1, 0, 1])
    };

    var c = dtm.clock(120, 16);

    i.play = function () {
        c.add(function () {
            //console.log(i.models.beats);
            var s = dtm.synth().nn(i.models.pitches.next());
            s.amp(i.models.beats.next() * 0.5).play();

        }).start();

        return i;
    };

    i.stop = function () {
        c.stop();
        return i;
    }
})();
})();