FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix, Node.js and dependencies
RUN apt-get update && \
    apt-get install -y postfix postfix-pcre curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create directory for email processing script
RUN mkdir -p /opt/email-processor/prisma

# Copy email processing script and dependencies
WORKDIR /opt/email-processor
COPY receive-email-processor.js /opt/email-processor/receive-email.js
COPY package.json /opt/email-processor/package.json
COPY schema.prisma /opt/email-processor/prisma/schema.prisma

# Install dependencies and generate Prisma client
RUN npm install --production=false && \
    npx prisma generate && \
    npm prune --production

# Make receive-email.js executable
RUN chmod +x /opt/email-processor/receive-email.js

# Create directory for Postfix scripts
RUN mkdir -p /etc/postfix/scripts

# Copy configuration files
COPY main.cf /etc/postfix/main.cf.template
COPY master.cf /etc/postfix/master.cf
COPY virtual_alias /etc/postfix/virtual_alias

# Expose SMTP port
EXPOSE 25

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
