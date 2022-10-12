# FROM node:16-alpine
# # Installing libvips-dev for sharp Compatability
# RUN apk update && apk add  build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}
# WORKDIR /opt/
# COPY ./package.json ./yarn.lock ./
# ENV PATH /opt/node_modules/.bin:$PATH
# RUN yarn config set network-timeout 600000 -g && yarn install
# WORKDIR /opt/app
# COPY ./ .
# RUN yarn build
# EXPOSE 1338
# CMD ["yarn", "start"]

# Production
FROM node:16-alpine as build
# Installing libvips-dev for sharp Compatability
RUN apk update && apk add build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g && yarn install
WORKDIR /opt/app
COPY ./ .
RUN yarn build
EXPOSE 1337
CMD ["yarn", "start"]