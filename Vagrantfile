# -*- mode: ruby -*-

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "saucy64"

  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/saucy/current/saucy-server-cloudimg-amd64-vagrant-disk1.box"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  config.vm.network :forwarded_port, guest: 8000, host: 8000   # devserver
  config.vm.network :forwarded_port, guest: 80, host: 80   # nginx

  # Share the salt config with the guest
  config.vm.synced_folder "salt", "/srv/salt/"
  config.vm.synced_folder "pillar", "/srv/pillar"

  ## Use all the defaults:
  config.vm.provision :salt do |salt|

    salt.minion_config = "salt/vagrant-minion"
    salt.run_highstate = true
    salt.verbose = true

  end

end
