/**
 * @fileOverview Single dimensional array with built-in transformation functions.
 * @module data
 */

/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.data can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:data.data
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.data = function () {
    /* LIST OPERATIONS*/

    // array.map.dist = function () {
    //     if (!isNestedDtmArray(array)) {
    //         var dist = array().pmf();
    //         return array.map(function (v) {
    //             return dist().col(v.toString()).get(0);
    //         });
    //     } else {
    //         return array;
    //     }
    // };
    //
    // array.map.entropy = function () {
    //     if (isNestedDtmArray(array)) {
    //         return array.map(function (a) {
    //             return a.entropy();
    //         });
    //     } else {
    //         return array.entropy();
    //     }
    // };
    //
    // array.map.histo = function () {
    //     // CHECK: this is hacky
    //     params.type = 'string'; // re-set the type to string from number
    //     return array.set(toFloat32Array(histo(array.val)));
    // };
    //


    // array.sort.by = array.sortby;

    // array.subarray = function () {
    //     return array;
    // };
    //
    // // TODO: regexp-like processing???
    // array.match = function () {
    //     return array;
    // };
    //
    // array.pick = function () {
    //     return array;
    // };
    //
    // // TODO: impelemnt
    // array.replaceat = function (idx, val) {
    //     return array;
    // };


    // array.remove.at = function (input) {
    //     var at = [];
    //     var val = array.val;
    //
    //     if (argsAreSingleVals(arguments)) {
    //         if (isNumArray(argsToArray(arguments))) {
    //             at = argsToArray(arguments);
    //         }
    //     } else if (isNumOrFloat32Array(input)) {
    //         at = input;
    //     } else if (isNumDtmArray(input)) {
    //         at = input.get();
    //     }
    //
    //     at.forEach(function (i) {
    //         val = splice(val, Math.round(i), 1);
    //     });
    //     return array.set(val);
    // };


    // /**
    //  * Removes zeros from the sequence.
    //  * @function module:data#removezeros
    //  * @returns {dtm.data}
    //  */
    // array.removezeros = function () {
    //     return array.set(dtm.transform.removeZeros(array.val));
    // };
    //
    // array.removevalue = function () {
    //     return array;
    // };

    // array.iir = function () {
    //     return array;
    // };

    var data = new Data();
    return data.set.apply(data, arguments);
};

dtm.data.augment = function (fnList) {
    objForEach(fnList, function (obj, name) {
        if (name === 'aliases') {
            objForEach(obj, function (arr, key) {
                arr.forEach(function (v) {
                    if (!isEmpty(Data.prototype[v])) {
                        console.log('The function name ' + key + ' already exists! Overwriting...');
                    }
                    Data.prototype[v] = fnList[key];

                    Each.prototype[v] = function () {
                        var data = this.data;
                        var args = arguments;

                        if (isNestedDtmArray(data)) {
                            data.each(function (a) {
                                a[v].apply(a, args);
                            });
                            return data;
                        } else {
                            return data;
                        }
                    };

                    Map.prototype[v] = function () {
                        var data = this.data;
                        var args = arguments;

                        if (isNestedDtmArray(data)) {
                            return data.map(function (a) {
                                return a[v].apply(a, args);
                            });
                        } else {
                            return data;
                        }
                    };
                });
            });
        } else {
            if (isFunction(obj)) {
                if (!isEmpty(Data.prototype[name])) {
                    console.log('The function name ' + name + ' already exists! Overwriting...');
                }
                Data.prototype[name] = obj;

                Each.prototype[name] = function () {
                    var data = this.data;
                    var args = arguments;

                    if (isNestedDtmArray(data)) {
                        data.each(function (a) {
                            a[name].apply(a, args);
                        });
                        return data;
                    } else {
                        return data;
                    }
                };

                Map.prototype[name] = function () {
                    var data = this.data;
                    var args = arguments;

                    if (isNestedDtmArray(data)) {
                        return data.map(function (a) {
                            return a[name].apply(a, args);
                        });
                    } else {
                        return data;
                    }
                };
            }
        }
    });
};

// function addNestedProperty(Class, fn) {
//     Class.prototype[fn] = function () {
//         var data = this.data;
//         var args = arguments;
//
//         if (isNestedDtmArray(data)) {
//             return data.map(function (a) {
//                 return a[fn].apply(a, args);
//             });
//         } else {
//             return data;
//         }
//     };
// }

function Data() {
    // callable object
    function data() {
        return data.clone.apply(data, arguments);
    }
    data.val = [];
    data.length = 0;

    data.params = {
        name: '',
        parent: null,
        original: null
    };

    data.meta = {
        type: 'dtm.data',
        getParams: function () {
            return data.params;
        },
        addParams: function (paramsExt) {
            objForEach(paramsExt, function (val, key) {
                data.params[key] = val;
            });
            return data;
        },
        setOriginal: function (obj) {
            data.params.original = obj;
            return data;
        }
    };

    // inherit callable Function.prototype
    data.__proto__ = Data.prototype;

    Object.defineProperty(data, 'length', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: 0
    });

    // cannot override?
    Object.defineProperty(data, 'name', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: ''
    });

    data.forEach = data.foreach = data.each = new Each(data);
    data.map = new Map(data);
    data.g = data.group = data.b = data.block = new Block(data);
    data.f = data.fit = new Fit(data);
    data.s = data.str = data.stretch = new Stretch(data);

    return data;
}

// make data instance callable
Data.prototype = Object.create(Function.prototype);

function Each(data) {
    /**
     * Performs JS Array.map function to the array values.
     * @function module:data#map
     * @param fn
     * @returns {dtm.data}
     */
    function each(fn) {
        each.data.val.forEach(fn);
        return each.data;
    }

    each.data = data;
    each.__proto__ = Each.prototype;

    return each;
}

Each.prototype = Object.create(Function.prototype);

function Map(data) {
    function map(fn) {
        return data.set(fromFloat32Array(data.val).map(fn));
    }

    map.data = data;
    map.__proto__ = Map.prototype;

    return map;
}

Map.prototype = Object.create(Function.prototype);

function Block(data) {
    // TODO: accept option as arg? for numBlocks, pad, overlap ratio, etc.
    function block(len, hop, window, pad) {
        if (!isInteger(len) || len < 1) {
            len = 1;
        } else if (len > this.length) {
            len = this.length;
        }
        if (!isInteger(hop) || hop < 1) {
            hop = len;
        }
        if (isEmpty(window)) {
            window = 'rectangular';
        }

        var newArr = [];
        var numBlocks = Math.floor((data.length - len) / hop) + 1;

        for (var i = 0; i < numBlocks; i++) {
            // name: original starting index
            newArr[i] = dtm.data(data.val.slice(i*hop, i*hop+len)).window(window).parent(data).label((i*hop).toString());
        }

        return data.set(newArr);
    }

    block.data = data;
    block.__proto__ = Block.prototype;

    ['g', 'group', 'b', 'block'].forEach(function (name) {
        // Data.prototype[name] = block;

        Each.prototype[name] = function () {
            var data = this.data;
            var args = arguments;

            if (isNestedDtmArray(data)) {
                data.each(function (a) {
                    a[name].apply(a, args);
                });
                return data;
            } else {
                return data;
            }
        };

        Map.prototype[name] = function () {
            var data = this.data;
            var args = arguments;

            if (isNestedDtmArray(data)) {
                return data.map(function (a) {
                    return a[name].apply(a, args);
                });
            } else {
                return data;
            }
        };
    });

    return block;
}

Block.prototype = Object.create(Function.prototype);

Block.prototype.into = function (val) {
    var data = this.data;

    if (isInteger(val)) {
        var len = Math.floor(data.length / val);
        return data.block(len);
    } else {
        return data;
    }
};

function Fit(data) {
    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:data#fit
     * @param len {number} Integer
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    function fit(len, interp) {
        if (isNestedDtmArray(data)) {
            return data.map(function (a) {
                return a.fit(len, interp);
            });
        }
        return data.set(dtm.transform.fit(data.val, len, interp));
    }

    fit.data = data;
    fit.__proto__ = Fit.prototype;

    ['fit', 'f'].forEach(function (name) {
        Each.prototype[name] = function () {
            var data = this.data;
            var args = arguments;

            if (isNestedDtmArray(data)) {
                data.each(function (a) {
                    a[name].apply(a, args);
                });
                return data;
            } else {
                return data;
            }
        };

        Map.prototype[name] = function () {
            var data = this.data;
            var args = arguments;

            if (isNestedDtmArray(data)) {
                return data.map(function (a) {
                    return a[name].apply(a, args);
                });
            } else {
                return data;
            }
        };
    });

    return fit;
}

