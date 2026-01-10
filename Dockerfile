# Base image with Node.js and Chrome dependencies
FROM node:18-bullseye-slim AS base

# Install OpenSSL and other dependencies for Prisma & Puppeteer
RUN apt-get update -y && apt-get install -y openssl \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome for Puppeteer
# Note: Puppeteer installs its own chrome, but having dependencies is crucial
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set up the application directory
WORKDIR /app

# Install dependencies (only production needed, but we install all for build)
COPY package.json package-lock.json* ./
# Install ALL dependencies including devDeps for build
RUN npm ci

# Copy output of prisma generate safely
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the application
# Increase memory limit for build just in case
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Production image, copy all the files and run next
FROM node:18-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Telemetry disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies for Puppeteer & Prisma
RUN apt-get update -y && apt-get install -y openssl \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from base build
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
