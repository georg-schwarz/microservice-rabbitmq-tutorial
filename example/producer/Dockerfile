# First stage: BUILD
FROM node:lts-alpine as builder

WORKDIR /build
COPY ./src ./src
COPY ./package*.json ./
COPY ./tsconfig.json ./

RUN npm ci
RUN npm run transpile

# Second stage: image to run node application
FROM node:lts-alpine

RUN mkdir /app
WORKDIR /app

COPY --from=builder /build/dist/ ./dist/
COPY --from=builder /build/package*.json ./

RUN npm ci --only=production
EXPOSE 8080

CMD [ "npm", "run", "start:transpiled" ]