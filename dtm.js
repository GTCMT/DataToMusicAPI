(function () {

/**
 * @fileOverview
 * @module core
 */

// TODO: load WebAudio on demand
/* Shared WebAudio Stuff */
//var actx = new (window.AudioContext || window.webkitAudioContext)();
//var now = function () { return actx.currentTime; };
//var out = function () { return actx.destination; };
//var clMult = 0.01;
//var clockBuf = actx.createBuffer(1, Math.round(actx.sampleRate * clMult), actx.sampleRate);

var params = {
    isLogging: false
};

/**
 * Returns the singleton dtm object.
 * @name module:core#dtm
 * @type {object}
 */
var dtm = {
    version: '0.0.1',

    log: function (arg) {
        if (params.isLogging) {
            console.log(arg);
        }
    },

    //instrColl: [],
    //activeInstrs: [],

    modelColl: [],
    clocks: [],

    params: {},

    // TODO: a function to list currently loaded objects, such as data, arrays, models... - for console livecoding situation

    ///**
    // * Returns the name of available models
    // * @function getModelNames
    // * @returns {Array}
    // */
    getModelNames: function () {
        return _.pluck(dtm.modelColl, 'name');
    },

    //ajaxGet: ajaxGet,
    //jsonp: jsonp,
    //clone: clone,

    start: function () {

    },

    get: function (param) {
        switch (param) {
            case 'models':
                return dtm.modelColl;
            case 'modelNames':
                var res = [];
                _.forEach(dtm.modelColl, function (m) {
                    res.push(m.get('name'));
                });
                return res;
            default:
                return null;
        }
    },

    //getAudioContext: function () {
    //    return actx
    //},

    //sampleRate: actx.sampleRate,
    //sr: actx.sampleRate,

    wa: {},

    startWebAudio: function () {
        dtm.wa.actx = new (window.AudioContext || window.webkitAudioContext)();
        dtm.wa.now = function () { return dtm.wa.actx.currentTime; };
        dtm.wa.out = function () { return dtm.wa.actx.destination; };
        dtm.wa.clMult = 0.01;
        dtm.wa.clockBuf = dtm.wa.actx.createBuffer(1, Math.round(dtm.wa.actx.sampleRate * dtm.wa.clMult), dtm.wa.actx.sampleRate);

        dtm.wa.makeNoise = function makeNoise(bufLen) {
            var actx = dtm.wa.actx;

            bufLen = bufLen || 4192;

            var buffer = actx.createBuffer(1, bufLen, dtm.wa.actx.sampleRate);
            var contents = buffer.getChannelData(0);

            _.forEach(_.range(bufLen), function (idx) {
                contents[idx] = _.random(-1, 1, true);
            });

            return buffer;
        };

        dtm.wa.makeIr = function makeIr(decay) {
            var actx = dtm.wa.actx;

            var bufLen = Math.round(decay * dtm.wa.actx.sampleRate) || dtm.wa.actx.sampleRate;

            var buffer = actx.createBuffer(2, bufLen, dtm.wa.actx.sampleRate);
            var left = buffer.getChannelData(0);
            var right = buffer.getChannelData(1);

            var exp = 10;
            _.forEach(_.range(bufLen), function (idx) {
                left[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen-idx)/bufLen, exp), -1, 1);
                right[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen-idx)/bufLen, exp), -1, 1);
            });

            return buffer;
        };

        dtm.wa.buffs = {
            verbIr: dtm.wa.makeIr(2)
        };
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
    var params = {};
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
        if (dtm.analyzer.checkType(arr) === 'string') {
            dtm.log('cannot get the min value of a string array');
            return null;
        } else {
            return _.min(arr);
        }
    },

    /**
     * Returns the maximum value of numeric array.
     * @function module:analyzer#max
     * @param arr {number}
     * @returns {T}
     */
    max: function (arr) {
        if (dtm.analyzer.checkType(arr) === 'string') {
            dtm.log('cannot get the max value of a string array');
            return null;
        } else {
            return _.max(arr);
        }
    },

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

        if (type === 'string') {
            dtm.log('cannot get the miean value of a string array');
            return null;
        } else {
            var sum = _.reduce(arr, function (num, sum) {
                return num + sum;
            });

            return sum / _.size(arr);
        }
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

    histo: function (input) {
        var res = [];
        var classes = _.clone(input);
        var histogram = _.countBy(input);

        _.forEach(classes, function (val, idx) {
            res[idx] = histogram[val];
        });

        return res;
    },

    classes: function (input) {
        return _.uniq(input).sort();
    },

    uniformity: function (input) {
        return dtm.analyzer.classes(input).length / input.length;
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

    /* GENERTORS */

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

                max = max || 1;

                for (var i = 0; i < len; i++) {
                    res[i] = i * max + min;
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
            case 'rand':
                for (var i = 0; i < len; i++) {
                    res[i] = _.random(min, max, true);
                }
                break;

            case 'randi':
                for (var i = 0; i < len; i++) {
                    res[i] = _.random(min, max);
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

            case 'constant':
            case 'const':
                min = min || 0;
                for (var i = 0; i < len; i++) {
                    res[i] = min;
                }
                break;

            default:
                break;
        }

        return res;
    },


    /* SCALERS */

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

        var denom = 1;

        if (max == min) {
            if (min > 0 && min <= 1) {
                min = 0;
            } else if (min > 1) {
                min -= 1;
            }
        } else {
            denom = max - min;
        }

        var newArr = _.map(arr, function (val) {
            return (val - min) / denom;
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

    limit: function (arr, min, max) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            var temp = val;
            if (temp < min) {
                temp = min;
            }
            if (temp > max) {
                temp = max;
            }
            res[idx] = temp;
        });

        return res;
    },

    /* ARITHMETIC */

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

    powof: function (arr, factor) {
        var res = [];

        _.forEach(arr, function (val, idx) {
            res[idx] = Math.pow(factor, val);
        });

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
    },

    /* LIST OPERATIONS */

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
        //return arr.sort();
        return _.sortBy(arr, function (val) {
            return val;
        });
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

    getBlock: function (arr, start, size, wrap) {
        var res = [];
        var idx = 0;

        // TODO: non-wrapping zero-padded version
        for (var i = 0; i < size; i++) {
            idx = dtm.val.mod(i + start, arr.length);
            res[i] = arr[idx];
        }

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

    pq: function (input, scale, round) {
        var res = [];
        _.forEach(input, function (val, idx) {
            res[idx] = dtm.value.pq(val, scale, round);
        });

        return res;
    },

    unique: function (input) {
        return _.uniq(input);
    },

    classId: function (input) {
        var res = [];
        var sortedClasses = dtm.analyzer.classes(input).sort();
        var classIds = {};

        _.forEach(sortedClasses, function (val, id) {
            classIds[val] = id;
        });

        _.forEach(input, function (val, idx) {
            res[idx] = classIds[val];
        });

        return res;
    },

    stringify: function (input) {
        var res = [];
        _.forEach(input, function (val, idx) {
            res[idx] = val.toString();
        });

        return res;
    }

    //getClasses: function (input) {
    //    return _.clone()
    //
    //}
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
dtm.array = function (val, name) {
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

        index: 0,
        step: 1
    };

    // public
    var array = {
        type: 'dtm.array'
    };

    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string|number}
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
                case 'name':
                case 'key':
                    return params.name;

                case 'type':
                    return params.type;
                
                case 'len':
                case 'length':
                    return params.length;


                /* STATS */
                case 'minimum':
                case 'min':
                    return dtm.analyzer.min(params.value);

                case 'maximum':
                case 'max':
                    return dtm.analyzer.max(params.value);

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


                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return params.value[params.index];

                case 'next':
                    params.index = dtm.value.mod(params.index + params.step, params.length);
                    return params.value[params.index];

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

                case 'step':
                case 'stepSize':
                    return params.step;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'block':
                case 'window':
                    var start, size;
                    if (arguments[1] instanceof Array) {
                        start = arguments[1][0];
                        size = arguments[1][1];
                        return dtm.transform.getBlock(params.value, start, size)
                    } else if (typeof(arguments[1]) === 'number' && typeof(arguments[2]) === 'number') {
                        start = arguments[1];
                        size = arguments[2];
                        return dtm.transform.getBlock(params.value, start, size);
                    } else {
                        return params.value;
                    }

                // TODO: incomplete
                case 'blockNext':
                    params.index = dtm.value.mod(params.index + params.step, params.length);
                    return dtm.transform.getBlock(params.value, params.index, arguments[1]);

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
     * @param input {array}
     * @param [name] {string}
     * @returns {dtm.array}
     */
    array.set = function (input, name) {
        if (input instanceof Array) {
            params.value = input;
        } else if (input.type === 'dtm.array') {
            params.value = input.get();
        }

        if (params.original === null) {
            params.original = params.value;
        }

        // CHECK: type checking - may be redundant
        checkType(params.value);

        if (params.type === 'number' || params.type === 'int' || params.type === 'float') {
            _.forEach(params.value, function (val, idx) {
                params.value[idx] = Number.parseFloat(val);
                //params.value[idx] = val;
            });

            params.normalized = dtm.transform.normalize(input);
            params.min = dtm.analyzer.min(input);
            params.max = dtm.analyzer.max(input);
            params.mean = dtm.analyzer.mean(input);
            params.std = dtm.analyzer.std(input);
        }

        params.length = params.value.length;

        if (typeof(name) !== 'undefined') {
            array.setName(name);
        }

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

    array.name = array.setName;

    array.setType = function (arg) {
        params.type = arg.toString();
        return array;
    };

    // TODO: do this in array.set()
    if (typeof(val) !== 'undefined') {
        if (typeof(val) === 'string') {
            val = val.split('');
        } else if (typeof(val) === 'number') {
            val = [val];
        }

        checkType(val);
        array.set(val, name);
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

    array.step = function (val) {
        params.step = Math.round(val);
        return array;
    };

    array.stepSize = array.step;

    array.index = function (val) {
        params.index = dtm.value.mod(Math.round(val), params.length);
        return array;
    };

    array.setIndex = array.index;



    /* GENERATORS */

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
     * Returns a clone of the array object. It can be used when you don't want to reference the same array object from different places.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        // this doesn't work
        //return dtm.clone(array);

        var newArr = dtm.array(params.value, params.name);

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
    array.d = array.dup = array.duplicate = array.c = array.copy = array.clone;

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
     * Retrieves the original values from when the array object was first created.
     * @function module:array#reset
     * @returns {dtm.array}
     */
    array.reset = function () {
        array.set(params.original);
        return array;
    };

    array.original = array.reset;



    /* SCALERS */

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

    array.nml = array.normalize;

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

    /**
     * Caps the array value range at the min and max values. Only works with a numerical array.
     * @function module:array#limit
     * @param [min=0]
     * @param [max=1]
     * @returns {*}
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

    array.exp = array.expCurve;

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

    array.log = array.logCurve;

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

    array.summarize = function () {
        return array;
    };



    /* LIST OPERATIONS*/

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

    array.slice = array.truncate;

    /**
     *
     * @function module:array#getBlock
     * @param start {number} Starting index of the array.
     * @param size {number}
     * @returns {dtm.array}
     */
    array.getBlock = function (start, size) {
        start = start || 0;
        size = size || params.length;
        return array.set(dtm.transform.getBlock(params.value, start, size))
    };

    array.block = array.getBlock;

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
    array.rev = array.reverse = array.mirror;

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
    array.flip = array.inv =  array.invert;

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
    array.rand = array.randomize = array.shuffle;


    /* ARITHMETIC */

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
     * Applys the array contents as the power to the argument as the base
     * @param val
     * @returns {dtm.array}
     */
    array.powof = function (val) {
        return array.set(dtm.transform.powof(params.value, val));
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



    /* NOMINAL */

    /**
     * Generates a histogram from a nominal array, such as the string type.
     * @function module:array#histo
     * @returns {dtm.array}
     */
    array.histo = function () {
        array.set(dtm.analyzer.histo(params.value));

        // CHECK: this is hacky
        params.type = 'string'; // re-set the type to string from number

        return array;
    };

    array.histogram = array.histo;

    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:array#unique
     * @returns {dtm.array}
     */
    array.unique = function () {
        array.set(dtm.transform.unique(params.value));
        return array;
    };

    array.uniq = array.unique;

    // TODO: id by occurrence / rarity, etc.
    array.classId = function (by) {
        return array.set(dtm.transform.classId(params.value));
    };

    array.class = array.classify = array.classId;

    array.stringify = function () {
        return array.set(dtm.transform.stringify(params.value));
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

    /* MUSICAL */

    // CHECK: this is different from the trnsf function
    /**
     * Pitch quantize the array values.
     * @function module:array#pq
     * @param {array | string}
     * @returns {dtm.array}
     */
    array.pq = function (scale, round) {
        if (arguments.length === 0) {
            scale = _.range(12);
        } else if (scale instanceof Array) {

        } else if (typeof(scale) === 'string') {
            scale = dtm.scales[scale.toLowerCase()];
        }

        return array.set(dtm.transform.pq(params.value, scale, round));
    };

    array.pitchScale = array.pitchQuantize = array.pq;

    array.transpose = function (val) {
        return array;
    };



    /* UNIT CONVERTERS */

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
     * Shorthand for notesToBeats() function.
     * @function module:array#ntob
     * @param resolution {integer}
     * @returns {dtm.array}
     */
    array.ntob = array.notesToBeats;

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
     * Shorthand for beatsToNotes() function.
     * @function module:array#bton
     * @param resolution {integer}
     * @returns {dtm.array}
     */
    array.bton = array.beatsToNotes;

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
     * Shorthand for intevalsToBeats() function.
     * @function module:array#itob
     * @returns {dtm.array}
     */
    array.itob = array.intervalsToBeats;

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
     * Shorthand for beatsToIntervals() function.
     * @function module:array#btoi
     * @returns {dtm.array}
     */
    array.btoi = array.beatsToIntervals;

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
    var params = {
        keys: [],
        types: [],
        values: []
    };

    var coll = {
        type: 'dtm.collection'
    };

    coll.get = function (param) {
        var out = null;
        return out;
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
     * @param [round=false] {boolean}
     * @returns {*}
     */
    pq: function (nn, scale, round) {
        if (typeof(scale) === 'undefined') {
            scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        }

        if (typeof(round) === 'undefined') {
            round = false;
        }

        var pc = nn % 12;
        var oct = nn - pc;
        var idx = Math.floor(pc / 12. * scale.length);
        var frac = 0.0;

        if (!round) {
            frac = nn % 1;
        }
        return oct + scale[idx] + frac;
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
    },
};

dtm.value.rand = dtm.value.random;

dtm.v = dtm.val = dtm.value;
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
    var params = {
        arrays: {},
        coll: [],

        keys: [],
        types: {},
        size: {}
    };

    var data = {
        type: 'dtm.data',

        /**
         * This can be used for promise callback upon loading data.
         * @name module:data#promise
         * @type {object}
         */
        promise: null
    };

    /**
     * Returns a clone of dtm.array object from the data.
     * @param id {string|integer} Key (string) or index (integer)
     * @returns {dtm.array}
     */
    data.get = function (param, id) {
        var out = null;

        if (typeof(param) === 'string') {
            switch (param) {
                case 'column':
                case 'arrays':
                case 'array':
                case 'arr':
                case 'a':
                    if (typeof(id) === 'number') {
                        if (id >= 0 && id < params.size['col']) {
                            return params.arrays[params.keys[id]].clone();
                        } else {
                            dtm.log('data.get(): index out of range');
                            return data;
                        }
                    } else if (typeof(id) === 'string') {
                        if (params.keys.indexOf(id) > -1) {
                            return params.arrays[id].clone();
                        } else {
                            dtm.log('data.get(): key does not exist');
                            return data;
                        }
                    } else {
                        dtm.log('data.get(): please specify array with index or name');
                        return params.arrays;
                    }

                case 'c':
                case 'collection':
                case 'col':
                case 'coll':
                    return params.coll;

                case 'row':
                case 'r':
                    return params.coll[id];

                case 'size':
                case 'dim':
                case 'dimension':
                    return params.size;

                case 'len':
                case 'length':
                    return params.size.row;

                case 'k':
                case 'key':
                case 'keys':
                case 'list':
                case 'names':
                    return params.keys;

                case 't':
                case 'type':
                case 'types':
                    return params.types;

                default:
                    return data;
            }
        } else if (typeof(param) === 'number') {
            if (param >= 0 && param < params.size['col']) {
                return params.arrays[params.keys[param]].clone();
            } else {
                dtm.log('data.get(): index out of range');
                return data;
            }
        } else {
            return data;
        }
    };

    data.set = function (res) {
        params.coll = res;
        params.keys = _.keys(params.coll[0]);
        setArrays();
        setTypes();
        setSize();
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
                            params.coll = res[val];
                            params.keys = _.keys(params.coll[0]);
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
                                    params.arrays['ch_' + c] = dtm.array(Array.prototype.slice.call(floatArr), 'ch_' + c);
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
                                params.coll = dtm.parser.csvToJson(xhr.response);
                            } else {
                                // TODO: this only works for shodan
                                params.coll = JSON.parse(xhr.response)['matches'];
                            }
                            params.keys = _.keys(params.coll[0]);
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
            //return data.promise;
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
    //                    params.coll = res[val];
    //                    data.keys = _.keys(params.coll[0]);
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


    function setArrays() {
        _.forEach(params.keys, function (key) {
            var a = dtm.array(_.pluck(params.coll, key), key);
            params.arrays[key] = a;
        })
    }

    function setTypes() {
        _.forEach(params.keys, function (key) {
            params.types[key] = params.arrays[key].get('type');
        })
    }

    function setSize() {
        params.size.col = params.keys.length;
        params.size.row = params.coll.length;
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

dtm.load = dtm.d = dtm.data;

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
    var params = {
        // webAudio, animationFrame, date, hrtime (node)
        source: 'animationFrame',

        name: null,
        isOn: false,
        sync: true,
        isMaster: false,

        bpm: 120,
        subDiv: 16,
        random: 0,
        swing: 0.5,

        current: 0,
        previous: 0,
        reported: 0,
        resolution: 480,
        beat: 0
    };

    var clock = {
        type: 'dtm.clock',

        interval: 1,

        time: [4, 4],
        beat: 0,

        list: [],

        // temp
        prev: 0,

        // CHECK: just for debugging
        callbacks: []
    };

    // private
    var callbacks = [];

    // member?
    var curTime = 0.0;

    clock.get = function (param) {
        switch (param) {
            case 'bpm':
            case 'tempo':
                return params.bpm;

            case 'subdiv':
            case 'subDiv':
            case 'div':
                return params.subDiv;

            case 'sync':
            case 'synced':
                return params.sync;

            case 'isOn':
            case 'isPlaying':
                return params.isOn;

            case 'source':
                return params.source;

            case 'beat':
                return params.beat;

            case 'cur':
            case 'current':
                return params.current;

            case 'prev':
            case 'previous':
                return params.previous;

            case 'rep':
            case 'reported':
                return params.reported;

            default:
                return clock;
        }
    };

    /**
     * Set the main parameters of the clock.
     * @function module:clock#set
     * @param [bpm] {number}
     * @param [subDiv] {number}
     * @param [time] {number}
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv, time) {
        if (typeof(bpm) === 'number') {
            params.bpm = bpm;
            params.sync = false;
        } else if (typeof(bpm) === 'boolean') {
            params.sync = bpm;
        }

        if (typeof(subDiv) !== 'undefined') {
            params.subDiv = subDiv;
        }

        if (typeof(time) !== 'undefined') {
            params.time = time;
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

        params.sync = bool;
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
            //params.bpm = 60;
            return clock;
        } else {
            params.bpm = val;
            params.sync = false;
            return clock;
        }
    };

    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {integer} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subDiv = function (val) {
        val = val || 4;
        params.subDiv = val;
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

    clock.setMaster = function (bool) {
        params.isMaster = bool;
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
    //        beats = _.range((params.subDiv * clock.time[0] / clock.time[1]));
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
    clock.del = clock.delete = clock.rem = clock.remove;

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
        if (params.source === 'animationFrame') {
            window.requestAnimationFrame(clock.tick);
        }

        if (params.isMaster) {
            dtm.log('starting the master clock');
        } else {
            dtm.log('starting a clock');
        }

        if (params.isOn !== true) {
            params.isOn = true;
            clock.tick();

            if (!params.isMaster) {
                dtm.clocks.push(clock);
            }
        }
        return clock;
    };

    clock.run = clock.play = clock.start;

    var clockSrc;

    // TODO: refactor big time!!!!
    // TODO: also implement swing / random to the af-based clock
    /**
     * Makes the clock tick once.
     * @param [timeErr=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timestamp) {
        if (params.isOn) {
            if (!params.sync && !params.isMaster) {
                if (params.source === 'webAudio') {
                    clockSrc = actx.createBufferSource();
                    clockSrc.buffer = clockBuf;
                    clockSrc.connect(out());

                    var freq = params.bpm / 60.0 * (params.subDiv / 4.0);
                    //var pbRate = 1/(1/freq - Math.abs(timeErr));

                    clockSrc.playbackRate.value = freq * clMult;
                    clockSrc.playbackRate.value += clockSrc.playbackRate.value * params.random * _.sample([1, -1]);

                    if (clock.beat % 2 == 0) {
                        clockSrc.playbackRate.value *= (1.0 - params.swing) / 0.5;
                    } else {
                        clockSrc.playbackRate.value *= params.swing / 0.5;
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

                    clock.beat = (clock.beat + 1) % (params.subDiv * clock.time[0] / clock.time[1]);

                } else if (params.source === 'animationFrame') {
                    params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution * params.subDiv / 4);

                    if (params.reported !== params.current) {
                        if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                            params.beat = Math.round(params.current / params.resolution);
                            //console.log(params.beat);

                            _.forEach(clock.callbacks, function (cb) {
                                cb(clock);
                            });
                        }

                        params.current = params.reported;
                    }

                    window.requestAnimationFrame(clock.tick);
                }

            } else if (params.sync && !params.isMaster) {

            } else if (params.isMaster) {
                if (params.source === 'webAudio') {
                    clockSrc = actx.createBufferSource();
                    clockSrc.buffer = clockBuf;
                    clockSrc.connect(out());

                    var freq = params.bpm / 60.0 * (params.subDiv / 4.0);

                    clockSrc.playbackRate.value = freq * clMult;
                    clockSrc.playbackRate.value += clockSrc.playbackRate.value * params.random * _.sample([1, -1]);

                    if (clock.beat % 2 == 0) {
                        clockSrc.playbackRate.value *= (1.0 - params.swing) / 0.5;
                    } else {
                        clockSrc.playbackRate.value *= params.swing / 0.5;
                    }

                    clockSrc.start(now() + 0.0000001);

                    clockSrc.onended = function () {
                        curTime += 1/freq;
                        var error = now() - curTime;

                        clock.tick(error);

                        //return function (cb) {
                        //    cb();
                        //};
                    };

                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });

                    clock.beat = (clock.beat + 1) % (params.subDiv * clock.time[0] / clock.time[1]);

                } else if (params.source === 'animationFrame') {
                    params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution);

                    if (params.reported !== params.current) {
                        if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                            params.beat = Math.round(params.current / params.resolution);
                            //console.log(params.beat);
                        }

                        _.forEach(clock.callbacks, function (cb) {
                            cb(clock);
                        });

                        params.current = params.reported;
                    }

                    window.requestAnimationFrame(clock.tick);
                }
            }
        }

        return clock;
    };

    // TODO: stopping system should remove these callbacks?
    // TODO: implement shuffle and randomize
    clock.tickSynced = function () {
        if (params.sync && params.isOn) {
            if (dtm.master.clock.get('source') === 'webAudio') {
                if (dtm.master.clock.beat % Math.round(params.resolution/params.subDiv) === 0) {
                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });
                }
            }

            else if (dtm.master.clock.get('source') === 'animationFrame') {
                if ((dtm.master.clock.get('cur') % (params.resolution/params.subDiv*4)) < params.prev) {

                    params.beat = Math.round(dtm.master.clock.get('cur') / params.resolution * params.subDiv / 4);

                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });

                }
                params.prev = dtm.master.clock.get('cur') % (params.resolution / params.subDiv * 4);
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
        if (params.isMaster) {
            dtm.log('stopping the master clock');
        } else {
            dtm.log('stopping a clock');
        }

        if (params.isOn === true) {
            params.isOn = false;
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
        params.swing = amt || 0.5;
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
        params.random = amt || 0;
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

    // single-shot schedular
    clock.delayEvent = function () {
        return clock;
    };

    clock.delay = clock.delayEvent;

    if (!params.isMaster && typeof(dtm.master) !== 'undefined') {
        dtm.master.clock.add(clock.tickSynced);
    }

    clock.set(bpm, subDiv, time);

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
    var params = {
        name: null,
        isPlaying: false,
        poly: false,

        modDest: [],

        sync: true,
        clock: dtm.clock(true, 8),
        //subDivision: 16,

        // default model coll
        models: {
            voice: dtm.synth(),
            wavetable: null,
            volume: dtm.array(1),
            scale: dtm.array().fill('seq', 12),
            rhythm: dtm.array(1),
            pitch: dtm.array(69),
            transp: dtm.array(0),
            chord: dtm.array(0),
            bpm: dtm.array(120),
            subdiv: dtm.array(8),
            repeats: null,
            step: null,

            atk: null,
            dur: dtm.array(0.25),
            lpf: null,
            res: dtm.array(0),
            comb: null,
            delay: null
        },

        pqRound: false,

        instrModel: null,

        callbacks: []
    };

    var instr = {
        type: 'dtm.instrument',
        params: {}
    };

    /**
     * Returns a parameter of the instrument object.
     * @function module:instr#get
     * @param param {string}
     * @returns {*}
     */
    instr.get = function (param) {
        //return params[key];

        switch (param) {
            case 'name':
                return params.name;

            case 'isPlaying':
                return params.isPlaying;

            case 'c':
            case 'clock':
                return params.clock;

            case 'm':
            case 'model':
                return params.models[arguments[1]];

            case 'beat':
                return params.clock.get('beat');

            default:
                break;
        }
    };

    // CHECK: when giving an array, should I clone it? ...probably yes
    instr.set = function (dest, src, adapt) {
        if (typeof(src) === 'number') {
            params.models[dest] = dtm.array(src);
        } else {
            if (src instanceof Array) {
                params.models[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                //if (src.get('type') === 'string') {
                //    params.models[dest] = src.clone().classId();
                //} else {
                //}
                params.models[dest] = src.clone();
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.models[dest] = src;
            }
        }

        switch (dest) {
            case 'bpm':
            case 'tempo':
                break;

            case 'div':
            case 'subdiv':
            case 'subDiv':
                break;

            default:
                break;
        }
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
                params.instrModel = model;
                params.name = arg;
                //params.models = model.models;
                instr.model(model);
                //instr.play = params.instrModel.play;
                //instr.run = params.instrModel.run;

                // CHECK: not good
                params.modDest.push(model);
            } else {
                dtm.log('registering a new instrument: ' + arg);
                params.name = arg;
                params.categ = 'instr';
                dtm.modelColl.push(instr);
            }

        } else if (typeof(arg) !== 'undefined') {
            if (arg.params.categ === 'instr') {
                params.instrModel = arg; // TODO: check the class name
                instr.model(arg);
            }
        }

        return instr;
    };

    // TODO: implement
    instr.clone = function () {
        return instr;
    };

    /**
     * Sets a model for one of the parameters of the instrument.
     * @function module:instr#model
     * @param model {string|dtm.model|dtm.array}
     * @param [target='none'] {string}
     * @returns {dtm.instr}
     */
    instr.model = function () {
        var arg = arguments[0];
        var categ = 'none'; // TODO: WIP

        if (typeof(arguments[1]) === 'string') {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (arg instanceof Array) {
            if (categ) {
                params.models[categ] = dtm.array(arg);
            } else {
                params.models['none'] = dtm.array(arg);
            }
        } else if (typeof(arg) === 'object') {
            if (arg.type === 'dtm.model') {
                if (arg.get('categ') === 'instr') {
                    // CHECK: ...
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    params.models[categ] = arg;
                    params.modDest.push(arg);
                } else if (arg.get('categ')) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                    params.models[arg.params.categ] = arg;
                    params.modDest.push(arg);
                } else if (categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    params.models[categ] = arg;
                    params.modDest.push(arg);
                }

            } else if (arg.type === 'dtm.array') {
                params.models[categ] = arg;
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
                params.models[categ] = model;
                params.modDest.push(model);
            }
        }

        return instr;
    };

    instr.map = function (src, dest) {
        if (src instanceof Array) {
            params.models[dest] = dtm.array(src).normalize();
        } else if (src.type === 'dtm.array') {
            // CHECK: assigning an array here is maybe not so smart...
            params.models[dest] = src.normalize();
        } else if (src.type === 'dtm.model') {

        }
        // use global index from the master

        return instr;
    };

    // CHECK: this is pretty memory-inefficient
    function defaultInstr(c) {
        var v = params.models.voice;
        var vol = params.models.volume.get('next');
        var dur = params.models.dur.get('next');
        var r = params.models.rhythm.get('next');
        var p = params.models.pitch.get('next');
        var sc = params.models.scale.get();
        var tr = params.models.transp.get('next');
        var ct = params.models.chord.get();
        var div = params.models.subdiv.get('next');
        params.clock.subDiv(div);

        var wt = params.models.wavetable;
        var lpf = params.models.lpf;
        var comb = params.models.comb;
        var delay = params.models.delay;

        if (params.sync === false) {
            params.clock.bpm(params.models.bpm.get('next'));
        }

        _.forEach(params.callbacks, function (cb) {
            cb(params.clock);
        });

        if (r) {
            _.forEach(ct, function (val) {
                if (wt) {
                    v.wt(wt.get());
                }

                if (lpf) {
                    v.lpf(lpf.get('next'), params.models.res.get('next'));
                }

                if (comb) {
                    v.comb(0.5, params.models.comb.get('next'));
                }

                if (delay) {
                    v.delay(params.models.delay.get('next'));
                }

                v.dur(dur).decay(dur);
                v.nn(dtm.val.pq(p + val, sc, params.pqRound) + tr).amp(vol).play();
            });
        }
    }

    /**
     * Starts performing the instrument.
     * @function module:instr#play
     * @returns {dtm.instr}
     */
    instr.play = function () {
        // should only play single voice / part / instance
        if (params.isPlaying !== true) {
            params.isPlaying = true;
            dtm.log('playing instr: ' + params.name);

            if (!params.instrModel) {
                // CHECK: ???
                params.clock.add(defaultInstr).start();
            }

            if (params.instrModel) {
                if (params.instrModel.get('categ') === 'instr') {
                    params.instrModel.stop();
                    params.instrModel.play();
                }
            }

            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        } else {
            dtm.log('instrument ' + params.name + ' is already playing!');
        }

        return instr;
    };

    instr.start = instr.run = instr.play;

    instr.stop = function () {
        if (params.isPlaying === true) {
            params.isPlaying = false;
            dtm.log('stopping: ' + params.name);

            if (params.instrModel) {
                if (params.instrModel.params.categ === 'instr') {
                    params.instrModel.stop();
                }
            }

            params.clock.stop();
            params.clock.clear();

            params.callbacks = [];
        }
        return instr;
    };


    /**
     * Modulates the parameter(s) of the instrument.
     * @function module:instr#mod
     * @arg {number}
     * @returns {dtm.instr}
     */
    instr.mod = function () {
        params.transp = dtm.val.rescale(modHandler(arguments[0]), -12, 12, true);

        if (typeof(arguments[0]) === 'number') {
            if (arguments.length === 1) {
                var val = arguments[0];
                _.forEach(params.modDest, function (dest) {
                    // MEMO: don't use arguments[n] in forEach
                    dest.mod(val);
                });

                //modHandler(dtm.val.rescale(val, -12, 12, true), params.transpose);

            } else {
                _.forEach(arguments, function (val, idx) {
                    if (params.modDest[idx]) {
                        params.modDest[idx].mod(val);
                    }
                });
            }

        } else if (typeof(arguments[0]) === 'string') {
            if (typeof(arguments[1] === 'number') && typeof(instr.params[arguments[0]]) !== 'undefined') {
                params[arguments[0]] = arguments[1]; // CHECK: ???????
            }

        } else if (typeof(arguments[0]) === 'object') {
            var keys = _.keys(arguments[0]);
        }

        return instr;
    };

    function modHandler(src) {
        if (typeof(src) === 'number') {
            return src;
        } else if (typeof(src) === 'object') {
            if (src instanceof Array) {
                var a = dtm.array(src).normalize();
                return a.get('next');
            } else if (src.type === 'dtm.array') {
                return src.get('next');
            } else if (src.type === 'dtm.model') {

            }
        }
    }

    function mapper(dest, src) {
        if (typeof(src) === 'number') {
            params.models[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.models[dest] = dtm.array(src).classify();
        } else {
            if (src instanceof Array) {
                params.models[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    params.models[dest] = src.clone().classify();
                } else {
                    params.models[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.models[dest] = src;
            }
        }
    }

    instr.modulate = instr.mod;



    /**
     * Sets the main voice / WebAudio synthesizer for the instrument.
     * @param arg {string|dtm.synth}
     * @returns {dtm.instr}
     */
    instr.voice = function (arg) {
        if (typeof(arg) === 'string') {
            params.models.voice.set(arg);
        } else if (arg.type === 'dtm.synth') {
            params.models.voice = arg;

        }
        return instr;
    };

    instr.syn = instr.synth = instr.voice;

    instr.wt = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('wavetable', src);

        if (adapt) {
            params.models.wavetable.normalize();
        }

        return instr;
    };

    instr.wavetable = instr.wt;

    instr.rhythm = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('rhythm', src);

        if (adapt) {
            params.models.rhythm.normalize().round();
        }

        return instr;
    };

    instr.beats = instr.rhythm;

    instr.volume = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('volume', src);
        if (adapt) {
            params.models.volume.logCurve(5).rescale(0.1, 1);
        }

        return instr;
    };

    instr.amp = instr.level = instr.vol = instr.volume;

    instr.pitch = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('pitch', src);

        if (adapt) {
            params.models.pitch.normalize().rescale(60, 90);
        }

        return instr;
    };

    instr.transpose = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('transp', src);

        if (adapt) {
            params.models.transp.normalize().scale(-12, 12);
        }

        return instr;
    };

    instr.tr = instr.transp = instr.transpose;

    instr.scale = function (src, adapt, round) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        if (typeof(round) === 'undefined') {
            params.pqRound = false;
        } else {
            params.pqRound = round;
        }

        mapper('scale', src);

        if (adapt) {
            params.models.scale.normalize().scale(0,11).round().unique().sort()
        }

        return instr;
    };

    instr.pq = instr.scale;

    instr.chord = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('chord', src);

        if (adapt) {
            params.models.chord.normalize().scale(0, 12).round().unique().sort();

            if (params.models.chord.get('len') > 4) {
                params.models.chord.fit(4).round().unique().sort();
            }
        }

        return instr;
    };

    instr.clock = function (bpm, subDiv, time) {
        params.clock.bpm(bpm);
        params.clock.subDiv(subDiv);
        return instr;
    };

    instr.bpm = function (src, adapt) {
        params.sync = false;

        //params.clock.bpm(val);
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('bpm', src);

        if (adapt) {
            params.models.bpm.normalize().scale(60, 180);
        }

        return instr;
    };

    instr.tempo = instr.bpm;

    instr.subDiv = function (src, adapt) {
        //params.clock.subDiv(val);
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('subdiv', src);

        if (adapt) {
            params.models.subdiv.normalize().scale(1, 5).round().powof(2);
        }
        return instr;
    };

    instr.len = instr.note = instr.div = instr.subdiv = instr.subDiv;

    instr.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }
        params.clock.sync(bool);
        params.sync = bool;
        return instr;
    };

    instr.lpf = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('lpf', src);

        if (adapt) {
            params.models.lpf.normalize().log(10).scale(500, 5000);
        }

        return instr;
    };

    instr.res = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('res', src);

        if (adapt) {
            params.models.res.normalize().scale(0, 50);
        }

        return instr;
    };

    instr.comb = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('comb', src);

        if (adapt) {
            params.models.comb.normalize().rescale(60, 90);
        }

        return instr;
    };

    instr.delay = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('delay', src);

        if (adapt) {
            params.models.delay.normalize();
        }

        return instr;
    };

    instr.dur = function (src, adapt) {
        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        mapper('dur', src);

        if (adapt) {
            params.models.dur.normalize().exp(10).scale(0.01, 0.5);
        }

        return instr;
    };

    instr.on = function (arg) {
        switch (arg) {
            case 'note':
                params.callbacks.push(arguments[1]);
                break;

            case 'every':
            case 'beat':
                var foo = arguments[1];
                var bar = arguments[2];
                params.callbacks.push(function (c) {
                    if (c.get('beat') % foo === 0) {
                        bar(c)
                    }
                });
                break;

            case 'subDiv':
            case 'subdiv':
            case 'div':
                break;

            default:
                break;
        }
        return instr;
    };

    instr.when = instr.on;

    instr.load(arg);

    return instr;
};

