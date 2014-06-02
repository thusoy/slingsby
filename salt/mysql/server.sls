mysql-deps:
  pkg.installed:
    - name: python-mysqldb

  # Needed to prevent page allocation failures on vagrant
  file.append:
    - name: /etc/sysctl.conf
    - text: vm.min_free_kbytes=65536


mysql-server:
  pkg.installed:
    - name: mysql-server-5.6
    - require:
      - pkg: mysql-deps


slingsby-db:
  mysql_database.present:
    - name: slingsby_rel
    - require:
      - pkg: mysql-server

  mysql_user.present:
    - name: slingsby
    - password: "{{ pillar['MYSQL_PASSWORD'] }}"
    - require:
      - pkg: mysql-server

  mysql_grants.present:
    - grant: all
    - user: slingsby
    - database: slingsby_rel.*
    - require:
      - mysql_database: slingsby-db
      - mysql_user: slingsby-db
