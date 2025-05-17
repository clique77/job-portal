# Build Stage
FROM node:18 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript code
RUN npm run build

# Production Stage
FROM node:18-slim

# Create a non-root user
RUN groupadd --system appgroup \
 && useradd --system --gid appgroup --home-dir /app --shell /usr/sbin/nologin appuser

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory structure with proper permissions
RUN mkdir -p /app/uploads/profile-pictures && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app/uploads

# Switch to non-root user
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"] 