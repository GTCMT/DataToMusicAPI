/**
 * @fileOverview Data object. Extends the dtm.array class, storing a multi-dimensional array.
 * @module data
 */

//dtm.data = function (arg, cb, type) {
//    var paramsExt = {
//
//    };
//
//    var data = dtm.array();
//    var params = data.meta.getParams();
//    objForEach(paramsExt, function (val, key) {
//        params[key] = val;
//    });
//
//    data.init = function (arg) {
//        var i = 0;
//
//        if (arguments.length === 1) {
//            if (typeof(arg) === 'number') {
//                for (i = 0; i < arg; i++) {
//                    params.arrays[i] = dtm.array();
//                    params.keys[i] = i.toString();
//                    params.size.col = arg;
//                    params.size.row = 0;
//                }
//            } else if (typeof(arg) === 'object') {
//                for (i = 0; i < arg.num; i++) {
//                    params.arrays[i] = dtm.array().fill('zeros', arg.len);
//                    params.keys[i] = i.toString();
//                    params.size.col = arg.num;
//                    params.size.row = arg.len;
//                }
//            }
//        } else if (arguments.length === 2) {
//            for (i = 0; i < arguments[0]; i++) {
//                params.arrays[i] = dtm.array().fill('zeros', arguments[1]);
//                params.keys[i] = i.toString();
//                params.size.col = arguments[0];
//                params.size.row = arguments[1];
//            }
//        } else if (arguments.length === 3) {
//        for (i = 0; i < arguments[0]; i++) {
//            params.arrays[arguments[2][i]] = dtm.array().fill('zeros', arguments[1]).label(arguments[2][i]);
//            params.keys[i] = arguments[2][i];
//            params.size.col = arguments[0];
//            params.size.row = arguments[1];
//        }
//    }
//        return data;
//    };
//
//    // TODO: move these to dtm.array
//    //data.append = function (arg) {
//    //    if (arg.constructor === Array) {
//    //        for (var i = 0; i < arg.length; i++) {
//    //            if (typeof(params.arrays[params.keys[i]]) !== 'undefined') {
//    //                params.arrays[params.keys[i]].append(arg[i]);
//    //            }
//    //        }
//    //        params.size.row++;
//    //    }
//    //    return data;
//    //};
//    //
//    //data.queue = function (arg) {
//    //    if (arg.constructor === Array) {
//    //        for (var i = 0; i < arg.length; i++) {
//    //            if (typeof(params.arrays[params.keys[i]]) !== 'undefined') {
//    //                params.arrays[params.keys[i]].queue(arg[i]);
//    //            }
//    //        }
//    //    }
//    //    return data;
//    //};
//    //
//    //data.flush = function () {
//    //    params.arrays.forEach(function (a) {
//    //        a.flush();
//    //    });
//    //    params.size.row = 0;
//    //    return data;
//    //};
//
//    if (typeof(arg) !== 'undefined') {
//        if (typeof(arg) === 'string') {
//            return data.load(arg, cb);
//        }
//    } else {
//        return data;
//    }
//};

/**
 * Creates a new dtm.data object, if the argument is empty, or a promise object, if the argument is a URL.
 * @function module:data.data
 * @param [input] {string} URL to load or query the data
 * @param fn {function}
 * @param type
 * @returns {dtm.data | promise}
 */
dtm.data = function (input, fn) {
    if (isString(input)) {
        var url = input;

        return new Promise(function (resolve) {
            var ext = url.split('.').pop(); // checks the extension

            if (ext === 'jsonp') {
                var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
                window[cbName] = function (res) {
                    delete window[cbName];
                    document.body.removeChild(script);

                    var keys = Object.keys(res);

                    keys.forEach(function (val) {
                        // CHECK: this is a little too case specific
                        if (val !== 'response') {
                            params.coll = res[val];
                            params.keys = Object.keys(params.coll[0]);
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

                        // for audio sample
                        if (xhr.responseType === 'arraybuffer') {

                            if (dtm.wa.isOn) {
                                dtm.wa.actx.decodeAudioData(xhr.response, function (buf) {
                                    var data = dtm.array();
                                    var arrays = [];
                                    for (var c = 0; c < buf.numberOfChannels; c++) {
                                        var floatArr = buf.getChannelData(c);
                                        arrays.push(dtm.array(Array.prototype.slice.call(floatArr)).label('ch_' + c).parent(data));
                                    }

                                    if (typeof(fn) !== 'undefined') {
                                        fn(data.set(arrays));
                                    }

                                    resolve(data.set(arrays));
                                });
                            }
                        } else if (xhr.responseType === 'blob') {
                            var img = new Image();
                            img.onload = function () {
                                //params.size.col = img.width;
                                //params.size.row = img.height;

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
                                var data = dtm.array();
                                var arrays = [];
                                objForEach(dtm.parser.csvToCols(xhr.response), function (v, k) {
                                    var a = dtm.array(v).label(k).parent(data);
                                    arrays.push(a);
                                });

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

                            if (typeof(fn) !== 'undefined') {
                                fn(data.set(arrays));
                            }

                            resolve(data.set(arrays));
                        }
                    }
                };

                xhr.send();
            }
        });
    } else {
        var elem_files = input;
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
                    var data = dtm.array();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                        var a = dtm.array(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (typeof(fn) !== 'undefined') {
                        fn(data.set(arrays));
                    }

                    resolve(data.set(arrays));
                }
            };
        });
    }
};

dtm.load = dtm.data;