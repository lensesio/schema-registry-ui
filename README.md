# schema-registry-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/schema-registry-ui/release.svg?style=flat)](https://github.com/landoop/schema-registry-ui/releases/latest)
[![docker](https://img.shields.io/docker/pulls/landoop/schema-registry-ui.svg?style=flat)](https://hub.docker.com/r/landoop/schema-registry-ui/)
[![Join the chat at https://gitter.im/Landoop/support](https://img.shields.io/gitter/room/nwjs/nw.js.svg?maxAge=2592000)](https://gitter.im/Landoop/support?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Kafka UI** for the [confluentinc/schema-registry](https://github.com/confluentinc/schema-registry)

> [Demo of schema-registry-ui](https://schema-registry-ui.landoop.com)

**Capabilities:** create / view / search / evolve / view history & configure **Avro** schemas of your Kafka cluster

### Other interesting projects

|                                                                       | Description                                                                   |
|-----------------------------------------------------------------------| ------------------------------------------------------------------------------|
| [Landoop/kafka-topics](https://github.com/Landoop/kafka-topics-ui)    | UI to browse Kafka data and work with Kafka Topics                            | 
| [Landoop/fast-data-dev](https://github.com/Landoop/fast-data-dev)     | Docker for Kafka developers (schema-registry,kafka-rest,zoo,brokers,landoop)  |
| [Landoop-On-Cloudera](https://github.com/Landoop/Landoop-On-Cloudera) | Install and manage your kafka streaming-platform on you Cloudera CDH cluster  |

## Preview

<a href="http://schema-registry-ui.landoop.com">
  <img src="http://landoop.github.io/schema-registry-ui/animation.0.7.gif" style="width:700px">
</a>

## Running it

The easiest way is to run it through Docker

    docker pull landoop/schema-registry-ui
    docker run --rm -it -p 8000:8000 \
               -e "SCHEMAREGISTRY_URL=http://confluent-schema-registry-host:port" \
               landoop/schema-registry-ui

**Config:** Your `schema-registry` service will need to allow CORS (!!)

To do that, and in `/opt/confluent-3.0.0/etc/schema-registry/schema-registry.properties`

```
access.control.allow.methods=GET,POST,OPTIONS
access.control.allow.origin=*
```

And restart the [schema-registry] service

> We also provide the schema-registry-ui as part of the [fast-data-dev](https://github.com/Landoop/fast-data-dev), that
is an excellent docker for developers

### Building it

* You need to download dependencies with `bower`. Find out more [here](http://bower.io)
* You need a `web server` to serve the app.
* By default `schema-registry-ui` points to the schema-registry at `http://localhost:8081`
  To point it to a different schema-registry, update `src/env.js`

#### Pre-steps

To just start the docker containers for zookeeper, kafka and schema-registry locally for testing, run the following commands (*DO NOT USE FOR PRODUCTION!!!*) 

    docker network create confluent
    docker run -d --net=confluent --name=zookeeper -e ZOOKEEPER_CLIENT_PORT=32181 --restart=always confluentinc/cp-zookeeper:3.0.1
    docker run -d --net=confluent --name=kafka -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:32181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092 --restart=always confluentinc/cp-kafka:3.0.1
    docker run -d --net=confluent --name=schemareg -e SCHEMA_REGISTRY_KAFKASTORE_CONNECTION_URL=zookeeper:32181 -e SCHEMA_REGISTRY_HOST_NAME=schemareg -e SCHEMA_REGISTRY_LISTENERS=http://0.0.0.0:8081 -e SCHEMA_REGISTRY_ACCESS_CONTROL_ALLOW_METHODS=GET,POST,OPTIONS -e SCHEMA_REGISTRY_ACCESS_CONTROL_ALLOW_ORIGIN=* -p 8081:8081 --restart=always confluentinc/cp-schema-registry:3.0.1

#### Steps

    git clone https://github.com/Landoop/schema-registry-ui.git
    cd schema-registry-ui
    npm install
    http-server .

Web UI will be available at `http://localhost:8080`

### Nginx config

If you use `nginx` to serve this ui, let angular manage routing with

    location / {
        try_files $uri $uri/ /index.html =404;
        root /folder-with-schema-registry-ui/;
    }

### Changelog

#### Version 0.7 (20-Aug-16)

* Material design on pagination

  <img width="40%" src="http://landoop.github.io/schema-registry-ui/0.7/materialize-pagination.png">

* High-light selected schema in list

  <img width="40%" src="http://landoop.github.io/schema-registry-ui/0.7/highlight-selected.png">

* Fit list of schemas in single page (minimize need to scroll down)

  <img width="40%" src="http://landoop.github.io/schema-registry-ui/0.7/fit-in-page.png">

#### Version 0.6 (16-Aug-16)

* In place editing of Avro schemas

  <img width="60%" src="http://landoop.github.io/schema-registry-ui/0.6/evolve-schema-in-place.png">

* Evolution History displayed as `diff`

  <img width="60%" src="http://landoop.github.io/schema-registry-ui/0.6/history.png">

#### Version 0.5 (4-Aug-16)

* Grunt-up app, resulting in < 1 MByte of minified files

* Code cleanup & numerous fixes

* First release of Docker image at https://hub.docker.com/u/landoop/

  <img width="50%" src="http://landoop.github.io/schema-registry-ui/0.5/docker.png">

#### Version 0.4 (29-Jul-16)

* Mostly bug fixes

#### Version 0.3 (10-Jul-16)

* Started introducing material design

#### Version 0.2 (29-Jun-16)

* Implement new schema creation

* Implement schema compatibility checking

#### Version 0.1 (12-Jun-16)

* Initial release

### License

The project is licensed under the [BSL](http://landoop.com/bsl) license
