describe('get', function () {
    describe('default', function () {
        it('should return the array value', function () {
            var a = dtm.array([1,2,3]);
            expect(a.get()).toEqual(toFloat32Array([1,2,3]));

            expect(a.get(0)).toBe(1);
            expect(a.get(2)).toBe(3);
            expect(a.get(-1)).toBe(3);
            expect(a.get(3)).toBe(1);

            expect(dtm.gen('range', 5).get(-2)).toBe(3);
        });
    });

    describe('label', function () {
        var name = 'hello';
        var a = dtm.array([1, 2, 3]).label(name);
        it('should return the given name', function () {
            expect(a.get('name')).toBe(name);
        });

        it('should not change the name', function () {
            expect(a.label(123).get('name')).toBe(name);
        });
    });

    describe('type', function () {
        it('should return the type number', function () {
            var a = dtm.array([1, 2, 3]);
            expect(a.get('type')).toBe('Float32Array');
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
            expect(a.get('sorted')).toEqual(toFloat32Array([1, 2, 3]));
        });

        var b = dtm.array('hey').split();
        it('should work on strings', function () {
            expect(b.get()).toEqual(['h', 'e', 'y']);
            expect(b.get('sorted')).toEqual(['e', 'h', 'y']);
        });
    });

    describe('min', function () {
        it('should work', function () {
            expect(dtm.a([1,2,3]).get('min')).toBe(1);
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
            expect(dtm.a([1,2,3]).get()).toEqual(toFloat32Array([1,2,3]));
        });
    });

    describe('nested', function () {
        it ('should return nested non-dtm.arrays', function () {
            expect(dtm.a([[1], [2], [3]]).get('nested')).toEqual([toFloat32Array(1), toFloat32Array(2), toFloat32Array(3)]);
        });
    });

    describe('query multi-dimensional array by row', function () {
        it('should work', function () {
            expect(dtm.gen('range', 15).block(5).get('row', 0)).toEqual(toFloat32Array([0,5,10]));
        });
    });
});

describe('set', function () {
    describe('various arguments', function () {
        it('should accept single values', function () {
            expect(dtm.a(1,2,3).get()).toEqual(toFloat32Array([1,2,3]));
            expect(dtm.a('hey').get()).toEqual(['hey']);
            expect(dtm.a('1','2').get()).toEqual(['1','2']);
        });

        it('should accept array', function () {
            expect(dtm.a([1,2,3]).get()).toEqual(toFloat32Array([1,2,3]));
            expect(dtm.a([1,'hey',3]).get()).toEqual([1,'hey',3]);
            expect(dtm.a(['foo','bar']).get()).toEqual(['foo','bar']);
        });

        it('should accept dtm.array', function () {
            expect(dtm.a(dtm.a([1,2,3])).get()).toEqual(toFloat32Array([1,2,3]));
        });

        it('should create a nested array', function () {
            expect(dtm.a([1], [2,3]).get('len')).toBe(2);
            expect(dtm.a([1], [2,3]).get(0).get()).toEqual(toFloat32Array(1));
            expect(dtm.a([1], [2,3]).get(1).get()).toEqual(toFloat32Array([2,3]));

            expect(dtm.a(dtm.a(1,2), [2,3]).get(0).get()).toEqual(toFloat32Array([1,2]));

            var a = dtm.a([1], [2,3]);
            expect(a.get('next').get()).toEqual(toFloat32Array(1));
            expect(a.get('next').get()).toEqual(toFloat32Array([2,3]));

            expect(dtm.a([1], [2,3]).normalize().get(0).get()).toEqual(toFloat32Array(1));

            expect(dtm.a([1],[2],[3]).get(0).get('parent').get('len')).toBe(3);
        })
    });
});

describe('basic array operations', function () {
    describe('map', function () {
        it('should work', function () {
            expect(dtm.a([1,2,3]).map(function (v) {
                return dtm.a([1]);
            }).flatten().get()).toEqual(toFloat32Array([1,1,1]));
        });
    });
});

describe('nest and unnest', function () {
    it('should work', function () {
        expect(isDtmArray(dtm.a([1,2,3]).nest().get(0))).toBe(true);
        expect(dtm.a([1,2,3]).nest().unnest().get()).toEqual(toFloat32Array([1,2,3]));
        expect(dtm.a([1,2],[3,4]).unnest().get()).toEqual(toFloat32Array([1,2,3,4]));
    });
});

