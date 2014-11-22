Slingsby [![Build Status](https://travis-ci.org/TelemarkAlpint/slingsby.png?branch=master)](https://travis-ci.org/TelemarkAlpint/slingsby)
========

The homepage for [NTNUI Telemark/Alpint](http://ntnuita.no).

[Slingsby](http://en.wikipedia.org/wiki/William_Slingsby) was also the first man to conquer Store
Vengetind in Romsdalen, along with hundreds of summits in Jotunheimen. One of the hardest ski
routes in Romsdalen, down the east side of Store Vengetind, is named after his ascent.


Goals
-----

* Easily readable code (read: pythonic python and idiomatic javascript)
* Easy to get started for new developers
* Deployment handled automatically
* Well tested code
* Site works on all devices (but not necessarily look the same or provide the same experience)
* RESTful


About
-----

Our server is running on AWS, with deployments handled automatically by Travis CI.


Local development
-----------------

**tl;dr**: To setup a build environment and run the tests, check out `.travis.yml`. For more
in-depth explanation, read on.

We're advise using [virtualenvs](http://virtualenv.readthedocs.org/en/latest/virtualenv.html) when
working on slingsby. First off, get pip and virtualenv if you haven't already:

    $ easy_install pip
    $ pip install virtualenv

Fetch the source code:

    $ git clone https://github.com/TelemarkAlpint/slingsby
    $ cd slingsby

Set up a virtualenv and install the python requirements:

    $ virtualenv venv
    $ . venv/bin/activate # windows: .\venv\Scripts\activate.bat
    $ pip install -r dev-requirements.txt

**Note**: If you're having trouble installing PyCrypto on windows due to missing C compiler, you
can install the precompiled binaries from
[the voidspace python modules](http://www.voidspace.org.uk/python/modules.shtml#pycrypto). If you
install PyCrypto globally, you can copy it into your virtualenv manually by copying `Crypto` and
`pycrypto-2.6-py2.7.egg-info` from `C:\Python2.7\Lib\site-packages` into `venv\Lib\site-packages`
and edit the `salt\slingsby\requirements.txt` to use pycrypto==2.6.

You now have everything needed to run the tests:

    $ python manage.py test

If you set the envvar `WITH_COVERAGE` you will get a code coverage report. This can also be found
online, at [our GitHub pages site](https://telemarkalpint.github.com/slingsby).

To run the server to test it in your browser, you need a little bit more work, because you need to
build the project first.

Slingsby uses [Grunt](http://gruntjs.com/) to run boring tasks that should be automated, like
compiling SASS stylesheet, minifying js and similar. To use grunt, you need NodeJS installed.
Follow the instructions over at [NodeJS](http://nodejs.org/) to install it for your system. The
node package manager *npm* is bundled with recent versions of node, we'll use that to install grunt
plugins we use. These are defined in the `package.json` file.

Once you have node and npm installed, you should install the grunt-cli, bower and all the grunt
plugins and frontend dependencies:

    $ npm install -g grunt-cli
    $ npm install

You also need Compass for the stylesheets, which can be installed with
[RubyGems](https://rubygems.org/):

    $ gem install compass

Great! Now you can compile all the static files:

    $ grunt prep watch

Adding the `watch` task makes sure grunt will stay awake and listen for changes to the project
files, and re-run whatever has to be done for those files *and* reload your browser when done.
Magic!

Add some dummy data to work with:

    $ python manage.py migrate --noinput && python manage.py bootstrap

And now, you can start the devserver:

    $ python manage.py runserver

This should start the devserver at port 8000, browse to `http://localhost:8000` to see it!
Starting the devserver like this will create a SQLite database you can use locally.
If you need to test anything using the fileserver (archive, musikk), you need to start a
lightweight HTTP server in the `media` directory. If it doesn't exist, create it first, and then
start the server:

    $ mkdir media
    $ cd media
    $ python -m SimpleHTTPServer 8001

**Note**: Social login will not work out of the box, since authenticating with Facebook requires
you to know our Facebook app secret. If you need to test social login you can decrypt the secrets
needed and start the devserver on port 80. You also need to add the following line to your hosts
file:

    127.0.0.1 ntnuita.local

Decrypt the secrets and start the devserver with them:

    $ python tools/secure_data.py decrypt
    $ python manage.py runserver 80

You'll find the secret needed for decryption in the styre-dropbox, in the file `Kontoer.kdbx`.
You'll need [KeePass](http://keepass.info/) to open it, the password for that file should be
given to you by the webmaster if you're deemed worthy.

Hack away!


Testing on a server
-------------------

To test that stuff works in the same environment (or rather, very similar) to the one in
production, you can start two local machines with all the same software we're using in production by
using [VirtualBox](https://www.virtualbox.org/) and [Vagrant](http://www.vagrantup.com/). Once you
have installed the two, simply execute the following to start your VMs and deploy the app to it:

    $ grunt build
    $ vagrant up
    $ fab deploy_vagrant

Make sure you have the following entries in your hosts file:

    127.0.0.1 ntnuita.local
    127.0.0.1 media.ntnuita.local

You can now visit `http://ntnuita.local` in your webbrowser to test how the app runs behind nginx
and uwsgi, with caching and the fileserver and all the bells and whistles.


Dependencies
------------

Handled by four (!) different package managers for three different purposes: `pip` handles python
libraries we use, defined in `salt/slingsby/requirements.txt`. `bower` handles frontend
dependencies like jQuery and Handlebars, defined in `bower.json`. `npm` handles build dependencies
like grunt and the grunt plugins for SASS transiling and js minification, defined in
`package.json`. And lastly, you also need RubyGems (`gem`) be able to install compass, which is
needed by grunt-compass.


It doesn't work!
----------------

Relax, take a deep breath, check the logs. Relevant logs to check include:

**uwsgi**: `/var/log/uwsgi/uwsgi.log`
**nginx**: `/usr/share/nginx/logs/error.log`
**slingsby**: `/var/log/slingsby/log.log`

Try restarting uwsgi and nginx, to see if it makes a difference:

    $ sudo service uwsgi restart
    $ sudo service nginx restart

Try to see if you can import the settings without failure:

    $ sudo /srv/ntnuita.no/venv/bin/python -c "import prod_settings"

Or, that you can import slingsby without failure:

    $ /srv/ntnuita.no/venv/bin/python -c "import slingsby"



How do I...
-----------

**Q**: Create a user for myself on the server?  
**A**: 1) Find your password hash by using the `tools/create_password_hash.py` tool, 2) encrypt
your password hash with `tools/secure_data.py encrypt <YOURNAME>_PASSWORD=<hash>`, 3) add your
details to `pillar/users/init.sls`, optionally also an SSH key, and Travis will create your user.

**Q**: Add a new frontend library?  
**A**: Install the library with bower: `bower install <new-libary> --save`. This will save it into
`bower_components`, now add it to an existing script or create a new one in the uglify task in
Gruntfile.js, to have it minified and concatenated.

**Q**: Add a new grunt plugin?  
**A**: `npm install --save-dev <name-of-grunt-plugin>`. `--save-dev` makes sure the new library is
saved in `package.json` and thus will be installed by everyone else as well.

**Q**: Add a secret value to the repo?  
**A**: `python tools/secure_data.py encrypt <your-new-value>=<your-secret>`. The name you choose
will be the name it will be added to pillar as.

**Q**: Generate good secrets?  
**A**: Use `openssl rand -base64 <number-of-bytes>`. For most keys, 30 random bytes is plenty.

**Q**: The server is fubar, how do I create a new one?  
**A**: See the steps under `salt/README.md`.

**Q**: How do I get the devserver back to untouched state?  
**A**: Delete the sqlite database: `rm db-dev.sqlite`, recreate an empty one: `python
manage.py syncdb --noinput`, and optionally fill it with some dummy data: `python manage.py
bootstrap`.


Testing web/fileserver integration
----------------------------------

Some tests require a fileserver to dump files to, notably the music upload. You can run these tests
by starting the vagrant box with `vagrant up` and run the tests like this:

    $ RUN_SSH_TESTS=1 python manage.py test

(Windows user have to set the RUN_SSH_TESTS envvar separately, ie `set RUN_SSH_TESTS=1` and then
run the tests as normal). If your fileserver is not reachable by `vagrant@localhost:2222`, set
the `FILESERVER` envvar to point to the one you want to use. Make sure that the user can log in
with the pubkey listed under `pillar/vagrant.sls`.


Handy oneliners
---------------

Wipe the local database and bootstrap a new one:

    $ rm db-dev.sqlite && python manage.py migrate --noinput && python manage.py bootstrap


Random notes that might someday be necessary
--------------------------------------------

### MySQL + django-celery

MySQL sucks and has a hard limit on 767 bytes for index keys, which in conjunction with
[django-celery causes problems](https://github.com/celery/django-celery/issues/259). To get it
working `django-celery/models.py` was hand-patched to reduce the size of all indexed fields to
191 chars, to let migrations run. Once migrations have run, this shouldn't matter anymore, even
if the modifications are lost, but if the error `Specified key was to long; max key length is 767
bytes` ever shows up again, this is probably the cause.

**Note**: This is now fixed automatically by our slingsby salt state, by running a replace on
`djcelery/models.py`.