Fit.prototype = Object.create(Function.prototype);

Fit.prototype.linear = Fit.prototype.line = function (len) {
    var data = this.data;
    return data.fit(len, 'line');
};

Fit.prototype.step = function (len) {
    var data = this.data;
    return data.fit(len, 'step');
};

Fit.prototype.cos = Fit.prototype.cosine = function (len) {
    var data = this.data;
    return data.fit(len, 'cos');
};

Fit.prototype.cub = Fit.prototype.cubic = function (len) {
    var data = this.data;
    return data.fit(len, 'cubic');
};

function Stretch(data) {
    /**
     * Multiplies the length of the array by the given factor.
     * @function module:data#stretch
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    function stretch (factor, interp) {
        if (isNestedDtmArray(data)) {
            return data.map(function (a) {
                return a.stretch(factor, interp);
            })
        }

        return data.set(dtm.transform.stretch(data.val, factor, interp));
    }

    stretch.data = data;
    stretch.__proto__ = Stretch.prototype;

    ['stretch', 'str', 's'].forEach(function (name) {
        Each.prototype[name] = function () {
            var data = this.data;
            var args = arguments;

            if (isNestedDtmArray(data)) {
                data.each(function (a) {
                    a[name].apply(a, args);
                });
                return data;
            } else {
                return data;
            }
        };

        Map.prototype[name] = function () {
            var data = this.data;
            var args = arguments;

            if (isNestedDtmArray(data)) {
                return data.map(function (a) {
                    return a[name].apply(a, args);
                });
            } else {
                return data;
            }
        };
    });

    return stretch;
}

Stretch.prototype = Object.create(Function.prototype);

Stretch.prototype.linear = Stretch.prototype.line = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'line');
};

Stretch.prototype.step = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'step');
};

Stretch.prototype.cos = Stretch.prototype.cosine = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'cos');
};

Stretch.prototype.cub = Stretch.prototype.cubic = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'cubic');
};

/* basic functions */
dtm.data.augment({
    aliases: {
        name: ['label', 'key'],
        names: ['keys', 'indices'],
        clear: ['flush'],
        res: ['residue']
    },

    /**
     * Sets or overwrites the contents of the data object.
     * @function module:data#set
     * @returns {dtm.data}
     */
    set: function () {
        var that = this;

        if (arguments.length === 0) {
            return that;
        }

        if (argsAreSingleVals(arguments)) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                that.val = new Float32Array(args);
            } else {
                that.val = args;
            }
        } else {
            // if set arguments include any array-like object
            if (arguments.length === 1) {
                if (isNumber(arguments[0])) {
                    that.val = toFloat32Array(arguments[0]);
                } else if (isNumArray(arguments[0])) {
                    that.val = toFloat32Array(arguments[0]);
                } else if (isNestedArray(arguments[0])) {
                    that.val = new Array(arguments[0].length);
                    arguments[0].forEach(function (v, i) {
                        that.val[i] = dtm.data(v).parent(that);
                    });
                } else if (isNestedWithDtmArray(arguments[0])) {
                    that.val = arguments[0];
                    that.val.forEach(function (v) {
                        if (isDtmArray(v)) {
                            v.parent(that);
                        }
                    });
                } else if (isDtmArray(arguments[0])) {
                    // array.val = arguments[0].get(); // cloning
                    that = arguments[0]; // retain the reference
                    // set parent in the child
                } else if (isNestedDtmArray(arguments[0])) {
                    that.val = arguments[0].get();
                    that.val.forEach(function (v) {
                        v.parent(that);
                    });
                } else if (isString(arguments[0])) {
                    that.val = [arguments[0]]; // no splitting
                    checkType(that.val);
                } else {
                    that.val = arguments[0];
                }
            } else {
                that.val = new Array(arguments.length);

                argsForEach(arguments, function (v, i) {
                    if (isDtmArray(v)) {
                        that.val[i] = v;
                    } else {
                        that.val[i] = dtm.data(v);
                    }
                    that.val[i].parent(that);
                });
            }
        }

        if (isEmpty(that.params.original)) {
            that.params.original = that.val;
        } else {
            that.params.processed++;
        }

        that.length = that.val.length;
        that.params.index = that.length - 1;

        return that;
    },

    // TODO: list different query params in detail in the documentation
    /**
     * Returns the array contents or an analyzed value
     * @function module:data#get
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name|key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
     * @returns {number|array|string}
     */
    get: function (param) {
        var that = this;

        if (isNumber(param)) {
            // TODO: support multiple single val arguments?
            if (!isInteger(param)) {
                param = Math.round(param)
            }

            return that.val[mod(param, that.length)];
        } else if (isArray(param) || isDtmArray(param)) {
            var indices = isDtmArray(param) ? param.get() : param;
            var res = [];

            // TODO: only accept integers

            indices.forEach(function (i) {
                if (isNumber(i)) {
                    if (!isInteger(i)) {
                        i = Math.round(i);
                    }
                    res.push(that.val[mod(i, that.length)]);
                } else if (isString(i) && isNestedDtmArray(that)) {
                    that.forEach(function (a) {
                        if (a.get('name') === i) {
                            res.push(a);
                        }
                    });
                }
            });

            if (isNestedDtmArray(that)) {
                res = dtm.data(res);
            } else if (isFloat32Array(that.val)) {
                res = toFloat32Array(res);
            }

            return res;

        } else if (isString(param)) {
            switch (param) {
                case 'getters':
                case 'help':
                case '?':
                    return 'name|key, type, len|length, min|minimum, max|maximum, extent|minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram'.split(', ');

                case 'methods':
                case 'functions':
                    return Object.keys(that);

                case 'name':
                case 'key':
                case 'label':
                    return that.params.name;

                case 'names':
                case 'keys':
                case 'labels':
                    if (isNestedWithDtmArray(that.val)) {
                        return that.val.map(function (a) {
                            return a.get('name');
                        });
                    } else {
                        return that.params.name;
                    }

                case 'type':
                    if (isNumArray(that.val)) {
                        return 'number';
                    } else if (isFloat32Array(that.val)) {
                        return 'Float32Array'
                    } else if (isStringArray(that.val)) {
                        return 'string';
                    } else if (isNestedWithDtmArray(that.val)) {
                        return 'nested';
                    } else {
                        return 'mixed';
                    }

                case 'parent':
                    return that.params.parent;

                case 'len':
                case 'length':
                    return that.length;

                case 'size':
                    if (isNestedDtmArray(that)) {
                        return { row: that.val[0].get('len'), col: that.length };
                    } else {
                        return that.length;
                    }

                case 'autolen':
                    return that.params.autolen;

                case 'hash':
                    return that.params.hash;

                case 'processed':
                    return that.params.processed;

                case 'nested':
                    return that.val.map(function (v) {
                        if (isDtmArray(v)) {
                            return v.get();
                        } else {
                            return v;
                        }
                    });

                case 'row':
                    if (isInteger(arguments[1]) && isNestedWithDtmArray(that.val)) {
                        var idx = arguments[1];
                        res = [];
                        that.val.forEach(function (a) {
                            res.push(a.get(idx));
                        });
                        if (isNumArray(res)) {
                            res = toFloat32Array(res);
                        }
                        return res;
                    } else {
                        break;
                    }

                /* STATS */
                case 'minimum':
                case 'min':
                    return getMin(that.val);

                case 'maximum':
                case 'max':
                    return getMax(that.val);

                case 'extent':
                case 'minmax':
                case 'range':
                    return [getMin(that.val), getMax(that.val)];

                case 'mean':
                case 'average':
                case 'avg':
                    return mean(that.val);

                case 'mode':
                    return mode(that.val);
                case 'median':
                    return median(that.val);
                case 'midrange':
                    return midrange(that.val);

                case 'standardDeviation':
                case 'std':
                    return std(that.val);
                case 'pstd':
                    return pstd(that.val);

                case 'variance':
                case 'var':
                    return variance(that.val);
                case 'populationVariance':
                case 'pvar':
                    return pvar(that.val);

                case 'sumAll':
                case 'sum':
                    return sum(that.val);

                case 'rms':
                    return rms(that.val);

                case 'pdf':
                    break;

                case 'entropy':
                    return that.clone().entropy().get();

                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return that.val[that.params.index];

                case 'next':
                    // TODO: increment after return
                    if (isEmpty(arguments[1])) {
                        that.params.index = mod(that.params.index + that.params.step, that.length);
                        return that.val[that.params.index];
                    } else if (isNumber(arguments[1]) && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        that.params.index = mod(that.params.index + that.params.step, that.length);
                        blockArray = dtm.transform.getBlock(that.val, that.params.index, arguments[1]);
                        return dtm.data(blockArray);
                    } else {
                        return that;
                    }

                case 'prev':
                case 'previous':
                    that.params.index = mod(that.params.index - that.params.step, array.length);
                    return that.val[that.params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    that.params.index = randi(0, that.length);
                    return that.val[that.params.index];

                case 'urn':
                    break;

                case 'index':
                case 'idx':
                    return that.params.index;

                case 'hop':
                case 'hopSize':
                case 'step':
                case 'stepSize':
                    return that.params.step;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'block':
                    var start, size, blockArray;
                    if (isArray(arguments[1])) {
                        start = arguments[1][0];
                        size = arguments[1][1];
                        blockArray = dtm.transform.getBlock(that.val, start, size);
                        return dtm.data(blockArray);
                    } else if (isNumber(arguments[1]) && isNumber(arguments[2])) {
                        start = arguments[1];
                        size = arguments[2];
                        blockArray = dtm.transform.getBlock(that.val, start, size);
                        return dtm.data(blockArray);
                    } else {
                        // CHECK: ???
                        return that.val;
                    }

                case 'blockNext':
                    // TODO: incr w/ the step size AFTER RETURN
                    that.params.index = mod(that.params.index + that.params.step, that.length);
                    blockArray = dtm.transform.getBlock(that.val, that.params.index, arguments[1]);
                    return dtm.data(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return that.params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    if (isEmpty(that.params.normalized)) {
                        that.params.normalized = dtm.transform.normalize(that.val);
                    }
                    if (isInteger(arguments[1])) {
                        return that.params.normalized[mod(arguments[1], that.length)];
                    } else {
                        return that.params.normalized;
                    }

                case 'sorted':
                case 'sort':
                    return dtm.transform.sort(that.val);

                case 'uniques':
                case 'unique':
                case 'uniq':
                    return dtm.transform.unique(that.val);

                case 'classes':
                    return listClasses(that.val);

                case 'classID':
                case 'classId':
                    return dtm.transform.classId(that.val);

                case 'string':
                case 'stringify':
                    return dtm.transform.stringify(that.val);

                case 'numClasses':
                case 'numUniques':
                case 'numUniqs':
                    return listClasses(that.val).length;

                case 'unif':
                case 'uniformity':
                    return uniformity(that.val);

                case 'histogram':
                case 'histo':
                    return histo(that.val);

                // TODO: implement
                case 'distribution':
                case 'dist':
                    return [];

                default:
                    if (params.hasOwnProperty(param)) {
                        return that.params[param];
                    } else {
                        return that.val;
                    }
            }
        } else {
            //if (isNestedDtmArray(array)) {
            //    console.log(array.val.map(function (a) {
            //        return a.get();
            //    }));
            //    return array.val.map(function (a) {
            //        return a.get();
            //    });
            //} else {
            //    return array.val;
            //}
            return that.val;
        }

        return that.val;
    },

    len: function () {
        if (isNestedDtmArray(this)) {
            return this.map(function (v) { return v.length; });
        } else {
            return this.set(this.length);
        }
    },

    /**
     * Returns a copy of the array object. It can be used when you don't want to reference the same array object from different places. For convenience, you can also do arrObj() instead of arrObj.clone() to quickly return a copy.
     * @function module:data#clone
     * @returns {dtm.data}
     */
    clone: function () {
        if (arguments.length === 0) {
            var newValue = [];
            if (isNestedWithDtmArray(this.val)) {
                newValue = this.val.map(function (a) {
                    return a.clone();
                });
            } else {
                newValue = this.val;
            }
            var newArr = dtm.data(newValue).label(this.params.name);
            newArr.meta.setOriginal(this.params.original);

            // // CHECK: this may cause troubles!
            // newArr.index(params.index);
            // newArr.stepsize(params.step);

            if (this.params.type === 'string') {
                newArr.classes = this.params.classes;
                //newArr.setType('string');
            }
            return newArr;
        } else {
            return this.column.apply(this, arguments)
        }
    },

    /**
     * Sets the name of the array object.
     * @function module:data#name
     * @param name {string}
     * @returns {dtm.data}
     */
    name: function (name) {
        if (isString(name)) {
            this.params.name = name;
        }
        return this;
    },

    // TODO: not consistent with "name()"
    names: function () {
        if (isNestedDtmArray(this)) {
            return this.set(this.get('keys'));
        } else {
            return this;
        }
    },

    // return the parent if arg is empty
    parent: function (obj) {
        if (isDtmArray(obj)) {
            this.params.parent = obj;
        }
        return this;
    },

    /**
     * Overwrites the "original" state with the current state.
     * @returns {dtm.data}
     */
    save: function () {
        return this.meta.setOriginal(this.val);
    },

    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:data#reset
     * @returns {dtm.data}
     */
    reset: function () {
        return this.set(this.params.original);
    },

    residue: function () {
        return this.set(dtm.transform.subtract(this.params.original, this.val));
    },

    /**
     * Clears all the contents of the array object.
     * @function module:data#flush | clear
     * @returns {dtm.data}
     */
    clear: function () {
        return this.set([]);
    }
});

/* elaborated accessors */
dtm.data.augment({
    aliases: {
        column: ['col'],
        interpolate: ['interp', 'itp']
    },

    column: function (which) {
        var that = this;

        if (isNestedDtmArray(that)) {
            if (isString(which)) {
                var res = null;
                that.val.forEach(function (a) {
                    if (a.get('name') === which) {
                        res = a;
                    }
                });
                if (isEmpty(res)) {
                    res = that;
                }
                return res.clone();
            } else {
                return that.get(which).clone();
            }
        } else {
            return dtm.data(that.get(which)).label(that.get('name'));
        }
    },

    /**
     * Returns a row of a nested array by the index.
     * @param num
     * @returns {dtm.data}
     */
    row: function (num) {
        return this.set(this.get('row', num));
    },

    // memo: only for single-dimensional numerical interpolation
    // mode: linear, step (round), ...
    // aliases: interp, itp
    interpolate: function (at, mode) {
        var that = this;

        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return that;
        }

        indices.forEach(function (i) {
            if (mode === 'step' || mode === 'round') {
                res.push(that.val[mod(Math.round(i), that.length)]);
            } else {
                var floor = mod(Math.floor(i), that.length);
                var ceil = mod(floor + 1, that.length);
                var frac = i - Math.floor(i);

                res.push(that.val[floor] * (1-frac) + that.val[ceil] * frac);
            }
        });

        return that.set(res);
    },

    // interp with index scaled to the 0-1 range
    phase: function (at, mode) {
        var that = this;

        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return that;
        }

        indices.forEach(function (i) {
            // even number floor value gives positive direction
            // e.g., 0~1, 2~3, -1~-2
            // odd gives inverse direction
            if (mod(Math.floor(i), 2) === 0) {
                i = mod(i, 1);
            } else {
                i = 1 - mod(i, 1);
            }

            i *= (that.length-1); // rescale index range

            if (mode === 'step' || mode === 'round') {
                res.push(that.val[mod(Math.round(i), that.length)]);
            } else {
                var floor = mod(Math.floor(i), that.length);
                var ceil = mod(floor + 1, that.length);
                var frac = i - Math.floor(i);

                res.push(that.val[floor] * (1-frac) + that.val[ceil] * frac);
            }
        });

        return that.set(res);
    }
});

