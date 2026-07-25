FROM node:20.18.1-alpine3.21 AS deps

USER node
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# =========================

FROM node:20.18.1-alpine3.21 AS final

WORKDIR /app

# ✅ install chromium + dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# balik lagi ke user node
#USER node

# copy source
COPY . .

RUN mv .env.example .env

# fix permission
RUN chown -R node:node /app

# copy node_modules
COPY --from=deps /app/node_modules ./node_modules

USER node

# env puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Run Migration
# RUN npx sequelize-cli db:migrate

EXPOSE 3000

#CMD ["node", "src/app.js"]
RUN chmod +x start.sh

CMD ["sh", "./start.sh"]
