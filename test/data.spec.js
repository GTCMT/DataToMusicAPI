describe('data object', function () {
    var dummyArray = dtm.transform.generate('noise', 8, 0, 10);

    describe('creating a data object', function () {
        var d = dtm.data([dummyArray], 'array');
        //console.log(d.value);
    });
});