/**
 * @fileOverview The instrument object that makes some complex musical gestures. It can contain multiple models, and be modulated in various ways.
 * @module instr
 */

/**
 * Creates a new instance of dtm.instr object. If given a name, it either creates a new instrument with the name, or loads from the pre-registered instrument model collection.
 * @function module:instr.instr
 * @param [arg] {string|dtm.model}
 * @returns {dtm.instr}
 */
dtm.instr = function (arg) {
    var instr = {
        type: 'dtm.instrument',
        params: {
            name: null,
            isPlaying: false,
            poly: false,

            modDest: [],

            sync: true,
            clock: dtm.clock(true, 8),
            subDivision: 16,

            models: {
                voice: dtm.synth()
            },

            instrModel: null
        }
    };

    /**
     * Sets a model for one of the parameters of the instrument.
     * @function module:instr#model
     * @param model {string|dtm.model|dtm.array}
     * @param [target='any'] {string}
     * @returns {dtm.instr}
     */
    instr.model = function () {
        var arg = arguments[0];
        var categ = 'any'; // TODO: WIP

        if (typeof(arguments[1]) === 'string') {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (arg instanceof Array) {
            if (categ) {
                instr.params.models[categ] = dtm.array(arg);
            } else {
                instr.params.models['any'] = dtm.array(arg);
            }
        } else if (typeof(arg) === 'object') {
            if (arg.type === 'dtm.model') {
                if (arg.params.categ === 'instr') {
                    // CHECK: ...
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    instr.params.models[categ] = arg;
                    instr.params.modDest.push(arg);
                } else if (arg.params.categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                    instr.params.models[arg.params.categ] = arg;
                    instr.params.modDest.push(arg);
                } else if (categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    instr.params.models[categ] = arg;
                    instr.params.modDest.push(arg);
                }

            } else if (arg.type === 'dtm.array') {
                instr.params.models[categ] = arg;
            }
        } else if (typeof(arg) === 'string') {
            var model = _.find(dtm.modelColl, {params: {
                name: arg
            }});

            if (typeof(model) !== 'undefined') {
                if (!categ) {
                    categ = model.params.categ;
                }

                dtm.log('assigning model "' + model.params.name + '" to category "' + categ + '"');
                instr.params.models[categ] = model;
                instr.params.modDest.push(model);
            }
        }

        return instr;
    };

    /**
     * Sets the main voice / WebAudio synthesizer for the instrument.
     * @param arg {string|dtm.synth}
     * @returns {dtm.instr}
     */
    instr.voice = function (arg) {
        if (typeof(arg) === 'string') {
            instr.params.models.voice.set(arg);
        }
        return instr;
    };

    /**
     * Starts performing the instrument.
     * @function module:instr#play
     * @returns {dtm.instr}
     */
    instr.play = function () {
        // can only play single voice / instance
        if (instr.params.isPlaying !== true) {
            instr.params.isPlaying = true;
            dtm.log('playing: ' + instr.params.name);

            if (!instr.params.instrModel) {
                instr.params.clock.add(function defInstr() {
                    var v = instr.params.models.voice;

                    // CHECK: only for dtm.arrays
                    if (typeof(instr.params.models.beats) !== 'undefined') {
                        if (instr.params.models.beats.next()) {
                            if (typeof(instr.params.models.melody) !== 'undefined') {
                                v.nn(instr.params.models.melody.next());
                            }

                            v.play();
                        }
                    } else {
                        //if (typeof(instr.params.models.melody) !== 'undefined') {
                        //    v.nn(instr.params.models.melody.next());
                        //}

                        if (typeof(instr.params.models.pitch) !== 'undefined') {
                            var nn = instr.params.models.pitch.next();
                            nn = dtm.val.rescale(nn, 60, 100, true);
                            v.nn(nn);
                        }

                        v.play();
                    }
                }).start(); // ???
            }

            if (instr.params.instrModel) {
                if (instr.params.instrModel.params.categ === 'instr') {
                    instr.params.instrModel.stop();
                    instr.params.instrModel.play();
                }
            }

            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        }

        return instr;
    };

    instr.start = instr.run = instr.play;

    instr.stop = function () {
        if (instr.params.isPlaying === true) {
            instr.params.isPlaying = false;
            dtm.log('stopping: ' + instr.params.name);

            if (instr.params.instrModel) {
                if (instr.params.instrModel.params.categ === 'instr') {
                    instr.params.instrModel.stop();
                }
            }

            instr.params.clock.stop();
            instr.params.clock.clear();
        }
        return instr;
    };

    instr.clock = function (bpm, subDiv, time) {
        instr.params.clock.bpm(bpm);
        instr.params.clock.subDiv(subDiv);
        return instr;
    };

    instr.bpm = function (val) {
        instr.params.clock.bpm(val);
        return instr;
    };

    instr.tempo = instr.bpm;

    instr.subDiv = function (val) {
        instr.params.clock.subDiv(val);
        return instr;
    };

    instr.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }
        instr.params.clock.sync(bool);
        instr.params.sync = bool;
        return instr;
    };


    /**
     * Modulates the parameter(s) of the instrument.
     * @function module:instr#mod
     * @arg {number}
     * @returns {dtm.instr}
     */
    instr.mod = function () {
        if (typeof(arguments[0]) === 'number') {
            if (arguments.length === 1) {
                var val = arguments[0];
                _.forEach(instr.params.modDest, function (dest) {
                    // MEMO: don't use arguments[n] in forEach
                    dest.mod(val);
                })
            } else {
                _.forEach(arguments, function (val, idx) {
                    if (instr.params.modDest[idx]) {
                        instr.params.modDest[idx].mod(val);
                    }
                })
            }

        } else if (typeof(arguments[0]) === 'string') {
            if (typeof(arguments[1] === 'number') && typeof(instr.params[arguments[0]]) !== 'undefined') {
                instr.params[arguments[0]] = arguments[1]; // CHECK: ???????
            }

        } else if (typeof(arguments[0]) === 'object') {
            var keys = _.keys(arguments[0]);
            console.log(keys);
        }

        return instr;
    };

    instr.modulate = instr.mod;

    instr.map = function (src, dest) {
        // testing w/ array...
        if (src.type === 'dtm.array') {

            // assigning an array here is not so smart...
            instr.params.models[dest] = src.normalize();
        }
        // use global index from the master

        return instr;
    };

    instr.get = function (key) {
        return instr.params[key];
    };

    instr.getModel = function (key) {
        return instr.params.models[key];
    };

    instr.setModel = function (src, dest) {
        instr.params.models[dest] = src;
        return instr;
    };

    instr.clone = function () {
        return instr;
    };

    instr.load = function (arg) {
        if (typeof(arg) === 'string') {
            var model = _.find(dtm.modelColl, {params: {
                name: arg,
                categ: 'instr'
            }});

            if (typeof(model) !== 'undefined') {
                dtm.log('loading instrument model: ' + arg);
                instr.params.instrModel = model;
                instr.params.name = arg;
                //instr.params.models = model.models;
                instr.model(model);
                //instr.play = instr.params.instrModel.play;
                //instr.run = instr.params.instrModel.run;

                // CHECK: not good
                instr.params.modDest.push(model);
            } else {
                dtm.log('registering a new instrument: ' + arg);
                instr.params.name = arg;
                instr.params.categ = 'instr';
                dtm.modelColl.push(instr);
            }

        } else if (typeof(arg) !== 'undefined') {
            if (arg.params.categ === 'instr') {
                instr.params.instrModel = arg; // TODO: check the class name
                instr.model(arg);
            }
        }

        return instr;
    };

    instr.load(arg);

    return instr;
};

dtm.i = dtm.instr;