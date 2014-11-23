describe('parser', function () {
    var p = dtm.parser;
    var mockCsv =
        'foo, bar, buz\r' +
        '123, 456.78, hey\r' +
        '789, 444.44, hoo';
    var mockJson = p.csvToJson(mockCsv);

    describe('csvToJson', function () {
        it('should return an object', function () {
            expect(typeof(p.csvToJson(mockCsv))).toBe('object');
        });

        it('should have 2 dict objects (rows)', function () {
            expect(p.csvToJson(mockCsv).length).toBe(2);
        });
    });

    describe('getSize', function () {
        it('should return a 2 value array', function () {
            expect(p.getSize(mockJson).length).toBe(2);
        });

        it('should return a column value of 3', function () {
            expect(p.getSize(mockJson)[0]).toBe(3);
        });

        it('should return a row value of 2', function () {
            expect(p.getSize(mockJson)[1]).toBe(2);
        });
    });

    describe('valueTypes', function () {
//        console.log(p.valueTypes(mockJson[1]));
    });
});