describe('clone', function () {
    it('should work', function () {
        var a = dtm.a([1,2,3]);
        var b = a.clone().add(1);
        expect(a.get()).toEqual(toFloat32Array([1,2,3]));
        expect(b.get()).toEqual(toFloat32Array([2,3,4]));
    });

    it('should work with nested arrays', function () {
        var a = dtm.a([1,2,3]).block(1);
        var b = a.clone().unnest().add(1);
        a.unnest();

        expect(a.get()).toEqual(toFloat32Array([1,2,3]));
        expect(b.get()).toEqual(toFloat32Array([2,3,4]));
    })
});

describe('select', function () {
    it('should work', function () {
        expect(dtm.a([1,2,3]).sel(0).get()).toEqual(toFloat32Array([1]));
        expect(dtm.a([1,2,3]).sel(1).get()).toEqual(toFloat32Array([2]));
        expect(dtm.a([1,2,3]).sel(-1).get()).toEqual(toFloat32Array([3]));
        expect(dtm.a([1,2,3]).sel(0, 1, 2).get()).toEqual(toFloat32Array([1, 2, 3]));
        expect(dtm.a([1,2,3]).sel([0, 2]).get()).toEqual(toFloat32Array([1, 3]));
        expect(dtm.a([1,2,3]).sel(dtm.a([0, 2])).get()).toEqual(toFloat32Array([1, 3]));
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
            expect(a.get()).toEqual(toFloat32Array([6, 7, 8]));
        });
    });

    // TODO: broken
    describe('concat', function () {
        it('should work', function () {
            expect(dtm.array([1,2]).concat([3,4]).get()).toEqual(toFloat32Array([1,2,3,4]));
            expect(dtm.array([1,2]).concat(3).get()).toEqual(toFloat32Array([1,2,3]));
            expect(dtm.array([1,2]).concat(dtm.a([3,4])).get()).toEqual(toFloat32Array([1,2,3,4]));

            //expect(dtm.array([1,2]).concat(['foo', 'bar']).get()).toEqual([1,2,'foo','bar']);
        });
    });

    describe('reorder', function () {
        it('should work with single array input', function () {
            expect(dtm.gen('range', 5).reorder([0,2,1,4,4]).get()).toEqual(toFloat32Array([0,2,1,4,4]));
            expect(dtm.a([1], [2], [3]).reorder([2, 1, 0]).get(0).get()).toEqual(toFloat32Array(3));
            expect(dtm.gen('range', 5).reorder([0, 4, 3]).get()).toEqual(toFloat32Array([0, 4, 3]));
            expect(dtm.gen('range', 5).reorder([0, -1, -2]).get()).toEqual(toFloat32Array([0, 4, 3]));
        });

        it('should work with single val arguments', function () {
            expect(dtm.gen('range', 3).reorder(2, 1, 0).get()).toEqual(toFloat32Array([2,1,0]));
        });

        it('should work with dtm.array input', function () {
            expect(dtm.gen('range', 3).reorder(dtm.a([2,1,0])).get()).toEqual(toFloat32Array([2,1,0]));
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
                expect(dtm.a(7).normalize(0, 10).get()).toEqual(toFloat32Array(0.7));
            });

            it('should work the same with dtm.array', function () {
                expect(dtm.a(7).normalize(dtm.a(0, 10)).get()).toEqual(toFloat32Array(0.7));
            });

            it('should work the same with dtm.gen', function () {
                expect(dtm.a(7).normalize(dtm.gen('line').sc(0, 10)).get()).toEqual(toFloat32Array(0.7));
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
                expect(dtm.a([1,2,3]).scale(dtm.a([0, 10])).get()).toEqual(toFloat32Array([0,5,10]));
            });
        });
    });

    describe('add', function () {
        describe('single dimension', function () {
            it('should do element-wise operation', function () {
                var a = dtm.a([1, 2, 3]).add([2, 3, 4]);
                expect(a.get()).toEqual(toFloat32Array([3, 5, 7]));
            });

            it('should do element-wise operation between array objects', function () {
                var a = dtm.a([1, 2, 3]);
                var b = dtm.a([2, 3, 4]);
                a.add(b);
                expect(a.get()).toEqual(toFloat32Array([3, 5, 7]));
            });

            it('should auto-fit to the longest array object', function () {
                expect(dtm.a(1).add([1,2,3]).get()).toEqual(toFloat32Array([2,3,4]));
            });
        });

        describe('nested', function () {
            it('should work', function () {
                expect(dtm.a([1],[2],[3]).add(1).unnest().get()).toEqual(toFloat32Array([2, 3, 4]));
                expect(dtm.a([1],[2],[3]).add(1).unnest().get()).toEqual(toFloat32Array([2, 3, 4]));
                expect(dtm.a([1],[2],[3]).add(dtm.a([1],[1],[1])).unnest().get()).toEqual(toFloat32Array([2, 3, 4]));

                expect(dtm.a(1).add(dtm.a([1],[2],[3])).unnest().get()).toEqual(toFloat32Array([2,3,4]));
                //expect(dtm.a([1, 2],[3]).add(dtm.a([1],[2],[3])).unnest().get()).toEqual(toFloat32Array([2,3,4]));
            });
        });

    });

    describe('mult', function () {
        it('should work', function () {
            expect(dtm.a([1,2,3]).mult(2).get()).toEqual(toFloat32Array([2,4,6]));
        });
    });

    describe('expCurve', function () {
        it('should be less than the original value(s)', function () {
            expect(dtm.a([0.5]).expc(10, 0, 1).get()[0]).toBeLessThan(0.5);
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

describe('block', function () {
    it('should work with no overlap', function () {
        dtm.gen('range', 5).block(1).forEach(function (v, i) {
            expect(v.get(0)).toBe(i);
        });

        dtm.gen('range', 5).block(2).forEach(function (v, i) {
            expect(v.get()).toEqual(toFloat32Array([i*2,i*2+1]));
        });

        expect(dtm.gen('range', 8).block(2).get('len')).toBe(4);
        expect(dtm.gen('range', 9).block(2).get('len')).toBe(4);
        dtm.gen('range', 9).block(2).forEach(function (v) {
            expect(v.get('len')).toBe(2);
        });

        expect(dtm.gen('range', 10).block(3).get('len')).toBe(3);

        expect(dtm.gen('range', 3).block(4).get(0).get()).toEqual(toFloat32Array([0, 1, 2]));
    });

    it('should work with overlaps', function () {
        dtm.gen('range', 3).block(2, 1).forEach(function (v, i) {
            expect(v.get()).toEqual(toFloat32Array([i, i+1]));
        });
    });
});

describe('ola', function () {
    it('should work', function () {
        expect(dtm.gen('range', 3).block(1).ola(1).get()).toEqual(toFloat32Array([0,1,2]));
        //expect(dtm.gen('range', 5).block(2, 1).ola(2).get()).toEqual(toFloat32Array([0,1,2]));
    });
});

describe('sum', function () {
    it('should work with nested arrays', function () {
        expect(dtm.gen('const', dtm.a([1, 1])).size(5).sum().get()).toEqual(toFloat32Array([5, 5]));
        expect(dtm.a([[1],[1,1],[1,1,1]]).sum().get()).toEqual(toFloat32Array([3,2,1]));
    });

    it('should work with regular arrays', function () {
        expect(dtm.gen('const', 1).size(5).sum().get()).toEqual(toFloat32Array(5));
    });
});

describe('row', function () {
    it('should work', function () {
        var a = dtm.gen('range', 9).block(3);
        expect(a.row(0).value).toEqual(toFloat32Array([0,3,6]));
    });
});

describe('col', function () {
    it('should work with number or list query', function () {

    });
});

describe('transpose', function () {
    it('should work', function () {
        var a = dtm.gen('range', 9).block(3).transp();
        expect(a().col(0).value).toEqual(toFloat32Array([0,3,6]));
        expect(a().col(1).value).toEqual(toFloat32Array([1,4,7]));
        expect(a().row(1).value).toEqual(toFloat32Array([3,4,5]));
    });
});

describe('reset', function () {

});

xdescribe('residue', function () {
    it('should work', function () {
        // precision error
        expect(dtm.a([0.1, 0.9, 1.3]).round().residue().get()).toEqual(toFloat32Array([0.1, -0.1, 0.3]));
    });
});