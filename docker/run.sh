#!/bin/sh

if echo $PROXY | egrep -sq "true|TRUE|y|Y|yes|YES|1" \
        && [[ ! -z "$SCHEMAREGISTRY_URL" ]]; then
    echo "Enabling proxy."
    cat <<EOF >>/caddy/Caddyfile
proxy /api/schema-registry $SCHEMAREGISTRY_URL {
    without /api/schema-registry
}
EOF
SCHEMAREGISTRY_URL=/api/schema-registry
fi

if [[ -z "$SCHEMAREGISTRY_URL" ]]; then
    echo "Schema Registry URL was not set via SCHEMAREGISTRY_URL environment variable."
else
    echo "Setting Schema Registry URL to $SCHEMAREGISTRY_URL."
    cat <<EOF >schema-registry-ui/env.js
var clusters = [
   {
     NAME: "default",
     SCHEMA_REGISTRY: "$SCHEMAREGISTRY_URL"
   }
]
EOF
fi

echo

exec /caddy/caddy -conf /caddy/Caddyfile
