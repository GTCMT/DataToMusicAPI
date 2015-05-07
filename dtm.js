(function () {

/**
 * @fileOverview
 * @module core
 */

var params = {
    isLogging: false
};

/**
 * Returns the singleton dtm object.
 * @name module:core#dtm
 * @type {object}
 */
var dtm = {
    version: '0.0.3',

    log: function (arg) {
        if (params.isLogging) {
            if (arguments.callee.caller.name) {
                console.log(arguments.callee.caller.name + ': ' + arg);
            } else {
                console.log(arg);
            }
        }
    },

    //instrColl: [],
    //activeInstrs: [],

    modelColl: [],
    modelCallers: {},
    clocks: [],

    params: {},

    // TODO: a function to list currently loaded objects, such as data, arrays, models... - for console livecoding situation

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

    wa: {
        isOn: false
    },

    startWebAudio: function () {
        dtm.wa.isOn = true;

        dtm.wa.actx = new (window.AudioContext || window.webkitAudioContext)();
        dtm.wa.now = function () {
            return dtm.wa.actx.currentTime;
        };
        dtm.wa.out = function () {
            return dtm.wa.actx.destination;
        };
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
                left[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen - idx) / bufLen, exp), -1, 1);
                right[idx] = dtm.val.rescale(dtm.val.expCurve(_.random(0, 1, true) * (bufLen - idx) / bufLen, exp), -1, 1);
            });

            return buffer;
        };

        dtm.wa.buffs = {
            verbIr: dtm.wa.makeIr(2)
        };
    },

    oscParams: {
        isOpen: false,
        port: null
    },

    startOsc: function () {
        dtm.osc.isOn = true;
        dtm.osc.start();
    }
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


//function clone(obj) {
    //return JSON.parse(JSON.stringify(obj));
    //return _.cloneDeep(obj); // CHECK: broken????????
//}


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) {
        return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        if (obj.type == 'dtm.array') {
            return obj.clone();
        } else {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = clone(obj[attr]);
                }
            }
            return copy;
        }
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
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
//dtm.osc = function () {
//    var params = {};
//
//    var myOsc = {
//        type: 'dtm.osc',
//        oscPort: null,
//        isOpen: false
//    };
//
//    myOsc.setup = function () {
//        if (typeof(osc) !== 'undefined' && !myOsc.isOpen) {
//            myOsc.isOpen = true;
//            dtm.log('opening OSC port');
//            myOsc.oscPort = new osc.WebSocketPort({
//                url: 'ws://localhost:8081'
//            });
//
//            myOsc.oscPort.open();
//
//            myOsc.oscPort.listen();
//
//            myOsc.oscPort.on('ready', function () {
//                //myOsc.oscPort.socket.onmessage = function (e) {
//                //    console.log('test');
//                //    var foo =String.fromCharCode.apply(null, new Uint16Array(e));
//                //    console.log("message", e);
//                //};
//
//                myOsc.oscPort.on('message', function (msg) {
//                    switch (msg.address) {
//                        case '/test':
//                            //console.log(msg.args[0]);
//                            break;
//                        default:
//                            break;
//                    }
//                });
//
//                myOsc.oscPort.on("error", function (err) {
//                    throw new Error(err);
//                });
//            });
//        } else if (myOsc.isOpen) {
//            dtm.log('OSC port is already open');
//        }
//
//        return myOsc;
//    };
//
//    myOsc.start = myOsc.setup;
//
//    myOsc.stop = function () {
//        if (myOsc.oscPort) {
//            myOsc.oscPort.close(1000);
//        }
//
//        myOsc.isOpen = false;
//        return myOsc;
//    };
//
//    myOsc.close = myOsc.stop;
//
//    myOsc.on = function (addr, cb) {
//        myOsc.oscPort.on('message', function (msg) {
//            if (addr[0] !== '/') {
//                addr = '/'.concat(addr);
//            }
//            if (msg.address == addr) {
//                cb(msg.args);
//            }
//        });
//        return myOsc;
//    };
//
//    myOsc.write = function (addr, args) {
//        myOsc.oscPort.send({
//            address: addr,
//            args: args
//        });
//
//        return myOsc;
//    };
//
//    myOsc.send = myOsc.write;
//
//    myOsc.map = function (src, dest) {
//        if (dest.type === 'dtm.array') {
//            myOsc.oscPort.on('message', function (msg) {
//                switch (msg.address) {
//                    case '/test':
//                        dest.queue(msg.args[0]);
//                        break;
//                    default:
//                        break;
//                }
//            });
//        }
//
//        return myOsc;
//    };
//
//    myOsc.setup();
//    return myOsc;
//};

dtm.osc = {
    type: 'dtm.osc',
    oscPort: null,
    isOn: false,
    isOpen: false,
    callbacks: [],

    start: function () {
        if (typeof(osc) !== 'undefined' && !dtm.osc.isOpen) {
            dtm.osc.isOpen = true;
            dtm.log('opening OSC port');

            dtm.osc.oscPort = new osc.WebSocketPort({
                url: 'ws://localhost:8081'
            });

            dtm.osc.oscPort.open();

            dtm.osc.oscPort.listen();

            dtm.osc.oscPort.on('ready', function () {
                //dtm.osc.oscPort.socket.onmessage = function (e) {
                //    console.log('test');
                //    var foo =String.fromCharCode.apply(null, new Uint16Array(e));
                //    console.log("message", e);
                //};

                dtm.osc.oscPort.on('message', function (msg) {
                    switch (msg.address) {
                        case '/test':
                            //console.log(msg.args[0]);
                            break;
                        default:
                            break;
                    }
                });

                dtm.osc.oscPort.on("error", function (err) {
                    throw new Error(err);
                });
            });
        } else if (dtm.osc.isOpen) {
            dtm.log('OSC port is already open');
        }

        return dtm.osc;
    },

    stop: function () {
        if (dtm.osc.oscPort) {
            dtm.osc.oscPort.close(1000);
        }

        dtm.osc.isOpen = false;
        return dtm.osc;
    },


    on: function (addr, cb) {
        dtm.osc.oscPort.on('message', function (msg) {
            if (addr[0] !== '/') {
                addr = '/'.concat(addr);
            }
            if (msg.address == addr) {
                cb(msg.args);
            }
        });
        return dtm.osc;
    },

    send: function (addr, args) {
        if (addr[0] !== '/') {
            addr.unshift('/');
        }

        if (args.constructor !== Array) {
            args = [args];
        }

        dtm.osc.oscPort.send({
            address: addr,
            args: args
        });

        return dtm.osc;
    },

    clear: function () {
        dtm.osc.callbacks = [];
    }
};

