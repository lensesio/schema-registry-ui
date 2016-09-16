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
    sed -e 's|^\s*var SCHEMA_REGISTRY =.*|  var SCHEMA_REGISTRY = "'"$SCHEMAREGISTRY_URL"'";|' \
        -i /schema-registry-ui/combined.js
fi

# echo "Final configuration is:"
# echo
# cat /schema-registry-ui/combined.js
# echo

exec /caddy/caddy -conf /caddy/Caddyfile
