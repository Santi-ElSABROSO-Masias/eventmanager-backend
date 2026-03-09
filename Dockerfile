# Use official Node.js Alpine image for a lightweight, secure base
FROM node:18-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install NO_OPTIONAL dependencies for production to keep size down
RUN npm install

# Copy Prisma schema separately to leverage Docker cache
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the TypeScript compiling to Javascript
RUN npm run build

# --- Production Image ---
FROM node:18-alpine AS runner
WORKDIR /app

# Copy node_modules & dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Only expose the internal port for compose network (doesn't map to host automatically)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