dtm.osc.close = dtm.osc.stop;


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
            dtm.log('cannot get the mean value of a string array');
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

    /**
     * Counts occurrences of each class in the list.
     * @function module:analyzer#histo
     * @param input {array}
     * @returns {array}
     */
    histo: function (input) {
        var res = [];
        var classes = _.clone(input);
        var histogram = _.countBy(input);

        _.forEach(classes, function (val, idx) {
            res[idx] = histogram[val];
        });

        return res;
    },

    /**
     * List unique items as "class" in sorted order.
     * @function module:analyzer#classes
     * @param input {array}
     * @returns {array}
     */
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
            case 'constants':
            case 'const':
            case 'consts':
                min = min || 0;
                for (var i = 0; i < len; i++) {
                    res[i] = min;
                }
                break;

            case 'string':
            case 'str':
            case 's':
            case 'characters':
            case 'character':
            case 'chars':
            case 'char':
            case 'c':
                res = arguments[1].split('');
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
    rescale: function (arr, min, max, dmin, dmax) {
        var normalized = dtm.transform.normalize(arr, dmin, dmax);
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

        if (len < 1) {
            len = 1;
        } else {
            len = Math.round(len);
        }

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

    fitSum: function (arr, tgt, round) {
        if (typeof(round) === 'undefined') {
            round = false;
        }

        var sum = dtm.analyzer.sum(arr);

        if (sum === 0) {
            arr = dtm.transform.add(arr, 0.000001);
            sum = dtm.analyzer.sum(arr);
        }

        if (round) {
            tgt = Math.round(tgt);
        }

        var res = dtm.transform.mult(arr, 1/sum * tgt);

        if (round) {
            res = dtm.transform.round(res);

            if (dtm.analyzer.sum(res) !== tgt) {
                var n = 1;
                var rem = dtm.analyzer.sum(res) - tgt;
                var add = rem < 0;

                if (add) {
                    while (rem < 0) {
                        res[dtm.val.mod(arr.length-n, arr.length)]++;
                        rem++;
                        n++;
                    }
                } else {
                    while (rem > 0) {
                        if (res[arr.length-n] > 0) {
                            res[dtm.val.mod(arr.length-n, arr.length)]--;
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
        var res = [];

        if (typeof(factor) === 'number') {
            _.forEach(input, function (val, idx) {
                res[idx] = val + factor;
            });
        } else if (factor.constructor === Array) {
            if (input.length !== factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            }

            for (var i = 0; i < input.length; i++) {
                res[i] = input[i] + factor[i];
            }
        }

        return res;
    },

    /**
     * Multiplies the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then element-wise multiplication is performed.
     * @function module:transform#mult
     * @param input {array}
     * @param factor {number|array}
     * @param [interp='linear] {string}
     * @returns {array}
     */
    mult: function (input, factor, interp) {
        var res = [];

        if (typeof(factor) === 'number') {
            _.forEach(input, function (val, idx) {
                res[idx] = val * factor;
            });
        } else if (factor.constructor === Array) {
            if (input.length !== factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            }

            for (var i = 0; i < input.length; i++) {
                res[i] = input[i] * factor[i];
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
        var res = [];

        if (typeof(factor) === 'number') {
            _.forEach(input, function (val, idx) {
                res[idx] = Math.pow(val, factor);
            });
        } else if (factor.constructor === Array) {
            if (input.length !== factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            }

            for (var i = 0; i < input.length; i++) {
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
        var res = [];

        if (typeof(factor) === 'number') {
            _.forEach(input, function (val, idx) {
                res[idx] = Math.pow(factor, val);
            });
        } else if (factor.constructor === Array) {
            if (input.length !== factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            }

            for (var i = 0; i < input.length; i++) {
                res[i] = Math.pow(factor[i], input[i]);
            }
        }

        return res;
    },


    /* ARITHMETIC */

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

    removeZeros: function (input) {
        var res = [];

        for (var i = 0; i < input.length; i++) {
            if (input[i] !== 0) {
                res.push(input[i]);
            }
        }

        return res;
    },

    diff: function (input) {
        var res = [];

        for (var i = 1; i < input.length; i++) {
            res.push(input[i] - input[i-1]);
        }

        return res;
    },

    /* LIST OPERATIONS */

    /**
     * Creates a horizontal mirror of the input array.
     * @function module:transform#mirror
     * @param {array} input One-dimensional array. Could be any type.
     * @returns {array}
     * @example
     *
     * var input = [4, 1, 2, 7, 5, 0, 6, 3];
     *
     * dtm.transform.mirror(input);
     * -> [3, 6, 0, 5, 7, 2, 1, 4]
     */
    mirror: function (input) {
        var res = [];
        for (var i = input.length - 1; i >= 0; --i) {
            res.push(input[i]);
        }
        return res;
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
        if (typeof(center) === 'undefined') {
            center = dtm.analyzer.mean(input);
        }

        var res = [];
        _.forEach(input, function (val, idx) {
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
     * @param [interp='linear'] {string}
     * @param [morphIdx=0.5] {float}
     */
    morph: function (srcArr, tgtArr, morphIdx, interp) {
        if (typeof(morphIdx) === 'undefined') {
            morphIdx = 0.5;
        }

        var srcLen = srcArr.length;
        var tgtLen = tgtArr.length;
        var resLen = Math.round((tgtLen - srcLen) * morphIdx + srcLen);

        return morphFixed(dtm.transform.fit(srcArr, resLen, interp), dtm.transform.fit(tgtArr, resLen), morphIdx);
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

    /**
     * @function module:transform#indicesToBeats
     * @param input
     * @param [seqLen] The length of the returned beat sequence. If not present, it will be the minimum power of two number to represent the beat sequence.
     */
    indicesToBeats: function (input, seqLen) {
        input = dtm.transform.sort(input);

        if (typeof(seqLen) === 'undefined') {
            var f = 0, len = 1;
            while (input[input.length-1] >= len) {
                len = Math.pow(2, ++f);
            }
        } else {
            len = seqLen;
        }

        var res = res = dtm.transform.generate('zeros', len);

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
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.array = function () {
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
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name, key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
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
                case 'window':
                    var start, size;
                    if (arguments[1].constructor === Array) {
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
                    // TODO: incr w/ the size of block after return
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
     * @returns {dtm.array}
     */
    array.set = function (input) {
        if (typeof(input) === 'undefined') {
            input = [];
        }

        if (typeof(input) === 'number') {
            params.value = [input];
        } else if (input.constructor === Array) {
            params.value = input;
        } else if (input.type === 'dtm.array') {
            params.value = input.get();
        } else if (typeof(input) === 'string') {
            params.value = dtm.transform.fill.apply(this, arguments);
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

        params.index = params.length - 1;

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

    // TODO: do this in array.set()
    //if (typeof(val) !== 'undefined') {
    //    if (typeof(val) === 'string') {
    //        val = val.split('');
    //    } else if (typeof(val) === 'number') {
    //        val = [val];
    //    }
    //
    //    checkType(val);
    //    array.set(val);
    //}

    array.set.apply(this, arguments);
    checkType(params.value);

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

    /**
     * Sets the size of the iteration step.
     * @function module:array#step
     * @param val {number}
     * @returns {dtm.array}
     */
    array.step = function (val) {
        params.step = Math.round(val);
        return array;
    };

    /**
     * Same as the step().
     * @function module:array#stepSize
     * @type {Function}
     */
    array.stepSize = array.step;

    /**
     * Sets the current index within the array for the iterator. Value exceeding the max or min value will be wrapped around.
     * @function module:array#index
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
     * @function module:array#fill
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=8] {number}
     * @param [min=0] {number}
     * @param [max=1] {number}
     * @returns {dtm.array}
     */
    array.fill = function (type, len, min, max) {
        //params.value = dtm.transform.generate(type, len, min, max);
        params.value = dtm.transform.generate.apply(this, arguments);
        array.set(params.value);
        return array;
    };

    /**
     * Same as the fill() function.
     * @function module:array#generate
     * @function module:array#gen
     */
    array.gen = array.generate = array.fill;

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
    array.d = array.dup = array.duplicate = array.c = array.copy = array.clone;

    /**
     * Morphs the array values with a target array / dtm.array values. The lengths can be mismatched.
     * @function module:array#morph
     * @param tgtArr {array | dtm.array}
     * @param morphIdx {number} between 0-1
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
     * @function module:array#reset
     * @returns {dtm.array}
     */
    array.reset = function () {
        array.set(params.original);
        return array;
    };

    array.original = array.reset;

    array.flush = function () {
        return array.set([]);
    };

    array.clear = array.flush;

    /* SCALARS */

    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:array#normalize
     * @param [min] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [max] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
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
     * @param min {number} The target minimum value of the scaled range.
     * @param max {number} The target maximum value of the scaled range.
     * @param [dmin] {number} The minimum of the domain (original) value range.
     * @param [dmax] {number} The maximum of the domain value range.
     * @returns {dtm.array}
     */
    array.rescale = function (min, max, dmin, dmax) {
        params.value = dtm.transform.rescale(params.value, min, max, dmin, dmax);
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

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:array#fitSum
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

    array.append = array.concat;

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
    array.rand = array.random = array.randomize = array.shuffle;

    /**
     * Adds new value(s) at the end of the array, and removes the oldest value(s) at the beginning of the array. The size of the array is unchanged.
     * @function module:array#queue
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

    /**
     * Same as array.queue()
     * @function module:array#fifo
     * @type {Function}
     */
    array.fifo = array.queue;

    /* ARITHMETIC */

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

    array.derivative = function (order) {
        return array;
    };

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

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:array#stringify
     * @returns {dtm.array}
     */
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
        } else if (scale.constructor === Array) {

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

    /**
     * function module:array#indicesToBeats
     * @param [len]
     * @returns {dtm.array}
     */
    array.indicesToBeats = function (len) {
        return array.set(dtm.transform.indicesToBeats(params.value, len));
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

    // TODO: min / max / single-value defaults
    randi: function (min, max) {
        return _.random(min, max);
    },

    random: function (min, max) {
        if (typeof(min) === 'undefined' && typeof(max) === 'undefined') {
            min = 0;
            max = 1;
        }
        return _.random(min, max, true);
    }
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
                            dtm.wa.actx.decodeAudioData(xhr.response, function (buf) {
                                for (var c = 0; c < buf.numberOfChannels; c++) {
                                    var floatArr = buf.getChannelData(c);
                                    params.arrays['ch_' + c] = dtm.array(Array.prototype.slice.call(floatArr)).name('ch_' + c);
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
            var a = dtm.array(_.pluck(params.coll, key)).name(key);
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

    data.init = function (arg) {
        if (arguments.length === 1) {
            if (typeof(arg) === 'number') {
                for (var i = 0; i < arg; i++) {
                    params.arrays[i] = dtm.array();
                    params.keys[i] = i.toString();
                    params.size.col = arg;
                    params.size.row = 0;
                }
            } else if (typeof(arg) === 'object') {
                for (var i = 0; i < arg.num; i++) {
                    params.arrays[i] = dtm.array().fill('zeros', arg.len);
                    params.keys[i] = i.toString();
                    params.size.col = arg.num;
                    params.size.row = arg.len;
                }
            }
        } else if (arguments.length === 2) {
            for (var i = 0; i < arguments[0]; i++) {
                params.arrays[i] = dtm.array().fill('zeros', arguments[1]);
                params.keys[i] = i.toString();
                params.size.col = arguments[0];
                params.size.row = arguments[1];
            }
        } else if (arguments.length === 3) {
        for (var i = 0; i < arguments[0]; i++) {
            params.arrays[arguments[2][i]] = dtm.array().fill('zeros', arguments[1]).name(arguments[2][i]);
            params.keys[i] = arguments[2][i];
            params.size.col = arguments[0];
            params.size.row = arguments[1];
        }
    }
        return data;
    };

    data.append = function (arg) {
        if (arg.constructor === Array) {
            for (var i = 0; i < arg.length; i++) {
                if (typeof(params.arrays[params.keys[i]]) !== 'undefined') {
                    params.arrays[params.keys[i]].append(arg[i]);
                }
            }
            params.size.row++;
        }
        return data;
    };

    data.queue = function (arg) {
        if (arg.constructor === Array) {
            for (var i = 0; i < arg.length; i++) {
                if (typeof(params.arrays[params.keys[i]]) !== 'undefined') {
                    params.arrays[params.keys[i]].queue(arg[i]);
                }
            }
        }
        return data;
    };

    data.flush = function () {
        _.forEach(params.arrays, function (a) {
            a.flush();
        });
        params.size.row = 0;
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
 * @param [bpm=true] {boolean|number} Synchronization or Tempo setting. If given a boolean, it sets the current sync state of the clock to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM is 120. Recommended value range is around 60-140.
 * @param [subDiv=16] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
 * @param [autoStart=true] {boolean} If true, the clock is started when it is instantiated. Works well with a synced clock.
 * @returns {dtm.clock} a new clock object
 * @example
 *
 * var cl = dtm.clock(120);
 * cl.start();
 */
dtm.clock = function (bpm, subDiv, autoStart) {
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
        beat: 0,
        prevBeat: -1,

        offset: 0,
        requestId: null,
        autoStart: true
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

    /**
     * Get the value of a parameter of the clock object.
     * @function module:clock#get
     * @param param
     * @returns {*}
     */
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
     * @param [bpm] {boolean|number} Synchronization or Tempo setting. If given a boolean, it sets the current sync state of the clock to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM is 120. Recommended value range is around 60-140.
     * @param [subDiv=16] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
     * @param [autoStart=true] {boolean} If true, the clock is started when it is instantiated. Works well with a synced clock.
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv, autoStart) {
        if (typeof(bpm) === 'number') {
            params.bpm = bpm;
            params.sync = false;
        } else if (typeof(bpm) === 'boolean') {
            params.sync = bpm;
        }

        if (typeof(subDiv) !== 'undefined') {
            params.subDiv = subDiv;
        }

        if (typeof(autoStart) !== 'undefined') {
            params.autoStart = autoStart;
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

    clock.interval = function (sec) {
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
                            params.beat = Math.round((params.current-params.offset) / params.resolution);
                            //console.log(params.beat);
                        }

                        _.forEach(clock.callbacks, function (cb) {
                            cb(clock);
                        });

                        params.current = params.reported;
                    }

                    params.requestId = window.requestAnimationFrame(clock.tick);
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

                    params.beat = Math.round((dtm.master.clock.get('cur')-params.offset) / params.resolution * params.subDiv / 4);

                    //if (params.beat > params.prevBeat) {
                        _.forEach(clock.callbacks, function (cb) {
                            cb(clock);
                        });
                    //}

                    params.prevBeat = params.beat;
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

    clock.reset = function () {
        //if (params.source === 'animationFrame') {
        //    window.cancelAnimationFrame(params.requestId);
        //}

        if (params.isMaster) {
            params.offset = params.current;
        } else {
            params.offset = dtm.master.clock.get('cur');
        }
        params.beat = 0;

        //clock.start();
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

    clock.on = function (condition) {
        switch (condition) {
            case 'every':
                clock.callbacks.push(function (c) {
                    if (c.get('beat') % arguments[1] === 0) {
                        arguments[2](c);
                    }
                });
                break;
            default:
                break;
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

        if (params.autoStart) {
            clock.start();
        }
    }

    clock.set(bpm, subDiv, autoStart);

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
        name: 'default',
        isPlaying: false,
        poly: false,

        // what is this for?
        modDest: [],

        modList: [],

        sync: true,
        clock: dtm.clock(true, 8),

        instrModel: null,

        callbacks: [],

        defInstr: function defaultInstr(c) {
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
    };

    var instr = {
        type: 'dtm.instrument',
        //params: {}
        params: []
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
                if (!arguments[1]) {
                    return params.models;
                } else {
                    return params.models[arguments[1]];
                }

            case 'beat':
                return params.clock.get('beat');

            case 'modList':
            case 'params':
                return instr.params;

            default:
                break;
        }
    };

    instr.set = function (dest, src, adapt) {
        if (typeof(src) === 'number') {
            params.models[dest] = dtm.array(src);
        } else {
            if (src.constructor === Array) {
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
        if (arg.constructor === Array) {
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
        if (src.constructor === Array) {
            params.models[dest] = dtm.array(src).normalize();
        } else if (src.type === 'dtm.array') {
            // CHECK: assigning an array here is maybe not so smart...
            params.models[dest] = src.normalize();
        } else if (src.type === 'dtm.model') {

        }
        // use global index from the master

        return instr;
    };

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
                //params.clock.add(params.defInstr).start();
                //params.clock.add(params.instrModel.play).start();
            }

            if (params.instrModel) {
                if (params.instrModel.get('categ') === 'instr') {
                    //params.instrModel.stop();
                    //params.instrModel.play();

                    if (params.instrModel.output) {
                        params.clock.add(params.instrModel.output).start();
                    }
                }
            }

            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        } else {
            dtm.log('instrument ' + params.name + ' is already playing!');
        }

        return instr;
    };

    instr.start = instr.print = instr.run = instr.play;

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


    // TODO: implement this
    /**
     * Modulates a parameter of the instrument by the index or the name.
     * @function module:instr#mod
     * @param tgt {number|string}
     * @param src
     * @returns {dtm.instr}
     */
    instr.mod = function (tgt, src, literal) {
        var dest = '';

        if (typeof(tgt) === 'string') {
            dest = tgt;
        } else if (typeof(tgt) === 'number') {
            // TODO: error check
            dest = instr.params[tgt];
        }

        instr[dest](src, literal);
        // maybe feed arguments[1-];

        return instr;
    };

    function mapper(dest, src) {
        if (typeof(src) === 'number') {
            params.models[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.models[dest] = dtm.array(src).classify();
        } else {
            if (src.constructor === Array) {
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

    //instr.load = function (arg) {
    //    if (typeof(arg) === 'string') {
    //        var model = _.find(dtm.modelColl, {params: {
    //            name: arg,
    //            categ: 'instr'
    //        }});
    //
    //        if (typeof(model) !== 'undefined') {
    //            dtm.log('loading instrument model: ' + arg);
    //            params.instrModel = model;
    //            params.name = arg;
    //            //params.models = model.models;
    //            instr.model(model);
    //            //instr.play = params.instrModel.play;
    //            //instr.run = params.instrModel.run;
    //
    //            // CHECK: not good
    //            params.modDest.push(model);
    //        } else {
    //            dtm.log('registering a new instrument: ' + arg);
    //            params.name = arg;
    //            params.categ = 'instr';
    //            dtm.modelColl.push(instr);
    //        }
    //
    //    } else if (typeof(arg) !== 'undefined') {
    //        if (arg.params.categ === 'instr') {
    //            params.instrModel = arg; // TODO: check the class name
    //            instr.model(arg);
    //        }
    //    }
    //
    //    return instr;
    //};

    instr.load = function (arg) {
        var model;

        if (typeof(arg) === 'string') {
            //model = _.find(dtm.modelColl, function (m) {
            //    return m.get('name') == arg;
            //});
            model = dtm.modelCallers[arg]();
        } else if (arg.type === 'dtm.model') {
            model = arg;
        }

        if (typeof(model) !== 'undefined') {
            model.parent = instr;
            model.map(instr);

            params.instrModel = model;
        }

        return instr;
    };

    arg = arg || 'default';
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
 * Creates a new empty musical model object, or overloads on an existing model in the collection.
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

        parent: {},
        mod: {},
        param: {},

        params: {},
        models: {},

        modes: {
            'literal': ['literal', 'lit', 'l'],
            'adapt': ['adapt', 'adapted', 'adaptive', 'a'],
            'preserve': ['preserve', 'preserved', 'p']
        }
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
        //var m = dtm.model();
        //m.output = clone(model.output);
        //_.forEach(model.setter, function (val, key) {
        //    m.setter[key] = clone(val);
        //});
        //m.modules = clone(model.modules);
        //
        //return m;
        return clone(model);
    };

    model.assignMethods = function (parent) {
        _.forEach(model.mod, function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        _.forEach(model.param, function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        return model;
    };

    model.map = model.assignMethods;

    /**
     * Call this when creating a new model, which you may want to reuse with new instanciation.
     * @function module:model#register
     * @returns {dtm.model}
     */
    model.register = function () {
        dtm.modelCallers[model.get('name')] = arguments.callee.caller;
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

        note: {
            delay: 0,
            duration: 1
        },

        output: {
            gain: 0.5
        },

        //isPlaying: false,
        buffer: null,

        // TODO: amp gain & out gain
        amp: {
            gain: 0.5,
            adsr: [0.001, 0.2, 0, 0.001]
        },

        pitch: {
            freq: 440,
            noteNum: 69
        },

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

    var noise = null;

    if (dtm.wa.isOn) {
        noise = dtm.wa.makeNoise(8192);
    }

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
                out = params.amp.gain;
                break;

            case 'volume':
            case 'gain':
                out = params.output.gain;
                break;

            case 'frequency':
            case 'freq':
            case 'cps':
                out = params.pitch.freq;
                break;

            case 'noteNum':
            case 'notenum':
            case 'note':
            case 'nn':
                out = params.pitch.noteNum;
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
            params.amp.adsr[0] = arguments[0] || 0.001;
            params.amp.adsr[1] = arguments[1] || 0.001;
            params.amp.adsr[2] = arguments[2];
            params.amp.adsr[3] = arguments[3] || 0.001;
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
                } else if (arg.constructor === Array) {
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
        dur = dur || params.note.duration;

        var startT = now() + del;
        var src;

        //var noise = makeNoise();

        if (params.type === 'noise') {
            src = actx.createBufferSource();
            if (!noise) {
                noise = dtm.wa.makeNoise(8192);
            }
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
            src.frequency.setValueAtTime(params.pitch.freq, startT);
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

        var gain = actx.createGain();
        gain.gain.setValueAtTime(params.output.gain, startT);

        amp.connect(gain);
        gain.connect(out());

        var susLevel = params.amp.adsr[2] * params.amp.gain;
        amp.gain.setValueAtTime(0, now());
        amp.gain.setTargetAtTime(params.amp.gain, startT, params.amp.adsr[0]);
        amp.gain.setTargetAtTime(susLevel, startT+params.amp.adsr[0], params.amp.adsr[1]);

        var relStart = startT + params.amp.adsr[0] + params.amp.adsr[1] + dur;
        amp.gain.setTargetAtTime(0, relStart, params.amp.adsr[3]);

        src.start(startT);
        src.stop(relStart + params.amp.adsr[3] + 0.3);

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

        params.pitch.noteNum = nn;
        params.pitch.freq = dtm.value.mtof(nn);

        return synth;
    };

    /**
     * Sets the frequency of the note to be played.
     * @function module:synth#freq
     * @param freq {number}
     * @returns {dtm.synth}
     */
    synth.freq = function (freq) {
        params.pitch.freq = freq;
        return synth;
    };

    /**
     * Sets the amplitude of the note.
     * @function module:synth#amp
     * @param val {number} Amplitude between 0-1.
     * @returns {dtm.synth}
     */
    synth.amp = function (val) {
        params.amp.gain = val;
        return synth;
    };

    /**
     * Sets the duration for the each note.
     * @function module:synth#dur
     * @param val {number} Duration in seconds.
     * @returns {dtm.synth}
     */
    synth.dur = function (val) {
        params.note.duration = val;
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
        params.amp.adsr[0] = val;
        return synth;
    };

    synth.decay = function (val) {
        params.amp.adsr[1] = val;
        return synth;
    };

    synth.sustain = function (val) {
        params.amp.adsr[2] = val;
        return synth;
    };

    synth.release = function (val) {
        params.amp.adsr[3] = val;
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
dtm.guido = {
    //type: 'dtm.guido',
    //parts: [],
    //numParts: 1,

    pitchClass: {
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
    },

    diatonic: {
        'c': 0,
        'd': 2,
        'e': 4,
        'f': 5,
        'g': 7,
        'a': 9,
        'b': 11,
        '_': null
    },

    nnToPitch: function (nn) {
        var pc = dtm.guido.pitchClass[dtm.val.mod(nn, 12)];
        var oct = (nn - dtm.val.mod(nn, 12)) / 12 - 4;
        return pc + oct.toString();
    },

    pitchToNn: function (sym) {
        var elems = sym.split('');

        var acc = 0;
        var oct = 0;

        var pc = dtm.guido.diatonic[elems[0]];

        if (elems.length === 2) {
            oct = (parseInt(elems[1]) + 4) * 12;
        } else if (elems.length > 2) {
            if (elems[1] == '#') {
                acc = 1;
            } else if (elems[1] == '&') {
                acc = -1;
            }

            if (elems.length === 3) {
                if (elems[1] == '-') {
                    oct = (parseInt(elems[1]+elems[2]) + 4) * 12;
                } else {
                    oct = (parseInt(elems[2]) + 4) * 12;
                }
            } else if (elems.length === 4) {
                oct = (parseInt(elems[2] + elems[3]) + 4) * 12;
            }
        }

        return pc + acc + oct;
    }

    //guido.dur = {
    //    1: '/1',
    //    2: '/'
    //};

    //guido.setup = function () {
    //    return guido;
    //};
    //
    //guido.format = function () {
    //    return guido;
    //};
    //
    //guido.test = function (arr) {
    //    var res = [];
    //
    //    _.forEach(arr, function (val, idx) {
    //        res[idx] = [guido.pc[_.random(-1, 11)], '*', val + '/16'].join('');
    //    });
    //
    //    res = res.join(' ');
    //    console.log(res);
    //
    //    return guido;
    //};
    //
    //guido.meow = function (rhythm, pitches) {
    //    var res = [];
    //
    //    for (var i = 0; i < rhythm.length; i++) {
    //        if (pitches[i] instanceof Array) {
    //            var chord = [];
    //            _.forEach(pitches[i], function (val, idx) {
    //                chord[idx] = [guido.pc[val], '*', rhythm[i] + '/16'].join('');
    //            });
    //            res[i] = '{' + chord.join(', ') + '}';
    //        } else {
    //            res[i] = [guido.pc[pitches[i]], '*', rhythm[i] + '/16'].join('');
    //        }
    //    }
    //
    //    res = res.join(' ');
    //    console.log(res);
    //    return guido;
    //};
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
    var m = dtm.model('clave', 'instr').register();

    //var darr = dtm.transform;
    //m.motif = {};
    //m.motif.beats = darr.itob([3, 3, 4, 2, 4]);
    //m.motif.target = darr.itob([2, 1, 2, 1]);
    //m.motif.midx = 0;

    //var cl = dtm.clock(80);
    //cl.subDiv(16);
    //cl.setTime('2/4');

    var params = {
        modules: {
            voice: dtm.synth(),
            base: dtm.array([3,3,4,2,4]).itob(),
            target: dtm.array([2,1,2,1]).itob(),
            res: dtm.array([3,3,4,2,4]).itob(),
            morph: dtm.array(0)
        }
    };

    m.output = function (c) {
        c.div(16);

        var v = params.modules.voice;

        var m = params.modules.morph.get('next');
        var r = params.modules.res.get('next');

        if (r) {
            v.play();
        }
    };

    m.mod.morph = function (src, mode) {
        mapper(src, 'morph');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.morph.normalize(0, 1);
        } else {
            params.modules.morph.normalize();
        }
    };

    m.mod.target = function (src, mode) {
        mapper(src, 'target');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            //params.modules.target.normalize(0, 1);
        } else {
            //params.modules.target.normalize();
        }
    };

    //m.play = function () {
    //    var idx = 0;
    //
    //    cl.add(function () {
    //        var src = actx.createBufferSource();
    //        var amp = actx.createGain();
    //        src.connect(amp);
    //        amp.connect(out());
    //        src.buffer = noise;
    //        src.loop = true;
    //
    //        m.motif.morphed = darr.morph(m.motif.beats, m.motif.target, m.motif.midx);
    //
    //        if (idx >= m.motif.morphed.length) {
    //            idx = 0;
    //        }
    //
    //        amp.gain.setValueAtTime(0.5 * dtm.value.expCurve(m.motif.morphed[idx], 20), now());
    //        amp.gain.linearRampToValueAtTime(0, now() + 0.02);
    //
    //        src.start(now());
    //
    //        idx = (idx + 1) % m.motif.morphed.length;
    //    });
    //
    //    cl.start();
    //};

    //m.mod = function (val) {
    //    m.motif.midx = val;
    //};

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
                params.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    params.modules[dest] = src.clone().classify();
                } else {
                    params.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.modules[dest] = src;
            }
        }
    }

    return m;
})();
/**
 * @fileOverview Instrument model "default"
 * @module instr-default
 */

(function (){
    var m = dtm.model('default', 'instr').register();

    var params = {
        clock: dtm.clock(true, 8),
        sync: true,
        callbacks: [],

        modules: {
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

        pqRound: false
    };

    m.output = function (c) {
        var v = params.modules.voice;
        var vol = params.modules.volume.get('next');
        var dur = params.modules.dur.get('next');
        var r = params.modules.rhythm.get('next');
        var p = params.modules.pitch.get('next');
        var sc = params.modules.scale.get();
        var tr = params.modules.transp.get('next');
        var ct = params.modules.chord.get();
        var div = params.modules.subdiv.get('next');
        c.subDiv(div);

        var wt = params.modules.wavetable;
        var lpf = params.modules.lpf;
        var comb = params.modules.comb;
        var delay = params.modules.delay;

        if (params.sync === false) {
            c.bpm(params.modules.bpm.get('next'));
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
                    v.lpf(lpf.get('next'), params.modules.res.get('next'));
                }

                if (comb) {
                    v.comb(0.5, params.modules.comb.get('next'));
                }

                if (delay) {
                    v.delay(params.modules.delay.get('next'));
                }

                v.dur(dur).decay(dur);
                v.nn(dtm.val.pq(p + val, sc, params.pqRound) + tr).amp(vol).play();
            });
        }
    };

    /**
     * Sets the synthesis voice for the instrument. Alternatively: .syn(), .synth()
     * @function module:instr-default#voice
     * @param arg {string|dtm.synth}
     * @returns {dtm.instr}
     */
    m.param.voice = function (arg) {
        if (typeof(arg) === 'string') {
            params.modules.voice.set(arg);
        } else if (arg.type === 'dtm.synth') {
            params.modules.voice = arg;
        }
        return m.parent;
    };

    m.mod.syn = m.mod.synth = m.mod.voice;

    /**
     * Sets the wavetable using the input. Alternatively: .wavetable()
     * @function module:instr-default#wt
     * @param src {number|string|array|dtm.array}
     * @param [mode='adaptive'] {string}
     * @returns {dtm.instr}
     */
    m.mod.wt = function (src, mode) {
        mapper(src, 'wavetable');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.wavetable.range(0, 1, 0, 1)
        } else {
            params.modules.wavetable.normalize();
        }

        return m.parent;
    };

    m.mod.wavetable = m.mod.wt;

    m.mod.at = function (src, mode) {
        mapper(src, 'at');

        return m.parent;
    };

    m.mod.rhythm = function (src, mode) {
        mapper(src, 'rhythm');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.rhythm.normalize().round();
        }

        return m.parent;
    };

    m.mod.beats = m.mod.rhythm;

    m.mod.volume = function (src, mode) {
        mapper(src, 'volume');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.volume.logCurve(5).rescale(0.1, 1);
        }

        return m.parent;
    };

    m.mod.amp = m.mod.level = m.mod.vol = m.mod.volume;

    m.mod.pitch = function (src, mode, round) {
        mapper(src, 'pitch');

        if (m.modes.literal.indexOf(mode) > -1) {

        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.pitch.rescale(60, 90, 0, 1);
        } else {
            params.modules.pitch.rescale(60, 90);
        }

        if (round) {
            params.modules.pitch.round();
        }

        return m.parent;
    };

    m.mod.nn = m.mod.noteNum = m.mod.pitch;

    m.mod.transpose = function (src, mode, round) {
        mapper(src, 'transp');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.transp.normalize().scale(-12, 12);
        }

        if (round) {
            params.modules.transp.round();
        }

        return m.parent;
    };

    m.mod.tr = m.mod.transp = m.mod.transpose;

    m.mod.scale = function (src, mode, round) {
        if (typeof(round) === 'undefined') {
            params.pqRound = false;
        } else {
            params.pqRound = round;
        }

        mapper(src, 'scale');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.scale.normalize().scale(0,11).round().unique().sort()
        }


        return m.parent;
    };

    m.mod.pq = m.mod.scale;

    m.mod.chord = function (src, mode) {
        mapper(src, 'chord');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.chord.normalize().scale(0, 12).round().unique().sort();

            if (params.modules.chord.get('len') > 4) {
                params.modules.chord.fit(4).round().unique().sort();
            }
        }

        return m.parent;
    };

    m.param.clock = function (bpm, subDiv, time) {
        m.parent.get('clock').bpm(bpm);
        m.parent.get('clock').subDiv(subDiv);
        return m.parent;
    };

    m.mod.bpm = function (src, mode) {
        params.sync = false;

        mapper(src, 'bpm');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.bpm.normalize().scale(60, 180);
        }

        return m.parent;
    };

    m.mod.tempo = m.mod.bpm;

    // CHECK: not working
    m.mod.subDiv = function (src, mode) {
        mapper(src, 'subdiv');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.subdiv.normalize().scale(1, 5).round().powof(2);
        }

        return m.parent;
    };

    m.mod.len = m.mod.note = m.mod.div = m.mod.subdiv = m.mod.subDiv;

    m.param.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }
        params.clock.sync(bool);
        params.sync = bool;
        return m.parent;
    };

    m.mod.lpf = function (src, mode) {
        mapper(src, 'lpf');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.lpf.normalize().log(10).scale(500, 5000);
        }

        return m.parent;
    };

    m.mod.res = function (src, mode) {
        mapper(src, 'res');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.res.normalize().scale(0, 50);
        }

        return m.parent;
    };

    m.mod.comb = function (src, mode) {
        mapper('comb', src);

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.comb.normalize().rescale(60, 90);
        }

        return m.parent;
    };

    m.mod.delay = function (src, mode) {
        mapper(src, 'delay');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.delay.normalize();
        }

        return m.parent;
    };

    m.mod.dur = function (src, mode) {
        mapper(src, 'dur');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            params.modules.dur.normalize().exp(10).scale(0.01, 0.5);
        }

        return m.parent;
    };

    // CHECK: kind of broken now
    m.mod.on = function (arg) {
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
        return m.parent;
    };

    m.mod.when = m.mod.on;

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
                params.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    params.modules[dest] = src.clone().classify();
                } else {
                    params.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.modules[dest] = src;
            }
        }
    }

    return m;
})();
(function () {
    var m = dtm.model('testInstr', 'instr').register();

    m.mod.doThis = function () {
        console.log('doing this');
        return m.parent;
    };

    m.mod.testSetter = function (src, adapt) {
        console.log('testing');

        if (typeof(adapt) === 'undefined') {
            adapt = true;
        }

        if (adapt) {

        } else {

        }

        return m.parent;
    };

    return m;
})();
(function () {
    var params = {
        clock: dtm.clock(true, 16),
        sync: true,
        callbacks: [],

        measures: 4,
        time: '4/4',

        modules: {
            voice: dtm.synth(),
            wavetable: null,
            volume: dtm.array(1),
            scale: dtm.array().fill('seq', 12),
            rhythm: dtm.array(1),
            pitch: dtm.array().fill('line', 8, 60, 72).round(),
            transp: dtm.array(0),
            chord: dtm.array(0),

            repeats: null,
            step: null,
            dur: dtm.array().fill('consts', 8, 16),

            bpm: dtm.array(120),
            subdiv: dtm.array(16)
        }
    };

    var m = dtm.model('testNotation', 'instr').register();
    var g = dtm.guido;
    var osc = dtm.osc;

    m.output = function (c) {
        osc.start();

        var time = params.time.split('/');
        var len = time[0] / time[1] *  params.measures;

        var res = [];
        var pc = [];
        var oct = [];
        var div = params.modules.subdiv.get();
        var p = params.modules.pitch.get();
        var dur = params.modules.dur.get();

        //var vol = params.modules.volume.get('next');
        //var r = params.modules.rhythm.get('next');

        //var sc = params.modules.scale.get();
        //var tr = params.modules.transp.get('next');
        //var ct = params.modules.chord.get();


        for (var i = 0; i < 8; i++) {
            pc[i] = g.pitchClass[dtm.val.mod(p[i], 12)];
            oct[i] = (p[i] - dtm.val.mod(p[i], 12)) / 12 - 4;
            res[i] = pc[i] + oct[i].toString() + '*' + dur[i] + '/' + div[0];
        }

        res = res.join(' ');
        osc.send('[\\instr<"Flute", dx=-1.65cm, dy=-0.5cm>\\meter<"4/4"> \\clef<"f"> ' + res + ']');

        return m.parent;
    };

    m.param.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper('pitch', src);

        if (literal) {
            params.modules.pitch.round();
        } else {
            params.modules.pitch.normalize().rescale(60, 90).round();
        }

        return m.parent;
    };

    m.mod.subDiv = function (src, literal) {
        mapper('subdiv', src);

        if (literal) {
            params.modules.subdiv.round();
        } else {
            params.modules.subdiv.normalize().scale(1, 5).round().powof(2);
            //params.modules.subdiv.normalize();
            //params.modules.mult(params.measures/params.modules.subdiv.get('sum'));
            //params.modules.add(-1).mult(-1).scale(1, 5).round().powof(2);
        }
        return m.parent;
    };

    m.mod.dur = function (src, literal) {
        mapper('dur', src);

        if (literal) {
            params.modules.dur.round();
        } else {
            params.modules.dur.normalize();
            params.modules.dur.mult(params.measures * params.modules.subdiv.get(0)/params.modules.dur.get('sum')).round();
        }

        return m.parent;
    };

    m.mod.len = m.mod.note = m.mod.div = m.mod.subdiv = m.mod.subDiv;

    function mapper(dest, src) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array(src).classify();
        } else {
            if (src.constructor === Array) {
                params.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    params.modules[dest] = src.clone().classify();
                } else {
                    params.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.modules[dest] = src;
            }
        }
    }

    return m;
})();
/**
 * @fileOverview Instrument model "default"
 * @module instr-decatur
 */

(function () {
    var m = dtm.model('decatur', 'instr').register();

    var params = {
        name: 'Flute',

        score: true,
        midi: true,

        // only for score
        staves: 1,
        clef: 'g',
        durFx: ['rest', 'stacc', 'half', 'normal', 'tenuto', 'slur'],
        dynFx: ['pp', 'p', 'mp', 'mf', 'f', 'ff'],

        // only for MIDI
        bpm: dtm.master.clock.get('bpm'),

        voice: 'mono',
        measures: 4,
        time: '4/4',
        div: 16,
        update: 1,
        repeat: 2,
        repMap: [2, 3, 3, 3, 4, 5, 5, 6, 6, 6, 7, 7, 8, 9],

        divMap: [16, 8, 16, 8, 16],
        range: {
            'Flute': [60, 75, 91],
            'Cello': [36, 48, 72],
            'Piano': [60, 72, 84],
            'PianoL': [36, 48, 60],
            'Pad': [36, 54, 72],
            'Bass': [48, 54, 60]
        },
        scale: [[0, 2, 7, 9], [2, 5, 7], [0, 2, 5, 7, 10], [0, 2, 5, 7], [0, 2, 4, 7, 9], [0, 2, 4, 6, 7], [2, 4, 6, 7, 9]],

        celloFx: ['arc', 'pizz'],

        callbacks: []
    };

    var mods = {
        pitch: dtm.array().fill('random', 8, 60, 72).round(),
        range: dtm.array(0.3),
        scale: dtm.array(params.scale[params.scale.length-1]),
        scaleSel: dtm.array(2),

        transp: dtm.array(0),
        chord: dtm.array(0),

        pos: dtm.array(0),

        div: dtm.a(Math.round(params.divMap.length/2)),
        repeat: dtm.array(1),
        note: dtm.array().fill('ones', 8),
        dur: dtm.array().fill('ones', 8),
        dyn: dtm.array().fill('zeros', 8),

        activity: dtm.array(0)
    };

    var g = dtm.guido;
    var osc = dtm.osc;

    m.output = function (c) {
        c.div(params.div);

        var rep = params.repeat;
        var numNotes = params.div * params.measures;

        if (c.get('beat') % (numNotes * params.update) === 0) {
            _.forEach(params.callbacks, function (cb) {
                cb(c);
            });
        }

        var sc = mods.scale.get();
        var chord = mods.chord.get();

        var pLen = Math.round(numNotes/rep);
        var pArr = mods.pitch.clone().fit(pLen, 'linear').log(10).round();

        //var range = mods.range.clone().fit(pLen, 'step');
        //var low = Math.round((params.range[params.name][0] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        //var high = Math.round((params.range[params.name][2] - params.range[params.name][1]) * range.get('mean') + params.range[params.name][1]);
        var nArr = mods.note.clone().scale(0.1, 1).fit(pLen, 'linear').fitSum(pLen, true);
        var acArr = mods.activity.clone().fit(pLen, 'linear').round();
        var trArr = mods.transp.clone().fit(pLen, 'linear').round();

        if (params.score && (params.name === 'Flute' || params.name === 'Piano' || params.name === 'PianoL' || params.name === 'Cello')) {


            // MEMO: \repeatBegin at the beginning breaks the score (bug)
            if (c.get('beat') % (numNotes * params.update) === 0) {
                var seq = [];

                var slurOn = false;
                var accum = 0, accErr = 0;
                var fixImaginaryLines = false;
                var pre, post;

                var durArr = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round();
                var dynArr = mods.dyn.clone().fit(pLen, 'step');


                if (params.div <= 16) {
                    params.durFx[2] = 'stacc';
                } else {
                    params.durFx[2] = 'half';
                }

                for (var i = 0; i < numNotes; i++) {
                    seq[i] = '';

                    var p = pArr.get('next');
                    var len = nArr.get('next');
                    var dur = durArr.get('next');
                    var prevDyn = dynArr.get('current');
                    var dyn = dynArr.get('next');
                    var ac = acArr.get('next');
                    var tr = trArr.get('next');

                    //===== imaginary line stuff =====
                    if (len > 1 && len + (accum % 4) > 4) {
                        fixImaginaryLines = true;
                        post = (len + accum) % 4;

                        if (post == 0) {
                            post = 4;
                        }
                        pre = len - post;
                        //console.log('bad: ' + i);
                        //console.log('accum: ' + accum);
                        //console.log('pre: ' + pre);
                        //console.log('post: ' + post);
                    }
                    accum += len;
                    //==================================

                    if (i == numNotes-1) {
                        accErr = numNotes - accum;

                        if (fixImaginaryLines) {
                            post += accErr;
                        } else {
                            len += accErr;
                        }
                    }

                    if (post == 0) {
                        len = pre;
                        fixImaginaryLines = false;
                    }

                    var pitch = '';

                    pitch += dtm.guido.nnToPitch(dtm.val.pq(p+tr, sc, true));

                    // note len & duration
                    if (params.durFx[dur] == 'rest' || ac === 0) {
                        pitch = '_';

                        if (slurOn) {
                            seq[i-1] += ' \\slurEnd';
                            slurOn = false;
                        }
                    }

                    if (params.durFx[dur] == 'slur' && ac !== 0) {
                        if (!slurOn && i !== numNotes-1) {
                            seq[i] += '\\slurBegin ';
                            slurOn = true;
                        }
                    }

                    if (params.durFx[dur] == 'half' && ac !== 0) {
                        if (fixImaginaryLines) {
                            seq[i] += pitch + '*' + pre + '/' + params.div*2 + '_*' + pre + '/' + params.div*2;
                            seq[i] += ',';
                            seq[i] += pitch + '*' + post + '/' + params.div*2 + '_*' + post + '/' + params.div*2;
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div*2 + '_*' + len + '/' + params.div*2;
                        }

                    } else {
                        if (fixImaginaryLines && !(params.durFx[dur] == 'rest' || ac === 0)) {
                            seq[i] += '\\tieBegin \\space<4> ' + pitch + '*' + pre + '/' + params.div;
                            seq[i] += ' , ';
                            seq[i] += pitch + '*' + post + '/' + params.div + ' \\tieEnd';
                        } else if (len !== 0) {
                            seq[i] += pitch + '*' + len + '/' + params.div;
                        }
                    }

                    if (ac !== 0 && !slurOn && params.div >= 4 && seq[i] != '' && params.name !== 'PianoL') {
                        if (params.durFx[dur] == 'stacc') {
                            seq[i] = '\\stacc( ' + seq[i] + ' )';
                        } else if (params.durFx[dur] == 'tenuto') {
                            seq[i] = '\\ten( ' + seq[i] + ' )';
                        }
                    }

                    if (params.durFx[dur] !== 'rest' &&
                        params.durFx[dur] !== 'stacc' &&
                        params.durFx[dur] !== 'tenuto' &&
                        ac === 2 && chord.length === 1 &&
                        seq[i] != '' &&
                        params.name !== 'PianoL') {
                        seq[i] = '\\accent( ' + seq[i] + ' )';
                    }

                    if ((params.durFx[dur] != 'slur' && slurOn) || i == numNotes-1 && slurOn) {
                        seq[i] += ' \\slurEnd';
                        slurOn = false;
                    }

                    //if (i > 0) {
                    //    if (dyn != prevDyn && (params.durFx[dur] != 'rest' || ac === 0)) {
                    //        seq[i] = '\\intens<"' + params.dynFx[dyn] + '", dx=-0.3, dy=-4> ' + seq[i];
                    //    }
                    //} else {
                    //    if (params.durFx[dur] != 'rest' || ac === 0) {
                    //        seq[i] = '\\intens<"' + params.dynFx[dyn] + '", dx=-0.3, dy=-4> ' + seq[i];
                    //    }
                    //}

                    fixImaginaryLines = false;
                }

                //================ formatting ================

                for (var i = seq.length-1; i >= 0; i--) {
                    if (seq[i] === '') {
                        seq.splice(i, 1);
                    }
                }

                for (var i = seq.length-1; i > 0; i--) {
                    if (seq[i].indexOf('_') > -1 && seq[i-1].indexOf('_') > -1) {
                        seq[i-1] = '_*' + (parseInt(seq[i].substr(seq[i].indexOf('*')+1, (seq[i].indexOf('/')-seq[i].indexOf('*')-1))) +
                        parseInt(seq[i-1].substr(seq[i-1].indexOf('*')+1, (seq[i-1].indexOf('/')-seq[i-1].indexOf('*')-1)))) + '/' + params.div;

                        seq[i] = '';
                    }
                }

                for (var i = 0; i < seq.length; i++) {
                    if (seq[i].indexOf(',') > -1) {
                        var sliced = seq[i].split(',');
                        seq[i] = sliced[0];
                        seq.splice(i+1, 0, sliced[1]);
                    }
                }

                for (var i = seq.length-1; i > 0; i--) {
                    if (seq[i] === '') {
                        seq.splice(i, 1);
                    }
                }

                for (var i = 0; i < seq.length; i++) {
                    if (seq[i].indexOf(' ') > -1) {
                        var sliced = seq[i].split(' ');
                        for (var j = 0; j < sliced.length-1; j++) {
                            seq[i+j] = sliced[j];
                            seq.splice(i+1+j, 0, sliced[j+1]);
                        }
                    }
                }

                if (mods.chord.get('len') > 1) {
                    seq = harmonizeGuido(seq, chord, sc);
                }

                //var accum = 0;
                //var space = ' \\space<4> ';
                //for (var i = 0; i < seq.length; i++) {
                //    accum += parseInt(seq[i].substr(seq[i].indexOf('*')+1, (seq[i].indexOf('/')-seq[i].indexOf('*')-1)));
                //
                //    if (seq[i].indexOf('_') > -1) {
                //        seq[i] = seq[i] + ' \\space<4> ';
                //    }
                //
                //
                //    if (accum >= 16) {
                //        seq[i] += space;
                //        if (accum % 16 === 0 && i !== seq.length-1) {
                //            seq[i+1] = '\\bar ' + space + seq[i+1];
                //        } else if (i === seq.length-1) {
                //            seq[i] += ' \\space<4> ';
                //        }
                //        accum -= 16;
                //    }
                //}

                var staffFormat = '\\staffFormat<"5-line",';
                if (seq.length === 1) {
                    staffFormat += 'size=1.3pt>';
                } else if (seq.length < 50) {
                    staffFormat += 'size=1.3pt>';
                } else if (seq.length < 100) {
                    staffFormat += 'size=2pt>';
                } else {
                    staffFormat += 'size=3pt>';
                }

                var staff = '\\staff<';

                switch (params.name) {
                    case 'Flute':
                        staff += '1';
                        break;
                    case 'Cello':
                        staff += '2';
                        break;
                    case 'Piano':
                        staff+= '3';
                        break;
                    case 'PianoL':
                        staff+= '4';
                        break;
                    default:
                        break;
                }

                if (seq.length === 1) {
                    staff += ',5mm>';
                } else {
                    switch (params.name) {
                        case 'Flute':
                            staff += ',14mm>';
                            break;
                        case 'Cello':
                            staff += ',14mm>';
                            break;
                        case 'Piano':
                            staff+= ',10mm>';
                            break;
                        case 'PianoL':
                            staff+= ',10mm>';
                            break;
                        default:
                            break;
                    }
                }

                seq = seq.join(' ');

                var name = '';
                if (params.name === 'Flute' || params.name === 'Cello') {
                    name += '\\instr<"' + params.name + '", dx=-1.65cm, dy=-0.5cm>';
                } else if (params.name === 'Piano') {
                    name += '\\instr<"' + params.name + '", dx=-1.65cm, dy=-1.3cm>';
                }
                var clef = '\\clef<"' + params.clef + '">';

                if (params.name === 'PianoL') {
                    clef = '';
                }

                var time = '\\meter<"' + params.time + '">';

                var autoBreak = '';
                var pageFormat = '';

                var barLine = '\\barFormat<style="staff">';

                if (params.name === 'Flute') {
                    autoBreak = '\\set<autoSystemBreak="off">';
                    pageFormat = '\\pageFormat<30cm, 10cm, 2cm, 5cm, 2cm, 5cm>';
                }

                //console.log('[' + pageFormat + autoBreak + name + clef + time + seq + ' \\space<6> \\repeatEnd]');

                //+ staff + staffFormat
                osc.send('/decatur/score', [params.name, '[' + pageFormat + autoBreak + name + clef + time + seq + ' \\space<6> \\repeatEnd]']);
            }
        }

        if (params.midi) {
            if (c.get('beat') % (numNotes * params.update) === 0) {
                params.bpm = dtm.master.clock.get('bpm');
                var evList = [];
                var unit = 60 / params.bpm * 4 / params.div;

                var dur = mods.dur.clone().fit(pLen, 'step').scale(0, 5).round().normalize();

                var del = 0;

                for (var j = 0; j < params.update; j++) {
                    // TODO: array get-next should be fixed
                    pArr.index(pLen-1);
                    nArr.index(pLen-1);
                    dur.index(pLen-1);
                    acArr.index(pLen-1);

                    del = numNotes * j;

                    for (var i = 0; i < numNotes; i++) {
                        var noteLen = nArr.get('next');
                        var p = pArr.get('next');
                        var durMod = dur.get('next');
                        var ac = acArr.get('next');
                        var tr = trArr.get('next');

                        if (noteLen !== 0) {
                            if (durMod !== 0 && ac !== 0) {
                                var delInSec = del * unit + dtm.val.rand(0, 0.01);
                                var durInSec = noteLen * durMod * unit * 0.95;
                                if (mods.chord.get('len') > 1) {
                                    for (var k = 0; k < chord.length; k++) {
                                        var trv = dtm.val.pq(p + tr, sc, true);
                                        evList.push([delInSec, durInSec, dtm.val.pq(trv + chord[k], sc, true)]);
                                    }
                                } else {
                                    evList.push([delInSec, durInSec, dtm.val.pq(p + tr, sc, true)]);
                                }
                            }
                            del += noteLen;
                        }
                    }
                }

                //if (params.name === 'PianoL') {
                //    console.log(evList);
                //}

                for (var i = 0; i < evList.length; i++) {
                    if (typeof(evList[i]) !== 'undefined') {
                        dtm.osc.send('/decatur/midi', [params.name].concat(evList[i]));
                    }
                }
            }
        }

        return m.parent;
    };

    m.param.get = function (param) {
        switch (param) {
            case 'score':
                break;
            case 'midi':
                break;

            case 'a':
            case 'array':
                return mods[arguments[1]];
                break;
            default:
                break;
        }
        return m.parent;
    };

    /**
     * Switches output for Guido notation.
     * @function module:instr-decatur#score
     * @param bool {boolean}
     * @returns {dtm.instr}
     */
    m.param.score = function (bool) {
        params.score = bool;
        return m.parent;
    };


    /**
     * Switches output for MIDI message via OSC.
     * @function module:instr-decatur#midi
     * @param bool {boolean}
     * @returns {dtm.instr}
     */
    m.param.midi = function (bool) {
        params.midi = bool;
        return m.parent;
    };

    /**
     * Sets the instrument name.
     * @function module:instr-decatur#name
     * @param src {string}
     * @returns {dtm.instr}
     */

    m.param.name = function (src) {
        params.name = src;

        switch (params.name) {
            case 'Flute':
                params.clef = 'g';
                break;
            case 'Cello':
                params.clef = 'f';
                break;
            case 'Piano':
                params.clef = 'g';
                break;
            case 'PianoL':
                params.clef = 'f';
                break;
            default:
                break;
        }
        return m.parent;
    };

    m.param.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.param.update = function (val) {
        params.update = val;
        return m.parent;
    };

    m.param.clef = function (src) {
        params.clef = src;
        return m.parent;
    };

    m.param.staves = function (num) {
        params.staves = num;
        return m.parent;
    };

    m.param.onUpdate = function (cb) {
        params.callbacks.push(cb);
        return m.parent;
    };

    m.mod.pitch = function (src, mode) {
        mapper(src, 'pitch');

        if (m.modes.literal.indexOf(mode) > -1) {
            mods.pitch.round();
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96, 0, 1).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81, 0, 1).round();
                mods.pitch.rescale(36, 72, 0, 1).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84, 0, 1).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60, 0, 1).round();
            } else if (params.name === 'Bass') {
                mods.pitch.rescale(48, 65, 0, 1).round();
            } else {
                mods.pitch.rescale(60, 96, 0, 1).round();
            }
        } else {
            if (params.name === 'Flute') {
                mods.pitch.rescale(60, 96).round();
            } else if (params.name === 'Cello') {
                //mods.pitch.rescale(36, 81).round();
                mods.pitch.rescale(36, 72).round();
            } else if (params.name === 'Piano') {
                mods.pitch.rescale(60, 84).round();
            } else if (params.name === 'PianoL') {
                mods.pitch.rescale(36, 60).round();
            } else if (params.name === 'Bass') {
                mods.pitch.rescale(48, 65).round();
            } else {
                mods.pitch.rescale(60, 96).round();
            }
        }

        return m.parent;
    };

    m.mod.range = function (src, mode) {
        mapper(src, 'range');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            mods.range.exp(2).scale(0.2, 0.8);
        }

        return m.parent;
    };

    m.mod.transpose = function (src, mode) {
        mapper(src, 'transp');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
        }

        return m.parent;
    };

    m.mod.tr = m.mod.transp = m.mod.transpose;

    m.mod.scale = function (src, mode) {
        if (m.modes.literal.indexOf(mode) > -1) {
            mapper(src, 'scale');
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mapper(src, 'scaleSel');
            mods.scaleSel.rescale(0, params.scale.length-1, 0, 1).round();
            mods.scale.set(params.scale[mods.scaleSel.get('mode')])
        } else {
            mapper(src, 'scaleSel');
            mods.scaleSel.rescale(0, params.scale.length-1).round();
            mods.scale.set(params.scale[mods.scaleSel.get('mode')])
        }

        return m.parent;
    };

    m.mod.chord = function (src, mode) {
        mapper(src, 'chord');
        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
        }
        return m.parent;
    };

    m.mod.pq = m.mod.scale;

    m.mod.div = function (src, mode) {
        mapper(src, 'div');

        if (m.modes.literal.indexOf(mode) > -1) {
            params.div = mods.div.round().get('mode');
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            mods.div.range(0, params.divMap.length-1).round();
            params.div = params.divMap[mods.div.get('mode')];
        }

        return m.parent;
    };

    m.mod.activity = function (src, mode) {
        mapper(src, 'activity');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.activity.scale(0, 2, 0, 1).round();
        } else {
            mods.activity.scale(0, 2).round();
        }

        if (!mode) {
        }

        return m.parent;
    };

    m.mod.ac = m.mod.activity;

    m.mod.note = function (src, mode) {
        mapper(src, 'note');

        if (m.modes.literal.indexOf(mode) > -1) {
            mods.note.round();
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
        }

        //else {
        //    mods.note.fitSum(params.measures * mods.div.get(0), true);
        //}

        return m.parent;
    };

    m.mod.dur = function (src, mode) {
        mapper(src, 'dur');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.dur.normalize(0, 1);
        } else {
            mods.dur.normalize();
        }

        return m.parent;
    };

    m.mod.dyn = function (src, mode) {
        mapper(src, 'dyn');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.dyn.scale(0, 5, 0, 1).round();
        } else {
            mods.dyn.scale(0, 5).round();
        }

        return m.parent;
    };

    m.mod.density = function (src, mode) {
        mapper(src, 'density');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
        } else {
            mods.density.scale(1, 32).exp(5);
        }

        return m.parent;
    };

    m.mod.repeat = function (src, mode) {
        mapper(src, 'repeat');

        if (m.modes.literal.indexOf(mode) > -1) {
            params.repeat = src;
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            mods.repeat.rescale(0, params.repMap.length-1, 0, 1).round();
            params.repeat = params.repMap[mods.repeat.get('mode')];
        } else {
            mods.repeat.rescale(0, params.repMap.length-1).round();
            params.repeat = params.repMap[mods.repeat.get('mode')];
        }

        return m.parent;
    };

    m.mod.rep = m.mod.repeat;

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            mods[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            mods[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
                mods[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    mods[dest] = src.clone().classify();
                } else {
                    mods[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                mods[dest] = src;
            }
        }
    }

    function harmonizeGuido(seq, chord, scale) {
        for (var i = 0; i < seq.length; i++) {
            if (seq[i].indexOf('*') > -1 && seq[i].indexOf('_') === -1) {
                var nn = dtm.guido.pitchToNn(seq[i].split('*')[0]);

                seq[i] = '{' + seq[i];

                for (var j = 0; j < chord.length; j++) {
                    if (chord[j] !== 0) {
                        var cv = nn + chord[j];
                        if (scale) {
                            cv = dtm.val.pq(cv, scale, true);
                        }
                        seq[i] += ', ';
                        seq[i] += dtm.guido.nnToPitch(cv);
                    }
                }
                seq[i] += '}';
            }
        }

        return seq;
    }

    return m;
})();
(function () {
    var m = dtm.model('csd', 'instr').register();

    var mods = {
        pitch: dtm.a(60),
        div: dtm.a(8)
    };

    var csd = null;
    if (typeof(csound) !== 'undefined') {
        csd = csound;
    }

    m.output = function (c) {
        var p = mods.pitch.get('next');
        c.div(mods.div.get('next'));

        csd.Event('i1 0 0.2 ' + p);
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (!literal) {
            mods.pitch.normalize().scale(60, 90);
        }

        return m.parent;
    };

    m.mod.div = function (src, literal) {
        mapper(src, 'div');

        if (!literal) {
            mods.div.normalize().scale(0, 5).round().powof(2);
        }

        return m.parent;
    };

    m.mod.file = function (src, literal) {
        return m.parent;
    };

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            mods[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            mods[dest] = dtm.array(src).classify();
        } else {
            if (src.constructor === Array) {
                mods[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    mods[dest] = src.clone().classify();
                } else {
                    mods[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                mods[dest] = src;
            }
        }
    }

    return m;
})();
(function () {
    var m = dtm.model('csd-osc', 'instr').register();

    var params = {
        iNum: 1
    };

    m.modules = {
        pitch: dtm.a(72),
        div: dtm.a(16)
    };

    m.output = function (c) {
        var p = m.modules.pitch.get('next');
        var div = m.modules.div.get('next');
        c.div(div);

        var i = params.iNum;
        if (typeof(i) === 'number') {
            i = 'i'.concat(i);
        } else {
            i = 'i\\"'+i+'\\"';
        }

        dtm.osc.send('/csd/event', [i, 0, 0.1, p]);
        return m.parent;
    };

    m.mod.pitch = function (src, literal) {
        mapper(src, 'pitch');

        if (!literal) {
            m.modules.pitch.normalize().rescale(60, 90).round();
        }

        return m.parent;
    };

    m.mod.div = function (src, literal) {
        mapper(src, 'div');

        if (!literal) {
            m.modules.div.normalize().scale(1, 5).round().powof(2);
        }
        return m.parent;
    };

    m.param.name = function (src, literal) {
        params.iNum = src;
        return m.parent;
    };

    // TODO: this needs to be a core function?
    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            m.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            m.modules[dest] = dtm.array(src).classify();
        } else {
            if (src.constructor === Array) {
                m.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    m.modules[dest] = src.clone().classify();
                } else {
                    m.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                m.modules[dest] = src;
            }
        }
    }

    return m;
})();
})();