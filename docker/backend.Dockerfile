# syntax=docker/dockerfile:1

###########
# builder #
###########

FROM golang:trixie AS builder

LABEL maintainer="Eylexander <me@eylexander.fr>"

ENV MONGODB_URI=mongodb://database:27017/portfolio

WORKDIR /go/src/

COPY . .

## Build server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o portfolio-server ./src/cmd/main.go

################
# target image #
################

FROM debian:bookworm-slim

WORKDIR /opt/app

COPY --from=builder /go/src/portfolio-server /opt/app/portfolio-server

EXPOSE 8000/tcp

ENTRYPOINT [ "/opt/app/portfolio-server" ]