///**
// * @fileOverview A voice is an instance of musical model. It is used to make actual sounds.
// * @module voice
// */

///**
// * Creats a new instance of voice, using the existing model name (string) or a model object.
// *
// * @function module:voice.voice
// * @param name {string|object}
// * @returns {object} a new voice
// */
dtm.voice = function (arg) {
    var voice = {
        className: 'dtm.voice',

        ///**
        // * @name module:voice#model
        // * @type {object}
        // */
        model: null,
        modelName: null, // TODO: this is maybe redundant

        transposition: 0,
        scale: [],
        clock: dtm.clock(),

        master: dtm.master
    };

    if (typeof(arg) !== 'undefined') {
        if (typeof(arg) === 'string') {
            // TODO: maybe should assign model to the field instead
            voice.modelName = arg;

            // TODO: hmm
            voice.model = _.find(dtm.modelCol, {name: voice.modelName});

        } else {
            voice.model = arg;
            voice.modelName = arg.name;
        }
    }


    ///**
    // * @function module:voice#getModel
    // * @returns {object} model
    // */
    voice.getModel = function () {
        return voice.model;
    };

    // CHECK: maybe this is redundant
    ///**
    // * @function module:voice#getModelName
    // * @returns {string} model name
    // */
    voice.getModelName = function () {
        return voice.modelName;
    };



    var verbLen = 44100 * 0.3;
    var ir = actx.createBuffer(1, verbLen, 44100);
    _.forEach(ir, function (val, idx) {
        ir.getChannelData(0)[idx] = _.random(-1, 1, true) * (verbLen-idx) / verbLen;
    });
    var verb = actx.createConvolver();
    verb.buffer = ir;

    voice.sendVerb = function (fVal) {
        return voice;
    };

    voice.setDelay = function (fVal) {
        return voice;
    };

    // TODO: maybe fix this redundancy
    if (voice.modelName !== null) {
        ///**
        // * @function module:voice#play
        // * @param [nn]
        // */
        voice.play = function (nn) {
            return _.find(dtm.modelCol, {name: voice.modelName}).play(nn);
        };

        ///**
        // * @function module:voice#run
        // * @param [clock]
        // * @returns {Object}
        // */
        voice.run = function (clock) {
            if (typeof(clock) === 'undefined') {
                clock = voice.clock;
            }
            _.find(dtm.modelCol, {name: voice.modelName}).run(clock);
            return voice.model;
        };

        ///**
        // * @function module:voice#modulate
        // * @param val
        // * @returns {*}
        // */
        voice.modulate = function (val) {
            return _.find(dtm.modelCol, {name: voice.modelName}).modulate(val);
        };

        voice.getParentClock = function () {
            return _.find(dtm.modelCol, {name: voice.modelName}).getParentClock();
        };

        voice.addParentClock = function (pCl) {
            console.log('test');
            _.find(dtm.modelCol, {name: voice.modelName}).addParentClock(pCl);
        };

        //voice.motif = voice.model.motif;
    }

    voice.clone = function () {
        // CHECK: this may not work, use constructor instead
        return dtm.clone(voice);
    };

    dtm.master.numActiveModels += 1;
    dtm.master.totalComplexity += _.find(dtm.modelCol, {name: voice.modelName}).complexity;
    dtm.master.voices.push(voice);

    return voice;
};

dtm.v = dtm.voice;