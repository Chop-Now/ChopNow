FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# Using npm ci for reliable builds (requires package-lock.json)
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the API port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
