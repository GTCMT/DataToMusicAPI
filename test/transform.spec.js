describe('array helper functions', function () {
    describe('generate', function () {
        it('should add up to 0 for sine', function () {
            var output = dtm.transform.generate('sine', 1000, -5, 5);
            expect(dtm.analyzer.sum(output)).toBeCloseTo(0, 10);
        });

        //var output = dtm.transform.generate('gauss', 128, 0, 1);
        //console.log(output);
        //it('should ...')
    });

    describe('normalize', function () {
        var input = [];
        for (var i = 0; i < 8; i++) {
            input[i] = _.random(-10, 10);
        }

        var norm = dtm.transform.normalize(input);
        it('should have 0 as min, 1 as max', function () {
            expect(_.min(norm)).toBe(0);
            expect(_.max(norm)).toBe(1);
        });
    });

    describe('rescale', function () {
        var input = [];

        var max = 1;
        var min = -1;

        for (var i = 0; i < 8; i++) {
            input[i] = _.random(0, 10);
        }

        var output = dtm.transform.rescale(input, min, max);
        it('should have corresponding min & max', function () {
            expect(_.max(output)).toBe(max);
            expect(_.min(output)).toBe(min);
        });
    });

    describe('mean', function () {
        var input = [];
        for (var i = 0; i < 8; i++) {
            input[i] = _.random(0, 10);
        }

        var output = dtm.analyzer.mean(input);
    });

    describe('mirror', function () {
        var mrr = dtm.transform.mirror;
        var input = _.shuffle(_.range(8));
        var output = mrr(input);

        var iSum = _.reduce(input, function (sum, num) {
            return sum + num;
        });

        var oSum = _.reduce(output, function (sum, num) {
            return sum + num;
        });

        it('should add up to the same value', function () {
            expect(iSum).toBe(oSum);
        });
    });

    describe('invert', function () {
        var num = 8;
        var input = _.shuffle(_.range(num));
        var output = dtm.transform.invert(input);

        for (var i = 0; i < num; i++) {
            //expect(input[i] + output[i]).toBe(num-1);
        }
    });

    describe('shift', function () {
        var input = [];
        for (var i = 0; i < 8; i++) {
            input[i] = _.random(-10, 10);
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
            input[i] = _.random(-10, 10);
        }

        var output = dtm.transform.shuffle(input);

        it('should have same summed value as the input', function () {
            expect(dtm.analyzer.sum(output)).toBe(dtm.analyzer.sum(input));
        })
    });

    describe('repeat', function () {
        var input = [1, 2, 3];
        var output = dtm.transform.repeat(input, 3);
        it('should have a length of 9', function () {
            expect(output.length).toBe(9);
        });
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

    describe('size manipulation sutff', function () {
        var input = [];
        for (var i = 0; i < 4; i++) {
            input[i] = _.random(-10, 10);
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
//
//        describe('stretch', function () {
//            var output = dtm.transform.stretch(input, 2.5);
//        });
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
});