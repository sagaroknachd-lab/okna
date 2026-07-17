FROM node:22-alpine
WORKDIR /app
COPY package.json ./
# No dependencies — the proxy uses only the Node standard library.
COPY advisor-proxy.mjs ./
ENV PORT=8787
EXPOSE 8787
CMD ["node", "advisor-proxy.mjs"]
