FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY src ./src
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/main.js"]
