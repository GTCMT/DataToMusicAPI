/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

/**
 * Creates a new instance of clock.
 * @function module:clock.clock
 * @param [bpm=true] {boolean|number} Synchronization or Tempo setting. If given a boolean, or string "sync", it sets the current sync state of the clock as a slave to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM for unsynced clock is 120. Recommended value range is around 60-140.
 * @param [subDiv=16] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
 * @param [autoStart=true] {boolean} If true, the clock is started when it is instantiated. Works well with a synced clock.
 * @returns {dtm.clock} a new clock object
 * @example
 *
 * var cl = dtm.clock(120);
 * cl.start();
 */
dtm.clock = function (bpm, subDiv, autoStart) {
    var params = {
        // webAudio, animationFrame, date, hrtime (node)
        source: 'animationFrame',

        name: null,
        isOn: false,
        sync: true,
        isMaster: false,

        bpm: 120,
        subDiv: 2,
        random: 0,
        swing: 0.5,

        current: 0,
        previous: 0,
        reported: 0,
        resolution: 480,
        beat: 0,
        prevBeat: -1,

        lookahead: 0.1,
        offset: 0,
        requestId: null,
        autoStart: true,

        time: [4, 4]
    };

    var clock = {
        type: 'dtm.clock',

        interval: 1,
        beat: 0,
        list: [],

        // temp
        prev: 0,

        // CHECK: public - just for debugging
        callbacks: []
    };

    // member?
    var curTime = 0.0;

    var actx = null, clockBuf = null;

    /**
     * Get the value of a parameter of the clock object.
     * @function module:clock#get
     * @param param
     * @returns {*}
     */
    clock.get = function (param) {
        switch (param) {
            case 'bpm':
            case 'tempo':
                if (params.sync) {
                    return dtm.master.get('clock').get('bpm');
                } else {
                    return params.bpm;
                }

            case 'subdiv':
            case 'subDiv':
            case 'div':
                return params.subDiv;

            case 'time':
                return params.subDiv;

            case 'dur':
            case 'interval':
                return getInterval();

            case 'freq':
                return getFreq();

            case 'sync':
            case 'synced':
                return params.sync;

            case 'lookahead':
            case 'la':
                return params.lookahead;

            case 'isOn':
            case 'isPlaying':
                return params.isOn;

            case 'source':
                return params.source;

            case 'beat':
                return params.beat;

            case 'cur':
            case 'current':
                return params.current;

            case 'prev':
            case 'previous':
                return params.previous;

            case 'rep':
            case 'reported':
                return params.reported;

            default:
                return clock;
        }
    };

    /**
     * Set the main parameters of the clock.
     * @function module:clock#set
     * @param [bpm] {boolean|number} Synchronization or Tempo setting. If given a boolean, it sets the current sync state of the clock to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM is 120. Recommended value range is around 60-140.
     * @param [subDiv=16] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
     * @param [autoStart=true] {boolean} If true, the clock is started when it is instantiated. Works well with a synced clock.
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv, autoStart) {
        if (typeof(bpm) === 'function') {
            clock.callback(bpm);
        } else {
            clock.bpm(bpm);
        }

        if (!isEmpty(subDiv)) {
            clock.subDiv(subDiv);
        }

        if (isBoolean(autoStart)) {
            params.autoStart = autoStart;
        }

        return clock;
    };

    /**
     * Sets the clock to be synced to the master clock. When set true, the tempo/BPM in itself is ignored.
     * @function module:clock#sync
     * @param [bool=true] {boolean}
     * @returns {dtm.clock}
     */
    clock.sync = function (bool) {
        if (!isBoolean(bool)) {
            bool = true;
        }

        params.sync = bool;
        return clock;
    };

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param bpm {number} BPM value
     * @returns {dtm.clock} self
     * @example
     *
     * var cl = dtm.createClock();
     * cl.bpm(90);
     */
    clock.bpm = function (bpm) {
        if (isNumber(bpm)) {
            params.bpm = bpm;
            params.sync = false;
        } else if (typeof(bpm) === 'boolean') {
            params.sync = bpm;
        } else if (bpm == 'sync') {
            params.sync = true;
        }

        return clock;
    };

    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {number|string} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subDiv = function (val) {
        if (isNumber(val)) {
            params.subDiv = val;
        } else if (typeof(val) === 'string') {
            val = val.split('/');
            try {
                val = Math.round(parseFloat(val[1])/parseFloat(val[0]));
            } catch (e) {
                return clock;
            }
            params.subDiv = val;
        }
        return clock;
    };

    clock.div = clock.subdiv = clock.subDiv;

    clock.time = function (val) {
        if (isNumber(val) && val !== 0) {
            params.subDiv = 1/val;
        }
        return clock;
    };

    function getInterval() {
        if (params.sync) {
            return 1.0/(dtm.master.get('clock').get('bpm')/60.0 * params.subDiv/4.0);
        } else {
            return 1.0/(params.bpm/60.0 * params.subDiv/4.0);
        }
    }

    function getFreq() {
        if (params.sync) {
            return dtm.master.get('clock').get('bpm')/60.0 * params.subDiv/4.0;
        } else {
            return params.bpm/60.0 * params.subDiv/4.0;
        }
    }

    clock.setTime = function (input) {
        if (isArray(input)) {
            clock.params.time = input;
        } else if (typeof(input) === 'string') {
            clock.params.time = input.split('/');
        }
        return clock;
    };

    clock.meter = clock.setTime;

    clock.setMaster = function (bool) {
        params.isMaster = bool;
        return clock;
    };

    clock.lookahead = function (lookahead) {
        if (isNumber(lookahead) && lookahead >= 0.0) {
            params.lookahead = lookahead;
        }
        return clock;
    };

    clock.la = clock.lookahead;

    /**
     * Registers a callback function to selected or all ticks of the clock.
     * @function module:clock#add
     * @param cb {function} Callback function.
     * @param [name] {string}
     * @returns {dtm.clock} self
     */
    clock.add = function (cb, name) {
        // prevent adding identical functions
        var dupe = false;

        if (typeof(name) === 'string') {
            _.forEach(clock.callbacks, function (stored) {
                if (stored.name == name) {
                    dtm.log('clock.add(): identical function exists in the callback list');

                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        } else {
            _.forEach(clock.callbacks, function (stored) {
                if (_.isEqual(stored, cb)) {
                    dtm.log('clock.add(): identical function exists in the callback list');

                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        }

        return clock;
    };

    clock.cb = clock.callback = clock.call = clock.register = clock.reg = clock.add;

    /**
     * @function module:clock#remove
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.remove = function (id) {
        if (typeof(id) === 'function') {
            dtm.log('removing a calblack function');
            _.remove(clock.callbacks, function (cb) {
                return _.isEqual(cb, id);
            });
        } else if (typeof(id) === 'string') {
            dtm.log('removing a calblack function: ' + id);
            _.remove(clock.callbacks, function (cb) {
                return cb.name == id;
            });
        }

        return clock;
    };

    /**
     * @function module:clock#rem
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.del = clock.delete = clock.rem = clock.remove;

    /**
     * Modifies or replaces the content of a callback function while the clock may be running. Note that the target callback needs to be a named function.
     * @function module:clock#modify
     * @param id {function|string}
     * @param [fn] {function}
     * @returns {dtm.clock}
     */
    clock.modify = function (id, fn) {
        if (typeof(id) === 'function') {
            dtm.log('modifying the callback: ' + id.name);
            clock.remove(id.name);
            clock.add(id);
        } else if (typeof(id) === 'string') {
            dtm.log('modifying the callback: ' + id);
            clock.remove(id);

            // CHECK: don't add if the same name doesn't already exist
            if (fn.name == '') {
                // fn.name is read-only!
                var temp = new Function(
                    'return function ' + id + fn.toString().slice(8)
                )();
                clock.add(temp);
            } else {
                clock.add(fn);
            }
        }
        return clock;
    };

    clock.replace = clock.mod = clock.modify;

    /**
     * Starts the clock.
     * @function module:clock#start
     * @returns {dtm.clock} self
     */
    clock.start = function () {
        if (params.source === 'animationFrame') {
            window.requestAnimationFrame(clock.tick);
        }

        if (params.isMaster) {
            dtm.log('starting the master clock');
        } else {
            dtm.log('starting a clock');
        }

        if (params.isOn !== true) {
            params.isOn = true;
            clock.tick();

            if (!params.isMaster) {
                dtm.clocks.push(clock);
            }
        }
        return clock;
    };

    clock.run = clock.play = clock.start;

    var clockSrc;

    // TODO: refactor big time!!!!
    // TODO: also implement swing / random to the af-based clock
    /**
     * Makes the clock tick once.
     * @param [timestamp=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timestamp) {
        if (!params.isOn) {
            // do nothing
            return clock;
        }

        var freq = 1;

        if (!params.sync && !params.isMaster) {
            if (params.source === 'webAudio') {
                actx = dtm.wa.actx;
                clockSrc = actx.createBufferSource();
                clockBuf = dtm.wa.clockBuf;
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                freq = params.bpm / 60.0 * (params.subDiv / 4.0);
                //var pbRate = 1/(1/freq - Math.abs(timeErr));

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * params.random * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= params.swing / 0.5;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    //var error = now() - curTime;
                    //clock.tick(error);
                    clock.tick();
//                curTime = now();
                };

                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (params.subDiv * clock.params.time[0] / clock.params.time[1]);

            } else if (params.source === 'animationFrame') {
                params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution * params.subDiv / 4);

                if (params.reported !== params.current) {
                    if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                        params.beat = Math.round(params.current / params.resolution);
                        //console.log(params.beat);

                        _.forEach(clock.callbacks, function (cb) {
                            cb(clock);
                        });
                    }

                    params.current = params.reported;
                }

                window.requestAnimationFrame(clock.tick);
            }

        } else if (params.sync && !params.isMaster) {

        } else if (params.isMaster) {
            if (params.source === 'webAudio') {
                actx = dtm.wa.actx;
                clockSrc = actx.createBufferSource();
                clockBuf = dtm.wa.clockBuf;
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                freq = params.bpm / 60.0 * (params.subDiv / 4.0);

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * params.random * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= params.swing / 0.5;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = now() - curTime;

                    clock.tick(error);

                    //return function (cb) {
                    //    cb();
                    //};
                };

                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (params.subDiv * clock.params.time[0] / clock.params.time[1]);

            } else if (params.source === 'animationFrame') {
                params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution);

                if (params.reported !== params.current) {
                    if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                        params.beat = Math.round((params.current-params.offset) / params.resolution);

                        //console.log(dtm.wa.actx.currentTime);
                        //console.log(params.reported);
                    }


                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });

                    params.current = params.reported;
                }

                params.requestId = window.requestAnimationFrame(clock.tick);
            }
        }

        return clock;
    };

    // TODO: stopping system should remove these callbacks?
    // TODO: implement shuffle and randomize
    clock.tickSynced = function () {
        if (!params.isOn || !params.sync) {
            return clock;
        }

        if (dtm.master.clock.get('source') === 'webAudio') {
            if (dtm.master.clock.beat % Math.round(params.resolution/params.subDiv) === 0) {
                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });
            }
        }

        else if (dtm.master.clock.get('source') === 'animationFrame') {
            if ((dtm.master.clock.get('cur') % (params.resolution/params.subDiv*4)) < params.prev) {

                params.beat = Math.round((dtm.master.clock.get('cur')-params.offset) / params.resolution * params.subDiv / 4);

                //if (params.beat > params.prevBeat) {
                _.forEach(clock.callbacks, function (cb) {
                    cb(clock);
                });
                //}

                params.prevBeat = params.beat;
            }
            params.prev = dtm.master.clock.get('cur') % (params.resolution / params.subDiv * 4);
        }

        return clock;
    };

    /**
     * Stops the clock.
     * @function module:clock#stop
     * @returns {dtm.clock} self
     */
    clock.stop = function () {
        if (params.isMaster) {
            dtm.log('stopping the master clock');
        } else {
            dtm.log('stopping a clock');
        }

        if (params.isOn === true) {
            params.isOn = false;
        }
        return clock;
    };

    clock.clear = function () {
        clock.callbacks = [];
        return clock;
    };

    /**
     * Applies swing to the every 2nd beat. (E.g. The 2nd 16th note in a 8th note interval).
     * @function module:clock#swing
     * @param [amt=0.5] {number} Percentage of swing. (E.g. 0.5(50%): straight, 0.75: hard swing, 0.4: pushed)
     * @returns {dtm.clock}
     */
    clock.swing = function (amt) {
        params.swing = amt || 0.5;
        return clock;
    };

    clock.shuffle = clock.swing;


    /**
     * Randomize the timings of the ticks.
     * @function module:clock#randomize
     * @param amt {number} Amount of randomization per beat (0-1).
     * @returns {dtm.clock}
     */
    clock.randomize = function (amt) {
        params.random = amt || 0;
        return clock;
    };

    clock.random = clock.randomize;
    clock.rand = clock.randomize;

    clock.reset = function () {
        //if (params.source === 'animationFrame') {
        //    window.cancelAnimationFrame(params.requestId);
        //}

        if (params.isMaster) {
            params.offset = params.current;
        } else {
            params.offset = dtm.master.clock.get('cur');
        }
        params.beat = 0;

        //clock.start();
        return clock;
    };

    clock.flush = function () {
        return clock;
    };

    clock.when = function (arr, cb) {
        if (isArray(arr)) {
            if (arr.indexOf(clock.beat) > -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.notWhen = function (arr, cb) {
        if (isArray(arr)) {
            if (arr.indexOf(clock.beat) == -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    /**
     * Executes an event at certain tick(s) of the clock.
     * @function module:clock#on
     * @param condition {string} Right now, it only supports "every".
     * @param length {number}
     * @param callback {function}
     * @returns {dtm.clock}
     * @example
     * dtm.clock().on('every', 4, callbackFunction);
     */
    clock.on = function (condition, length, callback) {
        switch (condition) {
            case 'every':
                var cb = (function (len, cb) {
                    return function (c) {
                        if (c.get('beat') % len === 0) {
                            cb(c);
                        }
                    };
                })(arguments[1], arguments[2]);

                clock.callbacks.push(cb);
                break;
            default:
                break;
        }

        return clock;
    };

    clock.seq = function (callback, seqArray, interval) {
        var cb = (function (cb, arr, len) {
            return function (c) {
                if (len === undefined) {
                    len = c.get('subDiv');
                }
                if (arr.indexOf(c.get('beat') % len) > -1) {
                    cb(c);
                }
            };
        })(arguments[0], arguments[1], arguments[2]);

        clock.callbacks.push(cb);
        return clock;
    };

    // single-shot scheduler
    clock.delayEvent = function () {
        return clock;
    };

    clock.delay = clock.delayEvent;

    if (!params.isMaster && typeof(dtm.master) !== 'undefined') {
        dtm.master.clock.add(clock.tickSynced);

        if (params.autoStart) {
            clock.start();
        }
    }

    clock.set(bpm, subDiv, autoStart);

    return clock;
};

dtm.c = dtm.clock;