/* scalars */
dtm.data.augment({
    aliases: {
        range: ['r'],
        normalize: ['n'],
        unipolar: ['uni', 'up'],
        bipolar: ['bi', 'bp'],
        limit: ['clip'],
        expcurve: ['expc'],
        logcurve: ['logc']
    },

    /**
     * Modifies the range of the array. Shorthand: data.r
     * @function module:data#range
     * @param arg1 {number|array|dtm.data} The target minimum value of the scaled range.
     * @param arg2 {number|array|dtm.data} The target maximum value of the scaled range.
     * @param [arg3] {number} The minimum of the domain (original) value.
     * @param [arg4] {number} The maximum of the domain value.
     * @returns {dtm.data}
     * @example
     * // Specifying the output range
     * dtm.data([1, 2, 3]).range([0, 10]).get();
     * // or
     * dtm.data([1, 2, 3]).range(0, 10).get();
     * -> [0, 5, 10]
     *
     * // Specifying the domain values (the second array in the argument)
     * dtm.data([1, 2, 3]).range([0, 10], [0, 5]).get();
     * // or
     * dtm.data([1, 2, 3]).range(0, 10, 0, 5).get();
     * -> [2, 4, 6]
     */
    range: function (arg1, arg2, arg3, arg4) {
        var that = this;
        var min, max, dmin, dmax;

        if (isNestedDtmArray(that)) {
            if (isNumber(arg3) && isNumber(arg4)) {
                dmin = arg3;
                dmax = arg4;
            } else {
                dmin = Infinity;
                dmax = -Infinity;

                that.forEach(function (a) {
                    dmin = a.get('min') < dmin ? a.get('min') : dmin;
                    dmax = a.get('max') > dmax ? a.get('max') : dmax;
                });
            }

            return that.map(function (a) {
                return a.range(arg1, arg2, dmin, dmax);
            });
        }

        // TODO: better typecheck order

        if (arguments.length === 0) {
            min = 0;
            max = 1;
        } else if (isNumber(arg1)) {
            if (arguments.length === 1) {
                min = 0;
                max = arg1;
            } else {
                min = arg1;
            }
        } else if (isNumArray(arg1)) {
            if (arg1.length >= 2) {
                min = arg1[0];
                max = arg1[1];
            }
            if (arg1.length > 2) {
                min = getMin(arg1);
                max = getMax(arg1);
            }
        } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
            if (arg1.get('len') === 2) {
                min = arg1.get(0);
                max = arg1.get(1);
            } else if (arg1.get('len') > 2) {
                min = arg1.get('min');
                max = arg1.get('max');
            }
        } else {
            return that;
        }

        if (isNumber(arg2)) {
            max = arg2;
        } else if (isNumArray(arg2) && arg2.length === 2) {
            dmin = arg2[0];
            dmax = arg2[1];
        }

        if (isNumber(arg3)) {
            dmin = arg3;
        } else if (isNumArray(arg3) && arg3.length === 2) {
            dmin = arg3[0];
            dmax = arg3[1];
        }

        if (isNumber(arg4)) {
            dmax = arg4;
        }

        return that.set(dtm.transform.rescale(that.val, min, max, dmin, dmax));
    },

    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:data#normalize
     * @param [arg1] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [arg2] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {dtm.data}
     */
    normalize: function (arg1, arg2) {
        var that = this;
        var min, max, args;

        if (isNestedDtmArray(that)) {
            if (isNumber(arg1) && isNumber(arg2)) {
                min = arg1;
                max = arg2;
            } else {
                min = Infinity;
                max = -Infinity;

                that.forEach(function (a) {
                    min = a.get('min') < min ? a.get('min') : min;
                    max = a.get('max') > max ? a.get('max') : max;
                });
            }

            return that.map(function (a) {
                return a.normalize(min, max);
            });
        }

        if (isNumber(arg1) && isNumber(arg2)) {
            min = arg1;
            max = arg2;
        } else {
            if (isNumOrFloat32Array(arg1)) {
                args = arg1;
            } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
                args = arg1.get();
            }

            if (isNumOrFloat32Array(args)) {
                if (args.length === 2) {
                    min = args[0];
                    max = args[1];
                } else if (args.length > 2) {
                    min = getMin(args);
                    max = getMax(args);
                }
            }
        }

        return that.set(dtm.transform.normalize(that.val, min, max));
    },

    unipolar: function () {
        return this.range(0, 1);
    },

    bipolar: function (dc) {
        if (!isBoolean(dc)) {
            dc = false;
        }

        // TODO: this is wrong
        if (dc) {
            var mean = this.get('mean');
            var posSize = this.get('max') - mean;
            var negSize = mean - this.get('min');

            if (posSize >= negSize) {
                return this.range(-1, 1, mean - posSize, this.get('max'));
            } else {
                return this.range(-1, 1, this.get('min'), mean + negSize);
            }
        } else {
            return this.range(-1, 1);
        }
    },

    /**
     * Caps the array value range at the min and max values. Only works with a numerical array.
     * @function module:data#limit | clip
     * @param [min=0]
     * @param [max=1]
     * @returns {dtm.data}
     */
    limit: function (min, max) {
        if (isNumOrFloat32Array(this.val)) {
            min = min || 0;
            max = max || 1;
            return this.set(dtm.transform.limit(this.get(), min, max));
        } else {
            return this;
        }
    },

    /**
     * Scales the array with an exponential curve.
     * @function module:data#expcurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.data}
     */
    expcurve: function (factor, min, max) {
        if (isEmpty(min)) {
            min = this.get('min');
        }
        if (isEmpty(max)) {
            max = this.get('max');
        }

        var arr = dtm.transform.expCurve(this.get('normalized'), factor);
        return this.set(dtm.transform.rescale(arr, min, max));
    },

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:data#logc | logcurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.data}
     */
    logcurve: function (factor, min, max) {
        if (isEmpty(min)) {
            min = this.get('min');
        }
        if (isEmpty(max)) {
            max = this.get('max');
        }

        var arr = dtm.transform.logCurve(this.get('normalized'), factor);
        return this.set(dtm.transform.rescale(arr, min, max));
    }
});