dtm.i = dtm.instrument = dtm.instr;
dtm.voice = dtm.instr;
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
    var params = {
        name: null,
        categ: 'none',
        categories: [],

        output: null // dtm.array
    };

    var model = {
        type: 'dtm.model',

        // assigning array or data/coll???
        //array: null,
        //data: null,
        parents: {},

        params: {},
        models: {}
    };

    model.get = function (param) {
        switch (param) {
            case 'name':
                return params.name;

            case 'category':
            case 'categ':
                return params.categ;

            default:
                return params.output;
        }
    };

    model.set = function (key, val) {
        params.value = val; // temp
        return model;
    };

    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        params.categ = categ;
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
                    params.categ = categ;
                }

                dtm.log('registering a new model: ' + name);
                params.name = name;
                dtm.modelColl.push(model);
            }
        }

        return model;
    };

    model.mod = function (val) {
        return model;
    };

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
dtm.synth = function (type, wt) {
    var params = {
        type: 'sine',
        duration: 1,

        //isPlaying: false,
        buffer: null,
        gain: 0.5,
        adsr: [0.001, 0.2, 0, 0.001],

        freq: 440,
        noteNum: 69,

        wt: {
            isOn: false,
            wt: null
        },

        lpf: {
            isOn: false,
            cof: 4000,
            res: 1
        },

        detune: {
            isOn: false,
            amount: 0,
            spread: 0
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
    };

    var synth = {
        type: 'dtm.synth',

        /**
         * A JavaScript promise object with play() function extended. Used for the audio sample loading.
         * @name module:synth#promise
         * @type {object}
         */
        promise: null
    };

    synth.get = function (param) {
        var out = null;

        switch (param) {
            case 'amp':
            case 'volume':
            case 'gain':
                out = params.gain;
                break;

            case 'frequency':
            case 'freq':
            case 'cps':
                out = params.freq;
                break;

            case 'noteNum':
            case 'notenum':
            case 'note':
            case 'nn':
                out = params.noteNum;
                break;

            case 'buffer':
                out = params.buffer;
                break;

            default:
                break;
        }

        return out;
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
                params.type = 'sine';
                break;
            case 'saw':
            case 'sawtooth':
                params.type = 'saw';
                break;
            case 'sq':
            case 'square':
                params.type = 'square';
                break;
            case 'tri':
            case 'triangle':
                params.type = 'triangle';
                break;
            case 'wn':
            case 'noise':
            case 'rand':
            case 'random':
                params.type = 'noise';
                break;
            case 'click':
            case 'impulse':
                params.type = 'click';
                break;
            case 'wt':
            case 'wavetable':
                params.type = 'wavetable';
                if (typeof(arguments[1] !== 'undefined')) {
                    synth.wt(arguments[1]);
                } else {
                    synth.wt([0]);
                }
                break;
            case 'sampler':
                params.type = 'sampler';
                break;
            default:
                break;
        }

        return synth;
    };

    synth.wt = function (arr) {
        params.wt.isOn = true;

        if (typeof(arr) === 'undefined') {
            arr = [0];
        }

        var base = [0, 1];

        for (var i = 0; i < arr.length; i++) {
            base.push(arr[i]);
        }

        var real = new Float32Array(base);
        var img = real;
        params.wt.wt = dtm.wa.actx.createPeriodicWave(real, img);

        return synth;
    };

    var noise = dtm.wa.makeNoise(8192);

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
            params.adsr[0] = arguments[0] || 0.001;
            params.adsr[1] = arguments[1] || 0.001;
            params.adsr[2] = arguments[2];
            params.adsr[3] = arguments[3] || 0.001;
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
        var actx = dtm.wa.actx;

        params.type = 'sampler';

        if (arg.constructor.name === 'AudioBuffer') {
            params.buffer = arg;
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
                                params.buffer = buf;
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
                        params.buffer = buf;
                        resolve(synth);

                        if (typeof(cb) !== 'undefined') {
                            cb(synth);
                        }
                    });
                } else if (arg instanceof Array) {
                    var buf = actx.createBuffer(1, arg.length, dtm.wa.actx.sampleRate);
                    var content = buf.getChannelData(0);
                    _.forEach(content, function (val, idx) {
                        content[idx] = arg[idx];
                    });

                    params.buffer = buf;
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
        var actx = dtm.wa.actx;
        var now = dtm.wa.now;
        var out = dtm.wa.out;

        del = del || 0;
        dur = dur || params.duration;

        var startT = now() + del;
        var src;

        //var noise = makeNoise();

        if (params.type === 'noise') {
            src = actx.createBufferSource();
            src.buffer = noise;
            src.loop = true;
        } else if (params.type === 'sampler') {
            src = actx.createBufferSource();
            src.buffer = params.buffer;
            src.playbackRate = 1;
            src.loop = false;
        } else if (params.type === 'click') {
            src = actx.createBufferSource();
            var buf = actx.createBuffer(1, 2, dtm.sr);
            var contents = buf.getChannelData(0);
            contents[1] = 1;
            src.buffer = buf;
            src.playbackRate = 1;
            src.loop = false;
        } else {
            src = actx.createOscillator();
            src.frequency.setValueAtTime(params.freq, startT);
        }

        switch (params.type) {
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

        if (params.wt.isOn) {
            src.setPeriodicWave(params.wt.wt);
        }

        var amp = actx.createGain();

        if (params.lpf.isOn) {
            var lpf = actx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.setValueAtTime(params.lpf.cof, startT);
            lpf.Q.setValueAtTime(params.lpf.res, startT);
            src.connect(lpf);
            lpf.connect(amp);
        } else {
            src.connect(amp);
        }

        if (params.comb.isOn) {
            var comb = actx.createDelay();
            comb.delayTime.setValueAtTime(1/dtm.val.mtof(params.comb.nn), startT);

            var combAmp = actx.createGain();
            combAmp.gain.setValueAtTime(params.comb.amount, startT);

            var combFb = actx.createGain();
            combFb.gain.setValueAtTime(0.95, startT);

            amp.connect(comb);
            comb.connect(combAmp);
            comb.connect(combFb);
            combFb.connect(comb);
            combAmp.connect(out());
        }

        if (params.delay.isOn) {
            var delay = actx.createDelay();
            delay.delayTime.setValueAtTime(params.delay.time, startT);

            var delAmp = actx.createGain();
            delAmp.gain.setValueAtTime(params.delay.amount, startT);

            var delFb = actx.createGain();
            delFb.gain.setValueAtTime(params.delay.feedback, startT);

            amp.connect(delay);
            delay.connect(delAmp);
            delay.connect(delFb);
            delFb.connect(delay);
            delAmp.connect(out());
        }

        // TODO: not chaning the effects...
        if (params.verb.isOn) {
            var verb = actx.createConvolver();
            verb.buffer = dtm.wa.buffs.verbIr;

            var verbAmp = actx.createGain();
            verbAmp.gain.setValueAtTime(params.verb.amount, startT);

            amp.connect(verb);
            verb.connect(verbAmp);
            verbAmp.connect(out());
        }

        amp.connect(out());

        var susLevel = params.adsr[2] * params.gain;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(params.gain, startT, params.adsr[0]);
        amp.gain.setTargetAtTime(susLevel, startT+params.adsr[0], params.adsr[1]);

        var relStart = startT + params.adsr[0] + params.adsr[1] + dur;
        amp.gain.setTargetAtTime(0, relStart, params.adsr[3]);

        src.start(startT);
        src.stop(relStart + params.adsr[3] + 0.3);

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

        params.noteNum = nn;
        params.freq = dtm.value.mtof(nn);

        return synth;
    };

    /**
     * Sets the frequency of the note to be played.
     * @function module:synth#freq
     * @param freq {number}
     * @returns {dtm.synth}
     */
    synth.freq = function (freq) {
        params.freq = freq;
        return synth;
    };

    /**
     * Sets the amplitude of the note.
     * @function module:synth#amp
     * @param val {number} Amplitude between 0-1.
     * @returns {dtm.synth}
     */
    synth.amp = function (val) {
        params.gain = val;
        return synth;
    };

    /**
     * Sets the duration for the each note.
     * @function module:synth#dur
     * @param val {number} Duration in seconds.
     * @returns {dtm.synth}
     */
    synth.dur = function (val) {
        params.duration = val;
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
        params.adsr[0] = val;
        return synth;
    };

    synth.decay = function (val) {
        params.adsr[1] = val;
        return synth;
    };

    synth.sustain = function (val) {
        params.adsr[2] = val;
        return synth;
    };

    synth.release = function (val) {
        params.adsr[3] = val;
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
        params.lpf.isOn = true;
        params.lpf.cof = cof || 4000;
        params.lpf.res = res || 1;
        return synth;
    };

    /**
     * Applies a reverb to the voice.
     * @function module:synth#verb
     * @param amt {number} 0-1
     * @returns {dtm.synth}
     */
    synth.verb = function (amt) {
        params.verb.isOn = true;
        params.verb.amount = amt;
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
        params.delay.isOn = true;
        params.delay.amount = amt || 0;
        params.delay.time = time || 0.3;
        params.delay.feedback = fb || 0.3;
        params.delay.stereo = stereo || false;

        return synth;
    };

    /**
     * Applies a resonating comb filter.
     * @param amt
     * @param nn
     * @returns {dtm.synth}
     */
    synth.comb = function (amt, nn) {
        params.comb.isOn = true;
        params.comb.amount = amt || 0;
        params.comb.nn = nn || 69;
        return synth;
    };

    synth.set(type, wt);

    return synth;
};

