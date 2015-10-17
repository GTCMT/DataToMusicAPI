/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

/**
 * Creates a new empty musical model object, or overloads on an existing model in the collection.
 * @function module:model.model
 * @param [name] {string} Give it a unique name.
 * @param [categ] {string}
 * @returns a new model instance
 */
dtm.model = function (name, categ) {
    var params = {
        name: null,
        categ: 'none',
        categories: [],
        defaultCb: null,

        registering: false,
        loading: true,

        output: null // dtm.array
    };

    var model = function () {
        if (typeof(params.defaultCb) === 'function') {
            return params.defaultCb.apply(this, arguments);
        } else {
            return model;
        }
    };

    model.default = function (callback) {
        params.defaultCb = callback;
    };

    model.type = 'dtm.model';
    model.parent = {};
    model.siblings = [];

    model.mod = {};
    model.param = {};
    model.set = {};
    model.map = {};

    model.params = {};
    model.models = {};

    model.modes = {
        'literal': ['literal', 'lit', 'l'],
        'adapt': ['adapt', 'adapted', 'adaptive', 'a'],
        'preserve': ['preserve', 'preserved', 'p', 'n']
    };

    if (name !== undefined) {
        params.name = name;
    }

    if (categ !== undefined) {
        params.categ = categ;
    }

    model.get = function (param) {
        switch (param) {
            case 'name':
                return params.name;

            case 'category':
            case 'categ':
                return params.categ;

            default:
                return params.output;
        }
    };


    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        params.categ = categ;
        return model;
    };

    //model.load = function (name, categ) {
        //console.log(model.load.caller.toString());
        //if (typeof(name) === 'string') {
        //    var load;
        //    for (var key in dtm.modelCallers) {
        //        if (key === name) {
        //            //if (model.load.caller.arguments[0] !== name) {
        //            if (params.loading) {
        //                console.log(name);
        //                load = dtm.modelCallers[name]();
        //            }
        //        }
        //    }
        //
        //    if (load === undefined) {
        //        for (var key in dtm.modelColl) {
        //            if (key === name && model.load.caller.arguments[0] !== name) {
        //                load = dtm.modelColl[name].clone();
        //            }
        //        }
        //    }
        //
        //    if (load !== undefined) {
        //        dtm.log('loading a registered / saved model: ' + name);
        //        model = load;
        //    } else {
        //        if (typeof(categ) === 'string') {
        //            params.categ = categ;
        //        }
        //
        //        params.name = name;
        //    }
        //}
    //    return model;
    //};

    /**
     * Call this when creating a new model, which you want to reuse later by newly instantiating.
     * @function module:model#register
     * @returns {dtm.model}
     */
    model.register = function () {

        //if (model.register.caller.arguments[0] !== null) {
        //    dtm.modelCallers[model.get('name')] = model.register.caller;
        //    params.loading = true;
        //}
        var modelAlreadyExists = false;

        //if (model.register.caller.arguments[0]) {
        //    params.loading = true;
        //}
        //params.loadable = model.register.caller.arguments[0];

        for (var key in dtm.modelCallers) {
            if (key === model.get('name')) {
                dtm.log('model already registered: ' + model.get('name'));
                modelAlreadyExists = true;
                params.registering = false;
            }
        }

        if (!modelAlreadyExists) {
            dtm.log('registering a new model: ' + model.get('name'));
            dtm.modelCallers[model.get('name')] = model.register.caller;
            params.registering = true;
        }

        return model;
    };

    model.save = function () {
        dtm.modelColl[model.get('name')] = model;
        return model;
    };


    // for instr-type models
    model.start = function () {
        return model;
    };

    model.stop = function () {
        return model;
    };

    model.morphArrays = function (arrObj1, arrObj2, midx) {
        return model;
    };

    model.clone = function () {
        //var m = dtm.model();
        //m.output = clone(model.output);
        //_.forEach(model.setter, function (val, key) {
        //    m.setter[key] = clone(val);
        //});
        //m.modules = clone(model.modules);
        //
        //return m;
        return clone(model);
    };

    model.assignMethods = function (parent) {
        _.forEach(model.mod, function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        _.forEach(model.param, function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        _.forEach(model.set, function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        _.forEach(model.map, function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });
        return model;
    };

    if (typeof(name) === 'string') {

        //console.log(arguments.callee.caller.toString());
        params.loading = arguments.callee.caller.arguments[0];

        var modelLoaded, key;
        for (key in dtm.modelCallers) {
            if (key === name) {
                if (params.loading !== true) {
                    dtm.log('found a registered model: ' + name);
                    modelLoaded = dtm.modelCallers[name](true);
                }
            }
        }

        if (modelLoaded === undefined) {
            for (key in dtm.modelColl) {
                if (key === name && model.load.caller.arguments[0] !== name) {
                    modelLoaded = dtm.modelColl[name].clone();
                }
            }
        }

        if (modelLoaded !== undefined) {
            dtm.log('loading a registered / saved model: ' + name);
            model = modelLoaded;
        }
    }

    //model.load.apply(this, arguments);
    return model;
};

dtm.model.load = dtm.model;
dtm.m = dtm.model;