/* interpolation and resampling */
dtm.data.augment({
    aliases: {
        linear: ['line'],
        cosine: ['cos'],
        cubic: ['cub'],
        slinear: ['sline'],
        scosine: ['scos'],
        scubic: ['scub']
    },

    linear: function (len) {
        return this.fit(len, 'linear');
    },

    step: function (len) {
        return this.fit(len, 'step');
    },

    cosine: function (len) {
        return this.fit(len, 'cos');
    },

    cubic: function (len) {
        return this.fit(len, 'cubic');
    },

    slinear: function (factor) {
        return this.stretch(factor, 'linear');
    },

    sstep: function (factor) {
        return this.stretch(factor, 'step');
    },

    scosine: function (factor) {
        return this.stretch(factor, 'cos');
    },

    scubic: function (factor) {
        return this.stretch(factor, 'cubic');
    },

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:data#fitsum
     * @param tgt {number} If the round argument is true, the target value is also rounded.
     * @param [round=false] {boolean}
     * @returns {dtm.data}
     */
    fitsum: function (tgt, round, min) {
        return this.set(dtm.transform.fitSum(this.val, tgt, round));
    },

    /**
     * Morphs the array values with a target array / dtm.data values. The lengths can be mismatched.
     * @function module:data#morph
     * @param tgtArr {array | dtm.data}
     * @param [morphIdx=0.5] {number} between 0-1
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    morph: function (tgtArr, morphIdx, interp) {
        if (isNumDtmArray(tgtArr)) {
            tgtArr = tgtArr.val;
        }

        // TODO: accept array for multi-point morphing
        if (isNumDtmArray(morphIdx)) {
            morphIdx = morphIdx.get(0);
        } else if (!isNumber(morphIdx)) {
            morphIdx = 0.5;
        }

        morphIdx = 1 - Math.abs(mod(morphIdx, 2) - 1);

        if (!isString(interp)) {
            interp = 'linear';
        }

        if (isNumDtmArray(this) && isNumOrFloat32Array(tgtArr)) {
            this.set(dtm.transform.morph(this.val, tgtArr, morphIdx, interp));
        }

        return this;
    }
});

/* blocking operations */
dtm.data.augment({
    aliases: {
        unblock: ['ub', 'u', 'ungroup', 'ug', 'flatten'],
        window: ['win'],
        transp: ['t']
    },

    unblock: function () {
        if (isNestedDtmArray(this)) {
            var flattened = [];
            this.val.forEach(function (v) {
                if (isDtmArray(v)) {
                    flattened = concat(flattened, v.get());
                }
            });

            if (isNumArray(flattened)) {
                flattened = toFloat32Array(flattened);
            }
            return this.set(flattened);
        } else {
            return this;
        }
    },

    // TODO: array.block (and window) should transform the parent array into nested child array
    nest: function () {
        if (!isDtmArray(this.val)) {
            this.set([dtm.this(this.val)]);
            this.val[0].parent(this);
        }
        return this;
    },

    /**
     * Applies a window function to the array. May be combined with array.block() operation.
     * @function module:data#window
     * @param type
     * @returns {dtm.data}
     */
    window: function (type) {
        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.window(type);
            });
        } else {
            return this.set(dtm.transform.window(this.val, type));
        }
    },

    ola: function (hop) {
        if (!isInteger(hop) || hop < 1) {
            hop = 1;
        }

        if (isNestedWithDtmArray(this.val)) {
            var len = hop * (this.length-1) + this.val[0].get('len');
            var newArr = new Array(len);
            newArr.fill(0);
            this.val.forEach(function (a, i) {
                a.foreach(function (v, j) {
                    newArr[i*hop+j] += v;
                });
            });

            return this.set(newArr);
        } else {
            return this;
        }
    },

    copy: function (times) {
        if (!isInteger(times)) {
            times = 1;
        }
        if (!isNestedDtmArray(this)) {
            var res = [];
            for (var i = 0; i < times; i++) {
                res.push(this.val);
            }
            return dtm.data(res);
        } else {

        }
        return this;
    },

    // TODO: conflicts with gen.transpose()
    transp: function () {
        if (isNestedDtmArray(this)) {
            var newArray = [];
            var i = 0;
            while (this.val.some(function (a) {
                return i < a.get('len');
            })) {
                // TODO: get('row', i)
                newArray.push(this.get('row', i));
                i++;
            }
            return this.set(newArray);
        } else {
            return this.block(1);
        }
    },

    // not sure what this does
    seg: function (idx) {
        if (isNumArray(idx) || isNumDtmArray(idx)) {
            var res = [];
            var len = idx.length;
            if (isNumDtmArray(idx)) {
                idx = idx.get();
            }

            if (idx[0] !== 0) {
                if (isFloat32Array(this.val)) {
                    res.push(dtm.data(this.val.subarray(0, idx[0])).label('0'));
                } else {
                    res.push(dtm.data(this.val.slice(0, idx[0])).label('0'));
                }
            }

            for (var i = 0; i < len-1; i++) {
                if (isFloat32Array(this.val)) {
                    res.push(dtm.data(this.val.subarray(idx[i], idx[i+1])).label(idx[i].toString()));
                } else {
                    res.push(dtm.data(this.val.slice(idx[i], idx[i+1])).label(idx[i].toString()));
                }
            }

            if (isFloat32Array(this.val)) {
                res.push(dtm.data(this.val.subarray(idx[i], this.length)).label(idx[i].toString()));
            } else {
                res.push(dtm.data(this.val.slice(idx[i], this.length)).label(idx[i].toString()));
            }

            return this.set(res);
        } else if (isInteger(idx)) {
            return this;
        }

        return this;
    }
});

