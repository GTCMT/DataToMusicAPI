dtm.midi = function () {
    var midi = new MIDI();
    return midi.init.apply(midi, arguments)
};

function MIDI() {
    function midi() {
        return midi;
    }

    midi.params = {};

    midi.__proto__ = MIDI.prototype;
    return midi;
}

MIDI.prototype = Object.create(Function.prototype);

MIDI.prototype.out = null;
MIDI.prototype.defaults = {
    note: dtm.data([[69]]),
    pitchbend: dtm.data([[0]]),
    velocity: dtm.data([[100]]),
    duration: dtm.data([[1]]),
    channel: dtm.data([[1]])
};

MIDI.prototype.init = function () {
    var that = this;
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
            }, null);
        } else {
            console.log("No MIDI support in your browser.");
        }
    }

    objForEach(MIDI.prototype.defaults, function (v, k) {
        that.params[k] = v;
    });

    return this;
};

MIDI.prototype.play = function () {
    var that = this;

    if (MIDI.prototype.out) {
        var out = MIDI.prototype.out;

        setTimeout(function () {
            var seqValue = 0;
            var dur = that.params.duration.get(seqValue).get(0);

            if (that.params.pitchbend !== MIDI.prototype.defaults.pitchbend) {
                dtm.music().phasor(function (d, i) {
                    var pbVal = that.params.pitchbend(seqValue).phase(d, 'step').range(0, 16383, -1, 1).round().val[0];
                    var upper = Math.floor(pbVal / 128);
                    var lower = pbVal - upper * 128;
                    out.send([224, lower, upper]);
                }, 256).trigger().for(dur);
            } else {
                out.send([224, 0, 64]);
            }

            var notes = that.params.note.get(seqValue);
            dur /= notes.length;

            var ch = that.params.channel.get(seqValue);
            if (ch.length !== notes.length) {
                ch = ch().step(notes.length);
            }

            dtm.music()
                .onnote(function (m, i) {
                    out.send([143 + ch(i).val[0], notes(i).val[0], 100]);
                })
                .offnote(function (m, i) {
                    out.send([143 + ch(i).val[0], notes(i).val[0], 0]);
                })
                .trigger()
                .every(dur)
                .rep(notes.length);
        });
    }
    return this;
};

MIDI.prototype.stop = function () {
    return this;
};

MIDI.prototype.note = function () {
    var args = argsToArray(arguments);
    this.params.note = convert(args);
    return this;
};

MIDI.prototype.pitchbend = function () {
    var args = argsToArray(arguments);
    this.params.pitchbend = convert(args);
    return this;
};

MIDI.prototype.for = function () {
    var args = argsToArray(arguments);
    this.params.duration = convert(args);
    return this;
};

MIDI.prototype.ch = MIDI.prototype.channel = function () {
    var args = argsToArray(arguments);
    this.params.channel = convert(args);
    return this;
};

dtm.startWebMidi();