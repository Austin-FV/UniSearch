# This script installs the server itself, completely.
# It should be run as the web user, where possible.

## Install pip prereqs
pip3 install wheel flask uwsgi

## Prepare the install directory.
mkdir -p /opt/greg

## Move the web files.
rm -rf /opt/greg/www
cp -r ../dist/client /opt/greg/www

## Make the SSL Key and Cert
openssl req -x509 -nodes -days 69 -newkey rsa:2048 -keyout /opt/greg/greg.key -out /opt/greg/greg.cert -subj "/C=CA/ST=Ontario/L=Guelph/O=T9/CN=131.104.49.108"

## Scrape
./pw.sh

## Run Flask
./run.sh
