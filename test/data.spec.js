describe('dtm.data', function () {
    var D = dtm.data;
    var tf32 = toFloat32Array;
    var arr = [1,2,3];

    describe('basics', function () {
        it('should set and get', function () {
            expect(D().set(arr).val).toEqual(tf32(arr));
            expect(D().set(arr).length).toBe(3);
        });
        it('data obj should be callable as setter', function () {
            expect(D(arr).val).toEqual(tf32(arr));
        });
    });

    describe('accessor module', function () {
        it('single fractional index', function () {
            expect(D(arr).interpolate(0.5).val).toEqual(tf32(1.5));
        });

        it('fractional indices array', function () {
            expect(D(arr).interpolate([0.5,1.5]).val).toEqual(tf32([1.5,2.5]));
        });
    });

    describe('scalars', function () {
        describe('range', function () {
            it('should normalize and rescale', function () {
                expect(D(arr).range(0,10).val).toEqual(tf32([0,5,10]));
            });

            it('should work with the aliase "r"', function () {
                expect(D(arr).r(0,10).val).toEqual(tf32([0,5,10]));
            });
        });

        describe('normalize', function () {
            it('fit to 0-1 without arguments', function () {
                expect(D(arr).normalize().val).toEqual(tf32([0,0.5,1]));
            });

            it('fit to 0-0.5 with domain values', function () {
                expect(D(arr).normalize(1,5).val).toEqual(tf32([0,0.25,0.5]));
            });

            it('should work with aliase "n"', function () {
                expect(D(arr).n().val).toEqual(tf32([0,0.5,1]));
            })
        });
    });

    // describe('interleave', function () {
    //     var a, b;
    //     beforeEach(function () {
    //         a = dtm.data(1,2,3,4);
    //         b = dtm.data(5);
    //     });
    //
    //     it('example 1', function () {
    //         expect(a.interleave(b).get()).toEqual(tf32([1,5,2,5,3,5,4,5]));
    //     });
    //
    //     it('example 2', function () {
    //         expect(a.interleave(b,2).get()).toEqual(tf32([1,2,5,3,4,5]));
    //     });
    //
    //     it('example 3', function () {
    //         expect(a.interleave(b,1,3).get()).toEqual(tf32([1,5,5,5,2,5,5,5,3,5,5,5,4,5,5,5]));
    //     });
    // });
});