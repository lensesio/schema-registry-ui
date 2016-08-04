#!/bin/sh

if [[ -z "$SCHEMAREGISTRY_URL" ]]; then
    echo "Schema Registry URL was not set via SCHEMAREGISTRY_URL environment variable."
else
    echo "Setting Schema Registry URL to $SCHEMAREGISTRY_URL."
    sed -e 's|^\s*SCHEMA_REGISTRY.*|  SCHEMA_REGISTRY: "'"$SCHEMAREGISTRY_URL"'",|' \
        -i /schema-registry-ui/src/env.js
fi

exec /caddy/caddy -conf /caddy/Caddyfile
