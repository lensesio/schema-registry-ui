#!/bin/sh

PROXY_SKIP_VERIFY="${PROXY_SKIP_VERIFY:-false}"
INSECURE_PROXY=""
ALLOW_GLOBAL="${ALLOW_GLOBAL:-false}"
ALLOW_TRANSITIVE="${ALLOW_TRANSITIVE:-false}"
ALLOW_DELETION="${ALLOW_DELETION:-false}"
READONLY_MODE="${READONLY_MODE:-false}"
CADDY_OPTIONS="${CADDY_OPTIONS:-}"
RELATIVE_PROXY_URL="${RELATIVE_PROXY_URL:-false}"
PORT="${PORT:-8000}"

{
    echo "Landoop Schema Registry UI ${SCHEMA_REGISTRY_UI_VERSION}"
    echo "Visit <https://github.com/Landoop/schema-registry-ui/tree/master/docker>"
    echo "to find more about how you can configure this container."
    echo

    if echo "$PROXY_SKIP_VERIFY" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
        INSECURE_PROXY=insecure_skip_verify
        echo "Unsecure: won't verify proxy certicate chain."
    fi

    # fix for certain installations
    cat /caddy/Caddyfile.template \
        | sed -e "s/8000/$PORT/" > /tmp/Caddyfile

    if echo "$ALLOW_TRANSITIVE" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
        TRANSITIVE_SETTING=",allowTransitiveCompatibilities: true"
        echo "Enabling transitive compatibility modes support."
    fi

    if echo "$ALLOW_GLOBAL" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
        GLOBAL_SETTING=",allowGlobalConfigChanges: true"
        echo "Enabling global compatibility level change support."
    fi

    if echo "$ALLOW_DELETION" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
        DELETION_SETTING=",allowSchemaDeletion: true"
        echo "Enabling schema deletion support."
    fi

    if echo "$READONLY_MODE" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
        READONLY_SETTING=",readonlyMode: true"
        echo "Enabling readonly mode."
    fi


    NUM_CLUSTER=0
    OLDIFS=""
    IFS=","
    for cluster in $SCHEMAREGISTRY_URL; do
        OPEN_CURL=",{"
        let "NUM_CLUSTER+=1"
        if [[ "$NUM_CLUSTER" == 1 ]]; then
            OPEN_CURL="{"
            cat <<EOF >/tmp/env.js
var clusters = [
EOF
        fi

        CLUSTER_URL="$(echo "$cluster" | sed -e 's/;.*//')"
        CLUSTER_NAME="$(echo "$cluster" | grep ';' | sed -e 's/.*;//')"
        if [[ -z "$CLUSTER_NAME" ]]; then
            # if no name is provided, use this
            CLUSTER_NAME="schema-$NUM_CLUSTER"
            CLUSTER_SANITIZED_NAME="${CLUSTER_NAME}"
        else
            # if a name is provided, sanitize it
            CLUSTER_SANITIZED_NAME="${CLUSTER_NAME// /_}"
            CLUSTER_SANITIZED_NAME="${CLUSTER_NAME//[^a-zA-Z0-9_.-]/}"
        fi
        if echo $PROXY | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
            cat <<EOF >>/tmp/Caddyfile
proxy /api/$CLUSTER_SANITIZED_NAME $CLUSTER_URL {
    without /api/$CLUSTER_SANITIZED_NAME
    $INSECURE_PROXY
}
EOF
        if echo $RELATIVE_PROXY_URL | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
            KAFKA_SCHEMA_URL="api/$CLUSTER_SANITIZED_NAME"
        else
            KAFKA_SCHEMA_URL="/api/$CLUSTER_SANITIZED_NAME"
        fi
            cat <<EOF >>/tmp/env.js
   $OPEN_CURL
     NAME: "$CLUSTER_NAME",
     SCHEMA_REGISTRY: "$KAFKA_SCHEMA_URL"
     $GLOBAL_SETTING
     $TRANSITIVE_SETTING
     $DELETION_SETTING
     $READONLY_SETTING
   }
EOF
        else
            cat <<EOF >>/tmp/env.js
   $OPEN_CURL
     NAME: "$CLUSTER_NAME",
     SCHEMA_REGISTRY: "$CLUSTER_URL"
     $GLOBAL_SETTING
     $TRANSITIVE_SETTING
     $DELETION_SETTING
     $READONLY_SETTING
   }
EOF
        fi
    done
    echo "]" >> /tmp/env.js

    if [[ -n "${CADDY_OPTIONS}" ]]; then
        echo "Applying custom options to Caddyfile"
        cat <<EOF >>/tmp/Caddyfile
$CADDY_OPTIONS
EOF
    fi

    # Here we emulate the output by Caddy. Why? Because we can't
    # redirect caddy to stderr as the logging would also get redirected.
    cat <<EOF
Note: if you use a PORT lower than 1024, please note that schema-registry-ui can
now run under any user. In the future a non-root user may become the default.
In this case you will have to explicitly allow binding to such ports, either by
setting the root user or something like '--sysctl net.ipv4.ip_unprivileged_port_start=0'.
Activating privacy features... done.
http://0.0.0.0:$PORT
EOF
} 1>&2

exec /caddy/caddy -conf /tmp/Caddyfile -quiet