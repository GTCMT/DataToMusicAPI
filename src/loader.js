/**
 * @fileOverview Data object. Extends the dtm.data class, storing a multi-dimensional array.
 * @module loader
 */

/**
 * Creates a new dtm.data (array) object, if the argument is empty, or a promise object, if the argument is a URL.
 * @function module:data.data
 * @param [input] {string} URL to load or query the data
 * @param fn {function}
 * @returns {dtm.data | promise}
 */
dtm.load = function (input, fn) {
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
                                    var data = dtm.data();
                                    var arrays = [];
                                    for (var c = 0; c < buf.numberOfChannels; c++) {
                                        var floatArr = buf.getChannelData(c);
                                        arrays.push(dtm.data(Array.prototype.slice.call(floatArr)).label('ch_' + c).parent(data));
                                    }

                                    if (!isEmpty(fn)) {
                                        fn(data.set(arrays));
                                    }

                                    resolve(data.set(arrays));
                                });
                            }
                        } else if (xhr.responseType === 'blob') {
                            var img = new Image();
                            img.onload = function () {
                                var canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;

                                var context = canvas.getContext('2d');
                                context.drawImage(img, 0, 0);

                                var res = [];

                                var imageData = context.getImageData(0, 0, img.width, img.height).data;
                                for (var c = 0; c < img.width; c++) {
                                    res.push(imageData.filter(function (v, i) {
                                        return i % (img.width*4) === c;
                                    }));
                                }
                                console.log(res);
                            };
                            img.src = window.URL.createObjectURL(xhr.response);

                        } else {
                            var keys = [];

                            if (ext === 'csv') {
                                var data = dtm.data();
                                var arrays = [];
                                objForEach(dtm.parser.csvToCols(xhr.response), function (v, k) {
                                    var a = dtm.data(v).label(k).parent(data);
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

                            if (!isEmpty(fn)) {
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
                    var data = dtm.data();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                        var a = dtm.data(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (!isEmpty(fn)) {
                        fn(data.set(arrays));
                    }

                    resolve(data.set(arrays));
                }
            };
        });
    }
};

dtm.csv = function (input, fn) {
    if (isString(input)) {
        var p = new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', input, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = dtm.data();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(xhr.response), function (v, k) {
                        var a = dtm.data(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (!isEmpty(fn)) {
                        fn(data.set(arrays));
                    }

                    // resolve(data.set(arrays));
                    resolve(arrays);
                }
            };

            xhr.send();
        });

        var data = dtm.data();
        p.then(function (d) {
            data.set(d);
        });

        return data;
    } else {
        var elem_files = input;
        var reader = new FileReader();

        reader.readAsText(elem_files[0]);
        return new Promise(function (resolve) {
            reader.onload = function (e) {
                //resolve(dtm.parser.csvToCols(e.target.result));
                var data = dtm.data();
                var arrays = [];
                objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                    var a = dtm.data(v).label(k).parent(data);
                    arrays.push(a);
                });

                if (!isEmpty(fn)) {
                    fn(data.set(arrays));
                }

                resolve(data.set(arrays));
            };
        });
    }
};

dtm.json = function (input, fn) {

};

dtm.text = function (input, fn) {
    if (isString(input)) {
        var p = new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', input, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = dtm.data();
                    if (isString(xhr.response)) {
                        data.set(xhr.response);
                    } else {
                        throw(new TypeError('the file content is not text'));
                    }

                    if (!isEmpty(fn)) {
                        fn(data);
                    }

                    // resolve(data);
                    resolve(xhr.response);
                }
            };

            xhr.send();
        });

        var data = dtm.data();
        p.then(function (res) {
            p = data.set(res);
        });

        return data;
    } else {
        var elem_files = input;
        var reader = new FileReader();

        reader.readAsText(elem_files[0]);
        return new Promise(function (resolve) {
            reader.onload = function (e) {
                var data = dtm.data();
                if (isString(e.target.result)) {
                    data.set(e.target.result);
                }

                if (!isEmpty(fn)) {
                    fn(data);
                }

                resolve(data);
            };
        });
    }
};

dtm.txt = dtm.text;

dtm.web = function (url, fn) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = dtm.data();

                if (url.indexOf('wunderground') > -1) {
                    var obj = JSON.parse(xhr.response);

                    // hard coding...
                    data.label('hourly_forecast');
                    var coll = obj['hourly_forecast'];
                    var keys = Object.keys(coll[0]);

                    function mapObjArray(objArray) {
                        var keys = Object.keys(objArray[0]);
                        var res = keys.map(function (k) {
                            var temp = objArray.map(function (doc) {
                                return doc[k];
                            });

                            var resArray = dtm.data(temp).label(k);

                            if (isParsableNumArray(temp)) {
                                resArray.tonum();
                            }
                            return resArray;
                        });
                        return dtm.data(res);
                    }

                    var res = [];

                    keys.forEach(function (k) {
                        var temp = coll.map(function (doc) {
                            return doc[k];
                        });

                        if (isObjArray(temp)) {
                            temp = mapObjArray(temp);
                        }

                        var resArray = dtm.data(temp).label(k).parent(data);
                        if (isParsableNumArray(temp)) {
                            resArray.tonum();
                        }

                        res.push(resArray);
                    });
                } else {
                    // TODO: this only works for shodan
                    var coll = JSON.parse(xhr.response)['matches'];


                    // params.coll = JSON.parse(xhr.response)['matches'];
                    // params.coll = second;

                    //var second = res[Object.keys(res)[0]];
                    //
                    //if (second.constructor === Array) {
                    //    keys = Object.keys(second[0]);
                    //} else {
                    //    keys = Object.keys(second);
                    //}
                    //
                    //// TODO: may not work with non-array JSON formats
                    //params.coll = res;
                }

                if (!isEmpty(fn)) {
                    fn(data.set(res));
                }

                resolve(data.set(res));
            } else {
            }
        };

        xhr.send();
    });
};

