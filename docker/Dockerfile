FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add needed tools
RUN apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

# Add and Setup Caddy webserver
RUN wget "https://caddyserver.com/download/build?os=linux&arch=amd64&features=" \
         -O /caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C /caddy \
    && rm -f /caddy.tgz

# Add and Setup Schema-Registry-Ui
RUN wget "https://github.com/Landoop/schema-registry-ui/releases/download/v.0.7.1/schema-registry-ui-0.7.1.tar.gz" \
         -O /schema-registry-ui.tar.gz \
    && mkdir /schema-registry-ui \
    && tar xzf /schema-registry-ui.tar.gz -C /schema-registry-ui \
    && rm -f /schema-registry-ui.tar.gz

# Add configuration and runtime files
ADD Caddyfile /caddy/
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000
ENTRYPOINT ["/run.sh"]
