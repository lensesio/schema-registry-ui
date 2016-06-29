# schema-registry-ui

Web UI for Confluent's Schema Registry - https://github.com/confluentinc/schema-registry built in angular

<center>
  <a href="http://schema-registry-ui.landoop.com" target="_blank">
    <img src="http://landoop.github.io/schema-registry-ui/schema-registry-ui.png"/>
  </a>
</center>

## preview 

<img src="http://landoop.github.io/schema-registry-ui/demo.gif">

## quickstart 

Download the latest release (includes all static files)

    wget https://github.com/Landoop/schema-registry-ui/files/310897/schema-registry-ui-0.1.tar.gz
    tar -zxvf schema-registry-ui-0.1.tar.gz
    cd schema-registry-ui

and open file index.html

## configure

By default the schema-registry-ui points to the schema-registry at http://localhost:8081

If you want to point it to a different url you need to update `app/src/env.js` and also enable CORS to the schema-registry.
To achieve that add to `/opt/confluent-2.0.1/etc/schema-registry/schema-registry.properties` the following and restart the service

    access.control.allow.methods=GET,POST,OPTIONS
    access.control.allow.origin=*

## build from source

1. clone the repo and navigate to the root folder `cd schema-registy-ui`
2. download dependencies with `bower install`
3. update your schema registry URL in `app/src/env.js`
4. serve locally with `http-server app`

## License

The project is licensed under the Apache 2 license.
