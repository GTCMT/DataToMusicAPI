(function () {
    var m = dtm.model('bl-piano', 'part');

    m.params.meta = {
        section: 1
    };

    var scale = [0, 2, 3, 5, 7, 9, 10];

    m.params.left = {
        div: 16,
        rhythm: [1, 1, -1, 3, 2, 2, 2],
        shape: [0, 7, 12, 5, 10, 7]
    };

    m.params.right = {
        div: 16,
        //models.rhythm: [-2, 2, -1, 2, -2, 3]
        rhythm: [-3, 5, 4],
        shape: [1, 0, -1, 0],
        voice: [0, 2, 7]
    };

    m.test = function (rhy, shp, div) {
        var temp = [];
        var note = 'c';

        var j = 0;

        for (var i = 0; i < rhy.length; i++) {
            if (rhy[i] > 0) {
                var oct = Math.floor(shp[j]/12);
                note = dtm.guido().pc[shp[j]-oct*12] + (oct+1);
                j++;
            } else {
                note = '_';
                rhy[i] *= -1;
            }
            temp[i] = note + '*' + rhy[i] + '/' + div;
        }

        temp = temp.join(' ');
        return temp;
    };

    m.output = function () {
        return m.test(m.params.left.rhythm, m.params.left.shape, 16);
    }
})();