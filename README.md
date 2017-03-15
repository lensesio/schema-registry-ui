# schema-registry-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/schema-registry-ui/release.svg?style=flat)](https://github.com/landoop/schema-registry-ui/releases/latest)
[![docker](https://img.shields.io/docker/pulls/landoop/schema-registry-ui.svg?style=flat)](https://hub.docker.com/r/landoop/schema-registry-ui/)
[![Join the chat at https://gitter.im/Landoop/support](https://img.shields.io/gitter/room/nwjs/nw.js.svg?maxAge=2592000)](https://gitter.im/Landoop/support?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a web tool for the [confluentinc/schema-registry](https://github.com/confluentinc/schema-registry) in order to create / view / search / evolve / view history & configure **Avro** schemas of your Kafka cluster.

## Live Demo
[schema-registry-ui.landoop.com](http://schema-registry-ui.landoop.com)

## Prerequisites
You will need schema-registry installed with CORS enabled.

In order to enable CORS, add in `/opt/confluent-3.x.x/etc/schema-registry/schema-registry.properties`

```
access.control.allow.methods=GET,POST,PUT,OPTIONS
access.control.allow.origin=*
```
And then restart the [schema-registry] service

##### Get the set up locally
We also provide the schema-registry and schema-registry-ui as part of the [fast-data-dev](https://github.com/Landoop/fast-data-dev) docker image for local development setup that also gives all the relevant backends. Just run:
```
docker run -d --name=fast-data-dev -p 8081:8081 landoop/fast-data-dev
```
Checkout more about fast-data-dev docker container [here](https://github.com/Landoop/fast-data-dev)

## Running it via Docker

To run it via the provided docker image:

```
docker pull landoop/schema-registry-ui
docker run --rm -p 8000:8000 \
           -e "SCHEMAREGISTRY_URL=http://confluent-schema-registry-host:port" \
           landoop/schema-registry-ui
```

Please see the [docker readme](https://github.com/Landoop/schema-registry-ui/tree/master/docker) for more information
and how to enable various features or avoid CORS issues via the proxy flag.

## Build from source

```
    git clone https://github.com/Landoop/schema-registry-ui.git
    cd schema-registry-ui
    npm install -g bower
    npm install
    http-server .
```
Web UI will be available at `http://localhost:8080`

### Nginx config

If you use `nginx` to serve this ui, let angular manage routing with
```
    location / {
        try_files $uri $uri/ /index.html =404;
        root /folder-with-schema-registry-ui/;
    }
```

### Setup Kafka Rest clusters

Use multiple Kafka Rest clusters in `env.js` :
```
var clusters = [
   {
       NAME:"prod",
       // Schema Registry service URL (i.e. http://localhost:8081)
       SCHEMA_REGISTRY: "http://localhost:8081", // https://schema-registry.demo.landoop.com
       COLOR: "#141414" // optional
     },
     {
       NAME:"dev",
       SCHEMA_REGISTRY: "http://localhost:8383",
       COLOR: "red", // optional
       allowGlobalConfigChanges: true, // optional
       //allowTransitiveCompatibilities: true        // if using a Confluent Platform release >= 3.1.1 uncomment this line
     }
  ];

```
* Use `COLOR` to set different header colors for each set up cluster.
* Use `allowGlobalConfigChanges` to enable configuring Global Compatibility Level from the UI.
* Use `allowTransitiveCompatibilities` to enable transitive compatibility levels. This is supported in CP >= 3.1.1

## Changelog
[Here](https://github.com/Landoop/schema-registry-ui/wiki/Changelog)

## License

The project is licensed under the [BSL](http://www.landoop.com/bsl) license.

## Relevant Projects

* [kafka-topics-ui](https://github.com/Landoop/kafka-topics-ui), UI to browse Kafka data and work with Kafka Topics
* [kafka-connect-ui](https://github.com/Landoop/kafka-connect-ui), Set up and manage connectors for multiple connect clusters
* [fast-data-dev](https://github.com/Landoop/fast-data-dev), Docker for Kafka developers (schema-registry,kafka-rest,zoo,brokers,landoop)
* [Landoop-On-Cloudera](https://github.com/Landoop/Landoop-On-Cloudera), Install and manage your kafka streaming-platform on you Cloudera CDH cluster



<img src="http://www.landoop.com/images/landoop-dark.svg" width="13" /> www.landoop.com
