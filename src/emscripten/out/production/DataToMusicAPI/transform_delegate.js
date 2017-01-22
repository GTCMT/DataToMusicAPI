dtm.transform = {};
dtm.tr = dtm.transform;

var commands = ['normalize', 'rescale', 'expCurve', 'logCurve', 'fit', 'stretch', 'ola', 'limit', 'fitSum', 'add', 'subtract', 'mult', 'pow', 'powof', 'round', 'floor', 'ceil', 'hwr', 'fwr', 'mod', 'removeZeros', 'diff', 'reverse', 'invert', 'shuffle', 'sort', 'repeat', 'truncate', 'getBlock', 'window', 'linslide', 'shift', 'morph', 'interleave', 'notesToBeats', 'beatsToNotes', 'intervalsToBeats', 'beatsToIntervals', 'beatsToIndices', 'indicesToBeats', 'calcBeatsOffset', 'applyOffsetToBeats', 'lreModulation', 'pitchQuantize', 'unique', 'classId', 'stringify', 'tonumber', 'getClasses', 'mtof', 'ftom', 'split', 'convolve'];

var transformWorker = new Worker('transform_worker.js');

transformWorker.addEventListener('message', function (e) {
    console.log(e.data.res);
}, false);

commands.forEach(function (v) {
    dtm.transform[v] = function () {
        transformWorker.postMessage({
            cmd: v,
            args: argsToArray(arguments)
        });
    };
});
