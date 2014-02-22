/* jshint indent:2,maxstatements:false */
/* global module,require */
module.exports = function (grunt) {
  "use strict";

  // Load all grunt tasks defined in package.json
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({


    pkg: grunt.file.readJSON('package.json'),

    /*
     * Compile all .hbs (handlebars) templates to a shared file
     */
    handlebars: {
      compile: {
        options: {
          namespace: "slingsby.templates",
          // Transform paths to sensible template names -> Extract filename, remove ext
          processName: function (name) {
            var path = name.split('/');
            var filename = path[path.length - 1];
            var parts = filename.split('.');
            parts.pop(); //removes extension
            return parts.join('.');
          }
        },
        files: {
          "slingsby/static/.tmp/handlebars_templates.js": "slingsby/*/templates/handlebars/*.hbs"
        }
      }
    },

    /*
    * Compile SASS stylesheets.
    */
    compass: {
      dist: {
        options: {
          sassDir: 'slingsby/static-src/stylesheets/sass/',
          cssDir: 'slingsby/static/stylesheets/',
          outputStyle: "compressed"
        }
      }
    },

    /*
     * Copy static-src -> static.
     */
    copy: {
      srcToStatic: {
        files: [
          {
            expand: true,
            src: [
              '**/*.*',

              // Exclude stuff built elsewhere
              '!stylesheets/sass/*',
              '!gfx/*',
            ],
            cwd: 'slingsby/static-src/',
            dest: 'slingsby/static/'
          }
        ]
      },
      collectedToStatic: {
        files: [{expand: true, src: ['**'], cwd: 'build/.tmp/', dest: 'slingsby/static/'}]
      }
    },

    jshint: {
      options: {
        'jshintrc': '.jshintrc',
      },
      all: [
        'Gruntfile.js',
        'slingsby/static-src/js/*.js',
        'slingsby/**/static/js/*.js',

        // Ignore the built stuff
        '!slingsby/static/**',
      ]
    },

    /*
    * Recompile css, update static dir and reload on template changes.
    */
    watch: {
      options: {
        livereload: true
      },
      css: {
        files: ['slingsby/static-src/stylesheets/sass/*.scss'],
        tasks: ['compass']
      },
      js: {
        files: ['<%= jshint.all %>'],
        tasks: ['jshint', 'shell:collectstatic', 'copy:collectedToStatic']
      },
      templates: {
        files: ['slingsby/**/templates/*.html'],
        tasks: []
      },
      handlebars: {
        files: ['slingsby/**/handlebars/*.hbs'],
        tasks: ['handlebars']
      },
      python: {
        files: ['slingsby/**/*.py']
      }
    },

    pylint: {
      slingsby: {
        options: {
          rcfile: '.pylintrc',
        },
        src: ['slingsby', '*.py', 'tools/*.py'],
      }
    },

    // Shortcuts for some often used commands
    shell: {
      options: {
        stderr: true,
      },
      buildPython: {
        command: 'python setup.py sdist --dist-dir build --formats gztar',
      },
      provision: {
        options: {
          stdout: true,
        },
        command: [
          'python ./tools/dump_secure_env_vars_to_pillar.py',
          'tar czf build/salt_and_pillar.tar.gz salt pillar',
          'scp build/salt_and_pillar.tar.gz slingsby:/tmp/',
          'ssh slingsby "sudo tar xf /tmp/salt_and_pillar.tar.gz -C /srv/',
          'sudo salt-call --local state.highstate --force-color',
          'rm /tmp/salt_and_pillar.tar.gz"'
        ].join('&&'),
      },
      collectstatic: {
        command: 'python manage.py collectstatic --settings dev_settings --noinput',
      },
      buildStatic: {
        command: [
          'cd slingsby/static',
          'tar czf ../../build/static_files.tar.gz *',
        ].join(' && '),
      },
      deployCode: {
        options: {
          stdout: true
        },
        command: [
          'scp build/slingsby-1.0.0.tar.gz slingsby:/tmp/slingsby.tar.gz',
          'ssh slingsby "sudo /srv/ntnuita.no/venv/bin/pip uninstall slingsby -y || echo',
          'sudo /srv/ntnuita.no/venv/bin/pip install /tmp/slingsby.tar.gz',
          'sudo restart uwsgi',
          'rm /tmp/slingsby.tar.gz"'
        ].join(' && '),
      },
      deployStatic: {
        options: {
          stdout: true,
        },
        command: [
          'scp build/static_files.tar.gz slingsby:/tmp/static_files.tar.gz',
          'ssh slingsby "cd /srv/ntnuita.no/static/',
          'test -d <%= grunt.option("slingsby-version") %> || sudo mkdir <%= grunt.option("slingsby-version") %>',
          'sudo tar xf /tmp/static_files.tar.gz -C <%= grunt.option("slingsby-version") %>',
          'sudo chown -R root:www <%= grunt.option("slingsby-version") %>',
          'find /srv/ntnuita.no/static -type f -print0 | xargs -0 sudo chmod 444',
          'find /srv/ntnuita.no/static -type d -print0 | xargs -0 sudo chmod 555',
          'rm /tmp/static_files.tar.gz"'
        ].join(' && '),
      },
      devserver: {
        options: {
          stdout: true,
        },
        command: 'python manage.py runserver --settings secret_settings <%= grunt.option("port") || 80 %>'
      },
      test: {
        command: 'python manage.py test --settings dev_settings slingsby.general.tests',
      }
    },

    clean: {
      python: [
        'slingsby/**/*.pyc',
        'slingsby/static/*',

        // save the bower libs from being cleaned on every build
        '!slingsby/static/libs',
      ],
      builds: [
        'build',
        'slingsby.egg-info',
      ]
    },

    concurrent: {
      server: {
        tasks: ['watch', 'shell:devserver'],
        options: {
          logConcurrentOutput: true,
        }
      }
    },

    // This task configures the uglify task with the files specified in build blocks
    // in our html files.
    useminPrepare: {
      options: {
        dest: 'slingsby/static',
        root: 'slingsby',
        flow: {
          html: {
            steps: {'js': ['uglifyjs']},
            post: {}
          }
        }
      },
      html: 'slingsby/**/templates/**/*.html',
    },

    imagemin: {
      static: {
        files: [{
          expand: true,
          cwd: 'slingsby/static-src/gfx',
          src: [
            '**/*.{png,jpg,gif}',

            // Ignore originals
            '!originals/**',
          ],
          dest: 'slingsby/static/gfx',
        }]
      }
    },

  });


  // Default task
  grunt.registerTask('default', [
    'server',
  ]);
  grunt.registerTask('lint', [
    'jshint',
    'pylint',
  ]);
  grunt.registerTask('test', [
    'shell:test',
  ]);
  grunt.registerTask('deploy', [
    'shell:deployStatic',
    'shell:deployCode',
  ]);
  grunt.registerTask('pybuild', [
    'shell:buildPython',
  ]);
  grunt.registerTask('provision', [
    'shell:provision',
  ]);
  grunt.registerTask('server', [
    'concurrent:server',
  ]);
  grunt.registerTask('build', [
    'clean',
    'useminPrepare',
    'handlebars',
    'compass',
    'imagemin',
    'copy:srcToStatic',
    'shell:collectstatic',
    'copy:collectedToStatic',
    'uglify',
    'shell:buildStatic',
    'pybuild',
  ]);
};
