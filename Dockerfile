# Chess Club Ranking System - Docker Image
# Base image: Node.js 18 Alpine (lightweight)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
# Doing this first allows Docker to cache this layer
COPY package.json package-lock.json ./

# Install production dependencies only
# Using ci for faster and more reliable installs
# Skip scripts to avoid husky errors in container
RUN npm ci --omit=dev --ignore-scripts

# Copy application files
COPY . .

# Expose port 5000
EXPOSE 5000

# Add health check
# This helps Kubernetes know if container is healthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]
