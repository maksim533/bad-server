FROM node:22-alpine as build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
