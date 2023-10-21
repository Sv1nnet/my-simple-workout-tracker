FROM node:18-alpine

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=prod

# Copy application files
COPY . .

# Add TypeScript compiler (tsc) to the container (you can remove this line if tsc is globally available in the base image)
RUN npm install --only=dev

# Build the application
RUN npm run build

# Expose the app port
EXPOSE 4173

# Start the app (ensure you are using the correct command to start the production build)
CMD ["npm", "run", "preview"]
