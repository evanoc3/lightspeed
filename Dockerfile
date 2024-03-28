FROM node:20-alpine AS build
WORKDIR /app
COPY ./ ./
RUN npm ci
RUN npm run build

FROM nginx:stable-alpine-slim
COPY --from=build /app/dist/ /usr/share/nginx/html/
