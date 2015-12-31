describe('analyzer', function () {
    var input = [0, 2, 2, 3, 4, 4, 4, 5];

    describe('mean', function () {
        it('should be 2', function () {
            expect(dtm.analyzer.mean([1, 2, 3])).toBe(2);
        });
    });

    describe('mode', function () {
        var numOut = dtm.analyzer.mode([0, 2, 2, 3, 4, 4, 4, 5]);

        it('should return 4', function () {
            expect(numOut).toBe(4);
        });

        var strOut = dtm.analyzer.mode(['foo', 'bar', 'buz', 'buz']);

        it('should return buz', function () {
            expect(strOut).toBe('buz');
        });
    });

    describe('median', function () {
        it('should return 3.5', function () {
            var output = dtm.analyzer.median(input);
            expect(output).toBe(3.5);
        });
    });

    describe('midrange', function () {
        it('should return 2.5', function () {
            var output = dtm.analyzer.midrange(input);
            expect(output).toBe(2.5);
        });
    });

    describe('variance', function () {
        var output = dtm.analyzer.var(input);
    });

    describe('standard deviation', function () {
        var output = dtm.analyzer.std(input);
    });

    describe('population variance', function () {
        var output = dtm.analyzer.pvar(input);
    });

    describe('population standard deviation', function () {
        var output = dtm.analyzer.pstd(input);
    });

    describe('rms', function () {
        var output = dtm.analyzer.rms(input);
    });

    describe('unique', function () {
        it('should work', function () {
            expect(dtm.analyzer.unique([0, 1, 2, 3, 2, 1, 0])).toEqual([0, 1, 2, 3]);
        });
    });

    describe('classes', function () {
        it('should work', function () {
            expect(dtm.analyzer.classes([3, 2, 1, 0, -1, 0, 1, 2, 3])).toEqual([-1, 0, 1, 2, 3]);
            expect(dtm.analyzer.classes(['c', 'b', 'a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
        });
    });

    describe('histogram', function () {
        it('should work', function () {
            expect(dtm.analyzer.histo([1, 2, 2, 3, 4, 4, 4])).toEqual([1, 2, 2, 1, 3, 3, 3]);
        });
    });

    describe('countBy', function () {
        it('should work', function () {
            expect(dtm.analyzer.countBy([1, 2, 2, 3, 4, 4, 4])).toEqual({
                '1': 1,
                '2': 2,
                '3': 1,
                '4': 3
            });
        });
    });

    describe('uniformity', function () {
        var output = dtm.analyzer.uniformity(input);
    });
});