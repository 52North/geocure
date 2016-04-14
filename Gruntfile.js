var server;

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'lib/server.js'
      }
    },
    mochacli: {
      all: ['test/{,*/}*.js']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'lib/*.js',
        'test/*.js'
      ]
    },
    mochacov: {
      coveralls: {
        options: {
          coveralls: {
            serviceName: 'travis-ci'
          }
        }
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          output: './coverage.html'
        }
      },
      options: {
        files: 'test/*.js',
        require: ['should']
      }
    }
  });

  // Default task.
  grunt.registerTask('test', ['jshint', 'mochacli']);
  grunt.registerTask('travis', ['test', 'mochacov:coveralls']);
  grunt.registerTask('coverage', ['test', 'mochacov:coverage']);
  grunt.registerTask('default', ['test']);

};
