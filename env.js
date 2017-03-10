var clusters = [
   {
       NAME:"prod",
       // Schema Registry service URL (i.e. http://localhost:8081)
       SCHEMA_REGISTRY: "http://localhost:8081", // https://schema-registry.demo.landoop.com
       SCHEMA_REGISTRY_VERSION: "3.0.1", // Declaring schema registry version
       COLOR: "#141414" // optional
     },
     {
       NAME:"dev",
       SCHEMA_REGISTRY: "http://localhost:8383",
       SCHEMA_REGISTRY_VERSION: "3.1.0", // Declaring schema registry version
       COLOR: "red", // optional
       allowGlobalConfigChanges: true, // optional
       allowTransitiveCompatibilities: true        // if using a Confluent Platform release >= 3.2.0 uncomment this line
     }
  ];