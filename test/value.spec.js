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
});