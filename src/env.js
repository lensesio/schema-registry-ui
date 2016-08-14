var ENV = {

  // Replace with the URL where the Schema Registry service is listening
  SCHEMA_REGISTRY: "https://schema-registry.demo.landoop.com", // "http://localhost:8081"

  AVRO4S: "https://platform.landoop.com/avro4s/avro4s",

  // If url is defined then top-left icon becomes a menu - linking into those URLs
  APPS: [
    {
      name: "Kafka Topics",
      icon: "src/assets/icons/kafka-topics.svg",
      urlTopics: "" // https://kafka-topics-ui.landoop.com // coming soon
    },
    {
      name: "Kafka Connectors",
      icon: "src/assets/icons/kafka-connect.svg",
      urlConnect: "" // https://kafka-connect-ui.landoop.com // coming soon
    },
    {
      name: "Kafka Monitoring",
      icon: "src/assets/icons/kafka-monitoring.svg",
      urlMonitoring: "" // https://kafka-monitor-ui.landoop.com" // coming soon
    },
    {
      name: "Kafka Alerts",
      icon: "src/assets/icons/kafka-alerts.svg",
      urlAlerts: "" // https://kafka-alerts-ui.landoop.com" // coming soon
    },
    {
      name: "Kafka Manager",
      icon: "src/assets/icons/kafka-manager.svg",
      urlManager: "" // https://kafka-manager-ui.landoop.com" // coming soon
    }
  ]

};
