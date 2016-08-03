var ENV = {

  //Replace with the URL where the Schema Registry service is listening
  // SCHEMA_REGISTRY: "http://localhost:8081",
  SCHEMA_REGISTRY: "https://schema-registry.demo.landoop.com",

  APPS: [
    {
      name: "Schema Registry",
      enabled: false,
      url: "https://schema-registry-ui.landoop.com",
      icon: "fa-file-text"
    },
    {
      name: "Kafka Topics",
      enabled: true,
      url: "https://kafka-topics-ui.landoop.com",
      icon: "src/assets/icons/kafka-topics.svg"
    },
    {
      name: "Kafka Connectors",
      enabled: false,
      url: "https://kafka-connect-ui.landoop.com",
      icon: "src/assets/icons/kafka-connect.svg"
    }
  ]
};
