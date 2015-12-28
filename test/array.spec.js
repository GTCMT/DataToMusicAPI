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

            a.name(123);
            it('should not change the name', function () {
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
            var a = dtm.array([1, 2, 3]).scale(0, 100);
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

        describe('sorted', function () {
            var a = dtm.array([3, 1, 2]);
            it('should return [1, 2, 3]', function () {
                expect(a.get('sorted').toString()).toBe([1, 2, 3].toString());
            });

            var b = dtm.array('hey').split();
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
            var a = dtm.array('hello world!').split();
            it('should return l', function () {
                expect(a.get('mode')).toBe('l');
            });
        });

        describe('histo', function () {
            var a = dtm.array('hello world!').split();
            it('should return 3 ls', function () {
                expect(a.get('histo')[2]).toBe(3);
            });
            it('should not change the content', function () {
                expect(a.get().join('')).toBe('hello world!');
            });
        });

        describe('classes', function () {
            var a = dtm.array('hello world!').split();
            it('should return unique classes', function () {
                expect(a.get('classes').length).toBe(9);
            });
        });

        describe('numClasses', function () {
            var a = dtm.array('hello world!').split();
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

        // TODO: fix
        xdescribe('block', function () {
            var a = dtm.gen('seq', 10);
            it('should return the first 3 items', function () {
                expect(a.get('block', [3, 3]).get('length')).toBe(3);
            });
        });

        // TODO: design
        xdescribe('array type', function () {
            it('should convert accordingly', function () {
                expect(dtm.a([1,2,3]).get()).toEqual(new Float32Array([1,2,3]));
            });
        });
    });

    describe('set', function () {
        describe('various arguments', function () {
            it('should accept array', function () {
                expect(dtm.a([1,2,3]).get()).toEqual([1,2,3]);
            });

            it('should accept dtm.array', function () {
                expect(dtm.a(dtm.a([1,2,3])).get()).toEqual([1,2,3]);
            });

            it('should accept single values', function () {
                expect(dtm.a(1,2,3).get()).toEqual([1,2,3]);
                expect(dtm.a(1,2,3).get(0)).toBe(1);
            });
        });
    });

    describe('select', function () {
        it('should work', function () {
            expect(dtm.a([1,2,3]).sel(0).get()).toEqual([1]);
            expect(dtm.a([1,2,3]).sel(1).get()).toEqual([2]);
            expect(dtm.a([1,2,3]).sel(-1).get()).toEqual([3]);
            expect(dtm.a([1,2,3]).sel(0, 1, 2).get()).toEqual([1, 2, 3]);
            expect(dtm.a([1,2,3]).sel([0, 2]).get()).toEqual([1, 3]);
            expect(dtm.a([1,2,3]).sel(dtm.a([0, 2])).get()).toEqual([1, 3]);
        });
    });

    describe('nominal operations', function () {
        describe('histogram', function () {
            var a = dtm.array('hello world!').split().histo();
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

        describe('concat', function () {
            var a = dtm.array([1, 2, 3]);
            it('should work', function () {
                expect(a.concat(dtm.a([4, 5])).get()).toEqual([1, 2, 3, 4, 5]);
            });
        });
    });

    describe('scalers', function () {
        describe('normalize', function () {
            describe('normalize to full 0-1 range', function () {
                it('should return 1s for ones', function () {
                    var a = dtm.gen('ones');
                    a.normalize();
                    expect(a.get('sum')).toBe(8);
                });

                it('should return 0s for zeros', function () {
                    var a = dtm.gen('zeros');
                    a.normalize();
                    expect(a.get('sum')).toBe(0);
                });

                it('should return 0s for minuses', function () {
                    var a = dtm.gen('zeros').add(-0.5);
                    a.normalize();
                    expect(a.get('sum')).toBe(0);
                });

                it('should return 1s for repeated big values', function () {
                    var a = dtm.gen('zeros').add(3);
                    a.normalize();
                    expect(a.get('sum')).toBe(8);
                });

                it('should return raw values for repeated values between 0-1', function () {
                    var a = dtm.gen('zeros').add(0.5);
                    a.normalize();
                    expect(a.get('sum')).toBe(4);
                });
            });

            describe('normalize to 0-1 with the domain range specified', function () {
                it('should have the value of 0.7', function () {
                    expect(dtm.a(7).normalize(0, 10).get(0)).toBe(0.7);
                });

                it('should work the same with dtm.array', function () {
                    expect(dtm.a(7).normalize(dtm.a(0,10)).get(0)).toBe(0.7);
                });

                it('should work the same with dtm.gen', function () {
                    expect(dtm.a(7).normalize(dtm.gen('line').sc(0,10)).get(0)).toBe(0.7);
                });
            });
        });

        describe('scale', function () {
            it('should work', function () {
                var a = dtm.a(0.5).scale(0, 100);
                expect(a.get(0)).toBe(50);
            });

            describe('rescale w/ domain range specified', function () {
                var a = dtm.a(0.3).scale(0, 10, 0, 1);
                it('should have the value of 3', function () {
                    expect(a.get(0)).toBe(3);
                })
            });

            describe('input types', function () {
                it('should accept dtm.array', function () {
                    expect(dtm.a([1,2,3]).scale(dtm.a([0, 10])).get()).toEqual([0,5,10]);
                });
            });
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

    describe('string operations', function () {
        describe('split', function () {
            it('should split test into t e s t', function () {
                expect(dtm.array('test').split().get()).toEqual(['t', 'e', 's', 't']);
            });
        });
    });

    // TODO: implement
    xdescribe('getBlock', function () {
        var a = dtm.gen('seq', 16, 0).block(2, 3);
        it('should have the length of 3', function () {
            expect(a.get('len')).toBe(3);
        });

        it('should start from 2', function () {
            expect(a.get(0)).toBe(2);
        });
    });
});