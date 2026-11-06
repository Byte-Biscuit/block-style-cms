# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build may load instrumentation / data paths; runtime overrides this.
ENV CMS_DATA_PATH=/tmp/cms-build-data
RUN mkdir -p /tmp/cms-build-data && npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV CMS_DATA_PATH=/data
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs \
    && mkdir -p /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
VOLUME /data

# Root only for entrypoint chown of /data; drops to nextjs before node.
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
