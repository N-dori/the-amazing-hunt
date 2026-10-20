# THE MEMORY PROTOCOL game image. Build context is the repo root.
# Built by deploy/deploy.sh, never by hand.

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . ./
# Heap cap: this box has 4 GB and other services. Swap covers the rest.
RUN NODE_OPTIONS=--max-old-space-size=1024 npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Standalone output: server.js plus traced node_modules. Static files and public/ are not
# copied into it by Next, so they are added here. Code is root-owned, read-only at runtime.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
