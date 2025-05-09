# Development stage
FROM node:22 AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=development

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=development /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
