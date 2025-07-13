FROM --platform=$BUILDPLATFORM oven/bun:1.2.18-alpine AS build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=2048
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN mv .env.docker .env && \
    bun run --smol build && \
    chmod +x ./start.sh

FROM oven/bun:1.2.18-alpine
RUN apk add --update envsubst supervisor nginx curl && \
    rm -rf /var/cache/apk/* /var/lib/apk/lists/*
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY package.json ./
RUN bun install --production --ignore-scripts --prefer-offline
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/start.sh ./
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
CMD ["sh", "start.sh"]

