# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM ${REGISTRY_PATH}cypress/browsers:node-20.12.0-chrome-123.0.6312.86-1-ff-124.0.2-edge-123.0.2420.65-1
RUN mkdir studio-lite
WORKDIR studio-lite

COPY . .

# Update npm to latest version
RUN npm --version
RUN --mount=type=cache,target=~/.npm \
    npm install -g --no-fund npm
RUN npm --version

# Install dependencies
RUN --mount=type=cache,target=~/.npm \
    npm ci --no-fund

# Check nx workspace version
RUN npx nx --version

# Install cypress
RUN --mount=type=cache,target=./.nx/cache \
    npx cypress install && npx cypress version

ENTRYPOINT ["npx", "nx"]
CMD ["e2e", "frontend-e2e"]