dtm.s = dtm.syn = dtm.synth;
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
    clock: dtm.clock(120, 480).sync(false),

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

    get: function (param) {
        var out;

        switch (param) {
            case 'index':
                out = dtm.master.params.index;
                break;
            default:
                out = null;
                break;
        }
        return out;
    },

    set: function (key, val) {
        return dtm.master;
    },

    state: null,

    reset: null
};

dtm.master.clock.setMaster(true);
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

    //m.get = function () {
    //    return defIntervals;
    //};
})();
(function () {
    var m = dtm.model('chord', 'chord');

    //m.params = {
    //    key: null
    //};

    //m.get = function () {
    //    return [0, 4, 7, 11];
    //};
})();
(function () {
    var m = dtm.model('scale', 'scale');

    var scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    //m.get = function () {
    //    return scale;
    //};

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

    m.rhythm = function (input) {
        m.models.rhythm = input;
        return m;
    };

    m.toneRow = function (input) {
        m.models.toneRow = input;
        return m;
    };

    m.synthesize = function () {
        var len = 0;
        m.models.rhythm.beatsToIndices();
        m.models.toneRow.fit(m.models.rhythm.get('len'));

        m.set();
        return m;
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

    //m.get = function () {
    //    return m.params.scale;
    //};
})();



(function () {
    var m = dtm.model('playback', 'playback');

    // maybe this is what instr is?

    m.play = function () {
        console.log('playing!');
    };
})();
(function () {
    var m = dtm.model('bl-motif', 'motif');

    m.params.isPercussion = false;
    m.params.rhythm = null;
    m.params.pitches = null;
    m.params.weights = null;

    var pc = {
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

    var generateRhythm = function (arr) {
        var a = dtm.array(arr);
        var intv = a.fit(32).rescale(0, 1).round().btoi().get();

        //var res = [];
        //for (var i = 0; i < 32/4; i++) {
        //
        //}

        //seq = seq.join(' ');


        return intv;
    };

    var generatePitch = function (arr, intv) {
        var a = dtm.array(arr);
        var p = a.fit(intv.length).rescale(-6, 11).round().get();

        var seq = [];

        for (var i = 0; i < intv.length; i++) {
            if (p[i] < 0) {
                p[i] = -1;
            }
            seq[i] = pc[p[i]] + '*' + intv[i] + '/16';
        }

        return seq;
    };

    m.generate = function (arr) {
        var temp = [];
        for (var ch = 0; ch < 3; ch++) {
            temp[ch] = [];

            for (var i = 0; i < arr.length; i++) {
                temp[ch][i] = _.random(0, 1, true);
            }

            temp[ch] = generatePitch(temp[ch], generateRhythm(temp[ch]));

            temp[ch] = temp[ch].join(' ');
        }

        var intervals = generateRhythm(arr);
        var seq = generatePitch(arr, intervals);


        seq = seq.join(' ');
        //seq = '[\\meter<"4/4"> ' + seq + ' \\newLine' + ' _*2/1' + ']';

        var res = '{' +
            '[\\instr<"Flute", dx=-1.65cm, dy=-0.5cm>\\meter<"4/4"> \\clef<"g"> ' + seq + '],' +
            '[\\instr<"Cello", dx=-1.65cm, dy=-0.5cm>\\meter<"4/4"> \\clef<"f"> ' + temp[0] + '],' +
            '[\\instr<"Piano", dx=-1.65cm, dy=-1.75cm> \\meter<"4/4"> \\clef<"g"> ' + temp[1] + '],' +
            '[\\meter<"4/4"> \\clef<"f"> ' + temp[2] + ']}';

        return res;
    };
})();
(function () {
    var m = dtm.model('bl-piano', 'part');

    m.params.meta = {
        section: 1
    };

    var scale = [0, 2, 3, 5, 7, 9, 10];

    m.params.left = {
        div: 16,
        rhythm: [1, 1, -1, 3, 2, 2, 2],
        shape: [0, 7, 12, 5, 10, 7]
    };

    m.params.right = {
        div: 16,
        //models.rhythm: [-2, 2, -1, 2, -2, 3]
        rhythm: [-3, 5, 4],
        shape: [1, 0, -1, 0],
        voice: [0, 2, 7]
    };

    m.test = function (rhy, shp, div) {
        var temp = [];
        var note = 'c';

        var j = 0;

        for (var i = 0; i < rhy.length; i++) {
            if (rhy[i] > 0) {
                var oct = Math.floor(shp[j]/12);
                note = dtm.guido().pc[shp[j]-oct*12] + (oct+1);
                j++;
            } else {
                note = '_';
                rhy[i] *= -1;
            }
            temp[i] = note + '*' + rhy[i] + '/' + div;
        }

        temp = temp.join(' ');
        return temp;
    };

    m.output = function () {
        return m.test(m.params.left.rhythm, m.params.left.shape, 16);
    }
})();
})();