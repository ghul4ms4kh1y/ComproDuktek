FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads private-uploads/proker-documents

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
