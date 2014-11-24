/**
 * @fileOverview Singleton master (conductor) module. Wants to oversee and control everything, but not quite there yet.
 * @module master
 */

dtm.master = {
    className: 'dtm.master',

    params: {
        data: null
    },

    level: 0.5,
    mute: false,

    /**
     * Total complexity thing.
     * @name module:master#totalComplexity
     * @type {integer}
     */
    totalComplexity: 0,
    complexityLimit: 10,
    numActiveModels: 0, // or active voices??

    activeInstrs: [],
    voices: [],
    numVoices: 0,
    models: [],

    numSynthVoices: 0,

    /**
     * Returns the master clock (singleton).
     * @function module:master#clock
     * @returns clock {object}
     */
    clock: dtm.clock(120, 96).start(),
    tempo: 60,
    time: [4, 4],
    beat: 0,

    // or just call plain "beat", etc.
    curBeat: 0,
    curMeasure: 0,
    curSection: 0,

    scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    cummulatedRhythm: null,

    transposition: 0,
    chord: null,
    tonalFunc: null,

    start: function () {

    },

    // TODO: not clearing the clocks passed from a voice to model
    /**
     * Stops and deletes all the running clock.
     * @function module:master#stop
     */
    stop: function () {
        _.forEach(dtm.clocks, function (c) {
            c.stop();
            c.clear();
            //_.forEach(c, function (d) {
            //    d.callbacks = [];
            //})
        });

        _.forEach(dtm.master.activeInstrs, function (i) {
            i.stop();
        });

        dtm.clocks = [];
        dtm.master.voices = [];

        dtm.master.activeInstrs = [];
    },

    /**
     * Transpose all the voices that are synced to the master.
     * @function module:master#transpose
     * @param val
     * @returns {*}
     */
    transpose: function (val) {
        dtm.master.transposition = val;
        return dtm.master;
    },

    /**
     * Pitch quantize all the voices that are synced to the master.
     * @function module:master#pq
     * @returns {*}
     */
    pq: function () {
        var scale;

        if (arguments.length === 0) {
            scale = _.range(12);
        } else if (typeof(arguments[0]) === 'array') {
            scale = arguments[0];
        } else if (typeof(arguments[0]) === 'string') {
            scale = dtm.scales[arguments[0].toLowerCase()];
        } else {
            scale = arguments;
        }

        dtm.master.scale = scale;

        // TODO: update all the voices as well?

        return dtm.master;
    },

    data: function (d) {
        if (typeof(d) !== 'undefined') {
            dtm.master.params.data = d;
        }
    },

    form: function () {

    },

    state: null,

    reset: null
};
