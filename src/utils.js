///**
// * @fileOverview Some Helper Functions. Probably needs reorganization.
// * @module utils
// */

dtm.utils = {
    mtof: mtof,
    pitchQ: pitchQ,
    delayEvent: delayEvent,
}

//dtm.array = {};
//dtm.stream = {};

function mtof(nn) {
    return 440. * Math.pow(2, (nn - 69) / 12.);
}

function pitchQ(nn, scale) {
    if (arguments.length == 1) {
        scale = [0, 7, 10];
    }

    var pc = nn % 12;
    var oct = nn - pc;
    var idx = Math.floor(pc / 12. * scale.length);
    return oct + scale[idx];
}


function addNoise() {

}

function randomize() {

}


function delayEvent(cb, sec) {
    if (arguments < 2 || !sec) {
        sec = 0.000001;
    }

    var src = actx.createBufferSource();
    src.buffer = clockBuf;
    src.connect(out());

    var freq = 1/sec;

    src.playbackRate.value = freq * clMult;
    src.start(now() + 0.0000001);

    src.onended = function () {
        console.log('hey');
        cb();
    };
}