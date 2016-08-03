var ENV = {
  //Replace with your Schema Registry URL
  SCHEMA_REGISTRY: "https://schema-registry.demo.landoop.com",

  APPS: [
    {
      name: "Schema Registry",
      enabled: true,
      url: "https://schema-registry.demo.landoop.com",
      icon: "fa-file-text"
    },
    {
      name: "Kafka Topics",
      enabled: false,
      url: "###",
      icon: "fa-th-list"
    },
    {
      name: "Kafka Connectors",
      enabled: false,
      url: "###",
      icon: "fa-random"
    }
  ]
};
