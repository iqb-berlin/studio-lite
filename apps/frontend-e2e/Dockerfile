# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM ${REGISTRY_PATH}cypress/browsers:node-20.12.0-chrome-123.0.6312.86-1-ff-124.0.2-edge-123.0.2420.65-1
RUN mkdir studio-lite
WORKDIR studio-lite

COPY . .

# Update npm to latest version
RUN npm --version && \
    npm install -g --no-fund npm && \
    npm cache clean --force && \
    npm --version

# Install dependencies
RUN npm ci --no-fund && npm cache clean --force

# Check nx workspace version
RUN npx nx --version

# Install cypress
RUN npx cypress install && npx cypress version

ENTRYPOINT ["npx", "nx"]
CMD ["e2e", "frontend-e2e"]
