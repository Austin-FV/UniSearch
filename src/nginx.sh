# Only needs to be done once on a system, run as root.

## Install Website
cp greg /etc/nginx/sites-available/greg
ln -fs /etc/nginx/sites-available/greg /etc/nginx/sites-enabled/greg

## Delete this if it exists.
rm -f /etc/nginx/sites-enabled/default

service nginx restart