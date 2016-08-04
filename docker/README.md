# Schema Registry UI #

This is a small docker image you can use to test the schema-registry-ui.
The only option is the Schema Registry URL.

To run it:

    docker run --rm -it -e "SCHEMAREGISTRY_URL=http://schema.registry.url"  landoop/schema-registry-ui

Optionally you may set the URLs of other Kafka UI components using the variables:

- KAFKATOPICS_UI_URL
- KAFKACONNECT_UI_URL
- KAFKAMONITOR_UI_URL
- KAFKAALERTS_UI_URL
- KAFKAMANAGER_UI_URL
