describe('guido', function () {
    describe('pitch sym to note num', function () {
        it('should return 60', function () {
            expect(dtm.guido.pitchToNn('c1')).toBe(60);
        });

        it('should return 66', function () {
            expect(dtm.guido.pitchToNn('f#1')).toBe(66);
        });

        it('should return 41', function () {
            expect(dtm.guido.pitchToNn('f-1')).toBe(41);
        });

        it('should return the original value', function () {
            var nn = Math.round(Math.random() * 120);
            expect(dtm.guido.pitchToNn(dtm.guido.nnToPitch(nn))).toBe(nn);
        });
    });

    describe('note num to pitch sym', function () {
        it('should return c1', function () {
            expect(dtm.guido.nnToPitch(60)).toBe('c1');
        });
    });
});