FROM node:18-alpine as build

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
# EXPOSE 4173

# Start the app (ensure you are using the correct command to start the production build)
# CMD ["npm", "run", "preview"]

FROM nginx:stable-alpine

COPY --from=build /usr/src/app /bin/www

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4173

CMD [ "nginx", "-g", "daemon off;" ]
