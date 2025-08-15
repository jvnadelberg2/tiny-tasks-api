# syntax=docker/dockerfile:1.7-labs
# Multi-stage build with optional SQLite support.
ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Healthcheck needs curl in the runtime image
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# -------- deps: install production deps (optionally build better-sqlite3) --------
FROM base AS deps
ARG WITH_SQLITE=0
COPY package.json package-lock.json* ./
# Use npm ci if lockfile exists; otherwise fallback to npm i.
RUN if [ -f package-lock.json ]; then \
      if [ "$WITH_SQLITE" = "1" ]; then \
        apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*; \
      fi; \
      npm ci --omit=dev; \
    else \
      if [ "$WITH_SQLITE" = "1" ]; then \
        apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*; \
      fi; \
      npm i --omit=dev; \
    fi

# -------- prod: small runtime image --------
FROM base AS prod
ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE=memory
# Copy deps, then app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s \
  CMD curl -fsS "http://localhost:${PORT}/health" || exit 1
USER node
CMD ["node", "server.js"]

# -------- test: optional stage to run the test suite in-container --------
FROM base AS test
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi
COPY . .
CMD ["npm", "test"]

