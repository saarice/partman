# Production Dockerfile for API Service
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy migrations
COPY migrations ./migrations

# Expose API port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
