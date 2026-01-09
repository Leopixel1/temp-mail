FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Make receive-email.js executable
RUN chmod +x src/receive-email.js

EXPOSE 3000

CMD ["npm", "start"]
