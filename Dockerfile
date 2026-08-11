# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL required by Prisma Client on Alpine
RUN apk add --no-cache openssl

# Install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy configuration files and source code
COPY tsconfig.json tsoa.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma Client and TSOA Routes/OpenAPI specs
RUN npx prisma generate
RUN npx tsoa spec-and-routes

# Build TypeScript to dist/
RUN npm run build

# Remove development dependencies to keep node_modules lean
RUN npm prune --production

# ==========================================
# Stage 2: Production Runtime Environment
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install OpenSSL for Prisma runtime execution
RUN apk add --no-cache openssl

# Copy package manifests
COPY package*.json ./

# Copy pruned node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled Javascript and generated route/swagger assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./dist/generated

# Use standard non-root user provided by Node Alpine for security
USER node

EXPOSE 3000

# Start production server
CMD ["node", "dist/server.js"]