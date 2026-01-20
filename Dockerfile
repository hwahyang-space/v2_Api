# Build
FROM node:24.6.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run
FROM node:24.6.0-alpine
WORKDIR /app

ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8080
ENV TRUST_PROXY=false
ENV CORS_ORIGINS=https://example.com

ENV RATE_LIMITER_UNIT_MINUTES=15
ENV RATE_LIMITER_MAX_RATE=10
ENV RATE_LIMITER_ALLOWLIST=127.0.0.1

ENV HEADER_SERVER="hwahyang.space v2"
ENV HEADER_X_POWERED_BY="hwahyang.space v2"

ENV DB_HOST=127.0.0.1
ENV DB_USER=USERNAME
ENV DB_PASSWORD=PASSWORD
ENV DB_DATABASE=DATABASE
ENV DB_CONNECTION_LIMIT=10
ENV DB_QUEUE_LIMIT=0
ENV DB_KEEP_ALIVE_INITIAL_DELAY=10000

ENV SECURITY_PASSWORD_ITERATION=10000
ENV SECURITY_ACCESS_TOKEN_SECRET=SECRET
ENV SECURITY_ACCESS_TOKEN_EXPIRES=3h
ENV SECURITY_REFRESH_TOKEN_SECRET=SECRET
ENV SECURITY_REFRESH_TOKEN_EXPIRES=3d

ENV LOG_WORKER_INTERVAL=5000

# Install Redis (via Alpine Package Keeper)
RUN apk add --no-cache redis

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/public ./dist/public
COPY entrypoint.sh ./

RUN npm install --omit=dev && chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]