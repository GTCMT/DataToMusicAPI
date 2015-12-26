describe('data object', function () {
    var dummyArray = dtm.gen('noise', 8, 0, 10).get();

    describe('creating a data object', function () {
        var d = dtm.data([dummyArray], 'array');
        //console.log(d.value);
    });
});