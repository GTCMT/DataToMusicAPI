(function () {
    var m = dtm.model('song', 'song');

    m.models = {
        form: dtm.model('form')
    };

    m.run = function () {
        return m;
    };

})();