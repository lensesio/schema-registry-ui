# schema-registry-ui

Web UI for [Confluent's Schema Registry](https://github.com/confluentinc/schema-registry)

Live demo => http://schema-registry-ui.landoop.com

## preview 

![](http://landoop.github.io/schema-registry-ui/img-1.png)

![](http://landoop.github.io/schema-registry-ui/img-2.png)

## quickstart 

Download the latest release (includes all static files)

    wget https://github.com/Landoop/schema-registry-ui/files/310897/schema-registry-ui-0.1.tar.gz
    tar -zxvf schema-registry-ui-0.1.tar.gz
    cd schema-registry-ui

and open file index.html

## configure

By default the schema-registry-ui points to the schema-registry at http://localhost:8081

If you want to point it to a different url you need to update `src/env.js` and also enable CORS to the schema-registry.
To achieve that add to `/opt/confluent-2.0.1/etc/schema-registry/schema-registry.properties` the following and restart the service

    access.control.allow.methods=GET,POST,OPTIONS
    access.control.allow.origin=*

## build from source

1. clone the repo and navigate to the root folder `cd schema-registy-ui`
2. download dependencies with `bower install`
3. update your schema registry URL in `src/env.js`

## License

The project is licensed under the Apache 2 license.
