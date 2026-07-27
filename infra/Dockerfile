# Dockerfile for ff-server

FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production
COPY . .
RUN npm run build || true
EXPOSE 3000
CMD ["node", "dist/server.js"]
