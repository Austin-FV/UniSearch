# This script is called automatically by install.sh as a subroutine that starts the flask app.

cd courseutility
uwsgi --ini courseutility.ini -d /opt/greg/uwsgi.log