# schema-registry-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/schema-registry-ui/release.svg?style=flat)](https://github.com/landoop/schema-registry-ui/releases/latest)
[![docker](https://img.shields.io/docker/pulls/landoop/schema-registry-ui.svg?style=flat)](https://hub.docker.com/r/landoop/schema-registry-ui/)
[![Join the chat at https://gitter.im/Landoop/support](https://img.shields.io/gitter/room/nwjs/nw.js.svg?maxAge=2592000)](https://gitter.im/Landoop/support?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Kafka** UI for the [confluentinc/schema-registry](https://github.com/confluentinc/schema-registry)

<a href="https://schema-registry-ui.landoop.com">=> Live DEMO of schema-registry-ui <=</a>

**Capabilities** create / view / search / evolve / view history & configure **Avro** schemas of your Kafka cluster

#### Other interesting projects

|                                                                       | Description                                                                   |
|-----------------------------------------------------------------------| ------------------------------------------------------------------------------|
| [Landoop/kafka-topics](https://github.com/Landoop/kafka-topics-ui)    | UI to browse Kafka data and work with Kafka Topics                            | 
| [Landoop/fast-data-dev](https://github.com/Landoop/fast-data-dev)     | Docker for Kafka developers (schema-registry,kafka-rest,zoo,brokers,landoop)  |
| [Landoop-On-Cloudera](https://github.com/Landoop/Landoop-On-Cloudera) | Install and manage your kafka streaming-platform on you Cloudera CDH cluster  |

## Preview

<a href="http://schema-registry-ui.landoop.com">
  <img src="http://landoop.github.io/schema-registry-ui/v0.3.animation.gif">
</a>

## Configuration

* By default `schema-registry-ui` points to the schema-registry at `http://localhost:8081`
  To point it to a different schema-registry, update `src/env.js`
* Enable CORS in the schema-registry by adding to `/opt/confluent-3.0.0/etc/schema-registry/schema-registry.properties` the following and restart the service

```
access.control.allow.methods=GET,POST,OPTIONS
access.control.allow.origin=*
```

## Run

### Prerequisites

* You need to download dependencies with `bower`. Find out more [here](http://bower.io)
* You need a `web server` to serve the app.

### Steps

    git clone https://github.com/Landoop/schema-registry-ui.git
    cd schema-registry-ui
    npm install
    http-server .

Web UI will be available at `http://localhost:8080`

## Deploy

    npm install
    grunt

All files will be under folder `dist`

### Nginx config

If you use `nginx` to serve this ui, let angular manage routing with

    location / {
        try_files $uri $uri/ /index.html =404;
        root /folder-with-schema-registry-ui/;
    }

### Docker

Easiest way to use and update is through images on the public Docker Hub
https://hub.docker.com/r/landoop/schema-registry-ui/

## Changelog

#### Version 0.6 (16-Aug-16)

* In place editing of Avro schemas

  <img width="60%" src="http://landoop.github.io/schema-registry-ui/0.6/evolve-schema-in-place.png">

* Evolution History displayed as `diff`

  <img width="60%" src="http://landoop.github.io/schema-registry-ui/0.6/history.png">

### License

The project is licensed under the [BSL](http://landoop.com/bsl) license.
