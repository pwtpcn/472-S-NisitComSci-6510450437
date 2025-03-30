FROM oven/bun:latest AS base
WORKDIR /usr/src/app

ARG DATABASE_URL="postgresql://username:password@domainOrIp:port/db_name?schema=public"
ENV DATABASE_URL=$DATABASE_URL

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun test

RUN rm -rf /temp

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/prisma ./prisma
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .

RUN bunx prisma db pull
RUN bunx prisma generate

RUN rm -rf /temp

EXPOSE 4000
ENTRYPOINT [ "bun", "run", "./src/index.ts" ]