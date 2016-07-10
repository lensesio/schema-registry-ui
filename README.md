# schema-registry-ui

Web UI for Confluent's Schema Registry built in angular - https://github.com/confluentinc/schema-registry

<center>
  <a href="http://schema-registry-ui.landoop.com">
    <img src="http://www.sachinghare.com/wp-content/uploads/2013/11/demo-button.jpg" width="70"/>
  </a>
</center>

### Features

* Schema registration and compatibility checks
* Generate CURL commands
* Search Subjects & Schemas
* Avro + Table schema views
* Routed urls

## Preview

<img src="http://landoop.github.io/schema-registry-ui/demo-v0.2.gif">

## Configuration

* By default `schema-registry-ui` points to the schema-registry at http://localhost:8081 To point it to a different schema-registry, update `app/src/env.js`
* Enable CORS in the schema-registry by adding to `/opt/confluent-2.0.1/etc/schema-registry/schema-registry.properties` the following and restart the service

```
access.control.allow.methods=GET,POST,OPTIONS
access.control.allow.origin=*
```

## Run

#### Prerequisites 
* You need to download dependencies with `bower`. Find out more [here](http://bower.io)
* You need a `web server` to serve the app.

#### Steps

    git clone https://github.com/Landoop/schema-registry-ui.git
    cd schema-registry-ui
    bower install
    http-server app

Web UI will be available at `http://localhost:8080`

#### Nginx config

If you use `nginx` to serve this ui, let angular manage routing with

    location / {
        try_files $uri $uri/ /index.html =404;
        root /folder-with-schema-registry-ui/;
    }

## License

The project is licensed under the Apache 2 license.
