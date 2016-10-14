module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        concat: {
            target: {
                src: [
                    'misc/start.js',
                    // 'src/emscripten/out/worker.js',
                    'src/alias.js',
                    'src/core.js',
                    'src/polyfills.js',
                    'src/utils.js',
                    'src/osc.js',
                    'src/analyzer.js',
                    'src/generator.js',
                    'src/transform.js',
                    'src/array.js',
                    'src/parser.js',
                    'src/data.js',
                    'src/clock.js',
                    'src/instrument.js',
                    'src/model.js',
                    'src/synth.js',
                    'src/master.js',
                    'src/guido.js',
                    'src/inscore.js',
                    'src/models/unipolar.js',
                    'src/models/bipolar.js',
                    'src/models/huffman.js',
                    'src/models/movetofront.js',
                    'src/instr/image-scan.js',
                    'misc/end.js'
                ],
                dest: 'dtm.js'
            }
        },

        jsdoc: {
            dist: {
                src: ['src/*.js', 'src/instr/*.js'],
                jsdoc: 'jsdoc',
                options: {
                    destination: 'doc',
                    configure: 'conf.json',
                    template: './node_modules/ink-docstrap/template'
                }
            }
        },

        uglify: {
            my_target: {
                files: {
                    'dtm_min.js': ['dtm.js']
                }
            }
        }
    });

    grunt.registerTask('default', ['concat']);
};