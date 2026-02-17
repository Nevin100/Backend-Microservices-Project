# Using Node.js 18 Alpine image for a lightweight container
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /use/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Run npm ci to install dependencies based on package-lock.json, ensuring a clean and reproducible build
RUN npm ci --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the API Gateway will run on
EXPOSE 3000

# Start the API Gateway using npm start
CMD ["node", "src/index.js"]


