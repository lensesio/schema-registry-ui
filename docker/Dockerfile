FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add and Setup Caddy webserver
ADD https://caddyserver.com/download/build?os=linux&arch=amd64&features=minify /caddy.tgz
RUN mkdir caddy && \
    tar xzf caddy.tgz -C /caddy && \
    rm -f /caddy.tgz
# Add and Setup Schema-Registry-Ui
ADD https://github.com/Landoop/schema-registry-ui/releases/download/v0.5/schema-registry-ui-0.5.tar.gz /schema-registry-ui.tar.gz
RUN mkdir /schema-registry-ui && \
    tar xzf /schema-registry-ui.tar.gz -C /schema-registry-ui && \
    rm -f /schema-registry-ui.tar.gz

# Add configuration and runtime files
ADD Caddyfile /caddy/
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000
ENTRYPOINT ["/run.sh"]
