/**
 * @fileOverview Data object.
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
    var params = {
        arrays: {},
        coll: [],

        keys: [],
        types: {},
        size: {}
    };

    var data = {
        type: 'dtm.data',
        name: 'dtm.data',

        /**
         * This can be used for promise callback upon loading data.
         * @name module:data#promise
         * @type {object}
         */
        promise: null,
        callback: null
    };

    /**
     * Returns a clone of dtm.array object from the data.
     * @function module:data#get
     * @param param {string|number}
     * @param id {string|number} Parameter name (string) or index (integer). Param name (string) can be: a|arr|array|arrays|column (2nd arg: name or index), c|col|coll|collection, r|row (2nd arg: row number), dim|dimension|size, len|length, k|key|keys|name|names|list, t|type|types, (empty returns the data object itself). If given an integer in the first argument, it returns an array object. Returned array object is a cloned version, and modifying it will not affect the original array object stored in the data object.
     * @returns {dtm.array}
     */
    data.get = function (param, id) {
        var out = null;

        if (typeof(param) === 'string') {
            switch (param) {
                case 'a':
                case 'arr':
                case 'array':
                case 'arrays':
                case 'c':
                case 'column':
                case 'ch':
                case 'channel':
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

                //case 'c':
                case 'col':
                case 'coll':
                case 'collection':
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
                case 'cardinality':
                case 'card':
                    return params.size.row;

                case 'k':
                case 'key':
                case 'keys':
                case 'name':
                case 'names':
                case 'list':
                    return params.keys.slice(); // quick cloning of array

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
        if (typeof(cb) !== 'undefined') {
            data.callback = cb;
        }

        data.promise = new Promise(function (resolve) {
            var ext = url.split('.').pop(); // checks the extension

            if (ext === 'jsonp') {
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

                        }
                    });

                    if (typeof(cb) !== 'undefined') {
                        cb(data);
                    }
                };

                var script = document.createElement('script');
                script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
                document.body.appendChild(script);

            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                //xhr.withCredentials = 'true';

                switch (ext) {
                    case 'txt':
                    case 'csv':
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
                    case 'png':
                    case 'jpg':
                    case 'jpeg':
                        xhr.responseType = 'blob';
                        break;
                    default:
                        //xhr.responseType = 'blob';
                        break;
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        if (xhr.responseType === 'arraybuffer') {

                            if (dtm.wa.isOn) {
                                dtm.wa.actx.decodeAudioData(xhr.response, function (buf) {
                                    for (var c = 0; c < buf.numberOfChannels; c++) {
                                        var floatArr = buf.getChannelData(c);
                                        params.arrays['ch_' + c] = dtm.array(Array.prototype.slice.call(floatArr)).name('ch_' + c);
                                        params.keys.push('ch_' + c);
                                    }

                                    //setArrays();
                                    //setTypes();
                                    //setSize();
                                    params.size.col = buf.numberOfChannels;
                                    params.size.row = params.arrays['ch_0'].get('length');
                                    // CHECK: ugly as hell

                                    if (typeof(cb) !== 'undefined') {
                                        cb(data);
                                    }

                                    resolve(data);
                                });
                            }
                        } else if (xhr.responseType === 'blob') {
                            var img = new Image();
                            img.onload = function () {
                                params.size.col = img.width;
                                params.size.row = img.height;

                                for (var i = 0; i < img.width; i++) {
                                    for (var j = 0; j < img.height; j++) {
                                        // TODO: WIP
                                    }
                                }
                            };
                            img.src = window.URL.createObjectURL(xhr.response);

                        } else {
                            var keys = [];

                            if (ext === 'csv') {
                                params.coll = dtm.parser.csvToJson(xhr.response);
                                keys = _.keys(params.coll[0]);
                            } else if (ext === 'json') {
                                var res = xhr.responseText;

                                try {
                                    res = JSON.parse(res);
                                } catch (e) {
                                    try {
                                        res = eval(res);
                                    } catch (e) {
                                        console.log('Could not parse the JSON file. Maybe the format is not right.');
                                    }
                                }


                                if (url.indexOf('wunderground') > -1) {
                                    var obj = JSON.parse(xhr.response);
                                    params.coll = obj[Object.keys(obj)[1]];

                                    if (params.coll.constructor === Array) {
                                        // for hourly forecast
                                        keys = Object.keys(params.coll[0]);
                                    } else {
                                        // for current weather
                                        keys = Object.keys(params.coll);
                                        params.coll = [params.coll];
                                    }
                                } else {
                                    var second = res[Object.keys(res)[0]];

                                    if (second.constructor === Array) {
                                        keys = Object.keys(second[0]);
                                    } else {
                                        keys = Object.keys(second);
                                    }

                                    // TODO: may not work with non-array JSON formats
                                    params.coll = res;
                                }
                            } else {
                                // TODO: this only works for shodan
                                //params.coll = JSON.parse(xhr.response)['matches'];

                                params.coll = second;
                            }
                            //params.keys = _.keys(params.coll[0]);
                            params.keys = keys;
                            setArrays();
                            setTypes();
                            setSize();

                            if (typeof(cb) !== 'undefined') {
                                cb(data);
                            }

                            resolve(data);
                        }
                    }
                };

                xhr.send();
            }
        });

        data.then = data.promise.then;

        // CHECK: this doesn't work
        data.promise.get = function (arg) {
            data.promise.then(function (d) {
                data = d;
                return d.get(arg);
            });
            //return data.promise;
        };

        if (data.name === 'dtm.data') {
            return data;
        } else if (data.name === 'dtm.load') {
            return data.promise;
        }
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
            params.arrays[key] = dtm.array(_.pluck(params.coll, key)).name(key);
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
            return data.load(arg, cb);
        }
    } else {
        return data;
    }
};

dtm.load = dtm.d = dtm.data;
dtm.load.name = 'dtm.load';