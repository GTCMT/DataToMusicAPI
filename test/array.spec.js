describe('array object', function () {
    describe('get', function () {
        describe('default', function () {
            it('should return the array value', function () {
                var a = dtm.array([1,2,3]);
                expect(a.get()).toEqual([1,2,3]);
            });
        });

        describe('name', function () {
            var name = 'hello';
            var a = dtm.array([1, 2, 3]).name(name);
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

            var b = dtm.array('s', 'hey');
            it('should return e h y', function () {
                expect(b.get('sorted').toString()).toBe(['e', 'h', 'y'].toString());
            });
        });

        describe('min', function () {
            var a = dtm.array('hello');
            it('should return a null', function () {
                expect(a.get('min')).toBe(null);
            });
        });

        describe('rms', function () {
            var a = dtm.array([1, 2, 3]);
            it('should return sqrt of 14', function () {
                expect(a.get('rms')).toBeCloseTo(2.16, 2);
            });
        });

        describe('mode', function () {
            var a = dtm.array('s', 'hello world!');
            it('should return l', function () {
                expect(a.get('mode')).toBe('l');
            });
        });

        describe('histo', function () {
            var a = dtm.array('s', 'hello world!');
            it('should return 3 ls', function () {
                expect(a.get('histo')[2]).toBe(3);
            });
            it('should not change the content', function () {
                expect(a.get().join('')).toBe('hello world!');
            });
        });

        describe('classes', function () {
            var a = dtm.array('s', 'hello world!');
            it('should return unique classes', function () {
                expect(a.get('classes').length).toBe(9);
            });
        });

        describe('numClasses', function () {
            var a = dtm.array('s', 'hello world!');
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
                expect(a.get('block', [3, 3]).get('length')).toBe(3);
            });
        });
    });

    describe('set', function () {

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
            var a = dtm.array('s', 'hello world!').histo();
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

        describe('queue', function () {
            var a = dtm.array([1, 2, 3]);
            a.queue([4, 5, 6, 7, 8]);

            it('should return [6,7,8]', function () {
                expect(a.get()).toEqual([6, 7, 8]);
            });
        });
    });

    describe('scalers', function () {
        describe('normalize', function () {
            describe('normalize to full 0-1 range', function () {
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

            describe('normalize to 0-1 with the domain range specified', function () {
                var a = dtm.a(7).normalize(0, 10);
                it('should have the value of 0.7', function () {
                    expect(a.get()[0]).toBe(0.7);
                });
            });
        });

        describe('rescale', function () {
            it('should...', function () {
                var a = dtm.a(0.5).rescale(0, 100);
                //console.log(a.get());
            });

            describe('rescale w/ domain range specified', function () {
                var a = dtm.a(0.3).rescale(0, 10, 0, 1);
                it('should have the value of 3', function () {
                    expect(a.get()[0]).toBe(3);
                })
            })
        });

        describe('add', function () {
            it('should do element-wise operation', function () {
                var a = dtm.a([1, 2, 3]).add([2, 3, 4]);
                expect(a.get()).toEqual([3, 5, 7]);
            });

            it('should do element-wise operation between array objs', function () {
                var a = dtm.a([1, 2, 3]);
                var b = dtm.a([2, 3, 4]);
                a.add(b);
                expect(a.get()).toEqual([3, 5, 7]);
            });
        });

        describe('expCurve', function () {
            it('should be less than the original value(s)', function () {
                expect(dtm.a([0.5]).exp(10, 0, 1).get()[0]).toBeLessThan(0.5);
            });
        });
    });

    describe('arithmetic', function () {
        describe('diff', function () {
            var a = dtm.a([0, -3, 3]);
            //console.log(a.diff().get());
        });
    });

    
    describe('getBlock', function () {
        var a = dtm.a().fill('seq', 16, 0).block(2, 3);
        it('should have the length of 3', function () {
            expect(a.get('len')).toBe(3);
        });

        it('should start from 2', function () {
            expect(a.get(0)).toBe(2);
        });
    });
});