FROM node:20.2.0-alpine

WORKDIR /newshandler

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm install

COPY . .

RUN npm run build