## Schema Registry UI ##

This is a small docker image you can use to test Landoop's schema-registry-ui.
It serves the schema-registry-ui from port 8000.
A live version can be found at <https://schema-registry-ui.landoop.com>

The software is stateless and the only necessary option is your Schema Registry
URL.

To run it:

    docker run --rm -it -p 8000:8000 \
               -e "SCHEMAREGISTRY_URL=http://schema.registry.url" \
               landoop/schema-registry-ui

Visit http://localhost:8000 to see the UI.
