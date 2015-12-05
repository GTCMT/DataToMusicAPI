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

function isArray(value) {
    return Array.isArray(value);
}

function isDtmObj(value) {
    if (typeof(value) === 'object') {
        return value.hasOwnProperty('meta');
    } else {
        return false;
    }
}