/* transforms and modulations */
dtm.data.augment({
    aliases: {
        amp: ['am', 'gain'],
        freq: ['fm']
    },

    amp: function (input) {
        var ampArr;

        if (argsAreSingleVals(arguments)) {
            ampArr = argsToArray(arguments);
        } else if (isNumOrFloat32Array(input)) {
            ampArr = input;
        } else if (isNumDtmArray(input)) {
            ampArr = input.get();
        }

        return this.mult(ampArr);
    },

    // with support for fractional freq array with table lookup and angular velocity
    freq: function (input) {
        var freqArr;

        if (argsAreSingleVals(arguments)) {
            freqArr = argsToArray(arguments);
        } else if (isNumOrFloat32Array(input)) {
            freqArr = input;
        } else if (isNumDtmArray(input)) {
            freqArr = input.get();
        }

        var res = [];

        var phase = 0;
        var len;
        var wavetable = this.clone();

        if (freqArr.length > this.length) {
            wavetable.fit(freqArr.length, 'step');
            len = freqArr.length;
        } else {
            len = wavetable.length;
        }

        var currFreqVal = 1;
        var floor, ceil, frac;

        dtm.line(len).forEach(function (p) {
            currFreqVal = freqArr[Math.floor(p * freqArr.length)];
            if (currFreqVal < 0) {
                phase += 1/len * currFreqVal;
                phase = mod(phase, 1);
            }

            floor = Math.floor(phase * (len-1));
            ceil = floor + 1;
            // ceil = currFreqVal >= 0 ? floor + 1 : floor - 1;
            // ceil = mod(ceil, len);
            frac = phase * (len-1) - floor;

            res.push(wavetable.val[floor] * (1-frac) + wavetable.val[ceil] * frac);

            if (currFreqVal >= 0) {
                phase += 1/len * currFreqVal;
                phase = mod(phase, 1);
            }
        });

        return this.set(res);
    }
});

/* arithmetic */
dtm.data.augment({
    aliases: {
        divide: ['div'],
        reciprocal: ['recip'],
        power: ['pow', 'exp'],
        abs: ['fwr'],
        modulo: ['mod'],
        morethan: ['mt'],
        lessthan: ['lt']
    },

    /**
     * Adds a value to all the array elements.
     * @function module:data#add
     * @param factor {number|array|dtm.data}
     * @param [interp='step'] {string}
     * @returns {dtm.data}
     * @example
     * <div> hey </div>
     */
    add: function (factor, interp) {
        var that = this;
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return that.set(dtm.transform.add(that.val, factor, interp));
        }
    },

    subtract: function (factor, interp) {
        var that = this;
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return that.set(dtm.transform.subtract(that.val, factor, interp));
        }
    },

    /**
     * Scales the numerical array contents.
     * @function module:data#mult
     * @param factor {number|array|dtm.data}
     * @param [interp='step'] {string}
     * @returns {dtm.data}
     */
    mult: function (factor, interp) {
        var that = this;
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.mult(factor.get('next'));
                } else {
                    return a.mult(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.mult(factor.get('next'));
                });
            }

            return that.set(dtm.transform.mult(that.val, factor, interp));
        }
    },

    divide: function (factor, interp) {
        var that = this;

        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.divide(factor.get('next'));
                } else {
                    return a.divide(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.divide(factor.get('next'));
                });
            }

            return that.set(dtm.transform.div(that.val, factor, interp));
        }
    },

    reciprocal: function () {
        var that = this;
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                return a.reciprocal();
            });
        } else if (isNumDtmArray(that)) {
            return that.map(function (v) {
                return 1/v;
            });
        } else {
            return that;
        }
    },

    /**
     * @function module:data#pow
     * @param factor {number|array|dtm.data}
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    power: function (factor, interp) {
        if (isNumDtmArray(factor)) {
            factor = factor.get();
        }
        return this.set(dtm.transform.pow(this.val, factor, interp));
    },

    /**
     * Applies the array contents as the power to the argument as the base
     * @function module:data#powof
     * @param factor {number|array|dtm.data}
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    powof: function (factor, interp) {
        if (isNumDtmArray(factor)) {
            factor = factor.get();
        }
        return this.set(dtm.transform.powof(this.val, factor, interp));
    },

    log: function (base, interp) {
        if (isNumDtmArray(base)) {
            base = base.get();
        }
        return this.set(dtm.transform.log(this.val, base, interp));
    },

    /**
     * Rounds float values of the array to integer values.
     * @function module:data#round
     * @param to {number}
     * @returns {dtm.data}
     */
    round: function (to) {
        return this.set(dtm.transform.round(this.val, to));
    },

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:data#floor
     * @returns {dtm.data}
     */
    floor: function () {
        return this.set(dtm.transform.floor(this.val));
    },

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:data#ceil
     * @returns {dtm.data}
     */
    ceil: function () {
        return this.set(dtm.transform.ceil(this.val));
    },

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:data#fwr | abs
     * @returns {dtm.data}
     */
    abs: function () {
        return this.set(dtm.transform.fwr(this.val));
    },

    /**
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:data#hwr
     * @returns {dtm.data}
     */
    hwr: function () {
        return this.set(dtm.transform.hwr(this.val));
    },

    modulo: function (divisor) {
        return this.set(dtm.transform.mod(this.val, divisor));
    },

    // CHECK: occurrence or value??
    // TODO: remove empty columns
    morethan: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.morethan(val);
            });
        } else {
            this.filter(function (v) {
                return v > val;
            });
        }
        return this.removeempty();
    },

    mtet: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.mtet(val);
            });
        } else {
            this.filter(function (v) {
                return v >= val;
            });
        }
        return this;
    },

    lessthan: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.lessthan(val);
            });
        } else {
            this.filter(function (v) {
                return v < val;
            });
        }
        return this;
    },

    ltet: function () {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.ltet(val);
            });
        } else {
            this.filter(function (v) {
                return v <= val;
            });
        }
        return this;
    }
});

