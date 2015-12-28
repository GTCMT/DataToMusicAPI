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

        it('should set the range from an array', function () {
            var g = dtm.gen('line', 10, [1, 10]);
            expect(g.get('min')).toBe(1);
            expect(g.get('max')).toBe(10);
        });

        // TODO: implement
        xit('should set the range from a dtm.array', function () {
            var g = dtm.gen('line', 10, dtm.a([1, 10]));
            expect(g.get('min')).toBe(1);
            expect(g.get('max')).toBe(10);
        });
    });

    describe('line', function () {
        it('should have the same len', function () {
            var g = dtm.gen('line', 20);
            expect(g.get().length).toBe(20);
        });

        it('should have the range of 0 to 1', function () {
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

        it('should be able to set the range', function () {
            var g = dtm.gen('line').range(0, 10);
            expect(g.get('min')).toBe(0);
            expect(g.get('max')).toBe(10);
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
        describe('sine', function () {

        });
        //console.log(dtm.gen('cos', 10, 1, 3).get());
    });

    describe('series', function () {
        // TODO: design
        xdescribe('sequence', function () {
            it('should work', function () {
                expect(dtm.gen('seq', 1, 5).get()).toEqual(new Float32Array([1, 2, 3, 4, 5]));
                //expect(dtm.gen('seq', 1, 1).get()).toEqual(new Float32Array([1]));
            });
        });

        // TODO: impelement
        xdescribe('sequence', function () {
            it('should generate 3, 5, 7, etc.', function () {
                var a = dtm.gen('seq', 8, 3, 2);
                expect(a.get(1) - a.get(0)).toBe(2);
            });
        });

        // should the end value be inclusive???
        xdescribe('range', function () {
            it('should work', function () {
                expect(dtm.gen('range').get()).toEqual(new Float32Array([0, 1]));
                expect(dtm.gen('range', 0, 5).get()).toEqual(new Float32Array([0, 1, 2, 3, 4, 5]));
                expect(dtm.gen('range', 5, 0).get()).toEqual(new Float32Array([5, 4, 3, 2, 1, 0]));
                expect(dtm.gen('range', [0, 5]).get()).toEqual(new Float32Array([0, 1, 2, 3, 4, 5]));

                expect(dtm.gen('range', 0, 1.5).get()).toEqual(new Float32Array([0, 1]));
            });
        });

        describe('fibonacci', function () {
            it('should work', function () {
                expect(dtm.gen('fibonacci', 10).get()).toEqual(new Float32Array([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]));
            });
        });
    });


    describe('array operations', function () {
        it('should expand or concat', function () {
            expect(dtm.gen('line', 3, 0, 2).concat([3, 4]).get()).toEqual(new Float32Array([0, 1, 2, 3, 4]));
            expect(dtm.gen('line', 3, 0, 2).pad(0, 3).get()).toEqual(new Float32Array([0, 1, 2, 0, 0, 0]));
        });
    });

    describe('range param', function () {
        it('should accept single values', function () {
            expect(dtm.gen('line', 3).range(10, 20).get()).toEqual(new Float32Array([10, 15, 20]));
        });

        it('should accept an array for the range', function () {
            expect(dtm.gen('line', 3).range([10, 20]).get()).toEqual(new Float32Array([10, 15, 20]));
        });

        it('should accept a dtm.array', function () {
            expect(dtm.gen('line', 3).range(dtm.a([10, 20])).get()).toEqual(new Float32Array([10, 15, 20]));
        });
    });


    describe('constant', function () {
        it('should return the same value anywhere', function () {
            var a = dtm.gen('const', 4, 3);
            expect(a.get(dtm.val.randi(0, 3))).toBe(3);
        });
    });

    describe('using dtm.gen functions with regular dtm.array', function () {
        it('should not set the length', function () {
            expect(dtm.a([1, 2, 3]).len(5).get('len')).toBe(3);
        });

        it('should ignore the type', function () {
            expect(dtm.a([1, 2, 3]).type('sine').get()).toEqual([1, 2, 3]);
        });
    });
});