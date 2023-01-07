FROM node:14-slim

WORKDIR /usr/client

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 3004:3004

ENV NODE_ENV=development API_HOST=mswt

# CMD ["npm", "run", "build:start"]
CMD ["npm", "run", "start"]
# CMD ["ls", "./.next"]