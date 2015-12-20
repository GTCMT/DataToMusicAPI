describe('model abstract', function () {

    //describe('blank model', function () {
    //    var m;
    //
    //    beforeEach(function () {
    //        m = dtm.model();
    //    });
    //
    //    it('should do something', function () {
    //
    //    });
    //});
    //
    //describe('build new blank model', function () {
    //    var m = dtm.model();
    //
    //});

    //describe('loading a preset model', function () {
    //    it('should load w/ the plain argument', function () {
    //        var uni = dtm.model().load('unipolar');
    //        expect(uni.get('name')).toBe('unipolar');
    //        expect(uni([1,2,3]).get()).toEqual([0,0.5,1.0]);
    //    });
    //});

    //xdescribe('build and save', function () {
    //    var m = dtm.model('dummy').save();
    //    m.meow = function () {
    //        return 'meow';
    //    };
    //
    //    m.hey = 'hey';
    //
    //    var n = dtm.model().load('dummy');
    //    //var n = dtm.model('dummy');
    //
    //    it('should remember the new params', function () {
    //        expect(n.get('name')).toBe('dummy');
    //        expect(n.meow()).toBe('meow');
    //        expect(n.hey).toBe('hey');
    //    });
    //
    //    it('should not remember the params w/ new instantiation', function () {
    //        var l = dtm.model().load('dummy');
    //    });
    //
    //    return m;
    //});

    describe('unipolar model', function () {
        var uni;

        beforeEach(function () {
            uni = dtm.model('unipolar');
        });

        it('should have the name unipolar', function () {
            expect(uni.get('name')).toBe('unipolar');
        });
        it('should normalize to 0 - 1', function () {
            expect(uni([1, 2, 3]).get()).toEqual([0.0, 0.5, 1.0]);
            expect(uni(dtm.array([1, 2, 3])).get()).toEqual([0.0, 0.5, 1.0]);
            expect(uni(0.5).get()).toEqual([0.5]);
        });

        it('should set the domain by args', function () {
            uni.domain(0, 10);
            expect(uni([0, 1, 2]).get()).toEqual([0.0, 0.1, 0.2]);
        });

        it('should reset the domain upon reinstantiation', function () {
            expect(uni([0, 1, 2]).get()).toEqual([0.0, 0.5, 1.0]);
        });

        it('should set the domain by array', function () {
            uni.domain([0, 5]);
            expect(uni([0, 1, 2]).get()).toEqual([0.0, 0.2, 0.4]);
        });

        it('should deal with strings', function () {
            var a = uni('hello');
            expect(typeof(a.get(0))).toBe('number');
            expect(a.get()).toEqual([0, 0, 1, 1, 0]);
        });

        it('should work with multiple args for set', function () {
            var a = uni(1, 2, 3);
            expect(a.get()).toEqual([0.0, 0.5, 1.0]);
        });

        xit('should work with generators', function () {
            var data = dtm.gen('line', 5, 0, 100);
            var a = uni(data);
            expect(a.get()).toEqual([0, 0.25, 0.5, 0.75, 1]);
        });
    });

    describe('creating a freq model', function () {
        var freqModel;

        beforeEach(function () {
            freqModel = dtm.model()
                .toNumeric('histo')
                .domain([0, 10])
        });

        it('should convert nominal to numeric', function () {
            //console.log(freqModel(dtm.array('c', 'heeey')).get());
        });
    });

    describe('huffman', function () {
        var m = dtm.model('huffman');
        console.log(m.build());
    });
});