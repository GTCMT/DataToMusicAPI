/**
 * @fileOverview Utility functions for single value input. Singleton.
 * @module value
 */

dtm.value = {
    type: 'dtm.value',

    /**
     * Rescales a single normalized (0-1) value.
     *
     * @function module:value#rescale
     * @param val {float} Value between 0-1.
     * @param min {number} Target range minimum.
     * @param max {number} Target range maximum.
     * @param [round=false] {boolean} If true, the output will be rounded to an integer.
     * @returns {number}
     */
    rescale: function (val, min, max, round) {
        round = round || false;

        var res = val * (max - min) + min;

        if (round) {
            res = Math.round(res);
        }

        return res;
    },

    /**
     * @function module:value#expCurve
     * @param val {float} Value between 0-1.
     * @param factor {float} Steepness. It should be above 1.
     * @returns {number}
     */
    expCurve: function (val, factor) {
        factor = factor <= 1 ? 1.000001 : factor;
        return (Math.exp(val * Math.log(factor)) - 1.) / (factor - 1.);
    },

    /**
     * @function module:value#logCurve
     * @param val {float} Value between 0-1.
     * @param factor {float} Steepness. It should be above 1.
     * @returns {number}
     */
    logCurve: function (val, factor) {
        factor = factor <= 1 ? 1.000001 : factor;
        return (Math.log(val * (factor - 1.) + 1.)) / (Math.log(factor));
    },

    /**
     * MIDI note number to frequency conversion.
     * @function module:value#mtof
     * @param nn {number} Note number
     * @returns {number}
     */
    mtof: function (nn) {
        return 440.0 * Math.pow(2, (nn - 69) / 12.);
    },

    /**
     * Frequency to MIDI note number conversion.
     * @function module:value#mtof
     * @param freq {number} Note number
     * @returns {number}
     */
    ftom: function (freq) {
        return Math.log2(freq / 440.0) * 12 + 69;
    },

    /**
     * Scale or pitch-quantizes the input value to the given models.scales.
     * @function module:value#pq
     * @param nn {integer} Note number
     * @param scale
     * @param [round=false] {boolean}
     * @returns {*}
     */
    pq: function (nn, scale, round) {
        if (!isNumArray(scale)) {
            scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        }

        if (typeof(round) === 'undefined') {
            round = false;
        }

        var pc = nn % 12;
        var oct = nn - pc;
        var idx = Math.floor(pc / 12. * scale.length);
        var frac = 0.0;

        if (!round) {
            frac = nn % 1;
        }
        return oct + scale[idx] + frac;
    },

    /**
     * A modulo (remainder) function that is not broken like the JS implementation.
     * @param n {number} Divident
     * @param m {number} Divisor
     * @returns {number}
     */
    mod: function mod(n, m) {
        return ((n % m) + m) % m;
    },

    incr: function incr() {

    },

    // TODO: min / max / single-value defaults
    randi: function (min, max) {
        return _.random(min, max);
    },

    random: function (min, max) {
        if (typeof(min) === 'undefined' && typeof(max) === 'undefined') {
            min = 0;
            max = 1;
        }
        return _.random(min, max, true);
    }
};

dtm.value.rand = dtm.value.random;

dtm.v = dtm.val = dtm.value;