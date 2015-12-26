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

describe('isNumArray', function () {
    it('should work', function () {
        expect(isNumArray([1, 2, 3])).toBe(true);
        expect(isNumArray([1, 2, 'meow', 4])).toBe(false);
    });
});

describe('isFloat32Array', function () {
    it('should work', function () {
        expect(isFloat32Array(new Float32Array([1, 2, 3]))).toBe(true);
    });
});

describe('isStringArray', function () {
    it('should work', function () {
        expect(isStringArray(['hey', 'ho'])).toBe(true);
        expect(isStringArray(['hey', 1])).toBe(false);
    });
});

describe('isDtmArray', function () {
    it('should work', function () {
        expect(isDtmArray(dtm.a())).toBe(true);
        expect(isDtmArray(dtm.a([1,2,3]))).toBe(true);
        expect(isDtmArray(dtm.gen('sine'))).toBe(true);
        expect(isDtmArray([1,2,3])).toBe(false);
    });
});

describe('argsToArray', function () {
    it('should work', function () {
        expect((function () {
            return argsToArray(arguments)
            })(1, 2, 3)).toEqual([1, 2, 3]);
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
        })(1, [2], 3)).toBe(false);
    });
});

describe('objForEach', function () {
    it('should work', function () {
        objForEach({foo: 123, bar: 456}, function (val, key) {

        });
    });
});