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
        'instrs/single-note',
        'instrs/short-noise',
        'instrs/nice-chords',
        'instrs/sampler',
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