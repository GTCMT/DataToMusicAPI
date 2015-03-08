(function () {
    var params = {
        name: 'Flute',
        callbacks: [],

        measures: 4,
        time: '4/4',

        clef: 'g',

        updateFreq: 1/4,

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
            dur: dtm.array().fill('consts', 8, 16),

            bpm: dtm.array(120),
            subdiv: dtm.array(16),

            note: dtm.array(72),
            pos: dtm.array(0)
        }
    };

    var m = dtm.model('decatur', 'instr').register();

    var g = dtm.guido();
    var osc = dtm.osc;
    //osc.start();

    m.output = function (c) {
        var time = params.time.split('/');
        var len = time[0] / time[1] *  params.measures;

        var res = [];
        var pc = [];
        var oct = [];
        var div = params.modules.subdiv.get();
        var p = params.modules.pitch.get();
        var dur = params.modules.dur.get();

        //var vol = params.modules.volume.get('next');
        //var r = params.modules.rhythm.get('next');

        //var sc = params.modules.scale.get();
        //var tr = params.modules.transp.get('next');
        //var ct = params.modules.chord.get();


        for (var i = 0; i < 8; i++) {
            pc[i] = g.pc[dtm.val.mod(p[i], 12)];
            oct[i] = (p[i] - dtm.val.mod(p[i], 12)) / 12 - 4;
            res[i] = pc[i] + oct[i].toString() + '*' + dur[i] + '/' + div[0];
        }

        res = res.join(' ');
        var name = '\\instr<"' + params.name + '", dx=-1.65cm, dy=-0.5cm>';

        var clef = '\\clef<"' + params.clef + '">';

        osc.send('/guido/score', [params.name, '[' + name + clef + '\\meter<"4/4"> \\repeatBegin ' + res + ' \\repeatEnd ]']);

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
            //params.modules.subdiv.normalize();
            //params.modules.mult(params.measures/params.modules.subdiv.get('sum'));
            //params.modules.add(-1).mult(-1).scale(1, 5).round().powof(2);
        }
        return m.parent;
    };

    m.setter.len = m.setter.note = m.setter.div = m.setter.subdiv = m.setter.subDiv;

    m.setter.dur = function (src, literal) {
        mapper('dur', src);

        if (literal) {
            params.modules.dur.round();
        } else {
            params.modules.dur.normalize();
            params.modules.dur.mult(params.measures * params.modules.subdiv.get(0)/params.modules.dur.get('sum')).round();
        }

        return m.parent;
    };

    m.setter.test = function (src1, src2, literal) {
        if (!literal) {

        }

        return m.parent;
    };

    m.setter.name = function (src) {
        params.name = src;
        return m.parent;
    };

    m.setter.clef = function (src) {
        params.clef = src;
        return m.parent;
    };

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

    return m;
})();