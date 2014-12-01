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
                    'src/voice.js',
                    'src/master.js',
                    'src/rhythm/clave-rhythm.js',
                    'src/instr/single-note.js',
                    'src/instr/short-noise.js',
                    'src/instr/nice-chords.js',
                    'src/instr/rhythm-seq.js',
                    'src/instr/sampler.js',
                    'src/instr/clave.js',
                    'src/instr/nb-noise.js',
                    'src/instr/tamborim.js',
                    //'src/instr/silly-melody.js',
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