/* statistics and aggregates */
dtm.data.augment({
    aliases: {
        mean: ['avg'],
        midrange: ['mid']
    },

    min: function (fn) {
        if (isFunction(fn)) {
            var res = getMin(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.min();
                });
            } else {
                return this.set(getMin(this.val));
            }
        }
    },

    max: function (fn) {
        if (isFunction(fn)) {
            var res = getMax(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.max();
                });
            } else {
                return this.set(getMax(this.val));
            }
        }
    },

    extent: function () {
        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.set(a.get('extent'));
            });
        } else {
            return this.set(this.get('extent'));
        }
    },

    mean: function (fn) {
        if (isFunction(fn)) {
            var res = mean(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.mean();
                });
            } else {
                return this.set(mean(this.val));
            }
        }
    },

    mode: function (fn) {
        if (isFunction(fn)) {
            var res = mode(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.mode();
                });
            } else {
                return this.set(mode(this.val));
            }
        }
    },

    median: function (fn) {
        if (isFunction(fn)) {
            var res = median(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.median();
                });
            } else {
                return this.set(median(this.val));
            }
        }
    },

    midrange: function (fn) {
        if (isFunction(fn)) {
            var res = midrange(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.midrange();
                });
            } else {
                return this.set(midrange(this.val));
            }
        }
    },

    std: function (fn) {
        if (isFunction(fn)) {
            var res = std(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.std();
                });
            } else {
                return this.set(std(this.val));
            }
        }
    },

    pstd: function (fn) {
        if (isFunction(fn)) {
            var res = pstd(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.pstd();
                });
            } else {
                return this.set(pstd(this.val));
            }
        }
    },

    'var': function (fn) {
        if (isFunction(fn)) {
            var res = variance(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.var();
                });
            } else {
                return this.set(variance(this.val));
            }
        }
    },

    pvar: function (fn) {
        if (isFunction(fn)) {
            var res = pvar(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.pvar();
                });
            } else {
                return this.set(pvar(this.val));
            }
        }
    },

    rms: function (fn) {
        if (isFunction(fn)) {
            var res = rms(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.rms();
                });
            } else {
                return this.set(rms(this.val));
            }
        }
    },

    // TODO: not consistent with other stats-based conversions
    sum: function () {
        if (isNestedWithDtmArray(this.val)) {
            var maxLen = 0;
            this.val.forEach(function (a) {
                if (a.get('len') > maxLen) {
                    maxLen = a.get('len');
                }
            });

            var res = new Float32Array(maxLen);

            for (var i = 0; i < maxLen; i++) {
                this.val.forEach(function (a) {
                    if (i < a.get('len') && isNumber(a.get(i))) {
                        res[i] += a.get(i);
                    }
                });
            }

            return this.set(res);
        } else {
            var sum = this.val.reduce(function (a, b) {
                return a + b;
            });
            return this.set(sum);
        }
    }
});

/* analysis, transformation and filtering */
dtm.data.augment({
    aliases: {
        correlation: ['corr'],
        covariance: ['covar', 'cov']
    },

    /**
     * @function module:data#diff
     * @returns {dtm.data}
     */
    diff: function (order, pad) {
        if (!isInteger(order) || order < 1) {
            order = 1;
        }
        for (var i = 0; i < order; i++) {
            this.val = dtm.transform.diff(this.val);
        }

        if (isSingleVal(pad)) {
            for (var i = 0; i < order; i++) {
                this.val = concat(this.val, pad);
            }
        }
        return this.set(this.val);
    },

    /**
     * Calculates the mean-square-error. If no argument is given, it will take the current array state as the modified value, and calculates the distortion from the original (initial state) value of itself. This would be useful for choosing quantization or transformation methods with less distortion to the data.
     * @returns {dtm.data}
     */
    mse: function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(array)) {
                var source = this.clone().reset();

                // respect the original length
                if (source.get('len') !== this.get('len')) {
                    this.fit(source.get('len'), 'step');
                }

                return source().subtract(this).pow(2).sum().divide(source.get('len'));
            }
        } else {
            return this;
        }
    },

    snr: function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(this)) {
                var mse = this.clone().mse();
                return this.set(meanSquare(this.val) / mse.get(0));
            }
        }
        return this;
    },

    dbsnr: function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(this)) {
                var snr = this.snr();
                return this.set(10 * Math.log10(snr.get(0)));
            }
        }
        return this;
    },

    dct: function () {
        var that = this;
        if (isNumDtmArray(that)) {
            var res = [];
            var w;
            for (var k = 0; k < that.length; k++) {
                if (k === 0) {
                    w = Math.sqrt(1/(4*that.length));
                } else {
                    w = Math.sqrt(1/(2*that.length));
                }
                res.push(2 * w * sum(that.val.map(function (v, n) {
                        return v * Math.cos(Math.PI/that.length * (n + 0.5) * k);
                    })));
            }
            return that.set(res);
        } else if (isNestedDtmArray(that)) {
            return that.map(function (a) {
                return a.dct();
            });
        }
        return that;
    },

    idct: function () {
        var that = this;
        if (isNumDtmArray(that)) {
            var res = [];
            for (var k = 0; k < that.length; k++) {
                res.push(sum(that.val.map(function (v, n) {
                    if (n === 0) {
                        return v / Math.sqrt(that.length);
                    } else {
                        return Math.sqrt(2/that.length) * v * Math.cos(Math.PI/that.length * n * (k + 0.5));
                    }
                })));
            }
            return that.set(res);
        } else if (isNestedDtmArray(that)) {
            return that.map(function (a) {
                return a.idct();
            });
        }
        return that;
    },

    fir: function (coef) {
        var that = this;
        var coef_ = [];
        if (argsAreSingleVals(arguments)) {
            coef_ = argsToArray(arguments);
        } else if (isNumOrFloat32Array(coef)) {
            coef_ = coef;
        } else if (isNumDtmArray(coef)) {
            coef_ = coef.get();
        }
        var res = [];

        for (var n = 0; n < that.length; n++) {
            res[n] = 0;
            coef_.forEach(function (v, i) {
                res[n] += (n-i) >= 0 ? v * that.val[n-i] : 0;
            });
        }

        return that.set(res);
    },

    amdf: function (max) {
        if (!isNumber(max)) {
            max = Math.round(this.length / 2);
        }

        var res = [];

        for (var i = 1; i < max; i++) {
            res.push(this().subtract(this().shift(i)).abs().mean().get(0));
        }

        return this.set(res);
    },

    correlation: function (tgt) {
        if (isNumDtmArray(this)) {
            var res = dtm.data();
            var zeros = dtm.data(0).rep(this.get('len'));
            var src = this.clone();

            if (isNumDtmArray(tgt) || isNumOrFloat32Array(tgt)) {
                var tgtLen = isNumOrFloat32Array(tgt) ? tgt.length : tgt.get('len');
                tgt = zeros().append(tgt).append(zeros);
                src.append(dtm.const(0).size(tgtLen)).append(zeros);
            } else {
                tgt = zeros().append(src).append(zeros);
                src.append(zeros).append(zeros);
            }

            for (var i = 0; i < src.get('len') - (this.get('len')-1); i++) {
                res.append(src().mult(tgt).get('sum'));
                src.shift(-1);
            }

            return res;
        } else {
            return this;
        }
    },

    covariance: function (tgt) {
        if (isNumDtmArray(this)) {
            if (isNumDtmArray(tgt)) {
                tgt = tgt.clone();
            } else if (isNumOrFloat32Array(tgt)) {
                tgt = dtm.data(tgt);
            } else {
                tgt = this.clone();
            }

            var len = this.get('len');

            if (tgt.get('len') !== len) {
                tgt.fit(len, 'step');
            }

            var xEst = this.get('mean');
            var yEst = this.get('mean');

            var res = 0;

            for (var i = 0; i < len; i++) {
                res += (this.get(i) - xEst) * (tgt.get(i) - yEst);
            }

            res /= len;

            return dtm.data(res);
        } else {
            return this;
        }
    },

    linreg: function () {
        if (isNumDtmArray(this)) {
            var xEst = dtm.range(this.get('len')).get('mean');
            var yEst = this.get('mean');
            var SSxy = 0;
            var SSxx = 0;

            this.val.forEach(function (y, x) {
                SSxy += (x - xEst) * (y - yEst);
                SSxx += Math.pow((x - xEst), 2);
            });
            var b1 = SSxy / SSxx;
            var b0 = yEst - b1 * xEst;

            var est = [];
            var err = [];
            for (var i = 0; i < this.get('len'); i++) {
                est.push(b0 + b1 * i);
                err.push(this.get(i) - est[i]);
            }

            return this.set([est, err, [b1, b0]]);
        } else if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.linreg();
            });
        } else {
            return this;
        }
    }
});

