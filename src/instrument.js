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
        className: 'dtm.instrument',
        params: {
            name: null,
            isPlaying: false,
            poly: false,

            modDest: [],
            clock: dtm.clock(120, 8),
            sync: true,
            subDivision: 16
        },

        instrModel: null,
        models: {
            voice: dtm.synth()
        },
        modelList: []
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
                instr.models[categ] = dtm.array(arg);
            } else {
                instr.models['any'] = dtm.array(arg);
            }
        } else if (typeof(arg) === 'object') {
            if (arg.className === 'dtm.model') {
                if (arg.params.categ === 'instr') {
                    // CHECK: ...
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    instr.models[categ] = arg;
                    instr.params.modDest.push(arg);

                } else if (categ) {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                    instr.models[categ] = arg;
                    instr.params.modDest.push(arg);
                } else if (arg.params.categ !== 'any') {
                    dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                    instr.models[arg.params.categ] = arg;
                    instr.params.modDest.push(arg);
                }
            } else if (arg.className === 'dtm.array') {
                instr.models[categ] = arg;
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
                instr.models[categ] = model;
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
            instr.models.voice.set(arg);
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

            if (!instr.instrModel) {
                instr.params.clock.add(function () {
                    var v = instr.models.voice;

                    // CHECK: only for dtm.arrays
                    if (typeof(instr.models.beats) !== 'undefined') {
                        if (instr.models.beats.next()) {
                            if (typeof(instr.models.melody) !== 'undefined') {
                                v.nn(instr.models.melody.next());
                            }

                            v.play();
                        }
                    } else {
                        if (typeof(instr.models.melody) !== 'undefined') {
                            v.nn(instr.models.melody.next());
                        }

                        v.play();
                    }
                }).start(); // ???
            }

            if (instr.instrModel) {
                if (instr.instrModel.params.categ === 'instr') {
                    instr.instrModel.stop();
                    instr.instrModel.play();
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

            if (instr.instrModel) {
                if (instr.instrModel.params.categ === 'instr') {
                    instr.instrModel.stop();
                }
            }

            instr.params.clock.stop();
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

    instr.map = function () {
        return instr;
    };

    instr.get = function (key) {
        return instr.params[key];
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
                instr.instrModel = model;
                instr.params.name = arg;
                //instr.models = model.models;
                instr.model(model);
                //instr.play = instr.instrModel.play;
                //instr.run = instr.instrModel.run;

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
                instr.instrModel = arg; // TODO: check the class name
                instr.model(arg);
            }
        }

        return instr;
    };

    instr.load(arg);

    return instr;
};

dtm.i = dtm.instr;