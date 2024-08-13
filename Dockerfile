FROM node:20.11.0 as build

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci

# Bundle app source
COPY . .

RUN npm run build

FROM node:20.11.0 as run

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/build ./build

COPY --from=build /usr/src/app/node_modules ./node_modules

COPY package*.json ./

EXPOSE 8080

CMD ["node", "./build"]
