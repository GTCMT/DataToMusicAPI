/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

// TODO: modeling - sharing information...

/**
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

        // assigning array or data/coll???
        //array: null,
        //data: null,
        parent: {},
        setter: {},

        params: {},
        models: {}
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

    model.mod = function (val) {
        return model;
    };

    model.modulate = model.mod;

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
        return model;
    };

    model.assignMethods = function (parent) {
        _.forEach(model.setter, function (method, key) {
            parent[key] = method;
        });
        return model;
    };

    model.map = model.assignMethods;

    model.load(name);

    return model;
};

dtm.m = dtm.model;