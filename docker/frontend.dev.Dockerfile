# syntax=docker/dockerfile:1

#############
# build-env #
#############

FROM node:25

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

ENV NEXT_ENV=development
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

EXPOSE 3000/tcp

ENTRYPOINT ["npm", "run", "dev"]