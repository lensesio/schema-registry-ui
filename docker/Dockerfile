FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add and Setup Caddy webserver
ADD https://caddyserver.com/download/build?os=linux&arch=amd64&features=minify /caddy.tgz
RUN mkdir caddy && \
    tar xzf caddy.tgz -C /caddy && \
    rm -f /caddy.tgz
# Add and Setup Schema-Registry-Ui
ADD https://github.com/Landoop/schema-registry-ui/releases/download/v0.4/schema-registry-ui-0.4.tag.gz /schema-registry-ui-0.4.tag.gz
RUN tar xzf /schema-registry-ui-0.4.tag.gz && \
    rm -f /schema-registry-ui-0.4.tag.gz && \
    mv app schema-registry-ui && \
    sed -e  's|^\s*SCHEMA_REGISTRY.*|  SCHEMA_REGISTRY: "https://schema-registry.example.net",|' -i /schema-registry-ui/src/env.js

# Add configuration and runtime files
ADD Caddyfile /caddy/
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000
ENTRYPOINT ["/run.sh"]
