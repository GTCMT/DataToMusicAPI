/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

// TODO: modeling - sharing information...

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

        output: null // dtm.array
    };

    var model = {
        type: 'dtm.model',

        parent: {},
        mod: {},
        param: {},

        params: {},
        models: {},

        modes: {
            'literal': ['literal', 'lit', 'l'],
            'adapt': ['adapt', 'adapted', 'adaptive', 'a'],
            'preserve': ['preserve', 'preserved', 'p']
        }
    };

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

    model.set = function (key, val) {
        params.value = val; // temp
        return model;
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

    model.load = function (name) {
        if (typeof(name) === 'string') {
            var load = _.find(dtm.modelColl, {params: {name: name}});

            if (typeof(load) !== 'undefined') {
                dtm.log('overriding an existing model: ' + name);
                model = load;

            } else {
                if (typeof(categ) === 'string') {
                    params.categ = categ;
                }

                dtm.log('registering a new model: ' + name);
                params.name = name;
                dtm.modelColl.push(model);
            }
        }

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

        return model;
    };

    model.map = model.assignMethods;

    /**
     * Call this when creating a new model, which you may want to reuse with new instanciation.
     * @function module:model#register
     * @returns {dtm.model}
     */
    model.register = function () {
        dtm.modelCallers[model.get('name')] = arguments.callee.caller;
        return model;
    };

    model.load(name);
    return model;
};

dtm.m = dtm.model;