#!/bin/sh

if [[ -z "$SCHEMAREGISTRY_URL" ]]; then
    echo "Schema Registry URL was not set via SCHEMAREGISTRY_URL environment variable."
else
    echo "Setting Schema Registry URL to $SCHEMAREGISTRY_URL."
    sed -e 's|^\s*SCHEMA_REGISTRY.*|  SCHEMA_REGISTRY: "'"$SCHEMAREGISTRY_URL"'",|' \
        -i /schema-registry-ui/combined.js
fi

echo "Final configuration is:"
echo
cat /schema-registry-ui/combined.js
echo

exec /caddy/caddy -conf /caddy/Caddyfile
