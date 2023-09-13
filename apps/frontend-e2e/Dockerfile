# syntax=docker/dockerfile:1

FROM cypress/browsers:node-20.5.0-chrome-114.0.5735.133-1-ff-114.0.2-edge-114.0.1823.51-1
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
