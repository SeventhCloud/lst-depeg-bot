# ---- Build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Install only @types/node for build
RUN npm install --save-dev @types/node

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:24-alpine AS runner
WORKDIR /app

# Copy runtime files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Add non-root user -- less secure
#RUN addgroup -S appgroup && adduser -S appuser -G appgroup
#USER appuser

# Start your bot
CMD ["node", "dist/index.js"]