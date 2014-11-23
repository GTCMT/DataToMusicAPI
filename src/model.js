/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

/**
 * @function module:model.model
 * @param [name] {string} Give it a unique name.
 * @returns a new model instance
 */
dtm.model = function (name) {
    var model = {
        className: 'dtm.model',

        /**
         * @name module:model#name
         * @type {string}
         */
        name: null,

        /**
         * Whether if the model is synced to the master.
         * @name module:model#sync
         * @type {boolean}
         */
        sync: true,
        clock: null,
        data: null,
        parent: null,
        complexity: 0,
        motif: {
            pitches: dtm.array(),
            beats: dtm.array()
        },

        // CHECK: there might be multiple
        parentClock: null,

        master: dtm.master,

        params: {
            scale: _.range(12)
        }
    };

    // ???
    if (arguments.length) {
        model.name = name;
    }

    /**
     * @function module:model#setName
     * @param name {string}
     * @returns {dtm.model}
     */
    model.setName = function (name) {
        model.name = name;
        return model;
    };

    /**
     * @function module:model#play
     * @param nn
     * @returns {dtm.model}
     */
    model.play = function (nn) {
        console.log('play() function is not implemented!');
        return model;
    };

    /**
     * @function module:model#run
     * @param clock
     * @returns {dtm.model}
     */
    model.run = function (clock) {
        console.log('run() funciton is not implemented!');
        return model;
    };

    /**
     * @function module:model#stop
     * @returns {dtm.model}
     */
    model.stop = function () {
        return model;
    }

    // TODO: should add to a list
    model.addParentClock = function (pClock) {
        model.parentClock = pClock;
        return model;
    }

    model.getParentClock = function () {
        return model.parentClock;
    }

    model.extend = function () {
        return model;
    };

    model.inherit = function () {
        return model;
    };

    model.scale = function () {
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

        model.params.scale = scale;

        return model;
    };

    model.load = function (name) {
        return model;
    };

    model.clone = function () {
        // increment the num of active models?
        return model;
    };

    // registers the model to the model collection
    dtm.modelCol.push(model);
    return model;
};

dtm.m = dtm.model;

// TODO: modeling - sharing information...
