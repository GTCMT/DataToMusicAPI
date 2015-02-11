describe('array object', function () {
    describe('get', function () {
        it('should return the array value', function () {
            var a = dtm.array([1,2,3]);
            expect(a.get().toString()).toBe([1,2,3].toString());
        });

        describe('name', function () {
            it('should return the given name', function () {
                var name = 'hello';
                var a = dtm.array([1, 2, 3], name);
                expect(a.get('name')).toBe(name);
            });
        });

        describe('type', function () {
            it('should return the type number', function () {
                var a = dtm.array([1, 2, 3]);
                expect(a.get('type')).toBe('number');
            });

            it('should return the type string', function () {
                var a = dtm.array(['a', 'b', 'c']);
                expect(a.get('type')).toBe('string');
            });
        });

        describe('length', function () {
            it('should return 3', function () {
                var a = dtm.array([1, 2, 3]);
                expect(a.get('len')).toBe(3);
            });
        });

        describe('original', function () {
            it('should return the original after transformation', function () {
                var a = dtm.array([1, 2, 3]).rescale(0, 100);
                expect(a.get('original').toString()).toBe([1, 2, 3].toString());
            });
        });
    });
});