/* nominal */
dtm.data.augment({
    aliases: {
        histogram: ['histo'],
        distribution: ['dist', 'pmf'],
        unique: ['uniq'],
        classify: ['class']
    },

    // TODO: copy-paste the count function
    /**
     * Generates a histogram from a nominal array, such as the string type.
     * @function module:data#histogram
     * @returns {dtm.data}
     */
    histogram: function () {
        // CHECK: this is hacky
        this.params.type = 'string'; // re-set the type to string from number
        return this.set(toFloat32Array(histo(this.val)));
    },

    count: function () {
        var that = this;
        var res = [];
        objForEach(countOccurrences(that.get()), function (v, k) {
            res.push(dtm.data(v).label(k).parent(that));
        });
        return that.set(res);
    },

    /**
     * Probability mass function
     * @returns {dtm.data}
     */
    distribution: function () {
        if (!isNestedDtmArray(this)) {
            return this.count().mult(1/this.get('sum'));
        } else {
            return this;
        }
    },

    entropy: function () {
        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.entropy();
            })
        } else {
            var dist = this.pmf().unnest();
            return dist.map(function (v) {
                return v * Math.log2(v);
            }).sum().mult(-1);
        }
    },

    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:data#uniq | unique
     * @returns {dtm.data}
     */
    unique: function () {
        return this.set(dtm.transform.unique(this.val));
    },

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:data#classify
     * @param by
     * @returns {dtm.data}
     */
    classify: function (by) {
        return this.set(dtm.transform.classId(this.val));
    }
});

/* random */
dtm.data.augment({
    aliases: {
        shuffle: ['randomize'],
        randomtrigger: ['randtrig']
    },

    /**
     * Randomizes the order of the array.
     * @function module:data#shuffle | random | randomize | rand
     * @returns {dtm.data}
     */
    shuffle: function () {
        return this.set(dtm.transform.shuffle(this.val));
    },

    randomtrigger: function (dist) {
        if (!isString(dist)) {
            dist = 'uniform';
        }

        if (isNestedNumDtmArray(this)) {
            return this.map(function (a) {
                return a.randomtrigger();
            });
        } else if (isNumDtmArray(this)) {
            return this.map(function (v) {
                if (Math.random() <= v) {
                    return 1.0;
                } else {
                    return 0.0;
                }
            });
        } else {
            return this;
        }
    }
});

/* unit conversions */
dtm.data.augment({
    aliases: {
        notesToBeats: ['ntob'],
        beatsToNotes: ['bton'],
        intervalsToBeats: ['itob'],
        beatsToIntervals: ['btoi'],
        beatsToIndices: ['btot'],
        indicesToBeats: ['ttob'],
        tonumber: ['tonum', 'num'],
        stringify: ['tostring'],
        toFloat32: ['tofloat32', 'tf32']
    },

    mtof: function () {
        return this.set(dtm.transform.mtof(this.val));
    },

    ftom: function () {
        return this.set(dtm.transform.ftom(this.val));
    },

    /**
     * Converts note values into a beat sequence.
     * @function module:data#notesToBeats | ntob
     * @param [resolution=4] {number}
     * @returns {dtm.data}
     */
    notesToBeats: function (resolution) {
        resolution = resolution || 4;
        return this.set(dtm.transform.notesToBeats(this.val, resolution));
    },

    /**
     * Converts beat sequence into note values.
     * @function module:data#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.data}
     */
    beatsToNotes: function (resolution) {
        resolution = resolution || 4;
        return this.set(dtm.transform.beatsToNotes(this.val, resolution));
    },

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:data#intervalsToBeats | itob
     * @returns {dtm.data}
     */
    intervalsToBeats: function (arr) {
        var ampseq;

        if (isNumDtmArray(arr)) {
            ampseq = arr.val;
        } else if (isNumOrFloat32Array(arr)) {
            ampseq = arr;
        }
        return this.set(dtm.transform.intervalsToBeats(this.val, ampseq));
    },


    /**
     * Converts beat sequence into intervalic values.
     * @function module:data#beatsToIntervals | btoi
     * @returns {dtm.data}
     */
    beatsToIntervals: function () {
        return this.set(dtm.transform.beatsToIntervals(this.val));
    },

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:data#beatsToTime
     * @returns {dtm.data}
     */
    beatsToTime: function () {
        return this.set(dtm.transform.beatsToIndices(this.val));
    },

    /**
     * function module:data#timeToBeats
     * @param [len]
     * @returns {dtm.data}
     */
    timeToBeats: function (len) {
        return this.set(dtm.transform.indicesToBeats(this.val, len));
    },

    /**
     * Converts string or boolean values to numerical values.
     * @function module:data#tonumber | toNumber
     * @returns {dtm.data}
     */
    tonumber: function () {
        if (isParsableNumArray(this.val) || isBoolArray(this.val)) {
            return this.set(toFloat32Array(dtm.transform.tonumber(this.val)));
        } else {
            return this;
        }
    },

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:data#stringify | tostring
     * @returns {dtm.data}
     */
    stringify: function () {
        return this.set(dtm.transform.stringify(this.val));
    },

    toFloat32: function () {
        if (isNumArray(this.val)) {
            this.set(toFloat32Array(this.val));
        }
        return this;
    }
});

