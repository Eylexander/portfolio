# syntax=docker/dockerfile:1

##################
# build-env-back #
##################

FROM golang:1.22.5 AS back-build-env

LABEL maintainer="Eylexander <eylexander88@gmail.com>"

RUN apt-get update \
  && apt-get install openssh-client -y

WORKDIR /go/src/

COPY . .

## Build server
RUN unset GOPATH && go build -o bin/backend src/cmd/*.go

###################
# build-env-front #
###################

FROM node:lts-buster AS front-build-env

RUN apt update \
    && apt install -y openssh-client

WORKDIR /app

## Build app
COPY ./frontend ./

RUN yarn && yarn build

################
# target image #
################

FROM ubuntu:24.04

WORKDIR /opt/backend

COPY --from=back-build-env /go/src/bin/backend .
COPY --from=back-build-env /go/src/scripts/startup.sh ./scripts/startup.sh
COPY --from=back-build-env /go/src/.env .env

ENV MONGODB_URI=mongodb://mongo:27017/

WORKDIR /opt/frontend

COPY --from=front-build-env /app/.output .

EXPOSE 8000/tcp

CMD [ "/opt/backend/backend" ]