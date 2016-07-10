var ENV = {
  //SCHEMA_REGISTRY: "http://localhost:8081"
  SCHEMA_REGISTRY: "https://schema-registry.demo.landoop.com",

  APPS : [
    {
        name : "Schema Registry",
        enabled : true,
        url : "###",
        icon : "fa-file-text"
    },
    {
        name : "Kafka Connectors",
        enabled : true,
        url : "###",
        icon: "fa-random"//"fa-cogs" //fa-cubes //fa-random
    },
    {
        name : "Kafka Topics",
        enabled : true,
        url : "###",
        icon : "fa-th-list"
    }
  ]
};
