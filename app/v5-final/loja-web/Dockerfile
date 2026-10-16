FROM node:22-slim
WORKDIR /app
COPY server.js ./
COPY public ./public
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
