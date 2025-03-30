FROM oven/bun:latest as build

WORKDIR /temp
COPY . .
RUN bun install
RUN bun run build

FROM oven/bun:latest as runtime

ARG BACKEND_URL
ARG AUTH_SECRET="YOUR_SECRET_KEY"
ENV BACKEND_URL=$BACKEND_URL
ENV AUTH_SECRET=$AUTH_SECRET

WORKDIR /app
COPY --from=build /temp/build /app/build
COPY --from=build /temp/node_modules /app/node_modules
COPY --from=build /temp/package.json /app/package.json

RUN rm -rf /temp

EXPOSE 3000
CMD ["bun", "run", "start"]