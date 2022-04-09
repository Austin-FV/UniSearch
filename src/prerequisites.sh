# This is by no means the best way of doing this.
# However, AutoMake and other tools are out of my reach right now.
# This script must be run as root.

apt-get update
apt-get install -y nginx openssl nodejs npm python3 python3-pip

echo "To get playwright to work, you'll need to make sure non-free packages are enabled in apt's sources.list before running install.sh"
echo "This shouldn't be a problem on Ubuntu unless you've played with your packages a little."