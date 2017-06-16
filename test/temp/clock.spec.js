describe('clock', function () {
    describe('get', function () {
        var c = dtm.clock(120, 16);

        xdescribe('bpm', function () {
            it('should return 120', function () {
                expect(c.get('bpm')).toBe(120);
            });
        });

        describe('subdiv', function () {
            it('should return 16', function () {
                expect(c.get('subdiv')).toBe(16);
            });
        });

        describe('sync', function () {
            it('should return false', function () {
                expect(c.get('sync')).toBe(false);
            });
        });
    });
});