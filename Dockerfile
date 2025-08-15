# syntax=docker/dockerfile:1.7-labs
ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Healthcheck needs curl
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# -------- deps: install prod deps; optionally add better-sqlite3 --------
FROM base AS deps
ARG WITH_SQLITE=0
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm i --omit=dev; fi
# Optionally add SQLite without altering package.json/lock
RUN if [ "$WITH_SQLITE" = "1" ]; then \
      apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*; \
      npm i --no-save --omit=dev better-sqlite3; \
    fi

# -------- prod --------
FROM base AS prod
ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE=memory
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
# Ensure the data dir exists in the image and is owned by "node".
# This ownership will be copied into a *new* named volume on first use.
RUN mkdir -p /app/data && chown -R node:node /app/data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s \
  CMD curl -fsS "http://localhost:${PORT}/health" || exit 1
USER node
CMD ["node", "server.js"]

# -------- test (optional) --------
FROM base AS test
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi
COPY . .
CMD ["npm", "test"]
