/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

/**
 * Creates a new instance of clock. Don't put "new".
 * @function module:clock.clock
 * @param [bpm=60] {number} Tempo in beats-per-minute. Recommended value range is around 60-140.
 * @param [subDiv=4] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
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
        subDiv: 16,
        random: 0,
        swing: 0.5,

        current: 0,
        previous: 0,
        reported: 0,
        resolution: 480,
        beat: 0,

        autoStart: true
    };

    var clock = {
        type: 'dtm.clock',

        interval: 1,

        time: [4, 4],
        beat: 0,

        list: [],

        // temp
        prev: 0,

        // CHECK: just for debugging
        callbacks: []
    };

    // private
    var callbacks = [];

    // member?
    var curTime = 0.0;

    clock.get = function (param) {
        switch (param) {
            case 'bpm':
            case 'tempo':
                return params.bpm;

            case 'subdiv':
            case 'subDiv':
            case 'div':
                return params.subDiv;

            case 'sync':
            case 'synced':
                return params.sync;

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
     * @param [bpm] {number}
     * @param [subDiv] {number}
     * @param [time] {number}
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv, autoStart) {
        if (typeof(bpm) === 'number') {
            params.bpm = bpm;
            params.sync = false;
        } else if (typeof(bpm) === 'boolean') {
            params.sync = bpm;
        }

        if (typeof(subDiv) !== 'undefined') {
            params.subDiv = subDiv;
        }

        if (typeof(autoStart) !== 'undefined') {
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
        if (typeof(bool) === 'undefined') {
            bool = true;
        }

        params.sync = bool;
        return clock;
    };

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param val {number} BPM value
     * @returns {dtm.clock} self
     * @chainable
     * @example
     *
     * var cl = dtm.createClock();
     * cl.setBpm(90);
     */
    clock.bpm = function (val) {
        if (!arguments || !val) {
            //params.bpm = 60;
            return clock;
        } else {
            params.bpm = val;
            params.sync = false;
            return clock;
        }
    };

    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {integer} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subDiv = function (val) {
        val = val || 4;
        params.subDiv = val;
        return clock;
    };

    clock.div = clock.subdiv = clock.subDiv;

    clock.interval = function (sec) {
        return clock;
    };

    clock.setTime = function (input) {
        if (typeof(input) === 'Array') {
            clock.time = input;
        } else if (typeof(input) === 'string') {
            clock.time = input.split('/');
        }
        return clock;
    };

    clock.setMaster = function (bool) {
        params.isMaster = bool;
        return clock;
    };

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

    clock.register = clock.reg = clock.add;

    ///**
    // * Registers a callback function to selected or all ticks of the clock.
    // * @function module:clock#add
    // * @param cb {function} Callback function.
    // * @param [beats] {array} Sequence of beat numbers (int) on which the callback function should be called. The default is the every beat.
    // * @returns {dtm.clock} self
    // */
    //clock.addToBeats = function (cb, iArr) {
    //    if (arguments.length == 1) {
    //        // CHECK: broken - changing the subdiv later should change this too?
    //        // maybe disable the registration for certain beats
    //        beats = _.range((params.subDiv * clock.time[0] / clock.time[1]));
    //    }
    ////        if (_.findKey(cb, 'modelName')) {
    ////            cb.addParentClock(clock); // CHECK: risky
    ////        }
    ////
    ////        console.log(_.findKey(cb, 'modelName'));
    //
    //    clock.callbacks.push([cb, beats]);
    //    return clock;
    //};

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
    clock.start = function (timeErr) {
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
     * @param [timeErr=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timestamp) {
        if (params.isOn) {
            if (!params.sync && !params.isMaster) {
                if (params.source === 'webAudio') {
                    clockSrc = actx.createBufferSource();
                    clockSrc.buffer = clockBuf;
                    clockSrc.connect(out());

                    var freq = params.bpm / 60.0 * (params.subDiv / 4.0);
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
                        var error = now() - curTime;
                        //clock.tick(error);
                        clock.tick();
//                curTime = now();
                    };

                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });

                    clock.beat = (clock.beat + 1) % (params.subDiv * clock.time[0] / clock.time[1]);

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
                    clockSrc = actx.createBufferSource();
                    clockSrc.buffer = clockBuf;
                    clockSrc.connect(out());

                    var freq = params.bpm / 60.0 * (params.subDiv / 4.0);

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

                    clock.beat = (clock.beat + 1) % (params.subDiv * clock.time[0] / clock.time[1]);

                } else if (params.source === 'animationFrame') {
                    params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution);

                    if (params.reported !== params.current) {
                        if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                            params.beat = Math.round(params.current / params.resolution);
                            //console.log(params.beat);
                        }

                        _.forEach(clock.callbacks, function (cb) {
                            cb(clock);
                        });

                        params.current = params.reported;
                    }

                    window.requestAnimationFrame(clock.tick);
                }
            }
        }

        return clock;
    };

    // TODO: stopping system should remove these callbacks?
    // TODO: implement shuffle and randomize
    clock.tickSynced = function () {
        if (params.sync && params.isOn) {
            if (dtm.master.clock.get('source') === 'webAudio') {
                if (dtm.master.clock.beat % Math.round(params.resolution/params.subDiv) === 0) {
                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });
                }
            }

            else if (dtm.master.clock.get('source') === 'animationFrame') {
                if ((dtm.master.clock.get('cur') % (params.resolution/params.subDiv*4)) < params.prev) {

                    params.beat = Math.round(dtm.master.clock.get('cur') / params.resolution * params.subDiv / 4);

                    _.forEach(clock.callbacks, function (cb) {
                        cb(clock);
                    });

                }
                params.prev = dtm.master.clock.get('cur') % (params.resolution / params.subDiv * 4);
            }
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

    clock.resetNextBeat = function () {
        clock.beat = 0;
        return clock;
    };

    clock.flush = function () {
        return clock;
    };

    clock.when = function (arr, cb) {
        if (typeof(arr) !== 'undefined') {
            if (arr.indexOf(clock.beat) > -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.notWhen = function (arr, cb) {
        if (typeof(arr) !== 'undefined') {
            if (arr.indexOf(clock.beat) == -1) {
                if (typeof(cb) !== 'undefined') {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.on = function (condition) {
        switch (condition) {
            case 'every':
                clock.callbacks.push(function (c) {
                    if (c.get('beat') % arguments[1] === 0) {
                        arguments[2](c);
                    }
                });
                break;
            default:
                break;
        }

        return clock;
    };

    // single-shot schedular
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