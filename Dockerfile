FROM node:16

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose the app port
EXPOSE 3004

# Start the app
CMD ["npm", "dev"]