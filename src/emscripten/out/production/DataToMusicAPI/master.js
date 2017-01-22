/**
 * @fileOverview Singleton master (conductor) module. Wants to oversee and control everything, but not quite there yet.
 * @module master
 */

dtm.master = {
    type: 'dtm.master',

    params: {
        data: null,
        index: 0,

        level: 0.5,
        mute: false,

        tempo: 120,
        time: [4, 4],

        beat: 0,
        measure: 0,
        section: 0,

        scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        cummulatedRhythm: null,

        transposition: 0,
        chord: null,
        tonalFunc: null,

        maxNumVoices: 500,
        voices: []
    },


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
    maxNumVoices: 0,
    models: [],

    /**
     * Returns the master clock (singleton).
     * @function module:master#clock
     * @returns clock {object}
     */
    clock: dtm.clock(120, 480).sync(false),

    start: function () {
        return dtm.master;
    },

    /**
     * Stops and deletes all the running clock.
     * @function module:master#stop
     */
    stop: function () {
        dtm.clocks.forEach(function (c) {
            c.stop();
            c.clear();
        });

        dtm.master.activeInstrs.forEach(function (i) {
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

    ///**
    // * Pitch quantize all the voices that are synced to the master.
    // * @function module:master#pq
    // * @returns {*}
    // */
    //pq: function () {
    //    var scale;
    //
    //    if (arguments.length === 0) {
    //        scale = dtm.gen('range', 12).get();
    //    } else if (isArray(arguments[0])) {
    //        scale = arguments[0];
    //    } else if (isString(arguments[0])) {
    //        scale = dtm.scales[arguments[0].toLowerCase()];
    //    } else {
    //        scale = arguments;
    //    }
    //
    //    dtm.master.scale = scale;
    //
    //    // TODO: update all the voices as well?
    //
    //    return dtm.master;
    //},

    data: function (d) {
        if (!isEmpty(d)) {
            dtm.master.params.data = d;
        }

        return dtm.master;
    },

    model: function () {
        return dtm.master;
    },

    get: function (param) {
        switch (param) {
            case 'index':
                return dtm.master.params.index;
                break;

            case 'clock':
                return dtm.master.clock;

            default:
                return null;
        }
    },

    set: function (key, val) {
        return dtm.master;
    },

    setNumVoices: function (num) {
        if (isInteger(num) && num > 0) {
            dtm.master.params.maxNumVoices = num;
        }

        return dtm.master;
    },

    suppressVoices: function () {
        if (dtm.master.params.voices.length > dtm.master.params.maxNumVoices) {
            dtm.master.params.voices[0].stop();
            dtm.master.params.voices.splice(0, 1);
            dtm.master.suppressVoices();
        }

        return dtm.master;
    },

    addVoice: function (voice) {
        dtm.master.params.voices.push(voice);
        dtm.master.suppressVoices();

        return dtm.master;
    },

    removeVoice: function (voice) {
        dtm.master.params.voices.forEach(function (v, i) {
            if (v.get('id') === voice.get('id')) {
                dtm.master.params.voices.splice(i, 1);
            }
        });

        return dtm.master;
    },

    panic: function () {
        dtm.master.params.voices.forEach(function (v) {
            v.stop();
        });

        dtm.master.params.voices = [];
        return dtm.master;
    },

    state: null,

    reset: null
};

dtm.master.clock.setMaster(true);
dtm.master.clock.start();