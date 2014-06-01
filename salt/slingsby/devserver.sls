slingsby-devserver:
  cmd.run:
    - cwd: /vagrant
    - name: grunt build server
    - require:
      - virtualenv: slingsby
