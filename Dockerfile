# Game images. Build context is the repo root. Built by deploy/deploy.sh, never by hand.
# One codebase, two apps: no build arg builds THE MEMORY PROTOCOL (dori-game); DORI_APP=shuk builds
# THE AMAZING SHUK (dori-shuk), served under /shuk with only its own routes (lib/base-path.ts, proxy.ts).

FROM node:22-alpine AS build
ARG DORI_APP=""
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_DORI_APP=$DORI_APP
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . ./
# Heap cap: this box has 4 GB and other services. Swap covers the rest.
RUN NODE_OPTIONS=--max-old-space-size=1024 npm run build
# The Shuk's invitation command runs in its container (docker exec): the script and the store's sources it imports,
# which use only Node built-ins. The Memory Protocol image gets an empty folder.
RUN mkdir -p /tools && if [ "$DORI_APP" = "shuk" ]; then \
      mkdir -p /tools/scripts /tools/lib/amazing-shuk && cp scripts/shuk-invite.ts /tools/scripts/ && cp lib/base-path.ts /tools/lib/ \
      && find lib/amazing-shuk -maxdepth 1 -name '*.ts' ! -name '*.test.ts' -exec cp {} /tools/lib/amazing-shuk/ \; ; fi

FROM node:22-alpine
ARG DORI_APP=""
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 NEXT_PUBLIC_DORI_APP=$DORI_APP
# Standalone output: server.js plus traced node_modules. Static files and public/ are not
# copied into it by Next, so they are added here. Code is root-owned, read-only at runtime.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /tools ./tools
# A new named volume mounted here takes this owner, so the app can write its state.
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
