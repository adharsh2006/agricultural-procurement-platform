# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 2: Runner
FROM python:3.9-slim
WORKDIR /app
# Copy the static export from the builder stage
COPY --from=builder /app/out/ .
EXPOSE 3000
CMD ["python", "-m", "http.server", "3000"]
