var clusters = [
  {
    NAME: "dev",
    // Schema Registry service URL (i.e. http://localhost:8081)
    SCHEMA_REGISTRY: "http://localhost:8081", // https://cp1.demo.playground.landoop.com/api/schema-registry
    SCHEMA_REGISTRY: "https://cp1.demo.playground.landoop.com/api/schema-registry",
    COLOR: "#141414", // optional
    readonlyMode: false, // optional
    allowTransitiveCompatibilities: true // if using a Schema Registry release <= 3.0 comment this line
  },
  {
    NAME: "prod",
    SCHEMA_REGISTRY: "http://localhost:8383",
    COLOR: "red", // optional
    allowGlobalConfigChanges: true, // optional
    readonlyMode: true, // optional
    allowSchemaDeletion: true, // Supported for Schema Registry version >= 3.3.0
    allowTransitiveCompatibilities: true // if using a Schema Registry release <= 3.0 comment this line
  }
];
