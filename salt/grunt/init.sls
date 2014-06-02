nodejs:
  pkgrepo.managed:
    - ppa: chris-lea/node.js

  pkg.installed:
    - require:
      - pkgrepo: nodejs


grunt-cli:
  npm.installed:
    - require:
      - pkg: nodejs

compass:
  gem.installed
