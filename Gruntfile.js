module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        concat: {
            target: {
                src: [
                    'src/emscripten/out/worker.js',
                    'src/polyfills.js',
                    'src/core.js',
                    'src/utils.js',
                    'src/osc.js',
                    'src/transform.js',
                    'src/data.js',
                    'src/generator_old.js',
                    'src/parser.js',
                    'src/loader.js',
                    'src/instrument.js',
                    'src/model.js',
                    'src/mapper.js',
                    'src/music.js',
                    'src/midi.js',
                    'src/master.js',
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
                src: ['src/*.js', './README.md'],
                jsdoc: 'jsdoc',
                options: {
                    destination: 'doc',
                    configure: 'conf.json',
                    template: './node_modules/ink-docstrap/template',
                    tutorials: 'tutorials'
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