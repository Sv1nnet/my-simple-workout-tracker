FROM node:18-alpine as build

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=prod

# Copy application files
COPY . .

# Build the application
RUN npm run build

RUN rm -rf node_modules

# Expose the app port
# EXPOSE 4173

# Start the app (ensure you are using the correct command to start the production build)
# CMD ["npm", "run", "preview"]

FROM nginx:stable-alpine

COPY --from=build /usr/src/app /bin/www

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

CMD [ "nginx", "-g", "daemon off;" ]
