#!/bin/bash
set -e

# Replace domain placeholder in config files
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/postfix/main.cf.template > /etc/postfix/main.cf
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/postfix/virtual_alias

# Generate postmap database
postmap /etc/postfix/virtual_alias

# Start rsyslog for logging
service rsyslog start

# Start Postfix
echo "Starting Postfix for domain: ${DOMAIN}"
postfix start-fg
