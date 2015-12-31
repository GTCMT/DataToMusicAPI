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
});