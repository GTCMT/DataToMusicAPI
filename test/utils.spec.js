describe('isEmpty', function () {
    it('should work', function () {
        expect(isEmpty()).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(NaN)).toBe(true);
        expect(isEmpty(1)).toBe(false);
        expect(isEmpty('')).toBe(false);
        expect(isEmpty([])).toBe(false);
        expect(isEmpty({})).toBe(false);
    });
});

describe('isNumber', function () {
    it('should work', function () {
        expect(isNumber(1)).toBe(true);
        expect(isNumber('1')).toBe(false);
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
        expect(isNumber(null)).toBe(false);

        expect(isNumber(Infinity)).toBe(true);
        expect(isNumber(-Infinity)).toBe(true);
    });
});

describe('isInteger', function () {
    it('should work', function () {
        expect(isInteger(1)).toBe(true);
        expect(isInteger(1.0)).toBe(true);
        expect(isInteger(1.5)).toBe(false);
        expect(isInteger('1')).toBe(false);
        expect(isInteger(null)).toBe(false);
        expect(isInteger([1])).toBe(false);
    });
});

//describe('isFloat', function () {
//    it('should work', function () {
//        expect(isFloat(1.5)).toBe(true);
//        expect(isFloat(1.0)).toBe(true);
//        expect(isFloat(1)).toBe(false);
//        expect(isFloat('1.5')).toBe(false);
//        expect(isFloat(null)).toBe(false);
//        expect(isFloat([1.5])).toBe(false);
//    });
//});

describe('isSingleVal', function () {
    it('should work', function () {
        expect(isSingleVal(123)).toBe(true);
        expect(isSingleVal('hey')).toBe(true);
        expect(isSingleVal(undefined)).toBe(false);
        expect(isSingleVal(null)).toBe(false);
        expect(isSingleVal([1, 2, 3])).toBe(false);
        expect(isSingleVal(dtm.array([1, 2, 3]))).toBe(false);
        expect(isSingleVal(function(){})).toBe(false);
    });
});

describe('isObject', function () {
    it('should work', function () {
        expect(isObject({})).toBe(true);
        expect(isObject(123)).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
    });
});

describe('isBoolean', function () {
    it('should work', function () {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean(123)).toBe(false);
        expect(isBoolean('123')).toBe(false);
        expect(isBoolean([1,2,3])).toBe(false);
        expect(isBoolean(undefined)).toBe(false);
        expect(isBoolean(null)).toBe(false);
    });
});

describe('isFunction', function () {
    it('should work', function () {
        expect(isFunction(function(){})).toBe(true);
        expect(isFunction(1)).toBe(false);
        expect(isFunction('1')).toBe(false);
        expect(isFunction(null)).toBe(false);
        expect(isFunction(undefined)).toBe(false);
    });
});

describe('isPromise', function () {
    it('should work', function () {
        var foo = new Promise(function (resolve) { resolve(123); });
        expect(isPromise(foo)).toBe(true);
        foo.then(function (v) {
            //expect(isPromise(foo)).toBe(false);
        });
    });
});

describe('isArray', function () {
    it('should be all-inclusive', function () {
        expect(isArray([1, 2, 3])).toBe(true);
        expect(isArray(['foo', 'bar'])).toBe(true);
        expect(isArray(toFloat32Array([1, 2, 3]))).toBe(true);
        expect(isArray([dtm.a([1,2,3])])).toBe(true);
        expect(isArray([[1], [2], [3]])).toBe(true);

        expect(isArray(dtm.a([1,2,3]))).toBe(false);
        expect(isArray(1)).toBe(false);
        expect(isArray(undefined)).toBe(false);
        expect(isArray({})).toBe(false);
    });
});

describe('isNumArray', function () {
    it('should work', function () {
        expect(isNumArray([1, 2, 3])).toBe(true);
        expect(isNumArray([1, 2, 'meow', 4])).toBe(false);
        expect(isNumArray(new Float32Array([1, 2, 3]))).toBe(false);
        expect(isNumArray([])).toBe(false);
    });
});

describe('isFloat32Array', function () {
    it('should work', function () {
        expect(isFloat32Array(new Float32Array([1, 2, 3]))).toBe(true);
        expect(isFloat32Array([1, 2, 3])).toBe(false);
        expect(isFloat32Array(new Float32Array([]))).toBe(false);
    });
});

