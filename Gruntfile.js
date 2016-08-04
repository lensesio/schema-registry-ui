'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates'
  });

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    bower: grunt.file.readJSON('bower.json'),

    clean: {
      src: ['dist']
    },

    copy: {
      files: {
        cwd: '.',
        src: [
          'index.html',
          'src/assets/**',
          'src/**/*.html',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/angular-material/angular-material.min.css',
          'bower_components/font-awesome/css/font-awesome.min.css',
          'bower_components/font-awesome/fonts/**',
          'bower_components/ace-builds/src-min-noconflict/**',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-ui-ace/ui-ace.min.js',
          'bower_components/spin.js/spin.min.js',
          'bower_components/angular-spinner/angular-spinner.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-material/angular-material.min.js',
          'bower_components/angularUtils-pagination/dirPagination.js',
          'bower_components/angular-animate/angular-animate.min.js',
          'bower_components/angular-aria/angular-aria.min.js'
        ],
        dest: 'dist',
        expand: true
      }
    },

    concat: {
      dist: {
        src: ['src/*.js', 'src/**/*-factory.js', 'src/**/*.controller.js'],
        dest: 'dist/combined.js'
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    usemin: {
      html: ['dist/index.html']
    }

    // Renames files for browser caching purposes
    // rev: {
    //   dist: {
    //     files: {
    //       src: [
    //         '<%= yeoman.dist %>/public/{,*/}*.js',
    //         '<%= yeoman.dist %>/public/{,*/}*.css',
    //         '<%= yeoman.dist %>/public/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
    //         '<%= yeoman.dist %>/public/assets/fonts/*',
    //         /** Do not rename for caching images in /statics/ **/
    //         '!<%= yeoman.dist %>/public/images/statics/**'
    //       ]
    //     }
    //   }
    // },


    // Performs rewrites based on rev and the useminPrepare configuration
    // usemin: {
    //   html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
    //   css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
    //   js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
    //   options: {
    //     assetsDirs: [
    //       '<%= yeoman.dist %>/public',
    //       '<%= yeoman.dist %>/public/assets'
    //     ],
    //     // This is so we update image references in our ng-templates
    //     patterns: {
    //       js: [
    //         [/(assets\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
    //       ]
    //     }
    //   }
    // },

    // The following *-min tasks produce minified files in the dist folder
    // imagemin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.client %>/assets',
    //       src: '{,*/}*.{png,jpg,jpeg,gif}',
    //       dest: '<%= yeoman.dist %>/public/assets'
    //     }]
    //   }
    // },

    // svgmin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= yeoman.client %>/assets',
    //       src: '{,*/}*.svg',
    //       dest: '<%= yeoman.dist %>/public/assets'
    //     }]
    //   }
    // },

    // Package all the html partials into a single javascript payload
    // ngtemplates: {
    //   options: {
    //     // This should be the name of your apps angular module
    //     module: 'schemaRegistryUIApp',
    //     htmlmin: {
    //       collapseBooleanAttributes: true,
    //       collapseWhitespace: true,
    //       removeAttributeQuotes: true,
    //       removeEmptyAttributes: true,
    //       removeRedundantAttributes: true,
    //       removeScriptTypeAttributes: true,
    //       removeStyleLinkTypeAttributes: true
    //     },
    //     usemin: 'app/src/app.js'
    //   },
    //   main: {
    //     cwd: '<%= yeoman.client %>',
    //     src: ['{src/**/*.html'],
    //     dest: '.tmp/templates.js'
    //   },
    //   tmp: {
    //     cwd: '.tmp',
    //     src: ['{app,components}/**/*.html'],
    //     dest: '.tmp/tmp-templates.js'
    //   }
    // },

  });

  grunt.registerTask('build', [
    'clean:dist',
    //'concurrent:dist',
    // 'injector',
    // 'wiredep',
    'useminPrepare',
    // 'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'clean',
    'copy',
    'concat',
    'usemin'
  ]);
};
