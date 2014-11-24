(function () {
    var i  = dtm.instr('silly-melody'); // ????

    //var m  = dtm.model('silly-melody').categ('instr');

    i.models = {
        pitches: dtm.array([0, 4, 7, 11, 12, 11, 7, 4]).add(72),
        beats: dtm.array([1, 0, 1])
    };

    var c = dtm.clock(120, 16);

    i.play = function () {
        c.add(function () {
            //console.log(i.models.beats);
            var s = dtm.synth().nn(i.models.pitches.next());
            s.amp(i.models.beats.next() * 0.5).play();

        }).start();

        return i;
    };

    i.stop = function () {
        c.stop();
        return i;
    }
})();