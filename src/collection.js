/**
 * @fileOverview Collection object. Right now, empty.
 * @module collection
 */

/**
 * Creates a new instance of dtm.collection object
 * @function module:collection.collection
 * @returns dtm.collection {object}
 */
dtm.collection = function () {
    var params = {
        keys: [],
        types: [],
        values: []
    };

    var coll = {
        type: 'dtm.collection'
    };

    coll.get = function (param) {
        var out = null;
        return out;
    };

    coll.set = function () {
        return coll;
    };

    coll.update = function () {
        return coll;
    };

    coll.map = function () {
        return coll;
    };

    return coll;
};

dtm.coll = dtm.collection;

// TODO: transformation module for this???