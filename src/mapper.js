dtm.to = dtm.map = function (src, fn) {
    // if (!Data.prototype.trace) {
    //     Data.prototype.trace = true;
    // } // timing issue

    var tgt = src.clone();
    fn(tgt);
    tgt.params.processFn = fn;
    tgt.params.isTarget = true;
    tgt.attach = function (scope, afn) {
        tgt.params.attachedFn = afn.bind(scope);
    };

    src.params.targets[tgt.params.id] = tgt;

    src.params.trace = true;

    // for master to halt tracing processes
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

                        var out = t.params.processFn(t);
                        if (isDtmArray(out)) {
                            t.set(out.val);
                        } else if (!isEmpty(out)) {
                            t.set(out);
                        }

                        if (t.params.attachedFn) {
                            t.params.attachedFn(tgt.val);
                        }
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