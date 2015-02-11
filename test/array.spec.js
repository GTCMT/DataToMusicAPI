describe('array object', function () {
    describe('get', function () {
        it('should return the array value', function () {
            var a = dtm.array([1,2,3]);
            expect(a.get().toString()).toBe([1,2,3].toString());
        });

        describe('name', function () {
            var name = 'hello';
            var a = dtm.array([1, 2, 3], name);
            it('should return the given name', function () {
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
            var a = dtm.array([1, 2, 3]);
            it('should return 3', function () {
                expect(a.get('len')).toBe(3);
            });
        });

        describe('original', function () {
            var a = dtm.array([1, 2, 3]).rescale(0, 100);
            it('should return the original after transformation', function () {
                expect(a.get('original').toString()).toBe([1, 2, 3].toString());
            });
        });

        describe('normalized', function () {
            var a = dtm.array([1, 2, 3]);
            it('should have max 1 and min 0', function () {
                expect(a.get('normalized').sort()[0]).toBe(0);
                expect(a.get('normalized').sort()[2]).toBe(1);
            });
        });

        describe('shorted', function () {
            var a = dtm.array([3, 1, 2]);
            it('should return [1, 2, 3]', function () {
                expect(a.get('sorted').toString()).toBe([1, 2, 3].toString());
            });

            var b = dtm.array('hey');
            it('should return e h y', function () {
                expect(b.get('sorted').toString()).toBe(['e', 'h', 'y'].toString());
            });
        });

        describe('min', function () {
            var a = dtm.array('hello');
            it('should', function () {
                expect(a.get('min')).toBe(null);
            });
        });

        describe('mode', function () {
            var a = dtm.array('hello world!');
            it('should return l', function () {
                expect(a.get('mode')).toBe('l');
            });
        });

        describe('histo', function () {
            var a = dtm.array('hello world!');
            it('should return 3 ls', function () {
                expect(a.get('histo')[2]).toBe(3);
            });
            it('should not change the content', function () {
                expect(a.get().join('')).toBe('hello world!');
            });
        });

        describe('classes', function () {
            var a = dtm.array('hello world!');
            it('should return unique classes', function () {
                expect(a.get('classes').length).toBe(9);
            });
        });

        describe('numClasses', function () {
            var a = dtm.array('hello world!');
            it('should return 9', function () {
                expect(a.get('numClasses')).toBe(9);
            });
        });

        describe('unique', function () {
            var a = dtm.array([1, 2, 3, 2, 1]);
            it('should return [1, 2, 3]', function () {
                expect(a.get('unique').toString()).toBe([1, 2, 3].toString());
            });
        });
    });

    describe('histogram', function () {
        var a = dtm.array('hello world!').histo();
        it('should return 3 ls', function () {
            expect(a.get()[2]).toBe(3);
        });
    });

    describe('unique', function () {
        var a = dtm.array([1, 2, 3, 2, 1]).unique();
        it('should return [1, 2, 3]', function () {
            expect(a.get().toString()).toBe([1, 2, 3].toString());
        });
    });
});