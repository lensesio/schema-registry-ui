#!/bin/sh

PROXY_SKIP_VERIFY="${PROXY_SKIP_VERIFY:-false}"
INSECURE_PROXY=""
ALLOW_GLOBAL="${ALLOW_GLOBAL:-false}"
ALLOW_TRANSITIVE="${ALLOW_TRANSITIVE:-false}"


if echo "$PROXY_SKIP_VERIFY" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
    INSECURE_PROXY=insecure_skip_verify
    echo "Unsecure: won't verify proxy certicate chain."
fi

# fix for certain installations
cat /caddy/Caddyfile.template > /caddy/Caddyfile

if echo $PROXY | egrep -sq "true|TRUE|y|Y|yes|YES|1" \
        && [[ ! -z "$SCHEMAREGISTRY_URL" ]]; then
    echo "Enabling proxy."
    cat <<EOF >>/caddy/Caddyfile
proxy /api/schema-registry $SCHEMAREGISTRY_URL {
    without /api/schema-registry
    $INSECURE_PROXY
}
EOF
    SCHEMAREGISTRY_URL=/api/schema-registry
fi

if echo "$ALLOW_TRANSITIVE" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
    TRANSITIVE_SETTING=",allowTransitiveCompatibilities: true"
    echo "Enabling transitive compatibility modes support."
fi

if echo "$ALLOW_GLOBAL" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
    GLOBAL_SETTING=",allowGlobalConfigChanges: true"
    echo "Enabling global compatibility level change support."
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
     $GLOBAL_SETTING
     $TRANSITIVE_SETTING
   }
]
EOF
fi

echo

exec /caddy/caddy -conf /caddy/Caddyfile