/* JS list operation wrappers and variations */
dtm.data.augment({
    aliases: {
        concat: ['cat', 'append', 'app'],
        repeat: ['rep'],
        fitrepeat: ['fitrep', 'frep'],
        mirror: ['mirr', 'mir'],
        reverse: ['rev'],
        invert: ['inv'],
        queue: ['fifo'],
        select: ['sel'],
        order: ['reorder']
    },

    reduce: function (fn) {
        return this.set(this.val.reduce(fn));
    },

    // TODO: these should be in the get method
    some: function (fn) {
        return this.val.some(fn);
    },

    every: function (fn) {
        return this.val.every(fn);
    },

    filter: function (fn) {
        return this.set(this.val.filter(fn));
    },

    // TODO: nested array and concat?
    /**
     * Concatenates new values to the contents.
     * @function module:data#concat | append
     * @param arr {array | dtm.data} A regular array or a dtm.data object.
     * @returns {dtm.data}
     */
    concat: function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            this.val = concat(this.val, arr.get());
        } else {
            this.val = concat(this.val, arr);
        }
        return this.set(this.val);
    },

    prepend: function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            this.val = concat(arr.get(), this.val);
        } else {
            this.val = concat(arr, this.val);
        }
        return this.set(this.val);
    },

    /**
     * Repeats the contents of the current array.
     * @function module:data#repeat | rep
     * @param count {number} Integer
     * @returns {dtm.data}
     */
    repeat: function (count) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        return this.set(dtm.transform.repeat(this.val, count));
    },

    fitrepeat: function (count, interp) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        return this.set(dtm.transform.fit(dtm.transform.repeat(this.val, count), this.length, interp));
    },

    /**
     * @function module:data#pad
     * @param val
     * @param length
     * @returns {{type: string}}
     */
    pad: function (val, length) {
        var test = [];
        for (var i = 0; i < length; i++) {
            test.push(val);
        }

        return this.concat(test);
    },

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @function module:data#truncate
     * @param arg1 {number} Start bits to truncate. If the arg2 is not present, it will be the end bits to truncate.
     * @param [arg2] {number} End bits to truncate.
     * @returns {dtm.data}
     */
    truncate: function (arg1, arg2) {
        return array.set(dtm.transform.truncate(array.val, arg1, arg2));
    },

    remove: function (input) {
        var at = [];
        var val = this.val;

        if (argsAreSingleVals(arguments)) {
            if (isNumArray(argsToArray(arguments))) {
                at = argsToArray(arguments);
            }
        } else if (isNumOrFloat32Array(input)) {
            at = input;
        } else if (isNumDtmArray(input)) {
            at = input.get();
        }

        at.forEach(function (i) {
            val.splice(i, 1);
        });
        return this.set(val);
    },

    removeempty: function () {
        var newArr = [];
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                if (a.get(0).constructor.name === 'Float32Array') {
                    if (a.get(0).length > 0) {
                        newArr.push(a);
                    }
                } else {
                    newArr.push(a);
                }
            });
            return dtm.data(newArr);
        } else {
            this.forEach(function (v) {
                if (!isEmpty(v)) {
                    newArr.push(v);
                }
            });
            return dtm.data(newArr).label(this.get('name'));
        }
    },

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:data#shift
     * @param amount {number} Integer
     * @returns {dtm.data}
     */
    shift: function (amount) {
        return this.set(dtm.transform.shift(this.val, amount));
    },

    /**
     * Appends an reversed array at the tail.
     * @function module:data#mirror
     * @returns {{type: string}}
     */
    mirror: function () {
        return this.concat(dtm.transform.reverse(this.val));
    },

    /**
     * Flips the array contents horizontally.
     * @function module:data#reverse | rev
     * @returns {dtm.data}
     */
    reverse: function () {
        return this.set(dtm.transform.reverse(this.val));
    },

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:data#invert | inv | flip
     * @param [center=meanVal] {number}
     * @returns {dtm.data}
     */
    invert: function (center) {
        return this.set(dtm.transform.invert(this.val, center));
    },

    /**
     * Adds new value(s) at the end of the array, and removes the oldest value(s) at the beginning of the array. The size of the array is unchanged.
     * @function module:data#queue | fifo
     * @param input {number|array}
     * @returns {dtm.data}
     */
    queue: function (input) {
        if (isNumber(input)) {
            this.val.push(input);
            this.val.shift();
        } else if (isFloat32Array(input)) {
            this.val = Float32Concat(this.val, input);
            this.val = this.val.splice(input.length);
        } else if (isArray(input)) {
            if (isFloat32Array(this.val)) {
                this.val = Float32Concat(this.val, input);
                this.val = Float32Splice(this.val, 0, input.length);
            } else {
                this.val = this.val.concat(input);
                this.val = this.val.splice(input.length);
            }
        } else if (isDtmArray(input)) {
            this.val = this.val.concat(input.get());
            this.val = this.val.splice(input.get('len'));
        }
        return this.set(this.val);
    },

    find: function (tgt) {
        if (!isEmpty(tgt)) {
            var res = [];

            if (isFunction(tgt)) {
                this.forEach(function (v, i) {
                    if (tgt(v)) {
                        res.push(i);
                    }
                });
            } else if (isSingleVal(tgt)) {
                this.forEach(function (v, i) {
                    if (v === tgt) {
                        res.push(i);
                    }
                });
            } else {
                return this;
            }

            return this.set(res);
        } else {
            return this;
        }
    },

    /**
     * Sorts the contents of numerical array.
     * @function module:data#sort
     * @returns {dtm.data}
     */
    sort: function (fn) {
        if (isEmpty(fn)) {
            return this.set(dtm.transform.sort(this.val));
        } else {
            return this.set(this.val.sort(fn));
        }
    },

    sortby: function (fn, desc) {
        if (!isBoolean(desc)) {
            desc = false;
        }
        if (!isFunction(fn)) {
            fn = function (v) {
                return v;
            };
        }
        var res = this.val.sort(function (a, b) {
            if (desc) {
                return fn(b) - fn(a);
            } else {
                return fn(a) - fn(b);
            }
        });
        return this.set(res);
    },

    replace: function (tgt, val) {
        // TODO: type and length check
        // TODO: if val is an array-ish, fill the tgt w/ the array elements
        if (isSingleVal(val)) {
            if (isSingleVal(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (v === tgt) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isArray(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (tgt.some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isDtmArray(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (tgt.get().some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isFunction(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (tgt(v)) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            }
        } else {
            return this;
        }
    },

    // TODO: support typed array
    select: function () {
        var indices, res = [];
        if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (isNumOrFloat32Array(arguments[0])) {
            indices = arguments[0];
        } else if (isDtmArray(arguments[0]) && isNumOrFloat32Array(arguments[0].get())) {
            indices = arguments[0].get();
        }

        if (!isNumOrFloat32Array(indices)) {
            return array;
        } else {
            indices.forEach(function (i) {
                res.push(array.val[mod(i, array.length)]);
            });
            return array.set(res);
        }
    },

    // TODO: may be obsolete
    reorder: function () {
        var indices;

        if (isDtmArray(arguments[0])) {
            indices = toFloat32Array(arguments[0]);
        } else if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (argIsSingleArray(arguments)) {
            indices = arguments[0];
        }

        if (isNumOrFloat32Array(indices)) {
            var newArr = new Array(indices.length);
            indices.forEach(function (v, i) {
                newArr[i] = this.get(v);
            });
        }
        return this.set(newArr);
    }
});

/* string operations */
dtm.data.augment({
    aliases: {},
    /**
     * Separates the array items into new array using the separator
     * @param [separator=''] {string}
     * @returns dtm.data
     */
    split: function (separator) {
        return this.set(dtm.transform.split(this.val, separator));
    },

    join: function (delimiter) {
        var that = this;
        if (isNestedDtmArray(that)) {
            that.map(function (a) {
                return a.join(delimiter);
            });
        }

        if (!isString(delimiter)) {
            delimiter = '';
        }
        var res = '';
        that.forEach(function (v, i) {
            res += toString(v);
            if (i < that.length-1) {
                res += delimiter;
            }
        });

        return that.set(res);
    },

    editdist: function (target) {
        if (isString(target)) {
            return this.set(dtm.transform.editDistance(this.val, target));
        } else {
            return this;
        }
    }
});

/* utilities */
dtm.data.augment({
    aliases: {
        call: ['do']
    },

    /* dtm.generator placeholders */
    // these are not really necessary, but prevents typeError when calling dtm.gen functions on pure dtm.data object
    type: function () { return this; },
    size: function () { return this; },

    call: function (fn) {
        if (isFunction(fn)) {
            if (arguments.length > 1) {
                // ?
            }
            fn(this);
        }
        return this;
    },

    // TODO: these are broken...
    print: function () {
        if (isFunction(dtm.params.printer)) {
            console.log([this].concat(argsToArray(arguments)));
            dtm.params.printer.apply(this, [this].concat(argsToArray(arguments)));
        } else {
            dtm.util.print(this);
        }
        return this;
    },

    plot: function () {
        if (isFunction(dtm.params.plotter)) {
            dtm.params.plotter.apply(this, [this].concat(argsToArray(arguments)));
        }
        return this;
    }
});

/* quantization and non-linear scaling */
dtm.data.augment({
    aliases: {
        pitchquantize: ['pq']
    },

    /**
     * Pitch quantize the array values. Shorthand: data.pq
     * @function module:data#pitchquantize
     * @param scale {array|dtm.data} A numerical or string (solfa -- e.g., 'do' or 'd' instead of 0) denoting the musical scale degrees.
     * @returns {dtm.data}
     */
    pitchquantize: function (scale) {
        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.pitchquantize(scale);
            });
        }

        if (isEmpty(scale)) {
            scale = dtm.gen('range', 12).get();
        } else if (isDtmArray(scale) && isNumOrFloat32Array(scale.get())) {
            scale = scale.get();
        } else if (isNumOrFloat32Array(scale)) {

        }

        return this.set(dtm.transform.pitchQuantize(this.val, scale));
    }
});

/* obsolete */
dtm.data.augment({

});

dtm.d = dtm.data;