# Dockerfile is used to build image which then can be used to build any number of containers.

FROM node:alpine AS builder
RUN apk add --no-cache bash
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY . .

ENV SKIP_PREFLIGHT_CHECK=true
RUN yarn install:packages && yarn build

FROM node:14.4.0

RUN apt-get update
RUN apt-get install musl-dev -y
RUN ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y libxss1 google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*


ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /usr/src/app

CMD ["google-chrome-unstable"]

RUN mkdir store

# copy subscription shop files in to docker image
COPY --from=builder /usr/src/app/store/next.config.js ./store
COPY --from=builder /usr/src/app/store/public ./store/public
COPY --from=builder /usr/src/app/store/.next ./store/.next
COPY --from=builder /usr/src/app/store/node_modules ./store/node_modules
COPY --from=builder /usr/src/app/store/package.json ./store/package.json

RUN mkdir admin

# copy admin/build files in to docker image
COPY --from=builder /usr/src/app/admin/build ./admin/build

# copy express server files in to docker image
COPY --from=builder /usr/src/app/server ./server
COPY --from=builder /usr/src/app/template ./template

COPY --from=builder /usr/src/app/index.js ./index.js
COPY --from=builder /usr/src/app/main.js ./main.js
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/get_env.js ./get_env.js

RUN yarn add puppeteer

# used to expose container level
EXPOSE 4000
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# used to run express and subscription shop server
CMD [ "yarn", "prod" ]