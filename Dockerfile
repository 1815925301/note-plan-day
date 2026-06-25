FROM node:20-alpine AS builder

WORKDIR /app

COPY client/package.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY server/package.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

RUN mkdir -p /data
VOLUME /data

EXPOSE 3000

WORKDIR /app/server
CMD ["node", "index.js"]