dtm.image = function (input, fn, mode) {
    if (isString(input)) {
        var url = input;

        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.open('GET', url, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = dtm.data();

                    var img = new Image();
                    img.onload = function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;

                        var context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0);

                        var imageData = context.getImageData(0, 0, img.width, img.height).data;
                        // var red = new Float32Array(imageData.length/4);
                        // var green = new Float32Array(imageData.length/4);
                        // var blue = new Float32Array(imageData.length/4);
                        var bri = new Float32Array(imageData.length/4);

                        for (var i = 0; i < imageData.length; i += 4) {
                            var brightness = 0.34 * imageData[i] + 0.5 * imageData[i+1] + 0.16 * imageData[i+2];
                            // red[i/4] = imageData[i]/255;
                            // green[i/4] = imageData[i+1]/255;
                            // blue[i/4] = imageData[i+2]/255;
                            bri[i/4] = brightness/255;
                        }

                        // data.set([
                        //     dtm.data(red).block(img.width).label('red').parent(data),
                        //     dtm.data(green).block(img.width).label('green').parent(data),
                        //     dtm.data(blue).block(img.width).label('blue').parent(data),
                        //     dtm.data(bri).block(img.width).label('brightness').parent(data)
                        // ]);
                        data.set(bri).block(img.width).label('brightness');

                        if (!isEmpty(fn)) {
                            fn(data);
                        }

                        resolve(data);
                    };
                    img.src = window.URL.createObjectURL(xhr.response);
                }
            };

            xhr.send();
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
                    var data = dtm.data();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                        var a = dtm.data(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (!isEmpty(fn)) {
                        fn(data.set(arrays));
                    }

                    resolve(data.set(arrays));
                }
            };
        });
    }
};

dtm.pic = dtm.img = dtm.image;

dtm.cam = function (input, interval) {
    var w = 400;
    var h = 300;

    var data, fn;

    if (isDtmArray(input)) {
        data = input;
    } else if (isFunction(input)) {
        fn = input;
    }
    if (isEmpty(data)) {
        data = dtm.data(0);
    }

    if (!isNumber(interval) || interval < 0) {
        interval = 1;
    }

    navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                audio: false,
                video: {
                    width: w,
                    height: h
                }
            },
            function (stream) {
                var video;
                if (document.getElementById('cam')) {
                    video = document.getElementById('cam');
                } else {
                    video = document.createElement('video');
                }
                video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;

                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;

                var context = canvas.getContext('2d');
                context.fillRect(0, 0, w, h);

                video.onloadedmetadata = function (e) {
                    video.play();
                    video.muted = 'true';
                };

                dtm.clock(function () {
                    context.drawImage(video, 0, 0, w, h);
                    var imageData = context.getImageData(0, 0, w, h).data;

                    var res = new Float32Array(imageData.length/4);

                    for (var i = 0; i < imageData.length; i += 4) {
                        var brightness = 0.34 * imageData[i] + 0.5 * imageData[i+1] + 0.16 * imageData[i+2];
                        // // red
                        // imageData[i] = brightness;
                        // // green
                        // imageData[i+1] = brightness;
                        // // blue
                        // imageData[i+2] = brightness;

                        res[i/4] = brightness/255;
                    }
                    data.set(res).block(w);

                    if (!isEmpty(fn)) {
                        fn(data);
                    }

                }).interval(interval);
            },
            function (err) {
                console.log(err);
            }
        );
    } else {
        console.log('getUserMedia not supported');
    }
};

dtm.audio = function (grab, block) {
    if (isNumber(grab)) {
        block = grab;
    } else if (!isNumber(block)) {
        block = 1024;
    }

    var data = dtm.data(0);
    dtm.params.stream = true;

    navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                audio: {
                    mandatory: {
                        googEchoCancellation: 'false',
                        googAutoGainControl: 'false',
                        googNoiseSuppression: 'false',
                        googHighpassFilter: 'false'
                    },
                    optional: []
                },
                video: false
            },
            function (stream) {
                // data = dtm.data();

                var actx = dtm.wa.actx;
                var input = actx.createMediaStreamSource(stream);
                var sp = actx.createScriptProcessor(block,1,1);

                // TODO: not getting destoryed properly
                sp.onaudioprocess = function (event) {
                    if (dtm.params.stream) {
                        var samps = event.inputBuffer.getChannelData(0);

                        if (isDtmArray(grab)) {
                            grab.set(samps);
                        } else if (isFunction(grab)) {
                            grab(data.set(samps));
                        } else {
                            data.set(samps); // not working
                        }
                    }
                };

                var gain = actx.createGain();
                gain.gain.value = 0;

                input.connect(sp).connect(gain).connect(actx.destination);
            },
            function (e) {
                console.error(e);
            });
    }

    return data;
};