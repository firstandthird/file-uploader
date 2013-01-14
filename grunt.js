module.exports = function(grunt) {
  grunt.initConfig({
    info: '<json:component.json>',
    meta: {
      banner: '/*!\n'+
              ' * <%= info.name %> - <%= info.description %>\n'+
              ' * v<%= info.version %>\n'+
              ' * <%= info.homepage %>\n'+
              ' * copyright <%= info.copyright %> <%= grunt.template.today("yyyy") %>\n'+
              ' * <%= info.license %> License\n'+
              '*/'
    },
    lint: {
      main: [
        'grunt.js', 
        'component.json',
        'lib/**/*.js',
        'test/*.js'
      ]
    },
    concat: {
      dist: {
        src: ['<banner>', 'lib/image-uploader.js'],
        dest: 'dist/jquery.imageuploader.js'
      }
    },
    min: {
      dist: {
        src: ['<banner>', 'dist/jquery.imageuploader.js'],
        dest: 'dist/jquery.imageuploader.min.js'
      }
    },
    watch: {
      main: {
        files: '<config:lint.main>',
        tasks: 'default' 
      }
      /*
      ci: {
        files: [
          '<config:lint.main>',
          'test/index.html'
        ],
        tasks: 'default mocha' 
      }
     */
    },
    /*
    mocha: {
      all: {
        src: 'test/index.html',
        options: {
          //grep: 'auto'
        },
        run: true
      }
    },
   */
    reloadr: {
      test: [
        'test/*',
        'dist/*'
      ]
    },
    server:{
      port: 8000,
      base: '.'
    }
  });
  //grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-reloadr');
  grunt.registerTask('default', 'lint concat min');
  grunt.registerTask('dev', 'server reloadr watch:main');
  //grunt.registerTask('ci', 'server watch:ci');
};
