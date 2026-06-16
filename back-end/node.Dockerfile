FROM node:18-alpine
WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
RUN npm ci --production || npm install --production

# Copy source
COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
