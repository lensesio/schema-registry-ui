FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add needed tools
RUN apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

# Add and Setup Caddy webserver
RUN wget "https://github.com/mholt/caddy/releases/download/v0.10.11/caddy_v0.10.11_linux_amd64.tar.gz" -O /caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C /caddy --no-same-owner \
    && rm -f /caddy.tgz

# Add and Setup Schema-Registry-Ui
ENV SCHEMA_REGISTRY_UI_VERSION="0.9.5"
RUN wget "https://github.com/Landoop/schema-registry-ui/releases/download/v.${SCHEMA_REGISTRY_UI_VERSION}/schema-registry-ui-${SCHEMA_REGISTRY_UI_VERSION}.tar.gz" \
         -O /schema-registry-ui.tar.gz \
    && mkdir /schema-registry-ui \
    && tar xzf /schema-registry-ui.tar.gz -C /schema-registry-ui --no-same-owner \
    && rm -f /schema-registry-ui.tar.gz \
    && rm -f /schema-registry-ui/env.js \
    && ln -s /tmp/env.js /schema-registry-ui/env.js

# Add configuration and runtime files
ADD Caddyfile /caddy/Caddyfile.template
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000


# USER nobody:nogroup
ENTRYPOINT ["/run.sh"]
