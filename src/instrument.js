dtm.instr = function (arg) {
    var instr = {
        className: 'dtm.instrument',
        params: {
            name: null,
            isPlaying: false,
            //poly: false,

            modDest: [],
            clock: dtm.clock(),
            sync: false
        },

        instrModel: null,
        models: {},
        modelList: []
    };

    instr.model = function () {
        var arg = arguments[0];
        var categ = null; // TODO: WIP

        if (typeof(arguments[1]) === 'string') {
            categ = arguments[1];
        }

        // TODO: refactor...
        if (typeof(arg) === 'object') {
            if (arg.params.categ === 'instr') {

            } else if (categ) {
                dtm.log('assigning model "' + arg.params.name + '" to category "' + categ + '"');
                instr.models[categ] = arg;
                instr.params.modDest.push(arg);
            } else if (arg.params.categ !== 'any') {
                dtm.log('assigning model "' + arg.params.name + '" to category "' + arg.params.categ + '"');
                instr.models[arg.params.categ] = arg;
                instr.params.modDest.push(arg);
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

    instr.load = function (arg) {
        return instr;
    };

    instr.play = function () {
        // can only play single voice / instance
        if (instr.params.isPlaying !== true) {
            instr.params.isPlaying = true;
            dtm.log('playing: ' + instr.params.name);

            if (instr.instrModel.params.categ === 'instr') {
                instr.instrModel.stop();
                instr.instrModel.play();
            }

            instr.params.clock.start(); // ???


            // register to the active instr list?
            dtm.master.activeInstrs.push(instr);
        }

        return instr;
    };

    instr.stop = function () {
        if (instr.params.isPlaying === true) {
            instr.params.isPlaying = false;

            if (instr.instrModel.params.categ === 'instr') {
                instr.instrModel.stop();
            }

            instr.params.clock.stop();
        }
        return instr;
    };

    instr.clock = function () {
        return instr;
    };

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

    instr.get = function (key) {
        return instr.params[key];
    };

    instr.clone = function () {

    };

    if (typeof(arg) === 'string') {
        var model = _.find(dtm.modelColl, {params: {
            name: arg,
            categ: 'instr'
        }});

        if (typeof(model) !== 'undefined') {
            dtm.log('loading instrument model: ' + arg);
            instr.instrModel = model;
            instr.params.name = arg;
            instr.models = model.models;
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
        instr.instrModel = arg; // TODO: check the class name
    }

    instr.start = instr.play;
    instr.run = instr.play;

    return instr;
};

dtm.i = dtm.instr;