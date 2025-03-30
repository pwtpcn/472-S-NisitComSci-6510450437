# Build stage
FROM oven/bun:latest as build

WORKDIR /temp

# Copy the project files
COPY . .

RUN cd /temp

# Install dependencies
RUN bun install

# Run the build process (adjust to your actual build command)
RUN bun run build

# Runtime stage
FROM oven/bun:latest as runtime

# Set environment variables
ARG BACKEND_URL
ARG AUTH_SECRET="YOUR_SECRET_KEY"
ENV BACKEND_URL=$BACKEND_URL
ENV AUTH_SECRET=$AUTH_SECRET

WORKDIR /app

# Copy necessary files from the build stage
COPY --from=build /temp/build /app/build
COPY --from=build /temp/node_modules /app/node_modules
COPY --from=build /temp/package.json /app/package.json
COPY --from=build /temp/.env /app/.env

# Clean up unnecessary temporary files
RUN rm -rf /temp

# Expose port and run the application
EXPOSE 3000
CMD ["bun", "run", "start"]
