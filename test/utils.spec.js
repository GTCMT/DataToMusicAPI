describe('isSingleVal', function () {
    it('should work', function () {
        expect(isSingleVal(123)).toBe(true);
        expect(isSingleVal('hey')).toBe(true);
        expect(isSingleVal(null)).toBe(false);
        expect(isSingleVal([1, 2, 3])).toBe(false);
    });
});

describe('isNumArray', function () {
    it('should work', function () {
        expect(isNumArray([1, 2, 3])).toBe(true);
        expect(isNumArray([1, 2, 'meow', 4])).toBe(false);
    });
});

describe('isStringArray', function () {
    it('should work', function () {
        expect(isStringArray(['hey', 'ho'])).toBe(true);
        expect(isStringArray(['hey', 1])).toBe(false);
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