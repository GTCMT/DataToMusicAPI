describe('generator', function () {
    describe('initialization', function () {
        var g = dtm.gen();
        it('should be empty', function () {
            expect(g.get('typed')).toBe(true);
            expect(g.get('pack')).toBe(false);
            //expect(g.get()).toEqual(new Float32Array([]));
            expect(g.get('len')).toBe(8);
        });
    });

    describe('basic', function () {
        it('should return the set type', function () {
            var g = dtm.gen('saw');
            expect(g.get('type')).toBe('saw');
            expect(g.type('line').get('type')).toBe('line');
        });

        it('should return the set length', function () {
            var g = dtm.gen('line', 16);
            expect(g.get('len')).toBe(16);
            expect(g.len(10).get('len')).toBe(10);
            expect(g.len('abc').get('len')).toBe(10);
        });

        it('should set the minmax from an array', function () {
            var g = dtm.gen('line', 10, [1, 10]);
            expect(g.get('min')).toBe(1);
            expect(g.get('max')).toBe(10);
        })
    });

    describe('line', function () {
        it('should have the same len', function () {
            var g = dtm.gen('line', 20);
            expect(g.get().length).toBe(20);
        });

        it('should have the range of 0 - 1', function () {
            var g = dtm.gen('line', 20);
            var min = dtm.analyzer.min(g.get());
            var max = dtm.analyzer.max(g.get());
            expect(min).toBe(0);
            expect(max).toBe(1);
        });

        it('should start with x and end with y', function () {
            var g = dtm.gen('line', 10, 3, -5);
            expect(g.get()[0]).toBe(3);
            expect(g.get()[9]).toBe(-5);
        });
    });

    describe('random', function () {
        it('should be within the range', function () {
            var res = dtm.gen('random', 5, -3, 3).get();
            expect(dtm.analyzer.min(res)).not.toBeLessThan(-3);
            expect(dtm.analyzer.max(res)).not.toBeGreaterThan(3);
        });
    });

    describe('osc', function () {
        //console.log(dtm.gen('cos', 10, 1, 3).get());
    });

    xdescribe('series', function () {
        describe('fibonacci', function () {
            it('should work', function () {
                expect(dtm.gen('fibonacci', 10).get()).toEqual(new Float32Array([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]));
            });
        });
    });

    xdescribe('range', function () {
        it('should work', function () {
            expect(dtm.gen('range').get()).toEqual(new Float32Array([0, 1]));
            expect(dtm.gen('range', 0, 5).get()).toEqual(new Float32Array([0, 1, 2, 3, 4, 5]));
            expect(dtm.gen('range', 5, 0).get()).toEqual(new Float32Array([5, 4, 3, 2, 1, 0]));
            expect(dtm.gen('range', [0, 5]).get()).toEqual(new Float32Array([0, 1, 2, 3, 4, 5]));
        });
    });
});