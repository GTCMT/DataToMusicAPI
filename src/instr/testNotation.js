(function () {
    var params = {
        clock: dtm.clock(true, 16),
        sync: true,
        callbacks: [],

        measures: 4,
        time: '4/4',

        modules: {
            voice: dtm.synth(),
            wavetable: null,
            volume: dtm.array(1),
            scale: dtm.array().fill('seq', 12),
            rhythm: dtm.array(1),
            pitch: dtm.array().fill('line', 8, 60, 72).round(),
            transp: dtm.array(0),
            chord: dtm.array(0),

            repeats: null,
            step: null,
            dur: dtm.array(0.25),

            bpm: dtm.array(120),
            subdiv: dtm.array().fill('consts', 8, 8)
        }
    };

    var m = dtm.model('testNotation', 'instr');
    var g = dtm.guido();
    var osc = dtm.osc();

    m.output = function (c) {
        osc.start();

        var time = params.time.split('/');
        var len = time[0] / time[1] *  params.measures;

        var res = [];
        var pc = [];
        var oct = [];
        var div = params.modules.subdiv.get();
        var p = params.modules.pitch.get();

        //var vol = params.modules.volume.get('next');
        //var dur = params.modules.dur.get('next');
        //var r = params.modules.rhythm.get('next');

        //var sc = params.modules.scale.get();
        //var tr = params.modules.transp.get('next');
        //var ct = params.modules.chord.get();

        for (var i = 0; i < 8; i++) {
            pc[i] = g.pc[dtm.val.mod(p[i], 12)];
            oct[i] = (p[i] - dtm.val.mod(p[i], 12)) / 12 - 4;
            res[i] = pc[i] + oct[i].toString() + '/' + div[i];
        }

        res = res.join(' ');
        osc.send('[\\instr<"Flute", dx=-1.65cm, dy=-0.5cm>\\meter<"4/4"> \\clef<"g"> ' + res + ']');

        return m.parent;
    };

    m.setter.measures = function (val) {
        params.measures = val;
        return m.parent;
    };

    m.setter.pitch = function (src, literal) {
        mapper('pitch', src);

        if (literal) {
            params.modules.pitch.round();
        } else {
            params.modules.pitch.normalize().rescale(60, 90).round();
        }

        return m.parent;
    };

    m.setter.subDiv = function (src, literal) {
        mapper('subdiv', src);

        if (literal) {
            params.modules.subdiv.round();
        } else {
            params.modules.subdiv.normalize().scale(1, 5).round().powof(2);
        }
        return m.parent;
    };

    m.setter.len = m.setter.note = m.setter.div = m.setter.subdiv = m.setter.subDiv;

    function mapper(dest, src) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array(src).classify();
        } else {
            if (src instanceof Array) {
                params.modules[dest] = dtm.array(src);
            } else if (src.type === 'dtm.array') {
                if (src.get('type') === 'string') {
                    params.modules[dest] = src.clone().classify();
                } else {
                    params.modules[dest] = src.clone();
                }
            } else if (src.type === 'dtm.model') {

            } else if (src.type === 'dtm.synth') {
                params.modules[dest] = src;
            }
        }
    }

})();