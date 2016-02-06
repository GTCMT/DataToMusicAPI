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
    version: '0.0.5',

    log: function (arg) {
        if (params.isLogging) {
            if (arguments.callee.caller.name) {
                console.log(arguments.callee.caller.name + ': ' + arg);
            } else {
                console.log(arg);
            }
        }
    },

    // TODO: put these in dtm.master
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
                dtm.modelColl.forEach(function (m) {
                    res.push(m.get('name'));
                });
                return res;
            default:
                return null;
        }
    },

    wa: {
        isOn: true,
        useOfflineContext: false
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
            dtm.gen('range', bufLen).get().forEach(function (idx) {
                contents[idx] = dtm.value.random(-1, 1);
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
            dtm.gen('range', bufLen).get().forEach(function (idx) {
                left[idx] = dtm.val.rescale(dtm.val.expCurve(dtm.value.random(0, 1) * (bufLen - idx) / bufLen, exp), -1, 1);
                right[idx] = dtm.val.rescale(dtm.val.expCurve(dtm.value.random(0, 1) * (bufLen - idx) / bufLen, exp), -1, 1);
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
    },

    export: function () {
        objForEach(dtm, function (v, k) {
            if (isEmpty(window[k])) {
                window[k] = v;
            }
        });
    }
};

this.dtm = dtm;

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
    return new Promise(function (resolve) {
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
/**
 * @module utils
 */

/* TYPE CHECKING */

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
    } else if (typeof(value) === 'number' && isNaN(value)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Returns true if the value is a number and is not NaN
 * @param value
 * @returns {boolean}
 */
function isNumber(value) {
    return !!(typeof(value) === 'number' && !isNaN(value));
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
    return typeof(value) === 'function';
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
    return !!(!isArray(val) && !isDtmObj(val) && !isFunction(val) && !isEmpty(val));
}

/**
 * Checks if a value is any kind of array
 * @private
 * @param val
 * @returns {boolean}
 */
function isArray(val) {
    return Array.isArray(val) || isFloat32Array(val);
}

/**
 * Checks if the value is a Float32Array
 * @param val
 * @returns {boolean}
 */
function isFloat32Array(val) {
    var res = false;
    if (!isEmpty(val)) {
        if (val.constructor.name === 'Float32Array' && val.length > 0) {
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
 * Checks if the value is either a regular or typed number array
 * @param val
 * @returns {boolean}
 */
function isNumOrFloat32Array(val) {
    return isNumArray(val) || isFloat32Array(val);
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
        res = val.some(function (v) {
            return isArray(v);
        });
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

/**
 * Checks if the value is an instance of DTM object
 * @param val
 * @returns {boolean}
 */
function isDtmObj(val) {
    if (isObject(val) || isFunction(val)) {
        return val.hasOwnProperty('meta');
    } else {
        return false;
    }
}

/**
 * Checks if the value is an instance of dtm.array
 * @param val
 * @returns {boolean}
 */
function isDtmArray(val) {
    if (isObject(val) || isFunction(val)) {
        if (val.hasOwnProperty('meta')) {
            return (val.meta.type === 'dtm.array' || val.meta.type === 'dtm.generator');
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
        return val.every(function (v) {
            return isDtmArray(v);
        });
    } else {
        return false;
    }
}

function isNumDtmArray(obj) {
    return isDtmArray(obj) && isNumOrFloat32Array(obj.value);
}

function isNestedNumDtmArray(obj) {
    return isNestedDtmArray(obj) && obj.value.every(function (a) { return isNumDtmArray(a)});
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
    argsToArray(args).forEach(function () {
        fn.apply(this, arguments);
    });
}

/**
 * Checks if the arguments object consist of a single array item
 * @param args {object} The arguments object
 * @returns {boolean}
 */
function argIsSingleArray(args) {
    return !!(args.length === 1 && isArray(args[0]));
}

function argsAreSingleVals(args) {
    var res = false;
    if (!argIsSingleArray(args)) {
        var argsArr = argsToArray(args);
        res = argsArr.every(function (a) {
            return isSingleVal(a);
        });
    }
    return res;
}

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
            return new Float32Array(src);
        }
    } else {
        return src;
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

function Float32Splice(array, len) {
    var res = new Float32Array(array.length - len);
    var temp = Array.prototype.slice.call(array);
    res.set(temp.splice(len));

    return res;
}

function splice(array, len) {
    if (isArray(array)) {
        return array.splice(len);
    } else if (isFloat32Array(array)) {
        return Float32Splice(array, len);
    }
}

function truncateDigits(value) {
    var digits = 10;
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}

function Float32Map(array, cb) {
    var res = new Float32Array(array.length);

    array.forEach(function (v, i) {
        res[i] = cb(v);
    });

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
dtm.util.isMixedArray = isMixedArray;
dtm.util.isNestedArray = isNestedArray;
dtm.util.isNestedWithDtmArray = isNestedWithDtmArray;
dtm.util.isDtmObj = isDtmObj;
dtm.util.isDtmArray = isDtmArray;
dtm.util.isNestedDtmArray = isNestedDtmArray;
dtm.util.isStringArray = isStringArray;
dtm.util.isBoolArray = isBoolArray;
dtm.util.hasMissingValues = hasMissingValues;
dtm.util.arrayCompare = arrayCompare;
dtm.util.argsToArray = argsToArray;
dtm.util.argsForEach = argsForEach;
dtm.util.argIsSingleArray = argIsSingleArray;
dtm.util.argsAreSingleVals = argsAreSingleVals;
dtm.util.toFloat32Array = toFloat32Array;
dtm.util.fromFloat32Array = fromFloat32Array;
dtm.util.Float32Concat = Float32Concat;
dtm.util.concat = concat;
dtm.util.Float32splice = Float32Splice;
dtm.util.splice = splice;
dtm.util.truncateDigits = truncateDigits;
dtm.util.Float32Map = Float32Map;
dtm.util.deferCallback = deferCallback;
dtm.util.cloneArray = cloneArray;
dtm.util.objForEach = objForEach;
dtm.util.numProperties = numProperties;
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
     * Returns the minimum value of numeric array.
     * @function module:analyzer#min
     * @param arr {number}
     * @returns {number}
     */
    min: function (arr) {
        if (isNumOrFloat32Array(arr)) {
            return Math.min.apply(this, arr);
        }
    },

    /**
     * Returns the maximum value of numeric array.
     * @function module:analyzer#max
     * @param arr {number}
     * @returns {number}
     */
    max: function (arr) {
        if (isNumOrFloat32Array(arr)) {
            return Math.max.apply(this, arr);
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
        if (isNumOrFloat32Array(arr)) {
            return dtm.analyzer.sum(arr) / arr.length;
        }
    },

    /**
     * Returns the most frequent value of the array.
     * @function module:analyzer#mode
     * @param arr {array}
     * @returns {value}
     */
    mode: function (arr) {
        var uniqs = dtm.analyzer.unique(arr);
        var max = 0;
        var num = 0;
        var res = null;

        var histo = dtm.anal.countBy(arr);

        uniqs.forEach(function (val) {
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
     * @returns {number}
     */
    sum: function (arr) {
        return arr.reduce(function (num, sum) {
            return num + sum;
        });
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
        arr.forEach(function (val, idx) {
            res[idx] = Math.pow((mean - val), 2);
        });

        // TODO: divide-by-zero error
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
        arr.forEach(function (val, idx) {
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
        arr.forEach(function (val, idx) {
            res[idx] = Math.pow(val, 2);
        });

        return Math.sqrt(dtm.analyzer.mean(res));
    },

    unique: function (input) {
        var res = [];
        input.forEach(function (v) {
            if (res.indexOf(v) === -1) {
                res.push(v);
            }
        });

        return res;
    },

    /**
     * Counts occurrences of each class in the list.
     * @function module:analyzer#histo
     * @param input {array}
     * @returns {array}
     */
    histo: function (input) {
        var res = [];
        var classes = cloneArray(input);
        var histogram = dtm.anal.countBy(input);

        classes.forEach(function (val, idx) {
            res[idx] = histogram[val];
        });

        return res;
    },

    countBy: function (input) {
        var res = {};
        input.forEach(function (v) {
            if (!res.hasOwnProperty(v)) {
                res[v] = 1;
            } else {
                res[v]++;
            }
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
        return dtm.analyzer.unique(input).sort();
    },


    uniformity: function (input) {
        return dtm.analyzer.classes(input).length / input.length;
    },

    intersection: function (arr1, arr2) {
        return arr1.filter(function (n) {
            return arr2.indexOf(n) !== -1;
        });
    }
};

//dtm.analyzer.pvariance = dtm.analyzer.pvar;
dtm.anal = dtm.analyzer;
/**
 * @fileOverview A module for generating array object with certain shapes, extends the dtm.array module
 * @module generator
 */

/**
 * @function module:generator.generator
 * @returns {dtm.generator}
 */
dtm.generator = function () {
    var paramsExt = {
        type: null,
        min: 0.0,
        max: 1.0,

        start: 0.0,
        end: 1.0,
        interval: null,

        scale: 'chromatic',
        transpose: 0,

        //step: 0.0,
        amp: 1.0,
        cycle: 1.0,
        phase: 0.0,
        const: 0.0,
        string: '',
        pack: false, // into dtm.array
        typed: true // Float32Array
    };

    // extend the dtm.array module
    var generator = dtm.array();

    var params = generator.meta.getParams();
    objForEach(paramsExt, function (val, key) {
        params[key] = val;
    });

    generator.meta = {
        type: 'dtm.generator'
    };

    // TODO: define params better
    // name, arg1, 2, 3, ..., length
    var tempParams = {
        oscil: {
            name: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq', 'harm', 'harmonic'],
            args: ['amp', 'freq', 'phase'],
            len: 4096
        },
        envelope: {
            name: [],
            args: [],
            len: 512
        }
    };

    var types = {
        all: [
            'line', 'saw', 'rise',
            'decay', 'fall', 'invSaw',
            'adsr', 'ADSR',
            'seq', 'sequence', 'series',
            'range',
            'scale', 'mode', 'chord',
            'fibonacci',
            'noise', 'random', 'rand', 'randi',
            'gauss', 'gaussian', 'gaussCurve', 'normal',
            'sin', 'sine', 'cos', 'cosine',
            'tri', 'triangle',
            'zeros', 'zeroes', 'ones',
            'constant', 'constants', 'const', 'consts',
            'repeat',
            'string', 'str', 's', 'text', 'split',
            'character', 'characters', 'chars', 'char', 'c'
        ],
        oscil: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq', 'harm', 'harmonic'],
        const: ['zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts'],
        envelope: ['rise', 'decay', 'fall', 'ahr'],
        noLength: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'range', 'seq', 'scale', 'mode', 'chord'],
        noRange: [],
        noMinMax: [],
        noMinMaxDir: ['rise', 'decay', 'fall', 'noise'],
        random: ['random', 'rand', 'randi'],
        string: ['string', 'split', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'text']
    };

    function isTypeCategOf(type) {
        return types[type].indexOf(params.type) > -1;
    }

    // dtm.gen().get(): using dtm.array get instead

    function process() {
        function line(len, min, max, cycle) {
            var res = new Float32Array(len);
            var incr = (max - min) / (len-1);

            for (var i = 0; i < len; i++) {
                res[i] = min + incr * i;
            }

            return res;
        }

        // TODO: should use Float32Array

        function sin(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = dtm.value.mod(i/(len-1) + offset / cycle, 1.0);
                var val = Math.sin(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        function cos(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = dtm.value.mod(i/(len-1) + offset, 1.0);
                var val = Math.cos(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        // TODO: implement
        function square(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            return res;
        }

        function random(len, min, max, amp, floor) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var val = Math.random() * (max - min) + min;
                if (floor) {
                    res[i] = Math.floor(val) * amp;
                } else {
                    res[i] = val * amp;
                }
            }
            return res;
        }

        function constant(len, val) {
            var res;
            if (isNumber(val)) {
                res = new Float32Array(len);
            } else {
                res = new Array(len);
            }
            for (var i = 0; i < len; i++) {
                if (isNumOrFloat32Array(val)) {
                    res[i] = toFloat32Array(val);
                } else if (isDtmArray(val)) {
                    res[i] = val.parent(generator);
                } else {
                    res[i] = val;
                }
            }
            return res;
        }

        // TODO: implement
        function series() {
            //return res;
        }

        // TODO: broekn
        function sequence(start, end, interval) {
            if (!isNumber(interval) && interval === 0.0) {
                interval = 1.0;
            }

            var steps = Math.floor((end - start) / interval) + 1;
            params.len = steps;
            //console.log(steps);
            var res = new Float32Array();

            for (var i = 0; i < steps; i++) {
                res[i] = start + interval * i;
            }
            return res;
        }

        function range(start, end, interval) {
            if (!isNumber(interval) || interval === 0.0) {
                interval = 1.0;
            }

            if (end >= start) {
                interval = Math.abs(interval);
            } else {
                interval = -Math.abs(interval);
            }

            var len = Math.ceil(Math.abs(end - start) / Math.abs(interval));
            var res = new Float32Array(len);

            for (var i = 0; i < len; i++) {
                res[i] = start + i * interval;
            }

            return res;
        }

        function transposeScale(scale, factor) {
            var shifted = scale.map(function (v) {
                return dtm.val.mod(v + factor, 12);
            });

            return dtm.transform.sort(shifted);
        }

        function scale(name, transpose) {
            var res = null;

            var scales = {
                chromatic: {
                    names: ['chromatic', 'chr'],
                    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                },
                major: {
                    names: ['major', 'maj'],
                    values: [0, 2, 4, 5, 7, 9, 11]
                },
                minor: {
                    names: ['minor', 'min'],
                    values: [0, 2, 3, 5, 7, 8, 10]
                },
                wholetone: {
                    names: ['wholetone', 'whole', 'wt'],
                    values: [0, 2, 4, 6, 8, 10]
                },
                majpenta: {
                    names: ['penta', 'pent', 'majpenta'],
                    values: [0, 2, 4, 7, 9]
                }
            };

            objForEach(scales, function (v) {
                if (v.names.indexOf(name.toLowerCase()) !== -1) {
                    res = new Float32Array(transposeScale(v.values, transpose));
                }
            });

            return res ? res : new Float32Array();
        }

        // TODO: typed?
        function fibonacci(len) {
            var res = new Float32Array(len);
            res[0] = 1;

            if (len > 1) {
                res[1] = 1;
                for (var i = 2; i < len; i++) {
                    res[i] = res[i-1] + res[i-2];
                }
            }
            return res;
        }

        generator.value = [];

        var sorted;
        if (isTypeCategOf('noMinMaxDir') || isTypeCategOf('random')) {
            sorted = dtm.transform.sort([params.min, params.max]);
        }

        // TODO: params or paramsExt?
        switch (params.type) {
            case 'line':
            case 'saw':
                generator.value = line(params.len, params.min, params.max);
                break;

            case 'rise':
                generator.value = line(params.len, sorted[0], sorted[1]);
                break;

            case 'decay':
            case 'fall':
                generator.value = line(params.len, sorted[1], sorted[0]);
                break;

            case 'adsr':
            case 'ADSR':
                break;

            case 'sin':
            case 'sine':
                generator.value = sin(params.len, params.min, params.max, params.amp, params.cycle, paramsExt.phase);
                break;

            case 'cos':
            case 'cosine':
                generator.value = cos(params.len, params.min, params.max, params.amp, params.cycle, 0.00);
                break;

            case 'tri':
            case 'triangle':
                break;

            case 'harm':
            case 'harmonic':
                break;

            case 'rand':
            case 'random':
                generator.value = random(params.len, sorted[0], sorted[1], 1.0, false);
                break;

            case 'noise':
                generator.value = random(params.len, sorted[0], sorted[1], params.amp, false);
                break;

            case 'randi':
                generator.value = random(params.len, sorted[0], sorted[1], 1.0, true);
                break;

            case 'range':
                generator.value = range(paramsExt.start, paramsExt.end, paramsExt.interval);
                break;

            case 'seq':
                generator.value = sequence(params.min, params.max);
                break;

            case 'scale':
                generator.value = scale(paramsExt.scale, paramsExt.transpose);
                break;

            case 'fibonacci':
                generator.value = fibonacci(params.len);
                break;

            case 'zeros':
            case 'zeroes':
                generator.value = constant(params.len, 0);
                break;

            case 'ones':
                generator.value = constant(params.len, 1);
                break;

            case 'const':
                generator.value = constant(params.len, params.const);
                break;

            case 'string':
            case 'str':
            case 's':
            case 'characters':
            case 'character':
            case 'chars':
            case 'char':
            case 'c':
                generator.value = params.string.split('');
                break;

            default:
                break;
        }

        params.len = generator.value.length;
    }

    /**
     * Sets the method of generating a shape
     * @function module:generator#type
     * @param type {string}
     * @returns {array}
     */
    generator.type = function (type) {
        if (isString(type)) {
            if (types.all.indexOf(type) > -1) {
                params.type = type;
            }
        }

        process(); // TODO: gets called too many times?
        return generator;
    };

    /**
     * @function module:generator#len | size
     * @param length
     * @returns {array}
     */
    generator.len = function (length) {
        if (isString(length) && length[0] === 'a') {
            params.autolen = true;
            return generator;
        }

        var len = parseInt(length);
        if (!isNaN(len) && len > 0) {
            params.len = len;
        }

        process();
        return generator;
    };

    generator.size = generator.len;

    /**
     * @function module:generator#min
     * @param min
     * @returns {array}
     */
    generator.min = function (min) {
        var val = parseFloat(min);
        if (!isNaN(val)) {
            params.min = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#max
     * @param max
     * @returns {array}
     */
    generator.max = function (max) {
        var val = parseFloat(max);
        if (!isNaN(val)) {
            params.max = val;
        }
        process();
        return generator;
    };

    ///**
    // * @function module:generator#range
    // * @param arg1 {number|array|dtm.array} A min value or an array of min and max values
    // * @param [arg2] {number} A max value
    // * @returns {array}
    // */
    //generator.range = function (arg1, arg2) {
    //    var args;
    //
    //    if (isDtmObj(arg1)) {
    //        args = arg1.get();
    //    } else if (argIsSingleArray(arguments)) {
    //        args = arguments[0];
    //    } else if (argsAreSingleVals(arguments)) {
    //        args = argsToArray(arguments);
    //    }
    //
    //    if (isNumOrFloat32Array(args)) {
    //        if (args.length === 2) {
    //            generator.min(args[0]);
    //            generator.max(args[1]);
    //        } else if (args.length > 2) {
    //            generator.min(dtm.analyzer.min(args));
    //            generator.max(dtm.analyzer.max(args));
    //        }
    //        process();
    //    }
    //    return generator;
    //};

    generator.start = function (val) {
        if (isNumber(val)) {
            paramsExt.start = val;
        }
        process();
        return generator;
    };

    generator.end = function (val) {
        if (isNumber(val)) {
            paramsExt.end = val;
        }
        process();
        return generator;
    };

    generator.interval = function (val) {
        if (isNumber(val)) {
            paramsExt.interval = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#amp
     * @param amp
     * @returns {array}
     */
    generator.amp = function (amp) {
        var val = parseFloat(amp);
        if (!isNaN(val)) {
            params.amp = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#cycle | cycles | freq
     * @param cycle
     * @returns {array}
     */
    generator.cycle = function (cycle) {
        var val = parseFloat(cycle);
        if (!isNaN(val)) {
            params.cycle = val;
        }
        process();
        return generator;
    };
    generator.freq = generator.cycle;

    generator.phase = function (phase) {
        if (isNumber(phase)) {
            paramsExt.phase = phase;
        }
        process();
        return generator;
    };

    generator.offset = generator.phase;

    /**
     * @function module:generator#const
     * @param value
     * @returns {array}
     */
    generator.const = function (value) {
        if (isSingleVal(value)) {
            params.const = value;
        }
        process();
        return generator;
    };

    generator.transpose = function (value) {
        if (isInteger(value)) {
            paramsExt.transpose = value;
        } else if (isDtmArray(value)) {
            paramsExt.transpose = value.get(0);
        }
        process();
        return generator;
    };

    // TODO: do more readable type check
    params.len = 8;

    if (arguments.length >= 1) {
        if (isObject(arguments[0])) {
            if (!isArray(arguments[0])) {
                objForEach(arguments[0], function (iter) {
                    if (params.hasOwnProperty(iter)) {
                        params[iter] = arguments[0][iter];
                    }
                });
            }
        } else {
            // set the generator type from arg 0
            if (isString(arguments[0])) {
                generator.type(arguments[0]);
            }
        }

        if (isObject(arguments[1])) {
            if (!isArray(arguments[1])) {
                objForEach(arguments[1], function (iter) {
                    if (params.hasOwnProperty(iter)) {
                        params[iter] = arguments[1][iter];
                    }
                });
            }
        }
    }

    if (arguments.length <= 2) {
        if (isTypeCategOf('oscil')) {
            params.min = -1.0;
            params.max = 1.0;
        } else {
            params.min = 0.0;
            params.max = 1.0;
        }
    }

    if (isTypeCategOf('envelope')) {
        params.len = 128;
    }

    if (isTypeCategOf('random')) {
        params.len = 1;
        params.min = 0.0;

        if (params.type === 'randi') {
            params.max = 2;
        } else {
            params.max = 1.0;
        }

        if (arguments.length === 2 && isNumber(arguments[1])) {
            params.max = arguments[1];
        } else if (arguments.length === 3) {
            if (isNumber(arguments[1])) {
                params.min = arguments[1];
            }
            if (isNumber(arguments[2])) {
                params.max = arguments[2];
            }
        }
    } else if (isTypeCategOf('oscil')) {
        params.len = 4096;

        if (arguments.length >= 3) {
            if (isArray(arguments[2])) {
                if (arguments[2].length === 1) {
                    generator.amp(arguments[2][0]);
                } else if (arguments[2].length === 2) {
                    params.min = arguments[2][0];
                    params.max = arguments[2][1];
                }
            } else {
                generator.amp(arguments[2]);
            }
        }

        if (arguments.length === 3) {
            // set as amplitude
            params.min = -1.0;
            params.max = 1.0;
            generator.amp(arguments[2]);
        }

        if (arguments.length === 4) {
            if (isArray(arguments[3])) {
                if (arguments[3].length === 2) {
                    generator.min(arguments[3][0]);
                    generator.max(arguments[3][1]);
                }
            } else {
                params.min = -1.0;
                params.max = 1.0;
                generator.cycle(arguments[3]);
            }
        }
    } else if (arguments.length >= 2) {
        if (isTypeCategOf('string')) {
            if (isString(arguments[1])) {
                params.string = arguments[1];
                params.typed = false;
            } else {
                params.string = String(arguments[1]);
            }
        } else if (params.type === 'range') {
            if (isNumArray(arguments[1])) {
                if (arguments[1].length === 1) {
                    // TODO: reduce the redundant process()
                    generator.start(0.0);
                    generator.end(arguments[1][0]);
                } else if (arguments[1].length >= 2) {
                    generator.start(arguments[1][0]);
                    generator.end(arguments[1][1]);
                }

                if (arguments[1].length === 3) {
                    generator.interval(arguments[1][2]);
                }
            } else {
                if (arguments.length === 2 && isNumber(arguments[1])) {
                    generator.start(0.0);
                    generator.end(arguments[1]);
                } else if (arguments.length >= 3) {
                    if (isNumber(arguments[1])) {
                        generator.start(arguments[1]);
                    }
                    if (isNumber(arguments[2])) {
                        generator.end(arguments[2]);
                    }
                }

                if (arguments.length === 4) {
                    generator.interval(arguments[3]);
                }
            }
        } else if (params.type === 'seq') {
            // TODO: incomplete
            params.min = arguments[1];
            params.max = arguments[2];
        } else if (params.type === 'scale') {
            if (isString(arguments[1])) {
                paramsExt.scale = arguments[1];
            }
            if (isInteger(arguments[2])) {
                paramsExt.transpose = arguments[2];
            }
            //process();
        } else if (isTypeCategOf('const')) {
            if (!isEmpty(arguments[1])) {
                params.const = arguments[1];
                params.len = 1;
            }
        } else {
            // set the length from arg 1
            generator.len(arguments[1]);

            if (arguments.length >= 3) {
                if (isArray(arguments[2])) {
                    if (arguments[2].length === 1) {
                        generator.max(arguments[2][0]);
                    } else if (arguments[2].length === 2) {
                        generator.min(arguments[2][0]);
                        generator.max(arguments[2][1]);
                    }
                } else {
                    if (arguments.length === 3) {
                        // set as 0 - max
                        generator.min(0);
                        generator.max(arguments[2]);
                        generator.amp(1.0);
                    }

                    if (arguments.length >= 4) {
                        generator.min(arguments[2]);
                        generator.max(arguments[3]);
                    }
                }
            }
        }

        //if (isTypeCategOf('noLength')) {
        //
        //} else {
        //
        //}
    }

    process();
    return generator;
};

dtm.g = dtm.gen = dtm.generator;

var generators = ['line', 'rise', 'decay', 'fall', 'seq', 'sequence', 'series', 'range', 'noise', 'random', 'rand', 'randi', 'gaussian', 'gaussCurve', 'gauss', 'normal', 'zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts', 'repeat', 'string', 'str', 'sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'fibonacci', 'decay'];

generators.forEach(function (type) {
    dtm[type] = function () {
        var args = [type, argsToArray(arguments)];
        return dtm.generator.apply(this, args);
    }
});
/**
 * @fileOverview Utility functions for single-dimensional arrays. Singleton.
 * @module transform
 */

// singleton helper functions
dtm.transform = {
    type: 'dtm.transform',

    /* GENERTORS */

    // TODO: deprecate this
    /**
     * Generates values for a new array.
     * @function module:transform#generate
     * @param type {string} Choices: 'line', 'noise'/'random', 'gaussian'/'gauss'/'normal', 'sin'/'sine', 'cos'/'cosine', 'zeroes', 'ones'
     * @param [len=8] {number}
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
    generator: function () {
        var type, len, min, max, cycle;
        var params = {
            type: '',
            len: 8,
            min: -1,
            max: 1,
            cycle: 1
        };

        if (typeof(arguments[0]) === 'string') {
            type = arguments[0];
        } else if (typeof(arguments[0]) === 'object') {
            for (var key in arguments[0]) {
                if (arguments[0].hasOwnProperty(key)) {
                    params[key] = arguments[0][key];
                }
            }
        }

        if (isEmpty(arguments[1])) {
            len = 8;
        } else if (typeof(arguments[1]) === 'number') {
            len = arguments[1];
        }

        var oscil = ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw'];

        if (typeof(arguments[2]) !== 'number') {
            if (oscil.indexOf(type) > -1) {
                min = -1;
            } else {
                min = 0;
            }
        } else {
            min = arguments[2];
        }

        if (typeof(arguments[3]) !== 'number') {
            max = 1;
        } else {
            max = arguments[3];
        }

        if (typeof(arguments[2] === 'number' && typeof(arguments[3] !== 'number'))) {
            cycle = arguments[2];
        }

        var res = [], incr = 0, val = 0, i = 0;
        var sorted = [];

        switch (type) {
            case 'rise':
            case 'decay':
            case 'fall':
            case 'noise':
            case 'random':
            case 'rand':
            case 'randi':
                sorted = dtm.transform.sort([min, max]);
                max = sorted[1];
                min = sorted[0];
        }

        switch (type) {
            case 'line':
            case 'saw':
                incr = (max - min) / (len-1);

                for (i = 0; i < len; i++) {
                    res[i] = min + incr * i;
                }
                break;

            case 'rise':
                incr = (max - min) / (len-1);

                for (i = 0; i < len; i++) {
                    res[i] = min + incr * i;
                }
                break;

            case 'decay':
            case 'fall':
                incr = (max - min) / (len-1);

                for (i = 0; i < len; i++) {
                    res[i] = min + incr * (len-1-i);
                }
                break;

            case 'seq':
            case 'sequence':
            case 'series':
                max = max || 1;

                for (i = 0; i < len; i++) {
                    res[i] = i * max + min;
                }
                break;

            // TODO: args: start, stop, interval
            case 'range':
                min = Math.round(min);
                max = Math.round(max);
                for (i = 0; i < max-min; i++) {
                    res[i] = i + min;
                }
                break;

            case 'noise':
            case 'random':
            case 'rand':
                for (i = 0; i < len; i++) {
                    res[i] = dtm.val.random(min, max);
                }
                break;

            case 'randi':
                for (i = 0; i < len; i++) {
                    res[i] = dtm.val.randi(min, max);
                }
                break;

            case 'gaussian':
            case 'gauss':
            case 'gaussCurve':
            case 'normal':
                for (i = 0; i < len; i++) {
                    var x = -Math.PI + (Math.PI * 2 / len) * i;
                    res[i] = Math.pow(Math.E, -0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI) / 0.4 * (max-min) + min;
                }
                break;

            case 'sin':
            case 'sine':
                for (i = 0; i < len; i++) {
                    incr = Math.PI * 2 / (len-1);
                    val = Math.sin(incr * i);
                    val = (val+1)/2 * (max-min) + min;
                    res[i] = val;
                }
                break;

            case 'cos':
            case 'cosine':
                for (i = 0; i < len; i++) {
                    incr = Math.PI * 2 / (len-1);
                    val = Math.cos(incr * i);
                    val = (val+1)/2 * (max-min) + min;
                    res[i] = val;
                }
                break;

            case 'tri':
                break;

            case 'zeros':
            case 'zeroes':
                for (i = 0; i < len; i++) {
                    res[i] = 0;
                }
                break;

            case 'ones':
                for (i = 0; i < len; i++) {
                    res[i] = 1;
                }
                break;

            case 'constant':
            case 'constants':
            case 'const':
            case 'consts':
                //min = min || 0;
                for (i = 0; i < len; i++) {
                    res[i] = min;
                }
                break;

            case 'repeat':
                for (i = 0; i < len; i++) {
                    res[i] = arguments[2];
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
                min = dtm.analyzer.min(arr);
            }

            if (!isNumber(max)) {
                max = dtm.analyzer.max(arr);
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

            //if (isFloat32Array(arr)) {
            //    return Float32Map(arr, function (val) {
            //        return (val - min) / denom;
            //    });
            //} else if (isNumArray(arr)) {
            //    return arr.map(function (val) {
            //        return (val - min) / denom;
            //    });
            //}
        }
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

        normalized.forEach(function (val, idx) {
            res[idx] = truncateDigits(dtm.value.rescale(val, min, max));
        });

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

        arr.forEach(function (val, idx) {
            res[idx] = dtm.value.expCurve(val, factor);
        });
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

        arr.forEach(function (val, idx) {
            res[idx] = dtm.value.logCurve(val, factor);
        });
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

        arr.forEach(function (val, idx) {
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
        if (!isBoolean(round)) {
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
        var res = null;
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
            input.forEach(function (val, idx) {
                res[idx] = val + factor;
            });
        } else if (isNumOrFloat32Array(factor)) {
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
     * Multiplies the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then the dot product is returned.
     * @function module:transform#mult
     * @param input {array}
     * @param factor {number|array}
     * @param [interp='linear] {string}
     * @returns {array}
     */
    mult: function (input, factor, interp) {
        var res = null;
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
            input.forEach(function (val, idx) {
                res[idx] = val * factor;
            });
        } else if (isNumOrFloat32Array(factor)) {
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
        var res = null;
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
            input.forEach(function (val, idx) {
                res[idx] = Math.pow(val, factor);
            });
        } else if (isNumOrFloat32Array(factor)) {
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
        var res = null;
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
            input.forEach(function (val, idx) {
                res[idx] = Math.pow(factor, val);
            });
        } else if (isNumOrFloat32Array(factor)) {
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
     * Rounds the float values to the nearest integer values or the nearest multiplication of the factor "to".
     * @function module:transform#round
     * @param input {array} Numerical array
     * @param to {number}
     * @returns {Array}
     */
    round: function (input, to) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (!isNumber(to)) {
            input.forEach(function (val, idx) {
                res[idx] = Math.round(val);
            });
        } else {
            input.forEach(function (val, idx) {
                res[idx] = Math.round(val / to) * to;
            });
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

        input.forEach(function (val, idx) {
            res[idx] = Math.floor(val);
        });
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

        input.forEach(function (val, idx) {
            res[idx] = Math.ceil(val);
        });
        return res;
    },

    hwr: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        input.forEach(function (val, idx) {
            res[idx] = (val < 0) ? 0 : val;
        });

        return res;
    },

    fwr: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        input.forEach(function (val, idx) {
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

        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return new Float32Array(res);
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
            return new Float32Array(res);
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
            return new Float32Array(res);
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
            center = dtm.analyzer.mean(input);
        }

        var res = [];
        input.forEach(function (val, idx) {
            res[idx] = center - (val - center);
        });
        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return new Float32Array(res);
        }
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
        var res = _.sortBy(arr, function (val) {
            return val;
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
            idx = dtm.val.mod(i + start, arr.length);
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
        if (!isNumber(morphIdx)) {
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

        input.forEach(function (val) {
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

        input.forEach(function (note) {
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

    pq: function (input, scale, round) {
        var res = [];
        input.forEach(function (val, idx) {
            res[idx] = dtm.value.pq(val, scale, round);
        });

        return res;
    },

    // CHECK: redundant with analyzer.unique
    unique: function (input) {
        return dtm.analyzer.unique(input);
    },

    classId: function (input) {
        var res = [];
        var sortedClasses = dtm.analyzer.classes(input).sort();
        var classIds = {};

        sortedClasses.forEach(function (val, id) {
            classIds[val] = id;
        });

        input.forEach(function (val, idx) {
            res[idx] = classIds[val];
        });

        return res;
    },

    stringify: function (input) {
        var res = [];
        input.forEach(function (val, idx) {
            res[idx] = val.toString();
        });

        return res;
    },

    tonumber: function (input) {
        var res = [];
        input.forEach(function (val, idx) {
            if (isString(val)) {
                res[idx] = parseFloat(val);
            } else if (isBoolean(val)) {
                res[idx] = val ? 1.0 : 0.0;
            } else {
                res[idx] = NaN;
            }
        });
        return res;
    },

    //getClasses: function (input) {
    //    return _.clone()
    //
    //}

    mtof: function (input) {
        var res;

        if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        } else {
            res = new Array(input.length);
        }

        input.forEach(function (v, i) {
            res[i] = dtm.value.mtof(v);
        });
        return res;
    },

    ftom: function (input) {
        var res;

        if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        } else {
            res = new Array(input.length);
        }

        input.forEach(function (v, i) {
            res[i] = dtm.value.ftom(v);
        });

        return res;
    },

    split: function (input, separator) {
        if (!isString(separator)) {
            separator = '';
        }

        var res = [];
        if (isArray(input)) {
            input.forEach(function (v) {
                if (isNumber(v)) {
                    v = v.toString();
                }
                res = res.concat(v.split(separator));
            });
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

    srcArr.forEach(function (val, idx) {
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
        }
    };

    array.value = [];

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
            return array.value[dtm.value.mod(param, params.len)];
        } else if (isNumArray(param) || (isDtmArray(param) && isNumArray(param.get()))) {
            var indices = isDtmArray(param) ? param.get() : param;
            var res = []; // TODO: support typed array?

            // TODO: only accept integers

            indices.forEach(function (i) {
                res.push(array.value[dtm.value.mod(i, params.len)]);
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
                    if (isNestedWithDtmArray(array.value)) {
                        return array.value.map(function (a) {
                            return a.get('name');
                        });
                    } else {
                        return params.name;
                    }

                case 'type':
                    if (isNumArray(array.value)) {
                        return 'number';
                    } else if (isStringArray(array.value)) {
                        return 'string';
                    } else {
                        return params.type;
                    }

                case 'parent':
                    return params.parent;

                case 'len':
                case 'length':
                case 'size':
                    return params.len;

                case 'autolen':
                    return params.autolen;

                case 'hash':
                    return params.hash;

                case 'processed':
                    return params.processed;

                case 'nested':
                    return array.value.map(function (v) {
                        if (isDtmArray(v)) {
                            return v.get();
                        } else {
                            return v;
                        }
                    });

                case 'row':
                    if (isInteger(arguments[1]) && isNestedWithDtmArray(array.value)) {
                        var idx = arguments[1];
                        var res = [];
                        array.value.forEach(function (a) {
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
                    return dtm.analyzer.min(array.value);

                case 'maximum':
                case 'max':
                    return dtm.analyzer.max(array.value);

                case 'extent':
                case 'minmax':
                case 'range':
                    return [dtm.analyzer.min(array.value), dtm.analyzer.max(array.value)];

                case 'mean':
                case 'average':
                case 'avg':
                    return dtm.analyzer.mean(array.value);

                case 'mode':
                    return dtm.analyzer.mode(array.value);
                case 'median':
                    return dtm.analyzer.median(array.value);
                case 'midrange':
                    return dtm.analyzer.midrange(array.value);

                case 'standardDeviation':
                case 'std':
                    return dtm.analyzer.std(array.value);
                case 'pstd':
                    return dtm.analyzer.pstd(array.value);

                case 'variance':
                case 'var':
                    return dtm.analyzer.var(array.value);
                case 'populationVariance':
                case 'pvar':
                    return dtm.analyzer.pvar(array.value);

                case 'sumAll':
                case 'sum':
                    return dtm.analyzer.sum(array.value);

                case 'rms':
                    return dtm.analyzer.rms(array.value);

                case 'pdf':
                    break;


                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return array.value[params.index];

                case 'next':
                    // TODO: increment after return
                    if (isEmpty(arguments[1])) {
                        params.index = dtm.value.mod(params.index + params.step, params.len);
                        return array.value[params.index];
                    } else if (isNumber(arguments[1]) && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        params.index = dtm.value.mod(params.index + params.step, params.len);
                        blockArray = dtm.transform.getBlock(array.value, params.index, arguments[1]);
                        return dtm.array(blockArray);
                    } else {
                        return array;
                    }

                case 'prev':
                case 'previous':
                    params.index = dtm.value.mod(params.index - params.step, params.len);
                    return array.value[params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    params.index = dtm.val.randi(0, params.len);
                    return array.value[params.index];

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
                        blockArray = dtm.transform.getBlock(array.value, start, size);
                        return dtm.array(blockArray);
                    } else if (isNumber(arguments[1]) && isNumber(arguments[2])) {
                        start = arguments[1];
                        size = arguments[2];
                        blockArray = dtm.transform.getBlock(array.value, start, size);
                        return dtm.array(blockArray);
                    } else {
                        // CHECK: ???
                        return array.value;
                    }

                case 'blockNext':
                    // TODO: incr w/ the step size AFTER RETURN
                    params.index = dtm.value.mod(params.index + params.step, params.len);
                    blockArray = dtm.transform.getBlock(array.value, params.index, arguments[1]);
                    return dtm.array(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    if (isEmpty(params.normalized)) {
                        params.normalized = dtm.transform.normalize(array.value);
                    }
                    if (isInteger(arguments[1])) {
                        return params.normalized[dtm.value.mod(arguments[1], params.len)];
                    } else {
                        return params.normalized;
                    }

                case 'sorted':
                case 'sort':
                    return dtm.transform.sort(array.value);

                case 'uniques':
                case 'unique':
                case 'uniq':
                    return dtm.transform.unique(array.value);

                case 'classes':
                    return dtm.analyzer.classes(array.value);

                case 'classID':
                case 'classId':
                    return dtm.transform.classId(array.value);

                case 'string':
                case 'stringify':
                    return dtm.transform.stringify(array.value);

                case 'numClasses':
                case 'numUniques':
                case 'numUniqs':
                    return dtm.analyzer.classes(array.value).length;

                case 'unif':
                case 'uniformity':
                    return dtm.analyzer.uniformity(array.value);

                case 'histogram':
                case 'histo':
                    return dtm.analyzer.histo(array.value);

                // TODO: implement
                case 'distribution':
                case 'dist':
                    return [];

                default:
                    if (params.hasOwnProperty(param)) {
                        return params[param];
                    } else {
                        return array.value;
                    }
            }
        } else {
            return array.value;
        }
    };

    array.col = function (num) {
        return array.set(array.get(num));
    };

    array.column = array.col;

    array.row = function (num) {
        var newArray = [];
        array.forEach(function (a) {
            newArray.push(a.get(num));
        });
        return array.set(newArray);
    };

    // TODO: conflicts with gen.transpose()
    array.transp = function () {
        if (isNestedDtmArray(array)) {
            var newArray = [];
            var i = 0;
            while (array.value.some(function (a) {
                return i < a.get('len');
            })) {
                newArray.push(array().row(i));
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
                array.value = new Float32Array(args);
            } else {
                array.value = args;
            }
        } else {
            // if set arguments include any array-like object
            if (arguments.length === 1) {
                if (isNumber(arguments[0])) {
                    array.value = new Float32Array([arguments[0]]);
                } else if (isNumArray(arguments[0])) {
                    array.value = new Float32Array(arguments[0]);
                } else if (isNestedArray(arguments[0])) {
                    array.value = new Array(arguments[0].length);
                    arguments[0].forEach(function (v, i) {
                        array.value[i] = dtm.array(v).parent(array);
                    });
                } else if (isNestedWithDtmArray(arguments[0])) {
                    array.value = arguments[0];
                    array.value.forEach(function (v) {
                        v.parent(array);
                    });
                } else if (isDtmArray(arguments[0])) {
                    array.value = arguments[0].get();
                    // set parent in the child
                } else if (isNestedDtmArray(arguments[0])) {
                    array.value = arguments[0].get();
                    array.value.forEach(function (v) {
                        v.parent(array);
                    });
                } else if (isString(arguments[0])) {
                    array.value = [arguments[0]]; // no splitting
                    checkType(array.value);
                } else {
                    array.value = arguments[0];
                }
            } else {
                array.value = new Array(arguments.length);

                argsForEach(arguments, function (v, i) {
                    if (isDtmArray(v)) {
                        array.value[i] = v;
                    } else {
                        array.value[i] = dtm.array(v);
                    }
                    array.value[i].parent(array);
                });
            }
        }

        if (isEmpty(params.original)) {
            params.original = array.value;

            // CHECK: type checking - may be redundant
            checkType(array.value);
        } else {
            params.processed++;
        }

        params.len = array.value.length;
        params.index = params.len - 1;

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
     * Returns a copy of the array object. It can be used when you don't want to reference the same array object from different places. For convenience, you can also do arrObj() instead of arrObj.clone() to quickly return a copy.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        var newValue = [];
        if (isNestedWithDtmArray(array.value)) {
            newValue = array.value.map(function (a) {
                return a.clone();
            });
        } else {
            newValue = array.value;
        }
        var newArr = dtm.array(newValue).label(params.name);

        // CHECK: this may cause troubles!
        newArr.index(params.index);
        newArr.step(params.step);

        if (params.type === 'string') {
            newArr.classes = params.classes;
            //newArr.setType('string');
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
        return array;
    }

    array.clonetest = clonetest;

    array.parent = function (obj) {
        if (isDtmArray(obj)) {
            params.parent = obj;
        }
        return array;
    };

    // TODO: array.block (and window) should transform the parent array into nested child array

    array.nest = function () {
        if (!isDtmArray(array.value)) {
            array.set([dtm.array(array.value)]);
            array.value[0].parent(array);
        }
        return array;
    };

    array.unnest = function () {
        var flattened = [];
        array.value.forEach(function (v) {
            if (isDtmArray(v)) {
                flattened = concat(flattened, v.get());
            }
        });

        if (isNumArray(flattened)) {
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

        if (isNumArray(array.value) && isNumArray(tgtArr)) {
            array.set(dtm.transform.morph(array.value, tgtArr, morphIdx, interp));
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

        return array.set(dtm.transform.normalize(array.value, min, max));
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

        return array.set(dtm.transform.rescale(array.value, min, max, dmin, dmax));
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
        return array.set(dtm.transform.fit(array.value, len, interp));
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
        return array.set(dtm.transform.stretch(array.value, factor, interp));
    };

    array.str = array.stretch;

    array.summarize = function () {
        return array;
    };

    array.sum = function () {
        if (isNestedWithDtmArray(array.value)) {
            var maxLen = 0;
            array.value.forEach(function (a) {
                if (a.get('len') > maxLen) {
                    maxLen = a.get('len');
                }
            });

            var res = new Float32Array(maxLen);

            for (var i = 0; i < maxLen; i++) {
                array.value.forEach(function (a) {
                    if (i < a.get('len') && isNumber(a.get(i))) {
                        res[i] += a.get(i);
                    }
                });
            }

            return array.set(res);
        } else {
            var sum = array.value.reduce(function (a, b) {
                return a + b;
            });
            return array.set(sum);
        }
    };

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:array#fitsum
     * @param tgt {number} If the round argument is true, the target value is also rounded.
     * @param [round=false] {boolean}
     * @returns {dtm.array}
     */
    array.fitsum = function (tgt, round, min) {
        return array.set(dtm.transform.fitSum(array.value, tgt, round));
    };

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     * @example
     * <div> hey </div>
     */
    array.add = function (factor, interp) {
        if (isDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.add(array.value, factor, interp));
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
        return array.set(dtm.transform.mult(array.value, factor, interp));
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
        return array.set(dtm.transform.pow(array.value, factor, interp));
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
        return array.set(dtm.transform.powof(array.value, factor, interp));
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
        //return array.set(array.value.map(callback));
        return array.set(fromFloat32Array(array.value).map(callback));
    };

    array.foreach = function (callback) {
        array.value.forEach(callback);
        return array;
    };

    array.forEach = array.foreach;

    array.filter = function (callback) {
        return array.set(array.value.filter(callback));
    };

    array.reduce = function (callback) {
        return array.set(array.value.reduce(callback));
    };

    // TODO: these should be in the get method
    array.some = function (callback) {
        return array.value.some(callback);
    };

    array.every = function (callback) {
        return array.value.every(callback);
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
                return array.set(array.value.map(function (v) {
                    if (v === tgt) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isArray(tgt)) {
                return array.set(array.value.map(function (v) {
                    if (tgt.some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isDtmArray(tgt)) {
                return array.set(array.value.map(function (v) {
                    if (tgt.get().some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isFunction(tgt)) {
                return array.set(array.value.map(function (v) {
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
                res.push(array.value[dtm.value.mod(i, params.len)]);
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
        return array.set(dtm.transform.sort(array.value));
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
            array.value = concat(array.value, arr.get());
        } else {
            array.value = concat(array.value, arr);
        }
        return array.set(array.value);
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

        return array.set(dtm.transform.repeat(array.value, count));
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

        return array.set(dtm.transform.fit(dtm.transform.repeat(array.value, count), params.len, interp));
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
        return array.set(dtm.transform.truncate(array.value, arg1, arg2));
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
            newArr[i] = dtm.array(array.value.slice(i*hop, i*hop+len)).window(window).parent(array);
        }

        return array.set(newArr);
    };

    array.nest = array.block;

    array.ola = function (hop) {
        if (!isInteger(hop) || hop < 1) {
            hop = 1;
        }

        if (isNestedWithDtmArray(array.value)) {
            var len = hop * (params.len-1) + array.value[0].get('len');
            var newArr = new Array(len);
            newArr.fill(0);

            array.value.forEach(function (a, i) {
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
        return array.set(dtm.transform.window(array.value, type));
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {number} Integer
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        return array.set(dtm.transform.shift(array.value, amount));
    };

    /**
     * Appends an reversed array at the tail.
     * @function module:array#mirror
     * @returns {{type: string}}
     */
    array.mirror = function () {
        return array.concat(dtm.transform.reverse(array.value));
    };

    array.mir = array.mirror;

    /**
     * Flips the array contents horizontally.
     * @function module:array#reverse | rev
     * @returns {dtm.array}
     */
    array.reverse = function () {
        return array.set(dtm.transform.reverse(array.value));
    };

    array.rev = array.reverse;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert | inv | flip
     * @param [center=meanVal] {number}
     * @returns {dtm.array}
     */
    array.invert = function (center) {
        return array.set(dtm.transform.invert(array.value, center));
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
        return array.set(dtm.transform.shuffle(array.value));
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
            array.value.push(input);
            array.value.shift();
        } else if (isFloat32Array(input)) {
            array.value = Float32Concat(array.value, input);
            array.value = array.value.splice(input.length);
        } else if (isArray(input)) {
            if (isFloat32Array(array.value)) {
                array.value = Float32Concat(array.value, input);
                array.value = Float32Splice(array.value, input.length);
            } else {
                array.value = array.value.concat(input);
                array.value = array.value.splice(input.length);
            }
        } else if (isDtmArray(input)) {
            array.value = array.value.concat(input.get());
            array.value = array.value.splice(input.get('len'));
        }
        return array.set(array.value);
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
        return array.set(dtm.transform.round(array.value, to));
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
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:array#hwr
     * @returns {dtm.array}
     */
    array.hwr = function () {
        return array.set(dtm.transform.hwr(array.value));
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr | abs
     * @returns {dtm.array}
     */
    array.fwr = function () {
        return array.set(dtm.transform.fwr(array.value));
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
            array.value = dtm.transform.diff(array.value);
        }

        if (isSingleVal(pad)) {
            for (var i = 0; i < order; i++) {
                array.value = concat(array.value, pad);
            }
        }
        return array.set(array.value);
    };

    /**
     * Removes zeros from the sequence.
     * @function module:array#removezeros
     * @returns {dtm.array}
     */
    array.removezeros = function () {
        return array.set(dtm.transform.removeZeros(array.value));
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
        return array.set(toFloat32Array(dtm.analyzer.histo(array.value)));
    };
    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:array#uniq | unique
     * @returns {dtm.array}
     */
    array.unique = function () {
        return array.set(dtm.transform.unique(array.value));
    };

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:array#classify
     * @param by
     * @returns {dtm.array}
     */
    array.classify = function (by) {
        return array.set(dtm.transform.classId(array.value));
    };

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:array#stringify | tostring
     * @returns {dtm.array}
     */
    array.stringify = function () {
        return array.set(dtm.transform.stringify(array.value));
    };

    /**
     * Converts string or boolean values to numerical values.
     * @function module:array#tonumber | toNumber
     * @returns {dtm.array}
     */
    array.tonumber = function () {
        return array.set(toFloat32Array(dtm.transform.tonumber(array.value)));
    };

    array.toFloat32 = function () {
        if (isNumArray(array.value)) {
            array.set(toFloat32Array(array.value));
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
        return array.set(dtm.transform.split(array.value, separator));
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

        return array.set(dtm.transform.pq(array.value, scale));
    };

    array.mtof = function () {
        return array.set(dtm.transform.mtof(array.value));
    };

    array.ftom = function () {
        return array.set(dtm.transform.ftom(array.value));
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
        return array.set(dtm.transform.notesToBeats(array.value, resolution));
    };

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.beatsToNotes(array.value, resolution));
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats | itob
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function () {
        return array.set(dtm.transform.intervalsToBeats(array.value));
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals | btoi
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        return array.set(dtm.transform.beatsToIntervals(array.value));
    };
    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToIndices | btoid
     * @returns {dtm.array}
     */
    array.beatsToIndices = function () {
        return array.set(dtm.transform.beatsToIndices(array.value));
    };

    /**
     * function module:array#indicesToBeats | idtob
     * @param [len]
     * @returns {dtm.array}
     */
    array.indicesToBeats = function (len) {
        return array.set(dtm.transform.indicesToBeats(array.value, len));
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
     * MIDI note number to frequency conversion.
     * @function module:value#mtof
     * @param nn {number} Note number
     * @returns {number}
     */
    mtof: function (nn) {
        return 440.0 * Math.pow(2, (nn - 69) / 12.);
    },

    /**
     * Frequency to MIDI note number conversion.
     * @function module:value#mtof
     * @param freq {number} Note number
     * @returns {number}
     */
    ftom: function (freq) {
        return Math.log2(freq / 440.0) * 12 + 69;
    },

    /**
     * Scale or pitch-quantizes the input value to the given models.scales.
     * @function module:value#pq
     * @param nn {number} Note number
     * @param scale {array} An array of either number or string
     * @param [round=false] {boolean}
     * @returns {*}
     */
    pq: function (nn, scale, round) {
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

        var pc = nn % 12;
        var oct = nn - pc;
        var idx = Math.floor(pc / 12. * sc.length);
        var frac = 0.0;

        if (!round) {
            frac = nn % 1;
        }
        return oct + sc[idx] + frac;
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

    randi: function (arg1, arg2) {
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
    },

    random: function (arg1, arg2) {
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
};

dtm.value.rand = dtm.value.random;

dtm.v = dtm.val = dtm.value;
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
        var lines = csv.split("\n"); // \r for Macs
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

    csvToCols: function (csvText) {
        var lines = csvText.split("\n"); // \r for Macs
        var headers = lines[0].split(",");
        var obj = {};
        headers.forEach(function (v, i) {
            headers[i] = v.trim(); // removes the spaces at the both ends
            obj[headers[i]] = [];
        });

        for (var i = 1; i < lines.length; i++) {
            var currentline = lines[i].split(",");

            if (currentline.length > 1) {
                for (var j = 0; j < headers.length; j++) {
                    var val = currentline[j];
                    if (!isNaN(val)) {
                        val = parseFloat(val);
                    } else {
                        val = val.trim();
                    }
                    obj[headers[j]].push(val);
                }
            }
        }

        return obj; //JavaScript object
    },

    /**
     * Parses the value types from a given row of a collection.
     * @function module:parser#valueTypes
     * @param row {array}
     * @returns {array}
     */
    valueTypes: function (row) {
        var types = [];

        row.forEach(function (val, idx) {
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
        var col = numProperties(json[0]); // header
        var row = numProperties(json);
        return [col, row];
    }
};
/**
 * @fileOverview Data object. Extends the dtm.array class, storing a multi-dimensional array.
 * @module data
 */

/**
 * Creates a new dtm.data object, if the argument is empty, or a promise object, if the argument is a URL.
 * @function module:data.data
 * @param [arg] {string} URL to load or query the data
 * @param cb {function}
 * @param type
 * @returns {dtm.data | promise}
 */
dtm.data = function (arg, cb, type) {
    //var params = {
    //    arrays: {},
    //    coll: [],
    //
    //    keys: [],
    //    types: {},
    //    size: {}
    //};

    var paramsExt = {

    };

    //var data = {
    //    type: 'dtm.data',
    //    name: 'dtm.data',
    //
    //    /**
    //     * This can be used for promise callback upon loading data.
    //     * @name module:data#promise
    //     * @type {object}
    //     */
    //    promise: null,
    //    callback: null
    //};

    var data = dtm.array();
    var params = data.meta.getParams();
    objForEach(paramsExt, function (val, key) {
        params[key] = val;
    });

    /**
     * Returns a clone of dtm.array object from the data.
     * @function module:data#get
     * @param param {string|number}
     * @param id {string|number} Parameter name (string) or index (integer). Param name (string) can be: a|arr|array|arrays|column (2nd arg: name or index), c|col|coll|collection, r|row (2nd arg: row number), dim|dimension|size, len|length, k|key|keys|name|names|list, t|type|types, (empty returns the data object itself). If given an integer in the first argument, it returns an array object. Returned array object is a cloned version, and modifying it will not affect the original array object stored in the data object.
     * @returns {dtm.array}
     */
    //data.get = function (param, id) {
    //    var out = null;
    //
    //    if (typeof(param) === 'string') {
    //        switch (param) {
    //            case 'a':
    //            case 'arr':
    //            case 'array':
    //            case 'arrays':
    //            case 'c':
    //            case 'column':
    //            case 'ch':
    //            case 'channel':
    //                if (typeof(id) === 'number') {
    //                    if (id >= 0 && id < params.size['col']) {
    //                        return params.arrays[params.keys[id]].clone();
    //                    } else {
    //                        dtm.log('data.get(): index out of range');
    //                        return data;
    //                    }
    //                } else if (typeof(id) === 'string') {
    //                    if (params.keys.indexOf(id) > -1) {
    //                        return params.arrays[id].clone();
    //                    } else {
    //                        dtm.log('data.get(): key does not exist');
    //                        return data;
    //                    }
    //                } else {
    //                    dtm.log('data.get(): please specify array with index or name');
    //                    return params.arrays;
    //                }
    //
    //            //case 'c':
    //            case 'col':
    //            case 'coll':
    //            case 'collection':
    //                return params.coll;
    //
    //            case 'row':
    //            case 'r':
    //                return params.coll[id];
    //
    //            case 'size':
    //            case 'dim':
    //            case 'dimension':
    //                return params.size;
    //
    //            case 'len':
    //            case 'length':
    //            case 'cardinality':
    //            case 'card':
    //                return params.size.row;
    //
    //            case 'k':
    //            case 'key':
    //            case 'keys':
    //            case 'name':
    //            case 'names':
    //            case 'list':
    //                return params.keys.slice(); // quick cloning of array
    //
    //            case 't':
    //            case 'type':
    //            case 'types':
    //                return params.types;
    //
    //            default:
    //                return data;
    //        }
    //    } else if (typeof(param) === 'number') {
    //        if (param >= 0 && param < params.size['col']) {
    //            //return params.arrays[params.keys[param]].clone();
    //            return params.arrays[params.keys[param]];
    //        } else {
    //            dtm.log('data.get(): index out of range');
    //            return data;
    //        }
    //    } else {
    //        return data;
    //    }
    //};

    //data.set = function (res) {
    //    params.coll = res;
    //    params.keys = Object.keys(params.coll[0]);
    //    setArrays();
    //    setTypes();
    //    setSize();
    //
    //    return data;
    //};
    //
    //data.setCols = function (cols) {
    //    params.keys = [];
    //    objForEach(cols, function (v, k) {
    //        params.keys.push(k);
    //    });
    //
    //    params.keys.forEach(function (k) {
    //        params.arrays[k] = dtm.array(cols[k]).label(k);
    //    });
    //
    //    params.size.col = params.keys.length;
    //    params.size.row = params.arrays[params.keys[0]].length;
    //
    //    return data;
    //};

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
    //data.load = function (url, cb) {
    //    if (typeof(cb) !== 'undefined') {
    //        data.callback = cb;
    //    }
    //
    //    data.promise = new Promise(function (resolve) {
    //        var ext = url.split('.').pop(); // checks the extension
    //
    //        if (ext === 'jsonp') {
    //            var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    //            window[cbName] = function (res) {
    //                delete window[cbName];
    //                document.body.removeChild(script);
    //
    //                var keys = Object.keys(res);
    //
    //                keys.forEach(function (val) {
    //                    // CHECK: this is a little too case specific
    //                    if (val !== 'response') {
    //                        params.coll = res[val];
    //                        params.keys = Object.keys(params.coll[0]);
    //                        setArrays();
    //                        setTypes();
    //                        setSize();
    //
    //                        resolve(data);
    //                    }
    //                });
    //
    //                if (typeof(cb) !== 'undefined') {
    //                    cb(data);
    //                }
    //            };
    //
    //            var script = document.createElement('script');
    //            script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
    //            document.body.appendChild(script);
    //
    //        } else {
    //            var xhr = new XMLHttpRequest();
    //            xhr.open('GET', url, true);
    //            //xhr.withCredentials = 'true';
    //
    //            switch (ext) {
    //                case 'txt':
    //                case 'csv':
    //                    break;
    //                case 'json':
    //                    //xhr.responseType = 'json';
    //                    break;
    //                case 'wav':
    //                case 'aif':
    //                case 'aiff':
    //                case 'ogg':
    //                case 'mp3':
    //                    xhr.responseType = 'arraybuffer';
    //                    break;
    //                case 'png':
    //                case 'jpg':
    //                case 'jpeg':
    //                    xhr.responseType = 'blob';
    //                    break;
    //                default:
    //                    //xhr.responseType = 'blob';
    //                    break;
    //            }
    //
    //            xhr.onreadystatechange = function () {
    //                if (xhr.readyState == 4 && xhr.status == 200) {
    //                    if (xhr.responseType === 'arraybuffer') {
    //
    //                        if (dtm.wa.isOn) {
    //                            dtm.wa.actx.decodeAudioData(xhr.response, function (buf) {
    //                                for (var c = 0; c < buf.numberOfChannels; c++) {
    //                                    var floatArr = buf.getChannelData(c);
    //                                    params.arrays['ch_' + c] = dtm.array(Array.prototype.slice.call(floatArr)).label('ch_' + c);
    //                                    params.keys.push('ch_' + c);
    //                                }
    //
    //                                //setArrays();
    //                                //setTypes();
    //                                //setSize();
    //                                params.size.col = buf.numberOfChannels;
    //                                params.size.row = params.arrays['ch_0'].get('length');
    //                                // CHECK: ugly as hell
    //
    //                                if (typeof(cb) !== 'undefined') {
    //                                    cb(data);
    //                                }
    //
    //                                resolve(data);
    //                            });
    //                        }
    //                    } else if (xhr.responseType === 'blob') {
    //                        var img = new Image();
    //                        img.onload = function () {
    //                            params.size.col = img.width;
    //                            params.size.row = img.height;
    //
    //                            for (var i = 0; i < img.width; i++) {
    //                                for (var j = 0; j < img.height; j++) {
    //                                    // TODO: WIP
    //                                }
    //                            }
    //                        };
    //                        img.src = window.URL.createObjectURL(xhr.response);
    //
    //                    } else {
    //                        var keys = [];
    //
    //                        if (ext === 'csv') {
    //                            params.coll = dtm.parser.csvToJson(xhr.response);
    //                            keys = Object.keys(params.coll[0]);
    //                        } else if (ext === 'json') {
    //                            var res = xhr.responseText;
    //
    //                            try {
    //                                res = JSON.parse(res);
    //                            } catch (e) {
    //                                try {
    //                                    res = eval(res);
    //                                } catch (e) {
    //                                    console.log('Could not parse the JSON file. Maybe the format is not right.');
    //                                }
    //                            }
    //
    //
    //                            if (url.indexOf('wunderground') > -1) {
    //                                var obj = JSON.parse(xhr.response);
    //                                params.coll = obj[Object.keys(obj)[1]];
    //
    //                                if (params.coll.constructor === Array) {
    //                                    // for hourly forecast
    //                                    keys = Object.keys(params.coll[0]);
    //                                } else {
    //                                    // for current weather
    //                                    keys = Object.keys(params.coll);
    //                                    params.coll = [params.coll];
    //                                }
    //                            } else {
    //                                var second = res[Object.keys(res)[0]];
    //
    //                                if (second.constructor === Array) {
    //                                    keys = Object.keys(second[0]);
    //                                } else {
    //                                    keys = Object.keys(second);
    //                                }
    //
    //                                // TODO: may not work with non-array JSON formats
    //                                params.coll = res;
    //                            }
    //                        } else {
    //                            // TODO: this only works for shodan
    //                            //params.coll = JSON.parse(xhr.response)['matches'];
    //
    //                            params.coll = second;
    //                        }
    //                        //params.keys = _.keys(params.coll[0]);
    //                        params.keys = keys;
    //                        setArrays();
    //                        setTypes();
    //                        setSize();
    //
    //                        if (typeof(cb) !== 'undefined') {
    //                            cb(data);
    //                        }
    //
    //                        resolve(data);
    //                    }
    //                }
    //            };
    //
    //            xhr.send();
    //        }
    //    });
    //
    //    data.then = data.promise.then;
    //
    //    // CHECK: this doesn't work
    //    data.promise.get = function (arg) {
    //        data.promise.then(function (d) {
    //            data = d;
    //            return d.get(arg);
    //        });
    //        //return data.promise;
    //    };
    //
    //    if (data.name === 'dtm.data') {
    //        return data;
    //    } else if (data.name === 'dtm.load') {
    //        return data.promise;
    //    }
    //};


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
        params.keys.forEach(function (key) {
            params.arrays[key] = dtm.array(_.pluck(params.coll, key)).label(key);
        })
    }

    function setTypes() {
        params.keys.forEach(function (key) {
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

    //data.stream = function (uri, rate) {
    //    return data;
    //};

    data.init = function (arg) {
        var i = 0;

        if (arguments.length === 1) {
            if (typeof(arg) === 'number') {
                for (i = 0; i < arg; i++) {
                    params.arrays[i] = dtm.array();
                    params.keys[i] = i.toString();
                    params.size.col = arg;
                    params.size.row = 0;
                }
            } else if (typeof(arg) === 'object') {
                for (i = 0; i < arg.num; i++) {
                    params.arrays[i] = dtm.array().fill('zeros', arg.len);
                    params.keys[i] = i.toString();
                    params.size.col = arg.num;
                    params.size.row = arg.len;
                }
            }
        } else if (arguments.length === 2) {
            for (i = 0; i < arguments[0]; i++) {
                params.arrays[i] = dtm.array().fill('zeros', arguments[1]);
                params.keys[i] = i.toString();
                params.size.col = arguments[0];
                params.size.row = arguments[1];
            }
        } else if (arguments.length === 3) {
        for (i = 0; i < arguments[0]; i++) {
            params.arrays[arguments[2][i]] = dtm.array().fill('zeros', arguments[1]).label(arguments[2][i]);
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
        params.arrays.forEach(function (a) {
            a.flush();
        });
        params.size.row = 0;
        return data;
    };

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            return data.load(arg, cb);
        }
    } else {
        return data;
    }
};
//
//dtm.load = dtm.d = dtm.data;
//dtm.load.name = 'dtm.load';

dtm.load = function (elem_files) {
    var fileType = null;
    var reader = new FileReader();
    if (elem_files[0].name.match(/.+\.json/gi)) {
        fileType = 'json';
    } else if (elem_files[0].name.match(/.+\.csv/gi)) {
        fileType = 'csv';
    }
    reader.readAsText(elem_files[0]);
    return new Promise(function (resolve) {
        reader.onload = function (e) {
            if (fileType === 'json') {
                resolve(JSON.parse(e.target.result));
            } else if (fileType === 'csv') {
                //resolve(dtm.parser.csvToCols(e.target.result));
                var data = dtm.data();
                var arrays = [];
                objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                    var a = dtm.array(v).label(k).parent(data);
                    arrays.push(a);
                });

                resolve(data.set(arrays));

                //resolve(dtm.data().setCols(dtm.parser.csvToCols(e.target.result)));
            }
        };
    });
};
/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

/**
 * Creates a new instance of clock.
 * @function module:clock.clock
 * @param [bpm=true] {boolean|number} Synchronization or Tempo setting. If given a boolean, or string "sync", it sets the current sync state of the clock as a slave to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM for unsynced clock is 120. Recommended value range is around 60-140.
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
        subDiv: 2,
        random: 0,
        swing: 0.5,

        current: 0,
        previous: 0,
        reported: 0,
        resolution: 480,
        beat: 0,
        prevBeat: -1,

        lookahead: 0.1,
        offset: 0,
        requestId: null,
        autoStart: true,

        time: [4, 4]
    };

    var clock = {
        type: 'dtm.clock',

        interval: 1,
        beat: 0,
        list: [],

        // temp
        prev: 0,

        // CHECK: public - just for debugging
        callbacks: []
    };

    // member?
    var curTime = 0.0;

    var actx = null, clockBuf = null;

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
                if (params.sync) {
                    return dtm.master.get('clock').get('bpm');
                } else {
                    return params.bpm;
                }

            case 'subdiv':
            case 'subDiv':
            case 'div':
                return params.subDiv;

            case 'time':
                return params.subDiv;

            case 'dur':
            case 'interval':
                return getInterval();

            case 'freq':
                return getFreq();

            case 'sync':
            case 'synced':
                return params.sync;

            case 'lookahead':
            case 'la':
                return params.lookahead;

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
        if (isFunction(bpm)) {
            clock.callback(bpm);
        } else {
            clock.bpm(bpm);
        }

        if (!isEmpty(subDiv)) {
            clock.subdiv(subDiv);
        }

        if (isBoolean(autoStart)) {
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
        if (!isBoolean(bool)) {
            bool = true;
        }

        params.sync = bool;
        return clock;
    };

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param bpm {number} BPM value
     * @returns {dtm.clock} self
     * @example
     *
     * var cl = dtm.createClock();
     * cl.bpm(90);
     */
    clock.bpm = function (bpm) {
        if (isNumber(bpm)) {
            params.bpm = bpm;
            params.sync = false;
        } else if (isBoolean(bpm)) {
            params.sync = bpm;
        } else if (bpm == 'sync') {
            params.sync = true;
        }

        return clock;
    };

    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {number|string} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subdiv = function (val) {
        if (isNumber(val)) {
            params.subDiv = val;
        } else if (isString(val)) {
            val = val.split('/');
            try {
                val = Math.round(parseFloat(val[1])/parseFloat(val[0]));
            } catch (e) {
                return clock;
            }
            params.subDiv = val;
        }
        return clock;
    };

    clock.div = clock.subdiv;

    clock.time = function (val) {
        if (isNumber(val) && val !== 0) {
            params.subDiv = 1/val;
        }
        return clock;
    };

    clock.interval = function (sec) {
        params.sync = false;
        params.subDiv = 1.0;
        params.bpm = 60.0 / sec * 4;
        return clock;
    };

    clock.dur = clock.interval;

    function getInterval() {
        if (params.sync) {
            return 1.0/(dtm.master.get('clock').get('bpm')/60.0 * params.subDiv/4.0);
        } else {
            return 1.0/(params.bpm/60.0 * params.subDiv/4.0);
        }
    }

    function getFreq() {
        if (params.sync) {
            return dtm.master.get('clock').get('bpm')/60.0 * params.subDiv/4.0;
        } else {
            return params.bpm/60.0 * params.subDiv/4.0;
        }
    }

    clock.setTime = function (input) {
        if (isArray(input)) {
            clock.params.time = input;
        } else if (isString(input)) {
            clock.params.time = input.split('/');
        }
        return clock;
    };

    clock.meter = clock.setTime;

    clock.setMaster = function (bool) {
        params.isMaster = bool;
        return clock;
    };

    clock.lookahead = function (lookahead) {
        if (isNumber(lookahead) && lookahead >= 0.0) {
            params.lookahead = lookahead;
        }
        return clock;
    };

    clock.la = clock.lookahead;

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

        if (isString(name)) {
            clock.callbacks.forEach(function (stored) {
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
            clock.callbacks.forEach(function (stored) {
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

    clock.cb = clock.callback = clock.call = clock.register = clock.reg = clock.add;

    /**
     * @function module:clock#remove
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.remove = function (id) {
        if (isFunction(id)) {
            dtm.log('removing a calblack function');
            _.remove(clock.callbacks, function (cb) {
                return _.isEqual(cb, id);
            });
        } else if (isString(id)) {
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
        if (isFunction(id)) {
            dtm.log('modifying the callback: ' + id.name);
            clock.remove(id.name);
            clock.add(id);
        } else if (isString(id)) {
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
    clock.start = function () {
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
     * @param [timestamp=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timestamp) {
        if (!params.isOn) {
            // do nothing
            return clock;
        }

        var freq = 1;

        if (!params.sync && !params.isMaster) {
            if (params.source === 'webAudio') {
                actx = dtm.wa.actx;
                clockSrc = actx.createBufferSource();
                clockBuf = dtm.wa.clockBuf;
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                freq = params.bpm / 60.0 * (params.subDiv / 4.0);
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
                    //var error = now() - curTime;
                    //clock.tick(error);
                    clock.tick();
//                curTime = now();
                };

                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (params.subDiv * clock.params.time[0] / clock.params.time[1]);

            } else if (params.source === 'animationFrame') {
                params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution * params.subDiv / 4);

                if (params.reported !== params.current) {
                    if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                        params.beat = Math.round(params.current / params.resolution);
                        //console.log(params.beat);

                        clock.callbacks.forEach(function (cb) {
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
                actx = dtm.wa.actx;
                clockSrc = actx.createBufferSource();
                clockBuf = dtm.wa.clockBuf;
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                freq = params.bpm / 60.0 * (params.subDiv / 4.0);

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

                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (params.subDiv * clock.params.time[0] / clock.params.time[1]);

            } else if (params.source === 'animationFrame') {
                params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution);

                if (params.reported !== params.current) {
                    if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                        params.beat = Math.round((params.current-params.offset) / params.resolution);

                        //console.log(dtm.wa.actx.currentTime);
                        //console.log(params.reported);
                    }


                    clock.callbacks.forEach(function (cb) {
                        cb(clock);
                    });

                    params.current = params.reported;
                }

                params.requestId = window.requestAnimationFrame(clock.tick);
            }
        }

        return clock;
    };

    // TODO: stopping system should remove these callbacks?
    // TODO: implement shuffle and randomize
    clock.tickSynced = function () {
        if (!params.isOn || !params.sync) {
            return clock;
        }

        if (dtm.master.clock.get('source') === 'webAudio') {
            if (dtm.master.clock.beat % Math.round(params.resolution/params.subDiv) === 0) {
                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });
            }
        }

        else if (dtm.master.clock.get('source') === 'animationFrame') {
            if ((dtm.master.clock.get('cur') % (params.resolution/params.subDiv*4)) < params.prev) {

                params.beat = Math.round((dtm.master.clock.get('cur')-params.offset) / params.resolution * params.subDiv / 4);

                //if (params.beat > params.prevBeat) {
                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });
                //}

                params.prevBeat = params.beat;
            }
            params.prev = dtm.master.clock.get('cur') % (params.resolution / params.subDiv * 4);
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
        if (isArray(arr)) {
            if (arr.indexOf(clock.beat) > -1) {
                if (!isEmpty(cb)) {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.notWhen = function (arr, cb) {
        if (isArray(arr)) {
            if (arr.indexOf(clock.beat) == -1) {
                if (!isEmpty(cb)) {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    /**
     * Executes an event at certain tick(s) of the clock.
     * @function module:clock#on
     * @param condition {string} Right now, it only supports "every".
     * @param length {number}
     * @param callback {function}
     * @returns {dtm.clock}
     * @example
     * dtm.clock().on('every', 4, callbackFunction);
     */
    clock.on = function (condition, length, callback) {
        switch (condition) {
            case 'every':
                var cb = (function (len, cb) {
                    return function (c) {
                        if (c.get('beat') % len === 0) {
                            cb(c);
                        }
                    };
                })(arguments[1], arguments[2]);

                clock.callbacks.push(cb);
                break;
            default:
                break;
        }

        return clock;
    };

    clock.seq = function (callback, seqArray, interval) {
        var cb = (function (cb, arr, len) {
            return function (c) {
                if (isEmpty(len)) {
                    len = c.get('subDiv');
                }
                if (arr.indexOf(c.get('beat') % len) > -1) {
                    cb(c);
                }
            };
        })(arguments[0], arguments[1], arguments[2]);

        clock.callbacks.push(cb);
        return clock;
    };

    // single-shot scheduler
    clock.delayEvent = function () {
        return clock;
    };

    clock.delay = clock.delayEvent;

    if (!params.isMaster && !isEmpty(dtm.master)) {
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
            params.clock.subdiv(div);

            var wt = params.models.wavetable;
            var lpf = params.models.lpf;
            var comb = params.models.comb;
            var delay = params.models.delay;

            if (params.sync === false) {
                params.clock.bpm(params.models.bpm.get('next'));
            }

            params.callbacks.forEach(function (cb) {
                cb(params.clock);
            });

            if (r) {
                ct.forEach(function (val) {
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

            case 'isplaying':
            case 'isPlaying':
                return params.isPlaying;

            case 'c':
            case 'clock':
                return params.clock;

            case 'beat':
                return params.clock.get('beat');

            case 'm':
            case 'mod':
            case 'model':
            case 'models':
            case 'modList':
                return instr.params;

            case 'param':
            case 'params':
                break;

            default:
                break;
        }
    };

    instr.set = function (dest, src, adapt) {
        if (isNumber(src)) {
            params.models[dest] = dtm.array(src);
        } else {
            if (src.constructor === Array) {
                params.models[dest] = dtm.array(src);
            } else if (isDtmArray(src)) {
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

        if (isString(arguments[1])) {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (arg.constructor === Array) {
            if (categ) {
                params.models[categ] = dtm.array(arg);
            } else {
                params.models['none'] = dtm.array(arg);
            }
        } else if (isObject(arg)) {
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

            } else if (isDtmArray(src)) {
                params.models[categ] = arg;
            }
        } else if (isString(arg)) {
            var model = _.find(dtm.modelColl, {params: {
                name: arg
            }});

            if (!isEmpty(model)) {
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
        if (isArray(src)) {
            params.models[dest] = dtm.array(src).normalize();
        } else if (isDtmArray(src)) {
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
     * @param tgt {number|string} Modulation target.
     * @param src {number|string|array|dtm.array} Modulation source.
     * @param [mode='adapt'] {string} Scaling mode.
     * @returns {dtm.instr}
     */
    instr.mod = function (tgt, src, mode) {
        var dest = '';

        if (isString(tgt)) {
            dest = tgt;
        } else if (isNumber(tgt)) {
            // TODO: error check
            dest = instr.params[tgt];
        }

        instr[dest](src, mode);
        // maybe feed arguments[1-];

        return instr;
    };

    instr.modulate = instr.mod;

    function mapper(dest, src) {
        if (isNumber(src)) {
            params.models[dest] = dtm.array(src);
        } else if (isString(src)) {
            params.models[dest] = dtm.array(src).classify();
        } else {
            if (isArray(src)) {
                params.models[dest] = dtm.array(src);
            } else if (isDtmArray(src)) {
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

        if (isString(arg)) {
            //model = _.find(dtm.modelColl, function (m) {
            //    return m.get('name') == arg;
            //});
            model = dtm.modelCallers[arg](); // requires the IIFE to manually return the created model... bad design?
        } else if (arg.type === 'dtm.model') {
            model = arg;
        }

        if (typeof(model) !== 'undefined') {
            model.parent = instr;
            model.assignMethods(instr);

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
        defaultCb: null,

        registering: false,
        loading: true,

        process: [],
        data: dtm.array(),
        clock: null,

        //output: null // dtm.array
        output: []
    };

    var model = function () {
        if (isFunction(params.defaultCb)) {
            return params.defaultCb.apply(this, arguments);
        } else {
            if (!!model.caller.arguments[0]) {
                if (model.caller.arguments[0].type === 'dtm.clock') {
                    params.clock = model.caller.arguments[0];
                }
            }

            if (arguments.length === 1) {
                var arg = arguments[0];

                if (isNumber(arg)) {
                    params.data.set(arg);
                } else if (isString(arg)) {
                    params.data.set(dtm.gen('s', arg)).histo();
                } else if (isNumOrFloat32Array(arg)) {
                    params.data.set(arg);
                } else if (isDtmArray(arg)) {
                    params.data.set(arg);
                } else if (isFunction(arg)) {
                    // TODO: not working
                    //params.output.push({
                    //    method: function (a, c) {
                    //        return arg(a, c);
                    //    },
                    //    params: null
                    //});
                }
            } else if (arguments.length > 1) {
                params.data.set.apply(this, arguments);
            }

            params.process.forEach(function (v) {
                v.method.apply(this, v.params);
            });

            if (params.range) {
                if (params.domain) {
                    params.data.range(params.range, params.domain);
                } else {
                    params.data.range(params.range);
                }
            } else if (params.domain) {
                params.data.normalize(params.domain);
            }

            var res = null;

            if (params.output) {
                params.output.forEach(function (v) {
                    if (params.clock) {
                        res = v.method(params.data, params.clock);
                    } else {
                        res = v.method(params.data);
                    }
                });
            }

            if (res) {
                return res;
            } else {
                return params.data;
            }
        }
    };

    model.meta = {
        type: 'dtm.model'
    };

    model.parent = {};
    model.siblings = [];

    model.mod = {};
    model.param = {};
    model.set = {};
    model.map = {};

    model.params = {};
    model.models = {};

    model.modes = {
        'literal': ['literal', 'lit', 'l'],
        'adapt': ['adapt', 'adapted', 'adaptive', 'a'],
        'preserve': ['preserve', 'preserved', 'p', 'n']
    };

    if (typeof(name) === 'string') {
        params.name = name;
    }

    if (typeof(categ) === 'string') {
        params.categ = categ;
    }

    model.default = function (callback) {
        if (typeof(callback) === 'function') {
            params.defaultCb = callback;
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

    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        if (typeof(categ) === 'string') {
            params.categ = categ;
        }
        return model;
    };

    /**
     * Call this when creating a new model, which you want to reuse later by newly instantiating.
     * @function module:model#register
     * @returns {dtm.model}
     */
    model.register = function () {

        //if (model.register.caller.arguments[0] !== null) {
        //    dtm.modelCallers[model.get('name')] = model.register.caller;
        //    params.loading = true;
        //}
        var modelAlreadyExists = false;

        //if (model.register.caller.arguments[0]) {
        //    params.loading = true;
        //}
        //params.loadable = model.register.caller.arguments[0];

        for (var key in dtm.modelCallers) {
            if (key === model.get('name')) {
                dtm.log('model already registered: ' + model.get('name'));
                modelAlreadyExists = true;
                params.registering = false;
            }
        }

        if (!modelAlreadyExists) {
            dtm.log('registering a new model: ' + model.get('name'));
            dtm.modelCallers[model.get('name')] = model.register.caller;
            params.registering = true;
        }

        return model;
    };

    model.save = function () {
        dtm.modelColl[model.get('name')] = model;
        return model;
    };

    model.toNumeric = function (type) {
        switch (type) {
            case 'histo':
            case 'histogram':
                params.process.push({
                    method: function () {
                        if (params.data.get('type') !== 'number') {
                            params.data.histo();
                        }
                    },
                    params: null
                });
                break;
            case 'class':
                params.process.push({
                    method: function () {
                        if (params.data.get('type') !== 'number') {
                            params.data.class();
                        }
                    },
                    params: null
                });
                break;
            case 'freq':
            case 'frequency':
            case 'appearance':
                break;
            default:
                break;
        }
        return model;
    };

    model.domain = function () {
        if (arguments.length === 1) {
            var arg = arguments[0];
            if (typeof(arg) === 'object') {
                if (arg.constructor === Array) {
                    params.domain = arg;
                } else if (isDtmArray(arg)) {
                    if (arg.get('len') === 2) {
                        params.domain = arg.get();
                    } else {
                        params.domain = arg.get('extent');
                    }
                }
            } else if (typeof(arg) === 'function') {
                params.process.push({
                    method: function () {
                        params.domain = arg(params.data);
                    },
                    params: null
                });
            }
        } else if (arguments.length === 2) {
            params.domain = [arguments[0], arguments[1]];
        }
        return model;
    };

    model.range = function () {
        if (arguments.length === 1) {
            var arg = arguments[0];
            if (typeof(arg) === 'object') {
                if (arg.constructor === Array) {
                    params.range = arg;
                } else if (isDtmArray(arg)) {
                    if (arg.get('len') === 2) {
                        params.range = arg.get();
                    } else {
                        params.range = arg.get('extent');
                    }
                }
            } else if (typeof(arg) === 'function') {
                params.process.push({
                    method: function () {
                        params.range = arg(params.data);
                    },
                    params: null
                });
            }
        } else if (arguments.length === 2) {
            params.range = [arguments[0], arguments[1]];
        }
        return model;
    };

    model.output = function (arg) {
        //console.log(model.caller.caller.caller.caller.arguments[0]);
        if (isFunction(arg)) {
            params.output.push({
                method: function (a, c) {
                    return arg(a, c)
                },
                params: null
            });
        } else {
            params.output.push({
                method: function () {
                    return arg;
                },
                params: null
            })
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
        model.mod.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        model.param.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        model.set.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        model.map.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });
        return model;
    };

    if (isString(name)) {
        if (!isEmpty(dtm.model.caller)) {
            params.loading = dtm.model.caller.arguments[0];
        }

        var modelLoaded, key;
        for (key in dtm.modelCallers) {
            if (key === name) {
                if (params.loading !== true) {
                    dtm.log('found a registered model: ' + name);
                    modelLoaded = dtm.modelCallers[name](true);
                }
            }
        }

        if (isEmpty(modelLoaded)) {
            for (key in dtm.modelColl) {
                if (key === name && model.load.caller.arguments[0] !== name) {
                    modelLoaded = dtm.modelColl[name].clone();
                }
            }
        }

        if (!isEmpty(modelLoaded)) {
            dtm.log('loading a registered / saved model: ' + name);
            model = modelLoaded;
        }
    } else if (isFunction(name)) {
        params.output.push({
            method: function (a, c) {
                return name(a, c)
            },
            params: null
        });
    }

    //model.load.apply(this, arguments);
    return model;
};

dtm.m = dtm.model;

/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module synth
 */

///**
// * Creates a new instance of synthesizer object.
// * @function module:synth.synth
// * @returns {dtm.synth}
// */
dtm.synth = function () {
    //var synth = {
    //    type: 'dtm.synth',
    //
    //    meta: {
    //        type: 'dtm.synth'
    //    }
    //};

    var synth = function () {
        return synth.clone();
    };

    var params = {
        sr: 44100,
        kr: 4410,
        dur: 1.0,
        durTest: dtm.array(1.0),
        offset: 0.0,
        repeat: 1,
        autoRep: true,

        baseTime: 0.0, // for offline rendering
        lookahead: false,
        autoDur: false,
        voiceId: Math.random(),
        startTime: 0.0,
        phase: 0.0,

        wavetable: null,
        rendered: null,
        tabLen: 8192,
        source: 'sine',
        type: 'synth',
        promise: null,
        pending: false,

        amp: null,
        notenum: null,
        freq: null,
        pitch: null,
        pan: null,
        curve: false,
        offline: false,
        clock: null,

        //useOfflineContext: true,
        rtFxOnly: true,
        named: []
    };

    var nodes = {
        src: null,
        amp: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null,

        phasor: null
    };

    synth.meta = {
        type: 'dtm.synth',
        setParams: function (newParams) {
            params = newParams;
            return synth;
        },
        setNodes: function (newNodes) {
            nodes = newNodes;
            return synth;
        }
    };

    synth.get = function (param) {
        switch (param) {
            case 'clock':
                return params.clock;
            case 'lookahead':
                return params.lookahead;
            case 'autoDur':
                return params.autoDur;
            case 'dur':
            case 'duration':
                return params.dur;
            case 'source':
                return params.source;
            case 'tabLen':
                return params.tabLen;
            case 'wavetable':
                return params.wavetable;
            case 'id':
                return params.voiceId;
            default:
                return synth;
        }
    };

    if (!!arguments.callee.caller) {
        if (arguments.callee.caller.arguments.length > 0) {
            if (isObject(arguments.callee.caller.arguments[0])) {
                if (arguments.callee.caller.arguments[0].type === 'dtm.clock') {
                    params.clock = arguments.callee.caller.arguments[0];
                    params.lookahead = true;
                    params.autoDur = true;
                }
            }
        }
    }

    var actx = dtm.wa.actx;
    var octx = null;
    params.sr = actx.sampleRate;
    params.rtFxOnly = !dtm.wa.useOfflineContext;
    var deferIncr = 1;

    var init = function () {
        if (isObject(arguments[0])) {
            if (arguments[0].hasOwnProperty('type')) {
                if (arguments[0].type === 'dtm.clock') {
                    params.clock = arguments[0];
                    params.lookahead = true;
                    params.autoDur = true;
                }
            }
        }

        params.baseTime = actx.currentTime;

        params.amp = toFloat32Array([1]);
        params.notenum = toFloat32Array([69]);
        params.freq = toFloat32Array([440]);
        params.pitch = freqToPitch(params.freq);
        params.wavetable = new Float32Array(params.tabLen);
        params.wavetable.forEach(function (v, i) {
            params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
        });
        params.pan = new Float32Array([0.0]);
    };

    init.apply(this, arguments);

    function freqToPitch(freqArr) {
        var res = new Float32Array(freqArr.length);
        freqArr.forEach(function (v, i) {
            res[i] = v * params.tabLen / params.sr;
        });
        return res;
    }

    function pitchToFreq(pitchArr) {

    }

    function setParamCurve (time, dur, curves) {
        curves.forEach(function (curve) {
            // if the curve length exceeds the set duration * this
            var maxDurRatioForSVAT = 0.25;
            if (params.curve || (curve.value.length / params.sr) > (params.dur * maxDurRatioForSVAT)) {
                curve.param.setValueCurveAtTime(curve.value, time, dur);
            } else {
                curve.value.forEach(function (v, i) {
                    curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                });
            }
        });
    }

    var fx = {
        // TODO: named param mode not complete
        Gain: function (mode) {
            var name = null;
            var post = isBoolean(mode) ? mode : params.rtFxOnly;
            if (isString(mode)) {
                post = true;
                name = mode;
            }
            this.mult = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.gain = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.gain);
                this.gain.connect(this.out);

                var curves = [];
                curves.push({param: this.gain.gain, value: this.mult});
                setParamCurve(time, dur, curves);

                if (!isEmpty(name)) {
                    params.named[name] = this.gain.gain;
                }
            }
        },

        LPF: function (post) {
            this.freq = new Float32Array([20000.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.lpf = ctx.createBiquadFilter();
                this.out = ctx.createGain();
                this.in.connect(this.lpf);
                this.lpf.connect(this.out);

                var curves = [];
                curves.push({param: this.lpf.frequency, value: this.freq});
                curves.push({param: this.lpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        HPF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.hpf = ctx.createBiquadFilter();
                this.hpf.type = 'highpass';
                this.out = ctx.createGain();
                this.in.connect(this.hpf);
                this.hpf.connect(this.out);

                var curves = [];
                curves.push({param: this.hpf.frequency, value: this.freq});
                curves.push({param: this.hpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        BPF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.bpf = ctx.createBiquadFilter();
                this.bpf.type = 'bandpass';
                this.out = ctx.createGain();
                this.in.connect(this.bpf);
                this.bpf.connect(this.out);

                var curves = [];
                curves.push({param: this.bpf.frequency, value: this.freq});
                curves.push({param: this.bpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        APF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.apf = ctx.createBiquadFilter();
                this.apf.type = 'allpass';
                this.out = ctx.createGain();
                this.in.connect(this.apf);
                this.apf.connect(this.out);

                var curves = [];
                curves.push({param: this.apf.frequency, value: this.freq});
                curves.push({param: this.apf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        Delay: function (post) {
            this.mix = new Float32Array([0.5]);
            this.time = new Float32Array([0.3]);
            this.feedback = new Float32Array([0.5]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.delay = ctx.createDelay();
                this.wet = ctx.createGain();
                this.dry = ctx.createGain();
                this.fb = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.delay);
                this.delay.connect(this.fb);
                this.fb.connect(this.delay);
                this.delay.connect(this.wet);
                this.wet.connect(this.out);
                this.in.connect(this.dry);
                this.dry.connect(this.out);

                var curves = [];
                curves.push({param: this.wet.gain, value: this.mix});
                curves.push({param: this.delay.delayTime, value: this.time});
                curves.push({param: this.fb.gain, value: this.feedback});
                setParamCurve(time, dur, curves);
            };
        },

        Reverb: function (post) {
            this.mix = toFloat32Array(0.5);
            //this.time = toFloat32Array(2.0);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.verb = ctx.createConvolver();
                this.wet = ctx.createGain();
                this.dry = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.verb);
                this.verb.connect(this.wet);
                this.wet.connect(this.out);
                this.in.connect(this.dry);
                this.dry.connect(this.out);

                var size = params.sr * 2;
                var ir = ctx.createBuffer(1, size, params.sr);
                ir.copyToChannel(dtm.gen('noise').size(size).mult(dtm.gen('decay').size(size)).get(), 0);
                this.verb.buffer = ir;

                this.dryLevel = this.mix.map(function (v) {
                    if (v <= 0.5) {
                        return 1.0;
                    } else {
                        return 1.0 - (v - 0.5) * 2.0;
                    }
                });

                this.wetLevel = this.mix.map(function (v) {
                    if (v >= 0.5) {
                        return 1.0;
                    } else {
                        return v * 2.0;
                    }
                });

                var curves = [];
                curves.push({param: this.dry.gain, value: this.dryLevel});
                curves.push({param: this.wet.gain, value: this.wetLevel});
                setParamCurve(time, dur, curves);
            }
        },

        Convolver: function () {

        },

        BitQuantizer: function () {
            this.bit = new Float32Array([16]);
            var self = this;

            this.run = function (time, dur) {
                this.in = actx.createGain();
                this.out = actx.createGain();
                this.in.connect(this.out);

                var interval = dur * params.sr / this.bit.length;
                this.bit.forEach(function (v, i) {
                    // allowing fractional values...
                    if (v > 16) {
                        v = 16;
                    } else if (v < 1) {
                        v = 1;
                    }
                    self.bit[i] = v;
                });

                params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > self.bit.length-1) {
                        blockNum = self.bit.length-1;
                    }
                    var res = Math.pow(2, self.bit[blockNum]);
                    params.rendered[i] = Math.round(v * res) / res;
                });
            };
        },

        SampleHold: function () {
            this.samps = new Float32Array([1]);
            var self = this;

            this.run = function (time, dur) {
                this.in = actx.createGain();
                this.out = actx.createGain();
                this.in.connect(this.out);

                var interval = dur * params.sr / this.samps.length;
                this.samps.forEach(function (v, i) {
                    v = Math.round(v);
                    if (v < 1) {
                        v = 1;
                    }
                    self.samps[i] = v;
                });

                params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > self.samps.length-1) {
                        blockNum = self.samps.length-1;
                    }
                    var samps = self.samps[blockNum];
                    var hold = 0;
                    if (i % samps === 0) {
                        hold = v;
                    }
                    params.rendered[i] = hold;
                })
            }
        },

        WaveShaper: function () {

        }
    };

    /**
     * Sets dtm.clock object for internal-use in the synth.
     * @function module:synth#clock
     * @param clock {dtm.clock} dtm.clock object
     * @returns {dtm.synth}
     */
    synth.clock = function (clock) {
        if (isObject(clock)) {
            if (clock.type === 'dtm.clock') {
                params.clock = clock;
            }
        }
        return synth;
    };

    /**
     * @function module:synth#lookahead
     * @param lookahead {bool|number}
     * @returns {dtm.synth}
     */
    synth.lookahead = function (lookahead) {
        if (isBoolean(lookahead)) {
            params.lookahead = lookahead;
        }
        return synth;
    };

    /**
     * @function module:synth#dur
     * @param src
     * @returns {dtm.synth}
     */
    synth.dur = function (src) {
        if (isNumber(src) && src > 0) {
            params.autoDur = false;
            params.dur = src;
        } else if (isBoolean(src)) {
            params.autoDur = src;
        } else if (src === 'auto') {
            params.autoDur = true;
        } else if (isDtmArray(src)) {
            params.durTest = src;
        } else if (isFunction(src)) {
            params.dur = src(dtm.a(params.dur), synth, params.clock);
        }
        return synth;
    };

    synth.offset = function (src) {
        params.offset = toFloat32Array(src)[0];
        return synth;
    };

    // maybe not good to have this in synth, instead should be in a model?
    synth.time = function (src) {
        if (isNumber(src) && (src > 0) && !isEmpty(params.clock)) {
            if (dtm.val.mod(params.clock.get('beat'), params.clock.get('time') * src) === 0) {
                // TODO: implement
            }
        }
        return synth;
    };

    /**
     * Plays
     * @function module:synth#play
     * @param [bool=true] {boolean}
     * @returns {dtm.synth}
     */
    synth.play = function (bool) {
        var defer = 0;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        // if playSwitch is a function



        //params.dur = params.durTest.get('next');

        if (params.pending) {
            params.pending = false;
            params.promise.then(function () {
                synth.play(bool);
                return synth;
            });
            return synth;
        }

        // deferred
        setTimeout(function () {
            //===== type check
            if (isBoolean(bool) && bool === false) {
                return synth;
            }

            if (params.autoDur) {
                if (params.type === 'sample') {
                    params.tabLen = params.wavetable.length;
                    params.dur = params.tabLen / params.sr / params.pitch;
                } else if (params.clock) {
                    params.dur = params.clock.get('dur');
                }
            }

            var offset = params.offset;
            var dur = params.dur;

            //===== end of type check

            dtm.master.addVoice(synth);

            //===============================
            if (dtm.wa.useOfflineContext) {
                octx = new OfflineAudioContext(1, (offset + dur*4) * params.sr, params.sr);

                offset += octx.currentTime;

                if (params.lookahead) {
                    offset += params.clock.get('lookahead');
                }

                nodes.src = octx.createBufferSource();
                nodes.amp = octx.createGain();
                nodes.out = octx.createGain();
                nodes.fx[0].out = octx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(nodes.fx[0].out);
                nodes.out.connect(octx.destination);

                for (var n = 1; n < nodes.fx.length; n++) {
                    nodes.fx[n].run(offset, dur);
                    nodes.fx[n-1].out.connect(nodes.fx[n].in);
                }
                nodes.fx[n-1].out.connect(nodes.out);

                if (params.source === 'noise') {
                    nodes.src.buffer = octx.createBuffer(1, params.sr/2, params.sr);
                    var chData = nodes.src.buffer.getChannelData(0);
                    chData.forEach(function (v, i) {
                        chData[i] = Math.random() * 2.0 - 1.0;
                    });
                    nodes.src.loop = true;
                } else {
                    nodes.src.buffer = octx.createBuffer(1, params.tabLen, params.sr);
                    nodes.src.buffer.copyToChannel(params.wavetable, 0);
                    nodes.src.loop = true;
                }

                var curves = [];
                curves.push({param: nodes.src.playbackRate, value: params.pitch});
                curves.push({param: nodes.amp.gain, value: params.amp});
                setParamCurve(offset, dur, curves);

                nodes.fx[0].out.gain.value = 1.0;
                nodes.out.gain.value = 0.3;

                nodes.src.start(offset);
                nodes.src.stop(offset + dur);

                octx.startRendering();
                octx.oncomplete = function (e) {
                    params.rendered = e.renderedBuffer.getChannelData(0);

                    offset += params.baseTime;
                    if (params.lookahead) {
                        offset += params.clock.get('lookahead');
                    }

                    nodes.rtSrc = actx.createBufferSource();
                    nodes.pFx[0].out = actx.createGain();
                    var pan = actx.createStereoPanner();
                    var out = actx.createGain();
                    nodes.rtSrc.connect(nodes.pFx[0].out);
                    for (var n = 1; n < nodes.pFx.length; n++) {
                        nodes.pFx[n].run(offset, dur);
                        nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                    }
                    nodes.pFx[n-1].out.connect(pan);
                    pan.connect(out);
                    out.connect(actx.destination);

                    nodes.rtSrc.buffer = actx.createBuffer(1, params.rendered.length, params.sr);
                    nodes.rtSrc.buffer.copyToChannel(params.rendered, 0);
                    nodes.rtSrc.loop = false;
                    nodes.rtSrc.start(offset);
                    nodes.rtSrc.stop(offset + nodes.rtSrc.buffer.length);

                    setParamCurve(offset, dur, [{param: pan.pan, value: params.pan}]);

                    out.gain.value = 1.0;

                    nodes.rtSrc.onended = function () {
                        dtm.master.removeVoice(synth);
                    };
                };
            } else {
                offset += actx.currentTime;

                if (params.lookahead) {
                    offset += params.clock.get('lookahead');
                }

                params.startTime = offset;

                nodes.src = actx.createBufferSource();
                nodes.amp = actx.createGain();
                nodes.pFx[0].out = actx.createGain();
                var pan = actx.createStereoPanner();
                var out = actx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(nodes.pFx[0].out);
                for (var n = 1; n < nodes.pFx.length; n++) {
                    nodes.pFx[n].run(offset, dur);
                    nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                }
                nodes.pFx[n-1].out.connect(pan);
                pan.connect(out);
                out.connect(actx.destination);

                nodes.src.buffer = actx.createBuffer(1, params.tabLen, params.sr);
                nodes.src.buffer.copyToChannel(params.wavetable, 0);
                nodes.src.loop = (params.type !== 'sample');
                nodes.src.start(offset);
                nodes.src.stop(offset + dur);

                var curves = [];
                curves.push({param: nodes.src.playbackRate, value: params.pitch});
                curves.push({param: nodes.amp.gain, value: params.amp});
                setParamCurve(offset, dur, curves);
                setParamCurve(offset, dur, [{param: pan.pan, value: params.pan}]);

                nodes.pFx[0].out.gain.value = 1.0; // ?
                out.gain.value = 1.0;

                nodes.src.onended = function () {
                    dtm.master.removeVoice(synth);

                    // rep(1) would only play once
                    if (params.repeat > 1) {
                        params.repeat--;
                        synth.play(); // TODO: pass any argument?
                    }
                };
            }

        }, defer + deferIncr);

        return synth;
    };

    // testing
    synth.cancel = function (time) {
        if (!isNumber(time)) {
            time = 0.0;
        }

        objForEach(params.named, function (p) {
            p.cancelScheduledValues(actx.currentTime + time);
        });

        return synth;
    };

    /**
     * Stops the currently playing sound.
     * @function module:synth#stop
     * @param [time=0] {number} Delay in seconds for the stop action to be called.
     * @returns {dtm.synth}
     */
    synth.stop = function (time) {
        var defer = 0.0;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        if (!isNumber(time)) {
            time = 0.0; // TODO: time not same as rt rendering time
        }

        params.repeat = 0;

        setTimeout(function () {
            if (nodes.src) {
                nodes.src.stop(time);
            }

            if (nodes.rtSrc) {
                nodes.rtSrc.stop(time);
            }

            dtm.master.removeVoice(synth);
        }, defer + deferIncr*2);

        return synth;
    };

    synth.repeat = function (times, interval) {
        if (isInteger(times) && times > 0) {
            params.repeat = times;
        }
        return synth;
    };

    synth.rep = synth.repeat;

    function getPhase() {
        params.phase = (actx.currentTime - params.startTime) / params.dur;
        if (params.phase < 0.0) {
            params.phase = 0.0;
        } else if (params.phase > 1.0) {
            params.phase = 1.0;
        }
        return params.phase;
    }

    function map(src, param) {
        src = typeCheck(src);

        var arr;
        if (isFloat32Array(src)) {
            arr = src;
        } else if (isFunction(src)) {
            arr = toFloat32Array(src(dtm.a(param), synth, params.clock));
        }
    }

    synth.mod = function (name, val) {
        if (isString(name) && params.named.hasOwnProperty(name)) {
            setTimeout(function () {
                params.named[name].cancelScheduledValues(0); // TODO: check
                params.named[name].setValueAtTime(val, 0);
            }, 0);
        }
        return synth;
    };

    synth.modulate = synth.mod;

    /**
     * Sets the frequency of the oscillator
     * @function module:synth#freq
     * @param src
     * @param [post=false] boolean
     * @returns {dtm.synth}
     */
    synth.freq = function (src, post) {
        src = typeCheck(src);
        if (src) {
            params.freq = src;
            params.pitch = freqToPitch(params.freq);
        }
        return synth;
    };

    synth.freq.add = function (src, interp) {
        src = typeCheck(src);
        if (!isString(interp)) {
            interp = 'step';
        }

        if (src) {
            if (src.length > params.freq.length) {
                params.freq = dtm.a(params.freq).fit(src.length, interp).get();
            } else if (src.length < params.freq.length) {
                src = dtm.a(src).fit(params.freq.length, interp).get();
            }
            src.forEach(function (v, i) {
                params.freq[i] += v;
            });

            params.pitch = freqToPitch(params.freq);
        }

        return synth;
    };

    synth.freq.mult = function (src, interp) {
        src = typeCheck(src);
        if (!isString(interp)) {
            interp = 'step';
        }

        if (src) {
            if (src.length > params.freq.length) {
                params.freq = dtm.a(params.freq).fit(src.length, interp).get();
            } else if (src.length < params.freq.length) {
                src = dtm.a(src).fit(params.freq.length, interp).get();
            }
            src.forEach(function (v, i) {
                params.freq[i] *= v;
            });

            params.pitch = freqToPitch(params.freq);
        }

        return synth;
    };

    /**
     * Sets the pitch of the oscillator by a MIDI note number.
     * @function module:synth#notenum
     * @param src
     * @returns {dtm.synth}
     */
    synth.notenum = function (src) {
        src = typeCheck(src);

        var arr;
        if (isFloat32Array(src)) {
            arr = src;
        } else if (isFunction(src)) {
            arr = toFloat32Array(src(dtm.a(params.notenum), synth, params.clock)); // TODO: what args to pass?
        }

        if (isNumOrFloat32Array(arr)) {
            params.notenum = new Float32Array(arr.length);
            params.freq = new Float32Array(arr.length);
            arr.forEach(function (v, i) {
                params.notenum[i] = v;
                params.freq[i] = dtm.value.mtof(v);
            });
            params.pitch = freqToPitch(params.freq);
        }
        return synth;
    };

    synth.nn = synth.notenum;

    synth.notenum.add = function (src, interp) {
        src = typeCheck(src);
        if (!isString(interp)) {
            interp = 'step';
        }

        var arr;
        if (isFloat32Array(src)) {
            arr = src;
        } else if (isFunction(src)) {
            arr = toFloat32Array(src(dtm.a(params.notenum), synth, params.clock)); // TODO: what args to pass?
        } else if (isNestedDtmArray(src)) {
            arr = src.get('next');
        }

        if (isNumOrFloat32Array(arr)) {
            if (arr.length > params.notenum.length) {
                params.notenum = dtm.a(params.notenum).fit(arr.length, interp).get();
            } else if (arr.length < params.notenum.length) {
                arr = dtm.a(arr).fit(params.notenum.length, interp).get();
            }
            arr.forEach(function (v, i) {
                params.notenum[i] += v;
            });

            params.freq = dtm.transform.mtof(params.notenum);
            params.pitch = freqToPitch(params.freq);
        }

        return synth;
    };

    synth.notenum.mult = function (src, interp) {
        src = typeCheck(src);
        if (!isString(interp)) {
            interp = 'step';
        }

        if (src) {
            if (src.length > params.notenum.length) {
                params.notenum = dtm.a(params.notenum).fit(src.length, interp).get();
            } else if (src.length < params.notenum.length) {
                src = dtm.a(src).fit(params.notenum.length, interp).get();
            }
            src.forEach(function (v, i) {
                params.notenum[i] *= v;
            });

            params.freq = dtm.transform.mtof(params.notenum);
            params.pitch = freqToPitch(params.freq);
        }

        return synth;
    };

    // for longer sample playback
    synth.pitch = function (src, post) {
        src = typeCheck(src);
        if (src) {
            params.pitch = src;
        }
        return synth;
    };

    /**
     * @function module:synth#amp
     * @param src
     * @returns {dtm.synth}
     */
    synth.amp = function (src) {
        if (isDtmArray(src) && src.get('autolen')) {
            src.size(Math.round(params.dur * params.sr));
        }

        src = typeCheck(src);

        var arr;
        if (isFloat32Array(src)) {
            arr = src;
        } else if (isFunction(src)) {
            arr = toFloat32Array(src(dtm.a(params.amp), synth, params.clock));
        }

        if (isFloat32Array(arr)) {
            params.amp = arr;
        }
        return synth;
    };

    synth.amp.add = function (src, interp) {
        src = typeCheck(src);
        if (!isString(interp)) {
            interp = 'step';
        }

        var arr;
        if (isFloat32Array(src)) {
            arr = src;
        } else if (isFunction(src)) {
            arr = toFloat32Array(src(dtm.a(params.amp), synth, params.clock)); // TODO: what args to pass?
        }

        if (isFloat32Array(arr)) {
            if (arr.length > params.amp.length) {
                params.amp = dtm.a(params.amp).fit(arr.length, interp).get();
            } else if (arr.length < params.amp.length) {
                arr = dtm.a(arr).fit(params.amp.length, interp).get();
            }
            arr.forEach(function (v, i) {
                params.amp[i] += v;
            });
        }
        return synth;
    };

    synth.amp.mult = function (src, interp) {
        src = typeCheck(src);
        if (!isString(interp)) {
            interp = 'step';
        }

        if (src) {
            if (src.length > params.amp.length) {
                params.amp = dtm.a(params.amp).fit(src.length, interp).get();
            } else if (src.length < params.amp.length) {
                src = dtm.a(src).fit(params.amp.length, interp).get();
            }
            src.forEach(function (v, i) {
                params.amp[i] *= v;
            });
        }
        return synth;
    };

    /**
     * @function module:synth#pan
     * @param src
     * @returns {dtm.synth}
     */
    synth.pan = function (src) {
        src = typeCheck(src);
        if (src) {
            params.pan = src;
        }
        return synth;
    };

    synth.ts = function (src) {
        return synth;
    };

    synth.ps = function (src) {

    };

    synth.wavetable = function (src, mode) {
        src = typeCheck(src);
        if (isFloat32Array(src)) {
            params.wavetable = src;
            params.tabLen = src.length;
            params.pitch = freqToPitch(params.freq); // ?
        } else if (isFunction(src)) {
            if (params.promise) {
                params.promise.then(function () {
                    params.wavetable = toFloat32Array(src(dtm.array(params.wavetable)));
                });
            } else {
                params.wavetable = toFloat32Array(src(dtm.array(params.wavetable)));
                params.tabLen = params.wavetable.length;
                params.pitch = freqToPitch(params.freq); // ?
            }
        } else {
            params.wavetable = new Float32Array(params.tabLen);
            params.wavetable.forEach(function (v, i) {
                params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
            });
        }
        return synth;
    };

    synth.table = synth.wt = synth.wavetable;

    synth.source = function (src) {
        if (isString(src)) {
            params.source = src;
        }

        return synth;
    };

    synth.load = function (name) {
        if (isString(name)) {
            params.pending = true;
            params.source = name;
            params.type = 'sample';
            params.pitch = toFloat32Array(1.0);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', name, true);
            xhr.responseType = 'arraybuffer';
            params.promise = new Promise(function (resolve) {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        actx.decodeAudioData(xhr.response, function (buf) {
                            params.wavetable = buf.getChannelData(0);
                            params.autoDur = true;
                            resolve(synth);
                        });
                    }
                };
            });

            xhr.send();
        }
        //else if (arg.constructor.name === 'ArrayBuffer') {
        //    actx.decodeAudioData(arg, function (buf) {
        //        params.buffer = buf;
        //        resolve(synth);
        //
        //        if (typeof(cb) !== 'undefined') {
        //            cb(synth);
        //        }
        //    });
        //} else if (arg.constructor === Array) {
        //    var buf = actx.createBuffer(1, arg.length, dtm.wa.actx.sampleRate);
        //    var content = buf.getChannelData(0);
        //    content.forEach(function (val, idx) {
        //        content[idx] = arg[idx];
        //    });
        //
        //    params.buffer = buf;
        //    resolve(synth);
        //
        //    if (typeof(cb) !== 'undefined') {
        //        cb(synth);
        //    }
        //}
        return synth;
    };

    /**
     * @function module:synth#gain
     * @param mult
     * @param post
     * @returns {dtm.synth}
     */
    synth.gain = function (mult, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var gain = new fx.Gain(post);

        mult = typeCheck(mult);
        if (mult) {
            gain.mult = mult;
        }

        if (post) {
            nodes.pFx.push(gain);
        } else {
            nodes.fx.push(gain);
        }
        return synth;
    };

    /**
     * @function module:synth#lpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.lpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var lpf = new fx.LPF(post);

        freq = typeCheck(freq);
        if (freq) {
            lpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            lpf.q = q;
        }

        if (post) {
            nodes.pFx.push(lpf);
        } else {
            nodes.fx.push(lpf);
        }
        return synth;
    };

    /**
     * @function module:synth#hpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.hpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var hpf = new fx.HPF(post);

        freq = typeCheck(freq);
        if (freq) {
            hpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            hpf.q = q;
        }

        if (post) {
            nodes.pFx.push(hpf);
        } else {
            nodes.fx.push(hpf);
        }
        return synth;
    };

    /**
     * @function module:synth#bpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.bpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var bpf = new fx.BPF(post);

        freq = typeCheck(freq);
        if (freq) {
            bpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            bpf.q = q;
        }

        if (post) {
            nodes.pFx.push(bpf);
        } else {
            nodes.fx.push(bpf);
        }
        return synth;
    };

    /**
     * @function module:synth#apf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.apf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var apf = new fx.APF(post);

        freq = typeCheck(freq);
        if (freq) {
            apf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            apf.q = q;
        }

        if (post) {
            nodes.pFx.push(apf);
        } else {
            nodes.fx.push(apf);
        }
        return synth;
    };

    /**
     * @function module:synth#delay
     * @param mix
     * @param time
     * @param feedback
     * @param post
     * @returns {dtm.synth}
     */
    synth.delay = function (mix, time, feedback, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var delay = new fx.Delay(post);

        mix = typeCheck(mix);
        if (mix) {
            delay.mix = mix;
        }

        time = typeCheck(time);
        if (time) {
            delay.time = time;
        }

        feedback = typeCheck(feedback);
        if (feedback) {
            delay.feedback = feedback;
        }

        if (post) {
            nodes.pFx.push(delay);
        } else {
            nodes.fx.push(delay);
        }
        return synth;
    };

    synth.reverb = function (mix, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var verb = new fx.Reverb(post);

        mix = typeCheck(mix);
        if (mix) {
            verb.mix = mix;
        }

        if (post) {
            nodes.pFx.push(verb);
        } else {
            nodes.fx.push(verb);
        }
        return synth;
    };

    synth.verb = synth.reverb;

    synth.conv = function (src) {
        return synth;
    };

    synth.waveshape = function (src) {
        return synth;
    };

    /**
     * @function module:synth#bq
     * @param bit
     * @returns {dtm.synth}
     */
    synth.bq = function (bit) {
        var bq = new fx.BitQuantizer();

        bit = typeCheck(bit);
        if (bit) {
            bq.bit = bit;
        }
        nodes.pFx.push(bq);
        return synth;
    };

    /**
     * @see {@link module:synth#bq}
     * @type {synth.bq|*}
     */
    synth.bitquantize = synth.bq;

    /**
     * @function module:synth#sh | samphold | samplehold
     * @param samps
     * @returns {dtm.synth}
     */
    synth.sh = function (samps) {
        var sh = new fx.SampleHold();

        samps = typeCheck(samps);
        if (samps) {
            sh.samps = samps;
        }
        nodes.pFx.push(sh);
        return synth;
    };

    synth.samplehold = synth.samphold = synth.sh;

    function typeCheck(src) {
        if (isNestedDtmArray(src)) {
            //return toFloat32Array(src);
            return src;
        } else if (isFunction(src)) {
            //return deferCallback(src);
            return src;
        } else {
            return toFloat32Array(src);
        }
    }

    // TODO: return value type not consistent!
    /**
     * @function module:synth#get
     * @param param
     * @returns {*}
     */
    synth.get = function (param) {
        switch (param) {
            case 'wt':
            case 'wavetable':
                return dtm.array(params.wavetable);
            case 'dur':
                return dtm.array(params.dur);
            case 'phase':
                return getPhase();
            case 'nn':
            case 'notenum':
                return dtm.array(params.notenum);
            case 'freq':
            case 'frequency':
                return dtm.array(params.freq);
            case 'pitch':
                return dtm.array(params.pitch);
            case 'fx':
                return nodes.fx;

            case 'samplerate':
            case 'sr':
            case 'fs':
                return params.sr;

            case 'numsamps':
                return Math.round(params.sr * params.dur);

            default:
                return synth;
        }
    };

    synth.clone = function () {
        return dtm.synth()
            .meta.setParams(clone(params))
            .meta.setNodes(clone(nodes));
    };

    synth.load.apply(this, arguments);
    return synth;
};

dtm.s = dtm.syn = dtm.synth;

dtm.startWebAudio();

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

        maxNumVoices: 10,
        voices: []
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
    maxNumVoices: 0,
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
        dtm.clocks.forEach(function (c) {
            c.stop();
            c.clear();
            //_.forEach(c, function (d) {
            //    d.callbacks = [];
            //})
        });

        dtm.master.activeInstrs.forEach(function (i) {
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
            scale = dtm.gen('range', 12).get();
        } else if (isArray(arguments[0])) {
            scale = arguments[0];
        } else if (isString(arguments[0])) {
            scale = dtm.scales[arguments[0].toLowerCase()];
        } else {
            scale = arguments;
        }

        dtm.master.scale = scale;

        // TODO: update all the voices as well?

        return dtm.master;
    },

    data: function (d) {
        if (!isEmpty(d)) {
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
        switch (param) {
            case 'index':
                return dtm.master.params.index;
                break;

            case 'clock':
                return dtm.master.clock;

            default:
                return null;
        }
    },

    set: function (key, val) {
        return dtm.master;
    },

    setNumVoices: function (num) {
        if (isInteger(num) && num > 0) {
            dtm.master.params.maxNumVoices = num;
        }

        return dtm.master;
    },

    suppressVoices: function () {
        if (dtm.master.params.voices.length > dtm.master.params.maxNumVoices) {
            dtm.master.params.voices[0].stop();
            dtm.master.params.voices.splice(0, 1);
            dtm.master.suppressVoices();
        }

        return dtm.master;
    },

    addVoice: function (voice) {
        dtm.master.params.voices.push(voice);
        dtm.master.suppressVoices();

        return dtm.master;
    },

    removeVoice: function (voice) {
        dtm.master.params.voices.forEach(function (v, i) {
            if (v.get('id') === voice.get('id')) {
                dtm.master.params.voices.splice(i, 1);
            }
        });

        return dtm.master;
    },

    panic: function () {
        dtm.master.params.voices.forEach(function (v) {
            v.stop();
        });

        dtm.master.params.voices = [];
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
    var m = dtm.model('unipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (typeof(arg) === 'string') {
                a.set(arg).split().histo();
            } else if (isArray(arg)) {
                if (isNumArray(arg)) {
                    a.set(arg);
                } else {
                    a.set(arg).split().histo();
                }
            } else if (isDtmObj(arg)) {
                a.set(arg);

                if (a.get('type') !== 'number') {
                    a.histo();
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumArray(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().histo();
            }
        }

        return a.normalize(min, max);
    });

    m.domain = function () {
        if (argsAreSingleVals(arguments) && arguments.length == 2) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                min = args[0];
                max = args[1];
            }
        } else if (argIsSingleArray(arguments)) {
            if (isNumArray(arguments[0]) && arguments[0].length == 2) {
                min = arguments[0][0];
                max = arguments[0][1];
            }
        }
    };

    return m;
})();
(function bipolarModel() {
    var m = dtm.model('bipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (isString(arg)) {
                a.set(arg).split().histo();
            } else if (isObject(arg)) {
                if (isArray(arg)) {
                    if (isNumArray(arg)) {
                        a.set(arg);
                    } else {
                        a.set(arg).split().histo();
                    }
                } else if (isDtmObj(arg)) {
                    a.set(arg);

                    if (a.get('type') !== 'number') {
                        a.histo();
                    }
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumArray(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().histo();
            }
        }

        return a.normalize(min, max).range(-1, 1);
    });

    m.domain = function () {
        if (argsAreSingleVals(arguments) && arguments.length == 2) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                min = args[0];
                max = args[1];
            }
        } else if (argIsSingleArray(arguments)) {
            if (isNumArray(arguments[0]) && arguments[0].length == 2) {
                min = arguments[0][0];
                max = arguments[0][1];
            }
        }
    };

    return m;
})();
(function () {
    var m = dtm.model('huffman').register();

    var chordDict = [];

    m.build = function () {
        console.log('meow');
        return m;
    };

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
            pan: dtm.array(0.5),
            scale: dtm.gen('range', 12),
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
        var pan = params.modules.pan.get('next');
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

        params.callbacks.forEach(function (cb) {
            cb(params.clock);
        });

        if (r) {
            ct.forEach(function (val) {
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
                v.nn(dtm.val.pq(p + val, sc, params.pqRound) + tr).amp(vol).pan(pan).play();
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

    m.param.syn = m.param.synth = m.param.voice;

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

    m.mod.wf = m.mod.wavetable = m.mod.wt;

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
            params.modules.volume.logCurve(5, 0, 1).rescale(0.1, 1);
        }

        return m.parent;
    };

    m.mod.amp = m.mod.level = m.mod.vol = m.mod.volume;

    /**
     * Sets the stereo panning.
     * @function module:instr-default#pan
     * @param src {number|array|dtm.array|string}
     * @param mode {string}
     * @returns {dtm.instr}
     */
    m.mod.pan = function (src, mode) {
        mapper(src, 'pan');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.pan.normalize(0, 1);
        } else {
            params.modules.pan.normalize();
        }

        return m.parent;
    };

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

    m.mod.speed = m.mod.len = m.mod.note = m.mod.div = m.mod.subdiv = m.mod.subDiv;

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
            params.modules.lpf.normalize().exp(3, 0, 1).scale(500, 5000);
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
            params.modules.dur.normalize().exp(10, 0, 1).scale(0.01, 0.5);
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
            } else if (isDtmArray(src)) {
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
})();