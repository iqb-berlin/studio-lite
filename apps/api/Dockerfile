# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""
ARG BASE_IMAGE_NAME=studio-lite-base


FROM $BASE_IMAGE_NAME AS base


FROM base AS dev
ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}node:lts-bookworm-slim AS build
ARG PROJECT
ENV NODE_ENV=production

RUN --mount=type=cache,target=/var/cache/apt \
    apt update && \
    apt install -y --no-install-recommends tini

USER node

WORKDIR /usr/src/studio-lite-${PROJECT}
RUN mkdir packages

# Install the runtime dependencies from the committed, fully pinned pair
# (apps/api/runtime-package.json + runtime-package-lock.json, #1587). npm ci
# resolves nothing against the registry, so a new major of some transitive
# optional peer can no longer break the image build the way ioredis 6.0.0 did.
# pg is part of the pair: typeorm loads its driver dynamically, which is why nx
# never lists it in the generated package.json.
#
# The generated package.json still arrives from the build -- as the drift
# guard: if its dependencies are not contained in the committed pair with the
# same versions, the build stops here. Fix: node scripts/update-api-runtime-deps.mjs
COPY --chown=node:node --from=base /usr/src/studio-lite/dist/apps/${PROJECT}/package.json generated-package.json
COPY --chown=node:node apps/${PROJECT}/runtime-package.json package.json
COPY --chown=node:node apps/${PROJECT}/runtime-package-lock.json package-lock.json
RUN node -e ' \
    const generated = require("./generated-package.json").dependencies || {}; \
    const committed = require("./package.json").dependencies || {}; \
    const drift = Object.entries(generated).filter(function (e) { return committed[e[0]] !== e[1]; }); \
    if (drift.length) { \
      console.error("Runtime dependencies drifted from the committed pair:"); \
      drift.forEach(function (e) { console.error("  " + e[0] + ": generated " + e[1] + ", committed " + (committed[e[0]] || "missing")); }); \
      console.error("Run: node scripts/update-api-runtime-deps.mjs"); \
      process.exit(1); \
    }' && rm generated-package.json
RUN --mount=type=cache,target=~/.npm \
    npm ci --omit=dev --no-fund

EXPOSE 3333


FROM build AS source
ARG PROJECT

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=base /usr/src/studio-lite/dist/apps/${PROJECT} .


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
