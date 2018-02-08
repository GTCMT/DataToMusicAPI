/**
 * @fileOverview
 * @module core
 */

// TODO: put this in the master
var params = {
    isLogging: false
};

/**
 * A namespace / the singleton dtm object.
 * @name module:core#dtm
 * @type {object}
 */
var dtm = {
    version: '0.8',

    log: function (arg) {
        if (params.isLogging) {
            if (arguments.callee.caller.name) {
                console.log(arguments.callee.caller.name + ': ' + arg);
            } else {
                console.log(arg);
            }
        }
    },

    // TODO: put these in dtm.master
    modelColl: [],
    modelCallers: {},
    clocks: [],

    params: {
        plotter: null,
        printer: null,
        stream: false,
        traced: []
    },

    // TODO: a function to list currently loaded objects, such as data, arrays, models... - for console livecoding situation

    get: function (param) {
        switch (param) {
            case 'models':
                return dtm.modelColl;
            case 'modelNames':
                var res = [];
                dtm.modelColl.forEach(function (m) {
                    res.push(m.get('name'));
                });
                return res;
            default:
                return null;
        }
    },

    wa: {
        isOn: true,
        useOfflineContext: false
    },

    startWebAudio: function () {
        dtm.wa.isOn = true;

        dtm.wa.actx = new (window.AudioContext || window.webkitAudioContext)();
        dtm.wa.now = function () {
            return dtm.wa.actx.currentTime;
        };
        dtm.wa.out = function () {
            return dtm.wa.actx.destination;
        };
        dtm.wa.clMult = 0.01;
        dtm.wa.clockBuf = dtm.wa.actx.createBuffer(1, Math.round(dtm.wa.actx.sampleRate * dtm.wa.clMult), dtm.wa.actx.sampleRate);
    },

    startWebMidi: function () {
        if (isEmpty(MIDI.prototype.out)) {
            if (navigator.requestMIDIAccess) {
                navigator.requestMIDIAccess({
                    sysex: false
                }).then(function (webMidi) {
                    var devices = [];
                    var iter = webMidi.outputs.values();
                    for (var i = iter.next(); i && !i.done; i = iter.next()) {
                        devices.push(i.value);
                    }
                    MIDI.prototype.devices = devices;
                    MIDI.prototype.out = devices[0];

                    var inputs = Array.from(webMidi.inputs.values());
                    inputs.forEach(function (device) {
                        device.onmidimessage = MIDI.prototype.oninput;
                    });
                }, null);
            } else {
                console.log("Web MIDI is not supported in this browser!");
            }
        }
    },

    oscParams: {
        isOpen: false,
        port: null
    },

    startOsc: function () {
        dtm.osc.isOn = true;
        dtm.osc.start();
    },

    export: function () {
        objForEach(dtm, function (v, k) {
            if (isEmpty(window[k])) {
                window[k] = v;
            }
        });
    },

    setPlotter: function (fn) {
        dtm.params.plotter = fn;
    },

    setPrinter: function (fn) {
        dtm.params.printer = fn;
    },

    cache: {
        audioStream: []
    }
};

this.dtm = dtm;
console.log('Loading DTM version ' + dtm.version);