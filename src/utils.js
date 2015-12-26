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

function isString(value) {
    return typeof(value) === 'string';
}

function isBoolean(value) {
    return typeof(value) === 'boolean';
}

function isArray(value) {
    return Array.isArray(value);
}

function isFloat32Array(value) {
    var res = false;
    if (!isEmpty(value)) {
        res = value.constructor.name === 'Float32Array';
    }
    return res;
}

function isNumArray(array) {
    var res = false;
    if (isArray(array)) {
        res = array.every(function (v) {
            return isNumber(v);
        });
    }
    return res;
}

function isSingleVal(value) {
    return !!(!isArray(value) && !isEmpty(value));
}

function isDtmObj(value) {
    if (typeof(value) === 'object' || typeof(value) === 'function') {
        return value.hasOwnProperty('meta');
    } else {
        return false;
    }
}

function isDtmArray(value) {
    if (typeof(value) === 'object' || typeof(value) === 'function') {
        if (value.hasOwnProperty('meta')) {
            return (value.meta.type === 'dtm.array' || value.meta.type === 'dtm.generator');
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

}

function argsToArray(args) {
    var res = [];
    for (var i = 0; i < args.length; i++) {
        res[i] = args[i];
    }
    return res;
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

function Float32Concat(first, second) {
    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}