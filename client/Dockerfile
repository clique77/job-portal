# Build Stage
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production Stage
FROM node:18-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Create uploads directory
RUN mkdir -p /app/uploads/profile-pictures

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 80

# Start the server
CMD ["serve", "-s", "dist", "-l", "80"] 