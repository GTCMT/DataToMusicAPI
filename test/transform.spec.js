describe('array helper functions', function () {
    describe('scalers', function () {
        describe('normalize', function () {
            describe('normalize autmatically to 0-1 range', function () {
                var input = [];
                for (var i = 0; i < 8; i++) {
                    input[i] = randi(-10, 10);
                }
                var norm = dtm.transform.normalize(input);

                it('should have 0 as min, 1 as max', function () {
                    expect(getMin(norm)).toBe(0);
                    expect(getMax(norm)).toBe(1);
                });
            });

            describe('normalize w/ domain min max', function () {
                var input = [0, 2, 4, 1, 3, 5];
                var dmin = -0;
                var dmax = 20;

                var norm = dtm.transform.normalize(input, dmin, dmax);
                it('should have the max val of 0.25', function () {
                    expect(getMax(norm)).toBe(0.25);
                })
            });
        });

        describe('rescale', function () {

            describe('rescale to the full range specified', function () {
                var input = [];

                var max = 1;
                var min = -1;

                for (var i = 0; i < 8; i++) {
                    input[i] = randi(0, 10);
                }

                var output = dtm.transform.rescale(input, min, max);
                it('should have corresponding min & max', function () {
                    expect(getMax(output)).toBe(max);
                    expect(getMin(output)).toBe(min);
                });
            });

            describe('rescale to the range with domain range specified', function () {
                var input = [0, 2, 4, 1, 3, 5];
                var dmin = 0;
                var dmax = 10;

                var min = -1;
                var max = 1;

                var output = dtm.transform.rescale(input, min, max, dmin, dmax);

                it('should have max of ...', function () {
                    expect(getMax(output)).toBe(0);
                    expect(getMin(output)).toBe(-1);
                })
            })
        });

        describe('fitSum', function () {
            it('should return the sum of 32', function () {
                var input = [3, 5, 2, 4.5, 1, 7, 9];
                var tgt = 30;
                var fracOut = dtm.transform.fitSum(input, tgt, false);
                expect(sum(fracOut)).toBe(tgt);

                var roundedOut = dtm.transform.fitSum(input, tgt, true);
                expect(sum(roundedOut)).toBe(Math.round(tgt));
            });

            it('should return 32', function () {
                var input = [2, 2, 0, 0, 1, 1, 2, 2];
                var out = dtm.transform.fitSum(input, 32, true);
                expect(sum(out)).toBe(32);
            });
        });

        describe('size manipulation sutff', function () {
            var input = [];
            for (var i = 0; i < 4; i++) {
                input[i] = randi(-10, 10);
            }

            // TODO: write proper test cases
            describe('fit', function () {
                var len = 8;
                var output = dtm.transform.fit(input, len, 'linear');

                it('should have the same first and last values', function () {
                    expect(input[0]).toBe(output[0]);
                    expect(input[input.length - 1]).toBe(output[output.length - 1]);
                });

//            console.log(input);
//            console.log(output);
            });

            describe('stretch', function () {
                it('should work', function () {
                    expect(dtm.transform.stretch([1,2.5], 2)).toEqual([1,1.5,2,2.5]);
                    expect(dtm.transform.stretch(toFloat32Array([1,2.5]), 2)).toEqual(toFloat32Array([1,1.5,2,2.5]));
                });
            });
        });

        describe('mult', function () {
            it('should work', function () {
                expect(dtm.transform.mult([1,2,3])).toEqual([1,2,3]);
            });

            it('should do element-wise multiplication', function () {
                var input = [1, 2, 3];
                var right = [2, 3, 4];
                var expected = [2, 6, 12];

                var out = dtm.transform.mult(input, right);
                expect(out).toEqual(expected);
            });

            it('should stretch and multiply', function () {
                var input = [1, 2, 3, 4];
                var right = [2, 5];
                var interp = 'linear';
                var expected = [2, 6, 12, 20];
                var out = dtm.transform.mult(input, right, interp);
                expect(out).toEqual(expected);
            });

            it('should stretch w/ step interpolation and multiply', function () {
                var input = [1, 2, 3, 4];
                var right = [2, 5];
                var interp = 'step';
                var expected = [2, 4, 15, 20];
                var out = dtm.transform.mult(input, right, interp);
                expect(out).toEqual(expected);
            });
        });

        describe('add', function () {
            it('should do element-wise addition', function () {
                var input = [1, 2, 3];
                var right = [2, 3, 4];
                var expected = [3, 5, 7];

                var out = dtm.transform.add(input, right);
                expect(out).toEqual(expected);
            });

            it('should stretch and add', function () {
                var input = [1, 2, 3, 4];
                var right = [2, 5];
                var interp = 'linear';
                var expected = [3, 5, 7, 9];
                var out = dtm.transform.add(input, right, interp);
                expect(out).toEqual(expected);
            });

            it('should stretch w/ step interpolation and add', function () {
                var input = [1, 2, 3, 4];
                var right = [2, 5];
                var interp = 'step';
                var expected = [3, 4, 8, 9];
                var out = dtm.transform.add(input, right, interp);
                expect(out).toEqual(expected);
            });
        });

        describe('pow', function () {
            it('should do element-wise power operation', function () {
                var input = [1, 2, 3];
                var right = [2, 3, 4];
                var expected = [1, 8, 81];
                var out = dtm.transform.pow(input, right);
                expect(out).toEqual(expected);
            });
        });

        describe('powof', function () {
            it('should have values of 1, 4, 16, 64', function () {
                var arr = [0, 1, 2, 3];
                var res = dtm.transform.powof(arr, 4);
                for (var i = 0; i < arr.length; i++) {
                    expect(res[i]).toBe(Math.pow(4, arr[i])); // stupid
                }
            });

            it('should do element-wise operation', function () {
                var input = [1, 2, 3];
                var right = [2, 3, 4];
                var out = dtm.transform.powof(input, right);
                var expected = [2, 9, 64];
                expect(out).toEqual(expected);
            });
        });

        describe('expCurve', function () {
            it('should return smaller values', function () {
                expect(dtm.transform.expCurve([0.5], 10)[0]).toBeLessThan(0.5);
            });
        });
    });

    describe('arithmetic', function () {
        describe('remove zeros', function () {
            var input = [2, 0, 1, 0, 3, -2, 0, 5];
            var out = dtm.transform.removeZeros(input);

            it('shoud return [2, 1, 3, -2, 5]', function () {
                expect(out).toEqual([2, 1, 3, -2, 5]);
            });
        });

        describe('diff', function () {
            var input = [0, 3, -2, 0, 5, 2, 4];
            var out = dtm.transform.diff(input);

            it('should return [3, -5, 2, 5, -3, 2]', function () {
                expect(out).toEqual([3, -5, 2, 5, -3, 2]);
            });
        });
    });

    describe('mean', function () {
        var input = [];
        for (var i = 0; i < 8; i++) {
            input[i] = randi(0, 10);
        }

        var output = mean(input);
    });

    describe('mirror', function () {
        var rev = dtm.transform.reverse;
        var input = _.shuffle(dtm.gen('range', 8).get());
        var output = rev(input);

        var iSum = input.reduce(function (sum, num) {
            return sum + num;
        });

        var oSum = output.reduce(function (sum, num) {
            return sum + num;
        });

        it('should add up to the same value', function () {
            expect(iSum).toBe(oSum);
        });
    });

    describe('invert', function () {
        var num = 8;
        var input = _.shuffle(dtm.gen('range', num));
        var output = dtm.transform.invert(input);

        for (var i = 0; i < num; i++) {
            //expect(input[i] + output[i]).toBe(num-1);
        }
    });

    describe('shift', function () {
        var input = [];
        for (var i = 0; i < 8; i++) {
            input[i] = randi(-10, 10);
        }

        var shift = -2;
        var output = dtm.transform.shift(input, shift);

        it('should have the same values at...', function () {
            var idx = 5;
            expect(output[idx]).toBe(input[idx + shift]);
        })
    });

    describe('shuffle', function () {
        var input = [];
        for (var i = 0; i < 8; i++) {
            input[i] = randi(-10, 10);
        }

        var output = dtm.transform.shuffle(input);

        it('should have same summed value as the input', function () {
            expect(sum(output)).toBe(sum(input));
        })
    });

    describe('repeat', function () {
        var input = [1, 2, 3];
        var output = dtm.transform.repeat(input, 3);
        it('should have a length of 9', function () {
            expect(output.length).toBe(9);
        });

        it('should work', function () {
            expect(dtm.transform.repeat(toFloat32Array([1,2]), 2)).toEqual(toFloat32Array([1,2,1,2]));
        })
    });

    describe('truncate', function () {
        var input = [1, 2, 3, 4, 5];
        var out1 = dtm.transform.truncate(input, 2);
        it('should have length of 3', function () {
            expect(out1.length).toBe(3);
        });

        var out2 = dtm.transform.truncate(input, 1, 1);
        it('should have length of 2', function () {
            expect(out2.length).toBe(3);
        });
    });

    describe('window', function () {
        var input = [1, 1, 1, 1, 1];

        var out = dtm.transform.window(input, 'triangular');
        it('should have a triangle shape output', function () {
            expect(out).toEqual([0, 0.5, 1.0, 0.5, 0]);
        });
    });

    //describe('morph', function () {
    //    var arr1 = [];
    //    var arr2 = [];
    //
    //    for (var i = 0; i < 8; i++) {
    //        arr1[i] = _.random(-10, 10);
    //        arr2[i] = _.random(-10, 10);
    //    }
    //
    //    var morphIdx = 0;
    //    var res = dtm.transform.morph(arr1, arr2, morphIdx);
    //
    //    // TODO: test!
    //
    //
    //});
    //
    //describe('morphVarLen', function () {
    //    var arr1 = [];
    //    var arr2 = [];
    //
    //    for (var i = 0; i < 4; i++) {
    //        arr1[i] = _.random(-10, 10);
    //    }
    //
    //    for (var j = 0; j < 8; j++) {
    //        arr2[j] = _.random(-10, 10);
    //    }
    //
    //    var morphIdx = 0.2;
    //    var res = dtm.transform.morphVarLen(arr1, arr2, morphIdx);
    //});

    describe('unit converters', function () {
        describe('notes to beats', function () {
            var input = [4, 8, 8, 16, 16, 16, 16];
            var output = dtm.transform.notesToBeats(input, 16);
//        console.log(output);
        });

        describe('beats to notes', function () {
            var input = [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1];
            var output = dtm.transform.beatsToNotes(input, 16);
//        console.log(output);
        });

        describe('intervals to beats', function () {
            var input = [3, 3, 4, 2, 4];
            var output = dtm.transform.intervalsToBeats(input);
//        console.log(output);
        });

        describe('beats to intervals', function () {
            var input = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0];
            var output = dtm.transform.beatsToIntervals(input);
//        console.log(output);
        });

        describe('beats to indices', function () {
            var input = [1, 0, 1, 1, 0, 0, 1, 1];
            var output = dtm.transform.beatsToIndices(input);

            it('should have 5 values', function () {
                expect(output.length).toBe(5);
            });
        });

        describe('indices to beats', function () {
            it('should give beat seq liek this...', function () {
                var input = [0, 3, 4, 6, 7];
                var len = 8;
                var out = dtm.transform.indicesToBeats(input, len);

                expect(out).toEqual(toFloat32Array([1, 0, 0, 1, 1, 0, 1, 1]));
            });

            it('should work w/ unsorted indices too', function () {
                var input = [3, 0, 7, 6, 4];
                var len = 8;
                var out = dtm.transform.indicesToBeats(input, len);

                expect(out).toEqual(toFloat32Array([1, 0, 0, 1, 1, 0, 1, 1]));
            });

            it('should terminate if the length is smaller', function () {
                var input = [3, 0, 7, 6, 4];
                var len = 6;
                var out = dtm.transform.indicesToBeats(input, len);

                expect(out).toEqual(toFloat32Array([1, 0, 0, 1, 1, 0]));
            });

            it('should automatically set the length', function () {
                var input = [3, 0, 7, 6, 4];
                var out = dtm.transform.indicesToBeats(input);

                expect(out).toEqual(toFloat32Array([1, 0, 0, 1, 1, 0, 1, 1]));
            });

            it('should have length of 16', function () {
                var input = [0, 10];
                var out = dtm.transform.indicesToBeats(input);

                expect(out.length).toBe(16);
            })
        });
    });

    describe('calcBeatsOffset', function () {
        var src = [1, 0, 0, 1, 0, 1, 0, 0];
        var tgt = [1, 0, 1, 0, 0, 0, 0, 1];

        var res = dtm.transform.calcBeatsOffset(src, tgt);
        //console.log(res);
    });

    describe('applyOffsetToBeats', function () {
        var src = [1, 0, 0, 1, 0, 1, 0, 0];
        var offset = [0, -1, 2];
        var res = dtm.transform.applyOffsetToBeats(src, offset);
    });

    describe('classId', function () {
        var arr = ['foo', 'bar', 'bar', 'buz', 'buz', 'foo'];

        var res = dtm.transform.classId(arr);
        it('sould return 2 0 0 1 1 2', function () {
            expect(res.toString()).toBe([2, 0, 0, 1, 1, 2].toString());
        });
    });

    describe('stringify', function () {
        var arr = [1, 2, 3];
        var res = dtm.transform.stringify(arr);
        it('should be converted to string type', function () {
            expect(typeof(res[2])).toBe('string');
        });
    });

    describe('tonumber', function () {
        var a = ['1', '2', '3'];
        var res = dtm.transform.tonumber(a);
        it('should be converted to number type', function () {
            expect(res).toEqual([1, 2, 3]);
        });
    });

    describe('split', function () {
        it('should output h e y', function () {
            expect(dtm.transform.split(['hey'])).toEqual(['h', 'e', 'y']);
        });
        it('should process array of string', function () {
            expect(dtm.transform.split(['hey', 'ho'])).toEqual(['h', 'e', 'y', 'h', 'o']);
        });

        it('should convert non-string values to a string', function () {
            expect(dtm.transform.split([123, '456'])).toEqual(['1', '2', '3', '4', '5', '6']);
        });
    });

    xdescribe('linslide', function () {
        it('should work', function () {
            expect(dtm.transform.linslide([1,0,0,1],0,1)).toEqual([1,0.5,0,1]);
            //expect(dtm.transform.linslide([1,0,0,1],0,2)).toEqual([1,0.66,0.33]);
        });
    });

    describe('pitch quantize', function () {
        it('should work with solfa array', function () {
            //expect(dtm.transform.pq([0,2,4,5,7,9,11], ['d','r','me','f','s','le','te'])).toEqual([0,2,3,5,7,8,10]);
            expect(dtm.transform.pitchQuantize([0,2,4,6,7,9,11], ['d','r','me','f','s','le','te'])).toEqual([0,2,3,5,7,8,10]);
        });
    });
});