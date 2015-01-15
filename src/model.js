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
    var model = {
        className: 'dtm.model',

        // assigning array or data/coll???
        array: null,
        data: null,

        params: {
            name: null,
            categ: 'any',
            categories: [],
            voice: null
        }
    };

    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        model.params.categ = categ;
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
                    model.params.categ = categ;
                }

                dtm.log('registering a new model: ' + name);
                model.params.name = name;
                dtm.modelColl.push(model);
            }
        }

        return model;
    };

    model.mod = function (val) {
        return model;
    };

    model.get = function (key) {
        return model.params[key];
    };

    model.modulate = model.mod;

    // CHECK: mapping an automatic modulation source???
    model.map = function (arrobj) {

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
        return model;
    };

    model.load(name);

    return model;
};

dtm.m = dtm.model;