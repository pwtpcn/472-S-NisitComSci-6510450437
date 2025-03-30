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

# Prerelease step
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .  
ENV NODE_ENV=production
RUN bun test

# Clean up temporary files
RUN rm -rf /temp

# Final release build
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/prisma ./prisma
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json ./package.json
COPY --from=prerelease /usr/src/app/.env ./.env
COPY ./.env ./.env

# Database URL environment variable
ARG DATABASE_URL="postgresql://username:password@domainOrIp:port/db_name?schema=public"
ENV DATABASE_URL=$DATABASE_URL

# Prisma commands to update schema and generate client
RUN bunx prisma db pull
RUN bunx prisma generate

# Clean up temporary files
RUN rm -rf /temp

# Expose the port and set entrypoint
EXPOSE 4000
ENTRYPOINT [ "bun", "run", "./src/index.ts" ]