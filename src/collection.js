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
    var coll = {
        className: 'dtm.collection',
        keys: [],
        types: [],
        values: []
    };

    coll.set = function () {

    };

    coll.update = function () {

    };

    coll.map = function () {

    };

    return coll;
}

dtm.coll = dtm.collection;

// TODO: transformation module for this???