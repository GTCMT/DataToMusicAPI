module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        concat: {
            target: {
                src: [
                    'src/emscripten/out/worker.js',
                    'src/alias.js',
                    'src/core.js',
                    'src/polyfills.js',
                    'src/utils.js',
                    'src/osc.js',
                    'src/analyzer.js',
                    'src/transform.js',
                    'src/array.js',
                    'src/data.js',
                    'src/generator_old.js',
                    'src/parser.js',
                    'src/loader.js',
                    'src/clock.js',
                    'src/instrument.js',
                    'src/model.js',
                    'src/mapper.js',
                    'src/synth.js',
                    'src/music.js',
                    'src/master.js',
                    'src/guido.js',
                    'src/inscore.js',
                    'src/models/unipolar.js',
                    'src/models/bipolar.js',
                    'src/models/huffman.js',
                    'src/models/movetofront.js',
                    'src/instr/image-scan.js'
                ],
                dest: 'dtm.js'
            },
            options: {
                banner: '(function () {\n',
                footer: '\n})();'
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