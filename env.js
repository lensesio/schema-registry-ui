var clusters = [
   {
       NAME:"prod",
       // Schema Registry service URL (i.e. http://localhost:8081)
       SCHEMA_REGISTRY: "http://localhost:8081", // https://schema-registry.demo.landoop.com
       // Avro4S backend url. Allows converting Avro -> Scala Case classes
       AVRO4S : "https://platform.landoop.com/avro4s/avro4s",
       COLOR: "#141414" // optional
     },
     {
       NAME:"dev",
       SCHEMA_REGISTRY: "http://localhost:8383",
       AVRO4S : "https://platform.landoop.com/avro4s/avro4s",
       COLOR: "red" // optional
     }
  ];