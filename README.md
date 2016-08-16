# schema-registry-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/schema-registry-ui/release.svg?style=flat)](https://github.com/landoop/schema-registry-ui/releases/latest)

Web UI for Confluent's Schema Registry built in angular - https://github.com/confluentinc/schema-registry

  <a href="http://schema-registry-ui.landoop.com">
    <img src="http://landoop.github.io/schema-registry-ui/demo-button.jpg" width="75"/>
  </a>

### Features

* Avro + Table schema views
* Search Subjects & Schemas
* Avro evolution compatibility checks
* New schema registration
* Display CURL commands
* Evolution History as `diff`

### Other Landoop projects

|                    Project                                     |         Description            |
|----------------------------------------------------------------| -------------------------------|
| [kafka-topics-ui](https://github.com/Landoop/kafka-topics-ui)  | View data from any Kafka topic |
| [Confluent-On-Cloudera](https://github.com/Landoop/Confluent-On-Cloudera) | Install and Manage the Confluent Platform on Hadoop Cloudera CDH clusters |

## Preview

<a href="http://schema-registry-ui.landoop.com">
  <img src="http://landoop.github.io/schema-registry-ui/v0.3.animation.gif">
</a>

## Configuration

* By default `schema-registry-ui` points to the schema-registry at http://localhost:8081 To point it to a different schema-registry, update `src/env.js`
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

## License

The project is licensed under the Apache 2 license.
