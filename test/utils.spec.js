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
        expect(isMixedArray([dtm.a([1,2,3])])).toBe(true);
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
        expect(isNestedWithDtmArray([[1,2,3]])).toBe(false);
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

describe('isDtmArray', function () {
    it('should work', function () {
        expect(isDtmArray(dtm.a())).toBe(true);
        expect(isDtmArray(dtm.a([1,2,3]))).toBe(true);
        expect(isDtmArray(dtm.gen('sine'))).toBe(true);
        expect(isDtmArray([1,2,3])).toBe(false);
        expect(isDtmArray([dtm.a([1,2,3])])).toBe(false);
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
        expect(toFloat32Array(undefined)).toBe(undefined);
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

describe('cloneArray', function () {
    it('should work', function () {
        expect(cloneArray([1,2,3])).toEqual([1,2,3]);
        expect(cloneArray(new Float32Array([1,2,3]))).toEqual(new Float32Array([1,2,3]));
    });
});