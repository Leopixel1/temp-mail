FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix and dependencies
RUN apt-get update && \
    apt-get install -y postfix postfix-pcre rsyslog && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create directory for scripts
RUN mkdir -p /etc/postfix/scripts

# Copy configuration files (will be mounted)
COPY main.cf /etc/postfix/main.cf.template
COPY master.cf /etc/postfix/master.cf

# Expose SMTP port
EXPOSE 25

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
