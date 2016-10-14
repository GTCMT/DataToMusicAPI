describe('generator', function () {
    describe('initialization', function () {
        var g = dtm.gen();
        it('should be empty', function () {
            expect(g.get('typed')).toBe(true);
            expect(g.get('pack')).toBe(false);
            //expect(g.get()).toEqual(toFloat32Array([]));
        });
    });

    describe('basic', function () {
        //it('should return the set type', function () {
        //    var g = dtm.gen('saw');
        //    expect(g.get('type')).toBe('saw');
        //    expect(g.type('line').get('type')).toBe('line');
        //});

        it('should return the set length', function () {
            var g = dtm.gen('line', 16);
            expect(g.get('len')).toBe(16);
            expect(g.size(10).get('len')).toBe(10);
            expect(g.size('abc').get('len')).toBe(10);
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
            expect(g.get('len')).toBe(20);
        });

        it('should have the range of 0 to 1', function () {
            var g = dtm.gen('line', 20);
            var min = getMin(g.get());
            var max = getMax(g.get());
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
        it('should work', function () {
            expect(dtm.gen('random').get('len')).toBe(1);
            expect(dtm.gen('random').get(0)).not.toBeLessThan(0.0);
            expect(dtm.gen('random').get(0)).not.toBeGreaterThan(1.0);
        });

        xit('should be within the range', function () {
            var res = dtm.gen('random', 5, -3, 3).get();
            expect(getMin(res)).not.toBeLessThan(-3);
            expect(getMax(res)).not.toBeGreaterThan(3);
        });

        xit('should be work with negatives', function () {
            var res = dtm.gen('random', 5, -3, 0).get();
            expect(getMin(res)).not.toBeLessThan(-3);
            expect(getMax(res)).not.toBeGreaterThan(0);
        });
    });

    describe('randi', function () {
        it('should work', function () {
            expect(dtm.gen('randi').get('len')).toBe(1);
            expect(dtm.gen('randi').get(0)).not.toBeLessThan(0);
            expect(dtm.gen('randi').get(0)).not.toBeGreaterThan(1);

            expect(dtm.gen('randi', 1, 3).get('len')).toBe(1);
            expect(dtm.gen('randi', 1, 3).get(0)).not.toBeLessThan(0);
            expect(dtm.gen('randi', 1, 3).get(0)).not.toBeGreaterThan(2);

            expect(dtm.gen('randi', 1, 1, 3).get('len')).toBe(1);
            expect(dtm.gen('randi', 1, 1, 3).get(0)).not.toBeLessThan(1);
            expect(dtm.gen('randi', 1, 1, 3).get(0)).not.toBeGreaterThan(2);
        });
    });

    describe('osc', function () {
        describe('sine', function () {
            it('should offset phase', function () {
                expect(dtm.gen('sine').offset(0.25).get(0)).toBe(1.0);
            });
        });
        //console.log(dtm.gen('cos', 10, 1, 3).get());
    });

    describe('series', function () {
        // TODO: design
        xdescribe('sequence', function () {
            it('should work', function () {
                expect(dtm.gen('seq', 1, 5).get()).toEqual(toFloat32Array([1, 2, 3, 4, 5]));
                //expect(dtm.gen('seq', 1, 1).get()).toEqual(toFloat32Array([1]));
            });
        });

        // TODO: impelement
        xdescribe('sequence', function () {
            it('should generate 3, 5, 7, etc.', function () {
                var a = dtm.gen('seq', 8, 3, 2);
                expect(a.get(1) - a.get(0)).toBe(2);
            });
        });

        describe('range', function () {
            it('should work', function () {
                expect(dtm.gen('range').get()).toEqual(toFloat32Array([0]));

                // single arg
                expect(dtm.gen('range', 3).get()).toEqual(toFloat32Array([0, 1, 2]));
                expect(dtm.gen('range', -3).get()).toEqual(toFloat32Array([0, -1, -2]));
                expect(dtm.gen('range', 3.5).get()).toEqual(toFloat32Array([0, 1, 2, 3]));

                // 2 arg integer
                expect(dtm.gen('range', 1, 4).get()).toEqual(toFloat32Array([1, 2, 3]));
                expect(dtm.gen('range', 3, 0).get()).toEqual(toFloat32Array([3, 2, 1]));
                expect(dtm.gen('range', [1, 4]).get()).toEqual(toFloat32Array([1, 2, 3]));
                expect(dtm.gen('range', 0, -3).get()).toEqual(toFloat32Array([0, -1, -2]));
                expect(dtm.gen('range', 2, -2).get()).toEqual(toFloat32Array([2, 1, 0, -1]));

                expect(dtm.gen('range', 1.5, 4).get()).toEqual(toFloat32Array([1.5, 2.5, 3.5]));
                expect(dtm.gen('range', 0.5, -2).get()).toEqual(toFloat32Array([0.5, -0.5, -1.5]));
                expect(dtm.gen('range', 0, 1.5).get()).toEqual(toFloat32Array([0, 1]));
                expect(dtm.gen('range', 2, -1.5).get()).toEqual(toFloat32Array([2, 1, 0, -1]));

                // with intervals
                expect(dtm.gen('range', 0, 2, 0.5).get()).toEqual(toFloat32Array([0, 0.5, 1, 1.5]));
                expect(dtm.gen('range', 0, 2, 2).get()).toEqual(toFloat32Array([0]));
                expect(dtm.gen('range', 0, 3, 2).get()).toEqual(toFloat32Array([0, 2]));
                expect(dtm.gen('range', 0, -2, 0.5).get()).toEqual(toFloat32Array([0, -0.5, -1, -1.5]));
            });
        });

        describe('scale', function () {
            it('should work', function () {
                expect(dtm.gen('scale', 'major').get()).toEqual(toFloat32Array([0, 2, 4, 5, 7, 9, 11]));
                expect(dtm.gen('scale', 'major', 'C').get()).toEqual(toFloat32Array([0, 2, 4, 5, 7, 9, 11]));
                expect(dtm.gen('scale', 'major', 0).get()).toEqual(toFloat32Array([0, 2, 4, 5, 7, 9, 11]));
                expect(dtm.gen('scale', 'major', 6).get()).toEqual(toFloat32Array([1, 3, 5, 6, 8, 10, 11]));
                expect(dtm.gen('scale', 'minor').get()).toEqual(toFloat32Array([0, 2, 3, 5, 7, 8, 10]));
            });
        });

        describe('fibonacci', function () {
            it('should work', function () {
                expect(dtm.gen('fibonacci', 10).get()).toEqual(toFloat32Array([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]));
            });
        });
    });


    describe('array operations', function () {
        it('should expand or concat', function () {
            expect(dtm.gen('line', 3, 0, 2).concat([3, 4]).get()).toEqual(toFloat32Array([0, 1, 2, 3, 4]));
            expect(dtm.gen('line', 3, 0, 2).pad(0, 3).get()).toEqual(toFloat32Array([0, 1, 2, 0, 0, 0]));
        });
    });

    describe('range param', function () {
        it('should accept single values', function () {
            expect(dtm.gen('line', 3).range(10, 20).get()).toEqual(toFloat32Array([10, 15, 20]));
        });

        it('should accept an array for the range', function () {
            expect(dtm.gen('line', 3).range([10, 20]).get()).toEqual(toFloat32Array([10, 15, 20]));
        });

        it('should accept a dtm.array', function () {
            expect(dtm.gen('line', 3).range(dtm.a([10, 20])).get()).toEqual(toFloat32Array([10, 15, 20]));
        });
    });


    describe('constant', function () {
        it('should work with single values', function () {
            var a = dtm.gen('const', 3).size(4);
            expect(a.get('len')).toBe(4);
            a.forEach(function (v) {
                expect(v).toBe(3);
            });

            expect(dtm.gen('const', 'foo').get('len')).toBe(1);
        });

        it('should work with array-ish values', function () {
            dtm.gen('const', [1,2]).size(2).forEach(function (v) {
                expect(v).toEqual(toFloat32Array([1,2]));
            });
        });
    });

    describe('using dtm.gen functions with regular dtm.array', function () {
        it('should not set the length', function () {
            expect(dtm.a([1, 2, 3]).size(5).get('len')).toBe(3);
        });

        it('should ignore the type', function () {
            expect(dtm.a([1, 2, 3]).type('sine').get()).toEqual(toFloat32Array([1, 2, 3]));
        });
    });
});