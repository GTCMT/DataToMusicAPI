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