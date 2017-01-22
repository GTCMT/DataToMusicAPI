dtm.to = dtm.map = function (src, fn) {
    // if (!Data.prototype.trace) {
    //     Data.prototype.trace = true;
    // } // timing issue

    var tgt = src.clone();
    fn(tgt);
    tgt.params.processFn = fn;

    src.params.targets[tgt.params.id] = tgt;

    src.params.trace = true;
    dtm.params.traced.push(src); // TODO: hacky!

    // reset the handler's method interceptor
    src.meta.setInterceptor(function (d, k) {
        if (typeof(d[k]) === 'function' && ['hasOwnProperty', 'clone', 'print', 'plot', 'process'].indexOf(k) === -1) {
            var tracedFn = d[k];
            return function () {
                var args = arguments;
                if (src.params.trace) {
                    objForEach(src.params.targets, function (t) {
                        tracedFn.apply(t, args);
                        t.params.processFn(t);
                    });
                }
                return tracedFn.apply(this, args);
            }
        } else {
            return d[k];
        }
    });

    return tgt;
};

dtm.to.enable = function (bool) {
    if (!isBoolean(bool)) {
        bool = true;
    }
    Data.prototype.traceGlobal = bool;
    return dtm.to;
};

dtm.to.enable();