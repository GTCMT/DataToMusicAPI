({
    baseUrl: 'src',
//    name: 'dtm',
    out: 'dtm.js',
    name: '../bower_components/almond/almond',
    include: [
        'core',
        'utils',
        'parser',
        'data',
        'clock',
        'model',
        'instr/single-note',
        'instr/short-noise',
        'instr/nice-chords',
        'instr/sampler',
        'voice',
        'master'
    ],
    skipSemiColonInsertion: true,
    wrap: {
        startFile: 'misc/start.js',
        endFile: 'misc/end.js'
    },
    optimize: 'none'
})