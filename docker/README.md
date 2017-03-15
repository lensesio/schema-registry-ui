## Schema Registry UI ##

[![](https://images.microbadger.com/badges/image/landoop/schema-registry-ui.svg)](http://microbadger.com/images/landoop/schema-registry-ui)

This is a small docker image you can use to test Landoop's schema-registry-ui.
It serves the schema-registry-ui from port 8000.
A live version can be found at <https://schema-registry-ui.landoop.com>

The software is stateless and the only necessary option is your Schema Registry
URL.

To run it:

    docker run --rm -p 8000:8000 \
               -e "SCHEMAREGISTRY_URL=http://schema.registry.url" \
               landoop/schema-registry-ui

Visit http://localhost:8000 to see the UI.

### Advanced Settings

Two of the Schema Registry UI settings need to be enabled explicitly. These
are support for global compatibility level configuration support —i.e change the
default compatibility level of your schema registry— and support for transitive
compatibility levels (Schema Registry version 3.1.1 or better). They are handled
by the `ALLOW_GLOBAL` and `ALLOW_TRANSITIVE` environment variables. E.g:

    docker run --rm -p 8000:8000 \
               -e "SCHEMAREGISTRY_URL=http://schema.registry.url" \
               -e ALLOW_GLOBAL=1 \
               -e ALLOW_TRANSITIVE=1 \
               landoop/schema-registry-ui

### Proxying Schema Registry

If you have CORS issues or want to pass through firewalls and maybe share your
server, we added the `PROXY` option. Run the container with `-e PROXY=true` and
Caddy server will proxy the traffic to Schema Registry:

    docker run --rm -p 8000:8000 \
               -e "SCHEMAREGISTRY_URL=http://schema.registry.url" \
               -e "PROXY=true" \
               landoop/schema-registry-ui

> **Important**: When proxying, for the `SCHEMAREGISTRY_URL` you have to use an
> IP address or a domain that can be resolved to it. **You can't use**
> `localhost` even if you serve Schema Registry from your localhost. The reason
> for this is that a docker container has its own network, so your _localhost_
> is different from the container's _localhost_. As an example, if you are in
> your home network and have an IP address of `192.168.5.65` and run Schema
> Registry from your computer, instead of `http://127.0.1:8082` you must use
> `http://192.168.5.65:8082`.

If your Schema Registry uses self-signed SSL certificates, you can use the
`PROXY_SKIP_VERIFY=true` environment variable to instruct the proxy to
not verify the backend TLS certificate.
