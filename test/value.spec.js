describe('single value transformation', function () {
    describe('mtof', function () {
        it('should return 440 for input 69', function () {
            expect(dtm.value.mtof(69)).toBe(440);
        });

        it('should return 69 for input 440', function () {
            expect(dtm.value.ftom(440)).toBe(69);
            expect(dtm.value.ftom(880)).toBe(81);
            expect(dtm.value.ftom(220)).toBe(57);
        });

        it('should return about 262 for input 60', function () {
            expect(dtm.value.mtof(60)).toBeCloseTo(262, 0);
        });
    });

    describe('random', function () {
        it('should be within normal range', function () {
            var val = dtm.value.random();
            expect(val).toBeLessThan(1.000001);
            expect(val).toBeGreaterThan(-0.000001);
        });

        it('should be within the set range', function () {
            var val = dtm.value.random(1, 10);
            expect(val).toBeLessThan(10.000001);
            expect(val).toBeGreaterThan(1.0 - 0.000001);
        });

        it('should take the max range', function () {
            var val = dtm.value.random(100);
            expect(val).toBeLessThan(100.000001);
            expect(val).toBeGreaterThan(-0.000001);
        });
    });

    describe('pitch quantize', function () {
        it('should work with solfa array', function () {
            expect(dtm.value.pq(67, ['do', 'sol'])).toBe(67);
            expect(dtm.value.pq(67, ['do', 'fi'])).toBe(66);
            expect(dtm.value.pq(60, ['mi'])).toBe(64);
            expect(dtm.value.pq(71, ['te'])).toBe(70);
        });
    });

    describe('modulo', function () {
        it('should work with negative values', function () {
            expect(dtm.value.mod(4, 3)).toBe(1);
            expect(dtm.value.mod(-1, 3)).toBe(2);
            expect(dtm.value.mod(-2, 3)).toBe(1);
        })
    })
});