describe('isNumOrFloat32Array', function () {
    it('should work', function () {
        expect(isNumOrFloat32Array([1, 2, 3])).toBe(true);
        expect(isNumOrFloat32Array(toFloat32Array([1, 2, 3]))).toBe(true);
        expect(isNumOrFloat32Array(dtm.a([1,2,3]))).toBe(false);
        expect(isNumOrFloat32Array([dtm.a([1,2,3])])).toBe(false);
    });
});

describe('isStringArray', function () {
    it('should work', function () {
        expect(isStringArray(['hey', 'ho'])).toBe(true);
        expect(isStringArray(['hey', 1])).toBe(false);
        expect(isStringArray([dtm.a('hey')])).toBe(false);
    });
});

describe('isMixedArray', function () {
    it('should work', function () {
        expect(isMixedArray([1, '2'])).toBe(true);
        expect(isMixedArray([dtm.a([1,2,3])])).toBe(false);
    });
});

describe('isNestedArray', function () {
    it('should work', function () {
        expect(isNestedArray([1, 2, 3])).toBe(false);
        expect(isNestedArray([1, [2], 3])).toBe(true);
        expect(isNestedArray([1, [2, 3]])).toBe(true);
        expect(isNestedArray([[1]])).toBe(true);
        expect(isNestedArray([toFloat32Array([1,2,3])])).toBe(true);
    });

    it('should treat dtm.array as an object, not array', function () {
        expect(isNestedArray([dtm.array([1,2,3])])).toBe(false);
    });
});

describe('isNestedWithDtmArray', function () {
    it('should work', function () {
        expect(isNestedWithDtmArray([dtm.array([1,2,3])])).toBe(true);
        //expect(isNestedWithDtmArray([[dtm.array([1,2,3])]])).toBe(true);
        expect(isNestedWithDtmArray([[1,2,3]])).toBe(false);
    });
});

describe('getMaxArrayDepth', function () {
    it('should work', function () {
        expect(getMaxArrayDepth(0)).toBe(0);
        expect(getMaxArrayDepth([0])).toBe(1);
        expect(getMaxArrayDepth([0, 1])).toBe(1);
        expect(getMaxArrayDepth([[0], 1])).toBe(2);
        expect(getMaxArrayDepth([[0], [1]])).toBe(2);
        expect(getMaxArrayDepth([[0], [1, [2]]])).toBe(3);
        expect(getMaxArrayDepth([[0], [1, [2, [3]]]])).toBe(4);
        expect(getMaxArrayDepth([[0], [1, [2, [3, 4]]]])).toBe(4);
    });
});

describe('getMaxDepth', function () {
    it('should work with mixed Array and dtm.array', function () {
        expect(getMaxDepth(0)).toBe(0);
        expect(getMaxDepth(dtm.a(0))).toBe(1);
        expect(getMaxDepth([0])).toBe(1);
        expect(getMaxDepth([dtm.a(0)])).toBe(2);
        expect(getMaxDepth(dtm.a([0], [1]))).toBe(2);
        expect(getMaxDepth(dtm.a(dtm.a(0), [1]))).toBe(2);
        expect(getMaxDepth([dtm.a([0], [1])])).toBe(3);
        expect(getMaxDepth(dtm.a(dtm.a([0], [1]), [1]))).toBe(3);
        expect(getMaxDepth(dtm.a(dtm.a(dtm.a([0], [1]), [1]), [1]))).toBe(4);
    });
});

describe('hasMissingValues', function () {
    it('should work', function () {
        expect(hasMissingValues([1, 2, 3])).toBe(false);
        expect(hasMissingValues([1, undefined, 3])).toBe(true);
        expect(hasMissingValues([1, null, 3])).toBe(true);
        expect(hasMissingValues([1, NaN, 3])).toBe(true);
    });
});

xdescribe('objCompare', function () {
    it('should work with shallow objects', function () {
        expect(objCompare({}, {})).toBe(true);
    });
});

describe('isDtmArray', function () {
    it('should work', function () {
        expect(isDtmArray(dtm.a())).toBe(true);
        expect(isDtmArray(dtm.a([1,2,3]))).toBe(true);
        expect(isDtmArray(dtm.gen('sine'))).toBe(true);
        expect(isDtmArray([1,2,3])).toBe(false);
        expect(isDtmArray([dtm.a([1,2,3])])).toBe(false);
    });
});

