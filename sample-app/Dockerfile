FROM registry.cto.ai/official_images/node:2-12.13.1-stretch-slim

WORKDIR /ops

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

ADD . .

EXPOSE 8080
CMD ["node", "index.js"]
