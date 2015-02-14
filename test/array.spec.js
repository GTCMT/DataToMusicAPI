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

        describe('block', function () {
            var a = dtm.array().fill('seq', 10);
            it('should return the first 3 items', function () {
                expect(a.get('block', [3, 3]).length).toBe(3);
            });
        });
    });

    describe('generater', function () {
        describe('sequence', function () {
            it('should generate 3, 5, 7, etc.', function () {
                var a = dtm.array().fill('seq', 8, 3, 2);
                expect(a.get(1) - a.get(0)).toBe(2);
            });
        });

        describe('constant', function () {
            it('should return the same value anywhere', function () {
                var a = dtm.array().fill('const', 4, 3);
                expect(a.get(dtm.val.randi(0, 3))).toBe(3);
            });
        });
    });

    describe('nominal operations', function () {
        describe('histogram', function () {
            var a = dtm.array('hello world!').histo();
            it('should return 3 ls', function () {
                expect(a.get()[2]).toBe(3);
            });
        });
    });

    describe('list operations', function () {
        describe('unique', function () {
            var a = dtm.array([1, 2, 3, 2, 1]).unique();
            it('should return [1, 2, 3]', function () {
                expect(a.get().toString()).toBe([1, 2, 3].toString());
            });
        });

        describe('limit', function () {
            var a = dtm.array([1, 3, 5, 7, 9]);
            var min = 2;
            var max = 6;
            a.limit(min, max);
            it('should have min=2 and max=6', function () {
                expect(a.get('min')).toBe(min);
                expect(a.get('max')).toBe(max);
            });
        });
    });

    describe('scalers', function () {
        describe('normalize', function () {
            it('should return 1s for ones', function () {
                var a = dtm.array().fill('ones');
                a.normalize();
                expect(a.get('sum')).toBe(8);
            });

            it('should return 0s for zeros', function () {
                var a = dtm.array().fill('zeros');
                a.normalize();
                expect(a.get('sum')).toBe(0);
            });

            it('should return 0s for minuses', function () {
                var a = dtm.array().fill('zeros').add(-.5);
                a.normalize();
                expect(a.get('sum')).toBe(0);
            });

            it('should return 1s for repeated big values', function () {
                var a = dtm.array().fill('zeros').add(3);
                a.normalize();
                expect(a.get('sum')).toBe(8);
            });

            it('should return raw values for repeated values between 0-1', function () {
                var a = dtm.array().fill('zeros').add(0.5);
                a.normalize();
                expect(a.get('sum')).toBe(4);
            });
        });

        describe('rescale', function () {
            it('should...', function () {
                var a = dtm.a(0.5).rescale(0, 100);
                //console.log(a.get());
            });
        });
    });

    
    describe('getBlock', function () {
        //var a = dtm.a().fill('seq', 8, )
    });
});