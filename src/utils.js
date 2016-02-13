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
    } else return !!(typeof(value) === 'number' && isNaN(value));
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
    return typeof(value) === 'function' && !value.hasOwnProperty('meta');
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

function getMaxArrayDepth(val) {
    if (isArray(val)) {
        var depth = 1;
        var list = [];
        val.forEach(function (v) {
            if (isArray(v)) {
                list.push(getMaxArrayDepth(v));
            }
        });

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

function getMaxDtmArrayDepth(val) {
    if (isDtmArray(val)) {
        var depth = 1;
        var list = [];
        val.forEach(function (v) {
            if (isDtmArray(v)) {
                list.push(getMaxDtmArrayDepth(v));
            }
        });

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

function getMaxDepth(val) {
    if (isArray(val) || isDtmArray(val)) {
        var depth = 1;
        var list = [];
        val.forEach(function (v) {
            if (isArray(v) || isDtmArray(v)) {
                list.push(getMaxDepth(v));
            }
        });

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

/**
 * Checks if the value is an instance of DTM object
 * @param val
 * @returns {boolean}
 */
function isDtmObj(val) {
    if (isObject(val) || typeof(val) === 'function') {
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
    if (isObject(val) || typeof(val) === 'function') {
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

/**
 * Converts various number or array types into a Float32Array. Returns null if not convertible.
 * @param src
 * @returns {Float32Array|null}
 */
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
            //return new Float32Array(src);
            var typedArray = new Float32Array(src.length);
            src.forEach(function (v, i) {
                typedArray[i] = v;
                //typedArray[i] = v.toFixed(7);
                //typedArray[i] = v.toPrecision();
            });
            return typedArray;
        }
    } else {
        return null;
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

/* TYPE CHECKING */
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
dtm.util.isStringArray = isStringArray;
dtm.util.isBoolArray = isBoolArray;
dtm.util.isNestedArray = isNestedArray;
dtm.util.isNestedWithDtmArray = isNestedWithDtmArray;
dtm.util.isDtmObj = isDtmObj;
dtm.util.isDtmArray = isDtmArray;
dtm.util.isNestedDtmArray = isNestedDtmArray;
dtm.util.isNumDtmArray = isNumDtmArray;
dtm.util.isNestedNumDtmArray = isNestedNumDtmArray;
dtm.util.argIsSingleArray = argIsSingleArray;
dtm.util.argsAreSingleVals = argsAreSingleVals;

/* ANALYSIS */
dtm.util.getMaxArrayDepth = getMaxArrayDepth;
dtm.util.getMaxDtmArrayDepth = getMaxDtmArrayDepth;
dtm.util.getMaxDepth = getMaxDepth;
dtm.util.hasMissingValues = hasMissingValues;
//dtm.util.arrayCompare = arrayCompare;
dtm.util.numProperties = numProperties;

/* CONVERSION */
dtm.util.argsToArray = argsToArray;
dtm.util.toFloat32Array = toFloat32Array;
dtm.util.fromFloat32Array = fromFloat32Array;

/* LIST OPERATION */
dtm.util.Float32Concat = Float32Concat;
dtm.util.concat = concat;
dtm.util.Float32splice = Float32Splice;
dtm.util.splice = splice;

/* ITERATION */
dtm.util.argsForEach = argsForEach;
dtm.util.objForEach = objForEach;
dtm.util.Float32Map = Float32Map;

/* MISC */
dtm.util.truncateDigits = truncateDigits;
dtm.util.deferCallback = deferCallback;
dtm.util.cloneArray = cloneArray;
