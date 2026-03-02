# Use official Node image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]