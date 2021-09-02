FROM alpine

WORKDIR /

ADD . /

RUN apk add --update nodejs npm \
    && npm install --force

EXPOSE 8080

CMD ["/bin/sh", "-c", "npm start"]
