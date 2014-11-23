module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            target: {
                src: [
                    'misc/start.js',
                    'src/core.js',
                    //'src/utils.js',
                    'src/stream.js',
                    'src/analyzer.js',
                    'src/transform.js',
                    'src/array.js',
                    'src/collection.js',
                    'src/value.js',
                    'src/iterator.js',
                    'src/parser.js',
                    'src/data.js',
                    'src/clock.js',
                    'src/instrument.js',
                    'src/model.js',
                    'src/model2.js',
                    'src/synth.js',
                    'src/synth2.js',
                    'src/master.js',
                    'src/instrs/single-note.js',
                    'src/instrs/short-noise.js',
                    'src/instrs/nice-chords.js',
                    'src/instrs/rhythm-seq.js',
                    'src/instrs/sampler.js',
                    'src/instrs/clave.js',
                    'src/instrs/nb-noise.js',
                    'src/instrs/tamborim.js',
                    //'src/instrs/silly-melody.js',
                    'src/voice.js',
                    'misc/end.js'
                ],
                dest: 'dtm.js'
            }
        },

        jsdoc: {
            dist: {
                src: ['src/*.js'],
                jsdoc: 'jsdoc',
                options: {
                    destination: 'doc',
                    configure: 'conf.json',
                    template: './node_modules/ink-docstrap/template'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('default', ['concat']);
};