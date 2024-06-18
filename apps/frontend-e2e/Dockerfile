# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM ${REGISTRY_PATH}cypress/browsers:node-20.13.0-chrome-124.0.6367.155-1-ff-125.0.3-edge-124.0.2478.80-1

WORKDIR /usr/src/studio-lite

# Copy studio-lite monorepo
COPY . .

# Copy pre-installed dependencies
COPY --from=studio-lite-base /usr/src/studio-lite-base/node_modules ./node_modules

# Check nx workspace version
RUN npx nx --version

# Install cypress
RUN --mount=type=cache,target=./.nx/cache \
    npx cypress install && npx cypress version

ENTRYPOINT ["npx", "nx"]
CMD ["e2e", "frontend-e2e"]
