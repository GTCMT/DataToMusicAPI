/* TYPE CHECKING */
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

function isNumber(value) {
    return !!(typeof(value) === 'number' && !isNaN(value));
}

function isInteger(value) {
    if (isNumber(value)) {
        return Number.isInteger(value);
    } else {
        return false;
    }
}

//function isFloat(value) {
//    if (isNumber(value)) {
//        return !Number.isInteger(value);
//    } else {
//        return false;
//    }
//}

function isString(value) {
    return typeof(value) === 'string';
}

function isBoolean(value) {
    return typeof(value) === 'boolean';
}

function isFunction(value) {
    return typeof(value) === 'function';
}

function isPromise(obj) {
    if (isObject(obj)) {
        if (obj.constructor === Promise) {
            return true;
        }
    } else {
        return false;
    }
}

function isArray(value) {
    return Array.isArray(value) || isFloat32Array(value);
}

function isFloat32Array(value) {
    var res = false;
    if (!isEmpty(value)) {
        if (value.constructor.name === 'Float32Array' && value.length > 0) {
            res = true;
        }
    }
    return res;
}

function isNumArray(array) {
    var res = false;
    if (isArray(array) && !isFloat32Array(array) && array.length > 0) {
        res = array.every(function (v) {
            return isNumber(v);
        });
    }
    return res;
}

function isNumOrFloat32Array(array) {
    return isNumArray(array) || isFloat32Array(array);
}

function isMixedArray(array) {
    return isArray(array) && !isNumOrFloat32Array(array);
}

function isSingleVal(value) {
    return !!(!isArray(value) && !isDtmObj(value) && !isFunction(value) && !isEmpty(value));
}

function isObject(value) {
    return (typeof(value) === 'object' && value !== null);
}

function isDtmObj(value) {
    if (isObject(value) || isFunction(value)) {
        return value.hasOwnProperty('meta');
    } else {
        return false;
    }
}

function isDtmArray(value) {
    if (isObject(value) || isFunction(value)) {
        if (value.hasOwnProperty('meta')) {
            return (value.meta.type === 'dtm.array' || value.meta.type === 'dtm.generator');
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isStringArray(array) {
    var res = false;
    if (isArray(array)) {
        res = array.every(function (v) {
            return typeof(v) === 'string';
        });
    }
    return res;
}

function hasMissingValues(array) {
    // assuming the input is an array with length > 0
    return array.some(function (v) {
        return isEmpty(v);
    });
}

function arrayCompare(first, second) {

}

function argsToArray(args) {
    var res = [];
    for (var i = 0; i < args.length; i++) {
        res[i] = args[i];
    }
    return res;
}

function argsForEach(args, fn) {
    argsToArray(args).forEach(function () {
        fn.apply(this, arguments);
    });
}

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



function append() {

}

function appendNoDupes() {

}

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
        if (isDtmArray(obj)) {
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
