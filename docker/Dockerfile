# 动态版多阶段构建
# 阶段 1:依赖 + 构建(静态资源)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ARG SITE_URL=https://example.com
ENV ASTRO_MODE=server
ENV SITE_URL=$SITE_URL
RUN npm run build:server

# 阶段 2:运行时(仅产物 + 生产依赖)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV ASTRO_MODE=server

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

RUN mkdir -p /app/data

EXPOSE 4321
USER node
CMD ["node", "dist/server/entry.mjs"]