describe('isNestedDtmArray', function () {
    it('should work', function () {
        expect(isNestedDtmArray([])).toBe(false);
        expect(isNestedDtmArray(dtm.a([1,2,3]))).toBe(false);
        expect(isNestedDtmArray(dtm.a([1,2,3], [4,5,6]))).toBe(true);
        expect(isNestedDtmArray(dtm.a([[1,2,3], [4,5,6]]))).toBe(true);
        expect(isNestedDtmArray(dtm.a([dtm.a([1,2,3])]))).toBe(true);
        expect(isNestedDtmArray(dtm.a([dtm.a([1,2,3]), dtm.a([4,5,6])]))).toBe(true);
        expect(isNestedDtmArray(dtm.a(dtm.a([1,2,3]), dtm.a([4,5,6])))).toBe(true);
    });
});

describe('isNumDtmArray', function () {
    it('should work', function () {
        expect(isNumDtmArray(dtm.a())).toBe(false);
        expect(isNumDtmArray(dtm.a([1,2,3]))).toBe(true);
        expect(isNumDtmArray(dtm.a([1,2,3], [4,5,6]))).toBe(false);
    });
});

describe('isNestedDtmArray', function () {
    it('should work', function () {
        expect(isNestedNumDtmArray(dtm.a([1,2,3]))).toBe(false);
        expect(isNestedNumDtmArray(dtm.a([1,2,3], [4,5,6]))).toBe(true);
    });
});

describe('argsToArray', function () {
    it('should work', function () {
        expect((function () {
            return argsToArray(arguments)
        })(1, 2, 3)).toEqual([1, 2, 3]);

        expect((function () {
            return argsToArray(arguments)
        })(1, null, 3)).toEqual([1, null, 3]);

        expect((function () {
            return argsToArray(arguments)
        })()).toEqual([]);

        expect((function () {
            return argsToArray(arguments)
        })(null)).toEqual([null]);
    });
});

describe('argsForEach', function () {
    it('should work', function () {
        expect((function () {
            argsForEach(arguments, function (v, i) {
                expect(v).toBe(i);
            });
        })(0, 1, 2));
    });
});

describe('argIsSingleArray', function () {
    it('should work', function () {
        expect((function () {
            return argIsSingleArray(arguments);
        })([1, 2, 3])).toBe(true);

        expect((function () {
            return argIsSingleArray(arguments);
        })(1, 2, 3)).toBe(false);

        expect((function () {
            return argIsSingleArray(arguments);
        })([1, 2], 3)).toBe(false);

        expect((function () {
            return argIsSingleArray(arguments);
        })([1], 2, 3)).toBe(false);

        expect((function () {
            return argIsSingleArray(arguments);
        })(dtm.a(1), 2, 3)).toBe(false);

        expect((function () {
            return argIsSingleArray(arguments);
        })()).toBe(false);
    })
});

describe('argsAreSingleVals', function () {
    it('should work', function () {
        expect((function () {
            return argsAreSingleVals(arguments);
        })(1, 2, 3)).toBe(true);

        expect((function () {
            return argsAreSingleVals(arguments);
        })([1, 2, 3])).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(toFloat32Array([1, 2, 3]))).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(1, [2], 3)).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(toFloat32Array(1), 2, 3)).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(toFloat32Array(1))).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(dtm.a(1), 2, 3)).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(dtm.a(1))).toBe(false);

        expect((function () {
            return argsAreSingleVals(arguments);
        })(1)).toBe(true);

        expect((function () {
            return argsAreSingleVals(arguments);
        })('hey')).toBe(true);

        //expect((function () {
        //    return argsAreSingleVals(arguments);
        //})()).toBe(false);
    });
});

describe('objForEach', function () {
    it('should work', function () {
        objForEach({foo: 123, bar: 456}, function (val, key) {
            expect(isNumber(val)).toBe(true);
            expect(key === 'foo' || key === 'bar').toBe(true);
        });
    });
});

describe('numProperties', function () {
    it('should work', function () {
        expect(numProperties({foo: 123, bar: 456})).toBe(2);
        expect(numProperties({})).toBe(0);
    });
});

describe('toFloat32Array', function () {
    it('should work', function () {
        expect(toFloat32Array(1)).toEqual(new Float32Array([1]));
        expect(toFloat32Array([1, 2, 3])).toEqual(new Float32Array([1, 2, 3]));
        expect(toFloat32Array(dtm.a([1, 2, 3]))).toEqual(new Float32Array([1, 2, 3]));
        expect(toFloat32Array(dtm.gen('range', 1, 4))).toEqual(new Float32Array([1, 2, 3]));
        expect(toFloat32Array(undefined)).toBe(null);
    });
});

