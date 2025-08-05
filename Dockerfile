# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only the package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Set the working directory to /app/src (optional)
WORKDIR /app/src

# Run the bot using app.js
CMD ["node", "app.js"]
