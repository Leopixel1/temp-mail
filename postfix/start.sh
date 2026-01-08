#!/bin/sh
set -e

# Replace domain placeholder in config files
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/postfix/main.cf.template > /etc/postfix/main.cf
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/postfix/virtual_alias > /etc/postfix/virtual_alias.tmp
mv /etc/postfix/virtual_alias.tmp /etc/postfix/virtual_alias

# Generate postmap database
postmap /etc/postfix/virtual_alias

# Start Postfix
echo "Starting Postfix for domain: ${DOMAIN}"
postfix start-fg
