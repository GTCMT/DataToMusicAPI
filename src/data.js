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
