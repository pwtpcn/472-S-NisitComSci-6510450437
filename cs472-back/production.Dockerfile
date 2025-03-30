# Base stage
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install dependencies for development
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
COPY bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install dependencies for production
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
COPY bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Prerelease stage
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun test

# Final release stage
FROM base AS release
COPY --from=prerelease /usr/src/app .

# Ensure DATABASE_URL is available at runtime
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Run prisma commands to update schema and generate client
RUN bunx prisma db pull
RUN bunx prisma generate

# Expose necessary port
EXPOSE 4000

# Start the application
ENTRYPOINT [ "bun", "run", "./src/index.ts" ]
