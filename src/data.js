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
    var paramsExt = {

    };

    var data = dtm.array();
    var params = data.meta.getParams();
    objForEach(paramsExt, function (val, key) {
        params[key] = val;
    });

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

    // TODO: move these to dtm.array
    //data.append = function (arg) {
    //    if (arg.constructor === Array) {
    //        for (var i = 0; i < arg.length; i++) {
    //            if (typeof(params.arrays[params.keys[i]]) !== 'undefined') {
    //                params.arrays[params.keys[i]].append(arg[i]);
    //            }
    //        }
    //        params.size.row++;
    //    }
    //    return data;
    //};
    //
    //data.queue = function (arg) {
    //    if (arg.constructor === Array) {
    //        for (var i = 0; i < arg.length; i++) {
    //            if (typeof(params.arrays[params.keys[i]]) !== 'undefined') {
    //                params.arrays[params.keys[i]].queue(arg[i]);
    //            }
    //        }
    //    }
    //    return data;
    //};
    //
    //data.flush = function () {
    //    params.arrays.forEach(function (a) {
    //        a.flush();
    //    });
    //    params.size.row = 0;
    //    return data;
    //};

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            return data.load(arg, cb);
        }
    } else {
        return data;
    }
};

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