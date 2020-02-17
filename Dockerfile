
FROM buildkite/puppeteer:latest

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/

RUN yarn install --prod

# If you are building your code for production
# RUN npm ci --only=production

COPY . /usr/src/app


CMD [ "npm", "start" ]


