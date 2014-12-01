/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

// TODO: a subclock system that follows master's tempo / ticks

/**
 * Creates a new instance of clock. Don't put "new".
 * @function module:clock.clock
 * @param [bpm=60] {number} Tempo in beats-per-minute. Recommended value range is around 60-140.
 * @param [subDiv=4] {integer} Sub division / tick speed. Recommended: 4, 8, 16, etc.
 * @returns {dtm.clock} a new clock object
 * @example
 *
 * var cl = dtm.clock(120);
 * cl.start();
 */
dtm.clock = function (bpm, subDiv, time) {
    var clock = {
        className: 'dtm.clock',

        interval: 1,

        time: [4, 4],
        beat: 0,

        list: [],

        params: {
            isOn: false,
            sync: true,
            bpm: 60,
            subDiv: 4,
            random: 0,
            swing: 50
        },

        // CHECK: just for debugging
        callbacks: []
    };

    clock.params.tempo = clock.params.bpm;

    // private
    var callbacks = [];

    // member?
    var curTime = 0.0;

    /**
     * Set the main parameters of the clock.
     * @function module:clock#set
     * @param bpm {number}
     * @param [subDiv] {number}
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv) {
        if (typeof(bpm) !== 'undefined') {
            clock.params.bpm = bpm;
            clock.params.sync = false;
        }
        if (typeof(params.subDiv) !== 'undefined') {
            clock.params.subDiv = subDiv;
        }

        return clock;
    };

    clock.sync = function (bool) {
        if (typeof(bool) === 'undefined') {
            bool = true;
        }

        clock.params.sync = bool;
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
            clock.params.bpm = 60;
            return clock;
        }
        clock.params.bpm = val;
        clock.tempo = val;
        return clock;
    };

    /**
     * Same as bpm().
     * @function module:clock#tempo
     */
    clock.tempo = clock.bpm;

    clock.subDiv = function (val) {
        val = val | 4;
        clock.params.subDiv = val;
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

    /**
     * Registers a callback function to selected or all ticks of the clock.
     * @function module:clock#add
     * @param cb {function} Callback function.
     * @param [beats] {array} Sequence of beat numbers (int) on which the callback function should be called. The default is the every beat.
     * @returns {dtm.clock} self
     */
    clock.add = function (cb, beats) {
        if (arguments.length == 1) {
            beats = _.range((clock.params.subDiv * clock.time[0] / clock.time[1]));
        }
//        if (_.findKey(cb, 'modelName')) {
//            cb.addParentClock(clock); // CHECK: risky
//        }
//
//        console.log(_.findKey(cb, 'modelName'));

        clock.callbacks.push([cb, beats]);
        return clock;
    };

//    clock.addToBeats = function (cb, iArr) {
//        callbacks.push([cb, iArr]);
//        return clock;
//    };

    /**
     * Starts the clock.
     * @function module:clock#start
     * @returns {dtm.clock} self
     */
    clock.start = function (timeErr) {
        if (clock.params.isOn !== true) {
            clock.params.isOn = true;
            clock.tick();

            if (!clock.params.isMaster) {
                dtm.clocks.push(clock);
            }
        }
        return clock;
    };

    clock.run = clock.play = clock.start;

    var clockSrc;

    /**
     * Makes the clock tick once.
     * @param [timeErr=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timeErr) {
        timeErr = timeErr || 0;
//            if (isNaN(timeErr)) {
//                timeErr = 0;
//            }
        if (clock.params.isOn) {

            if (!clock.params.sync && !clock.params.isMaster) {
                clockSrc = actx.createBufferSource();
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                var freq = clock.params.bpm / 60.0 * (clock.params.subDiv / 4.0);
//            var pbRate = 1/(1/freq - Math.abs(timeErr));

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * (clock.params.random / 100) * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (100 - clock.params.swing) / 50;
                } else {
                    clockSrc.playbackRate.value *= clock.params.swing / 50;
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
                    if (_.indexOf(cb[1], clock.beat) > -1) {
                        cb[0](clock);
                    }
                });

                clock.beat = (clock.beat + 1) % (clock.params.subDiv * clock.time[0] / clock.time[1]);

                return clock;

            } else if (clock.params.sync && !clock.params.isMaster) {
                //if (dtm.master.clock.beat % Math.round(480/clock.params.subDiv) === 0) {
                //    _.forEach(clock.callbacks, function (cb) {
                //        if (_.indexOf(cb[1], clock.beat) > -1) {
                //            cb[0](clock);
                //        }
                //    });
                //}

                return clock;
            } else if (clock.params.isMaster) {
                clockSrc = actx.createBufferSource();
                clockSrc.buffer = clockBuf;
                clockSrc.connect(out());

                var freq = clock.params.bpm / 60.0 * (clock.params.subDiv / 4.0);

                clockSrc.playbackRate.value = freq * clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * (clock.params.random / 100) * _.sample([1, -1]);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (100 - clock.params.swing) / 50;
                } else {
                    clockSrc.playbackRate.value *= clock.params.swing / 50;
                }

                clockSrc.start(now() + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = now() - curTime;
                    clock.tick();

                    //return function (cb) {
                    //    cb();
                    //};
                };

                _.forEach(clock.callbacks, function (cb) {
                    if (_.indexOf(cb[1], clock.beat) > -1) {
                        cb[0](clock);
                    }
                });

                clock.beat = (clock.beat + 1) % (clock.params.subDiv * clock.time[0] / clock.time[1]);
            }

        }
    };

    clock.tickSynced = function () {
        if (clock.params.sync) {
            if (dtm.master.clock.beat % Math.round(480/clock.params.subDiv) === 0) {
                _.forEach(clock.callbacks, function (cb) {
                    if (_.indexOf(cb[1], clock.beat) > -1) {
                        cb[0](clock);
                    }
                });
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
        if (clock.params.isOn === true) {
            clock.params.isOn = false;
        }
        return clock;
    };

    clock.clear = function () {
        clock.callbacks = [];
        return clock;
    };

    // TODO: use -1to1 ratio than %
    /**
     * Applies swing to the every 2nd beat. (E.g. The 2nd 16th note in a 8th note interval).
     * @function module:clock#swing
     * @param [amt=50] {number} Percentage of swing. (E.g. 50%: straight, 75%: hard swing, 40%: pushed)
     * @returns {dtm.clock}
     */
    clock.swing = function (amt) {
        clock.params.swing = amt || 50;
        return clock;
    };

    clock.shuffle = clock.swing;


    // TODO: use 0to1 ratio than %
    /**
     * Randomize the timings of the ticks.
     * @function module:clock#randomize
     * @param amt {number} Percentage of randomization per beat.
     * @returns {dtm.clock}
     */
    clock.randomize = function (amt) {
        clock.params.random = amt || 0;
        return clock;
    };

    clock.random = clock.randomize;
    clock.rand = clock.randomize;

    clock.resetNextBeat = function () {
        clock.beat = 0;
        return clock;
    };

    if (!clock.params.isMaster && typeof(dtm.master) !== 'undefined') {
        dtm.master.clock.add(clock.tickSynced);
    }

    // assign input arguments...
    //_.forEach(arguments, function (val, idx) {
    //    switch (idx) {
    //        case 0: clock.params.bpm = val; break;
    //        case 1: clock.params.subDiv = val; break;
    //    }
    //});

    if (typeof(bpm) !== 'undefined') {
        clock.params.bpm = bpm;
        clock.params.sync = false;
    }

    if (typeof(subDiv) !== 'undefined') {
        clock.params.subDiv = subDiv;
    }

    if (typeof(time) !== 'undefined') {
        clock.params.time = time;
    }

    return clock;
};

dtm.c = dtm.clock;