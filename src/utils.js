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

function isArray(value) {
    return Array.isArray(value);
}

function isSingleVal(value) {
    return !!(!isArray(value) && !isEmpty(value));
}

function isDtmObj(value) {
    if (typeof(value) === 'object') {
        return value.hasOwnProperty('meta');
    } else {
        return false;
    }
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

function append() {

}

function appendNoDupes() {

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