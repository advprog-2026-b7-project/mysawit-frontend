# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

FROM base AS build

ENV NODE_ENV=production
ENV PNPM_CONFIG_DANGEROUSLY_ALLOW_ALL_BUILDS=true

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential python-is-python3 pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

COPY . .
RUN pnpm run build

RUN pnpm prune --prod

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app /app

EXPOSE 3000

CMD ["pnpm", "run", "start"]