describe('Float32Splice', function () {
    it('should work', function () {
        expect(Float32Splice(new Float32Array([1,2,3]), 2)).toEqual(toFloat32Array(3));
    });
});

describe('concat', function () {
    it('should work with both numArray and Float32Array', function () {
        expect(concat([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
        expect(concat(toFloat32Array([1, 2]), [3, 4])).toEqual(toFloat32Array([1, 2, 3, 4]));
        expect(concat([1, 2], toFloat32Array([3, 4]))).toEqual(toFloat32Array([1, 2, 3, 4]));

        expect(concat([], toFloat32Array([1, 2]))).toEqual(toFloat32Array([1, 2]));
    });
});

describe('truncateDigits', function () {
    it('should work', function () {
        expect(truncateDigits(1.00000000001)).toBe(1.0);
    });
});

describe('Float32Map', function () {
    it('should work', function () {
        expect(Float32Map(toFloat32Array([1,2,3]), function (v) { return v * 2; })).toEqual(toFloat32Array([2,4,6]));
    });
});

describe('deferCallback', function () {
    var res = [];

    function normal (a) {
        res.push(a);
    }
    function deferThis(a) {
        res.push(a);
    }

    var deferred = deferCallback(deferThis, 0);

    deferred(0);
    normal(1);
    it('should work', function (done) {
        setTimeout(function () {
            expect(res).toEqual([1, 0]);
            done();
        }, 1);
    });
});

describe('clone', function () {
    //it('should work with dtm.array', function () {
    //    var src = dtm.a([1,2,3]);
    //    var cloned = clone(src);
    //    src.mult(2);
    //    expect(cloned.get()).toEqual(toFloat32Array([1,2,3]));
    //    expect(src.get()).toEqual(toFloat32Array([2,4,6]));
    //});
});

describe('cloneArray', function () {
    it('should work', function () {
        expect(cloneArray([1,2,3])).toEqual([1,2,3]);
        expect(cloneArray(toFloat32Array([1,2,3]))).toEqual(toFloat32Array([1,2,3]));
    });
});


describe('analysis functions', function () {
    var input = [0, 2, 2, 3, 4, 4, 4, 5];

    describe('mean', function () {
        it('should be 2', function () {
            expect(mean([1, 2, 3])).toBe(2);
        });
    });

    describe('mode', function () {
        var numOut = mode([0, 2, 2, 3, 4, 4, 4, 5]);

        it('should return 4', function () {
            expect(numOut).toBe(4);
        });

        var strOut = mode(['foo', 'bar', 'buz', 'buz']);

        it('should return buz', function () {
            expect(strOut).toBe('buz');
        });
    });

    describe('median', function () {
        it('should return 3.5', function () {
            var output = median(input);
            expect(output).toBe(3.5);
        });
    });

    describe('midrange', function () {
        it('should return 2.5', function () {
            var output = midrange(input);
            expect(output).toBe(2.5);
        });
    });

    describe('variance', function () {
        var output = variance(input);
    });

    describe('standard deviation', function () {
        var output = std(input);
    });

    describe('population variance', function () {
        var output = pvar(input);
    });

    describe('population standard deviation', function () {
        var output = pstd(input);
    });

    describe('rms', function () {
        var output = rms(input);
    });

    describe('unique', function () {
        it('should work', function () {
            expect(unique([0, 1, 2, 3, 2, 1, 0])).toEqual([0, 1, 2, 3]);
        });
    });

    describe('listClasses', function () {
        it('should work', function () {
            expect(listClasses([3, 2, 1, 0, -1, 0, 1, 2, 3])).toEqual([-1, 0, 1, 2, 3]);
            expect(listClasses(['c', 'b', 'a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
        });
    });

    describe('histogram', function () {
        it('should work', function () {
            expect(histo([1, 2, 2, 3, 4, 4, 4])).toEqual([1, 2, 2, 1, 3, 3, 3]);
        });
    });

    describe('countBy', function () {
        it('should work', function () {
            expect(countBy([1, 2, 2, 3, 4, 4, 4])).toEqual({
                '1': 1,
                '2': 2,
                '3': 1,
                '4': 3
            });
        });
    });

    describe('uniformity', function () {
        var output = uniformity(input);
    });
});