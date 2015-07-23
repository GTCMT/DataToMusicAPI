/**
 * @fileOverview Instrument model "clave"
 * @module instr-clave
 */

(function () {
    var m = dtm.model('clave', 'instr').register();

    var params = {
        modules: {
            voice: dtm.synth('noise').decay(0.05),
            base: dtm.array([3,3,4,2,4]).itob(),
            target: dtm.array([2,1,2,1]).itob(),
            res: dtm.array([3,3,4,2,4]).itob(),
            emphasis: dtm.a(100),
            morph: dtm.array(0)
        },

        index: 0,
        print: false
    };

    m.output = function (c) {
        c.div(16);

        //var v = params.modules.voice;
        var v = dtm.synth('noise').decay(0.05); // new timbre every voice

        var m = params.modules.morph.get('next');

        var e = params.modules.emphasis.get('next');
        var res = params.modules.base.clone().morph(params.modules.target, m).exp(e);

        params.index = (params.index + 1) % res.get('length');
        var r = res.get(params.index);

        if (params.print) {
            console.log(res.get());
        }

        v.amp(r).play();
    };

    /**
     * Sets the morphing index between the base (clave) and target rhythm.
     * @function module:instr-clave#morph
     * @param src {number|array|string|dtm.array}
     * @param [mode='adaptive'] {string}
     * @returns {dtm.instr}
     */
    m.mod.morph = function (src, mode) {
        mapper(src, 'morph');

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.morph.normalize(0, 1);
        } else {
            params.modules.morph.normalize();
        }

        return m.parent;
    };

    m.mod.mod = m.mod.modulate = m.mod.morph;
    /**
     * Sets the amount of amplitude modulation to be scaled exponentially. With 'adaptive' and 'pre-normalized' mapping, the normalized factor will be scaled to 1-100.
     * @function module:instr-clave#emphasis
     * @param src {number|array|string|dtm.array}
     * @param [mode='adaptive'] {string}
     * @returns {dtm.instr}
     */
    m.mod.emphasis = function (src, mode) {
        mapper(src, 'emphasis');

        var max = 200;

        if (m.modes.literal.indexOf(mode) > -1) {
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.emphasis.normalize(0, 1).scale(1, max);
        } else {
            params.modules.emphasis.normalize().scale(1, max);
        }

        return m.parent;
    };

    // TODO: different mode of rhythm input?
    /**
     * Sets the target rhythm.
     * @function module:instr-clave#target
     * @param src {number|array|string|dtm.array}
     * @param [mode='adaptive'] {string}
     * @returns {dtm.instr}
     */
    m.mod.target = function (src, mode) {
        mapper(src, 'target');

        if (m.modes.literal.indexOf(mode) > -1) {
            params.modules.target.itob();
        } else if (m.modes.preserve.indexOf(mode) > -1) {
            params.modules.target.scale(1, 4, 0, 1).round().itob();
        } else {
            params.modules.target.scale(1, 4).round().itob();
        }

        return m.parent;
    };

    /**
     * Prints out the current rhythm / amplitude sequence into the console.
     * @function module:instr-clave:print
     * @param [bool=true] {boolean}
     * @returns {dtm.instr}
     */
    m.param.print = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }

        params.print = bool;
        return m.parent;
    };

    m.param.voice = function (arg) {
        params.modules.voice = arg;
        return m.parent;
    };

    function mapper(src, dest) {
        if (typeof(src) === 'number') {
            params.modules[dest] = dtm.array(src);
        } else if (typeof(src) === 'string') {
            params.modules[dest] = dtm.array('str', src).classify();
        } else {
            if (src.constructor === Array) {
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