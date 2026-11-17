#!/bin/sh
# Passwortschutz: in Coolify die Umgebungsvariablen SITE_USER und SITE_PASS setzen. Ohne SITE_PASS ist die Seite offen.
set -e
if [ -n "$SITE_PASS" ]; then
  htpasswd -bc /etc/nginx/.htpasswd "${SITE_USER:-familie}" "$SITE_PASS" >/dev/null 2>&1
  AUTH='auth_basic "klein d"; auth_basic_user_file /etc/nginx/.htpasswd;'
else
  AUTH=''
fi
sed "s|#AUTH#|$AUTH|" /etc/nginx/klein-d.conf.template > /etc/nginx/conf.d/default.conf
