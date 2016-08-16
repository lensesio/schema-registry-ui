angularAPP.controller('HomeCtrl', function ($log, SchemaRegistryFactory, toastFactory) {
  $log.info("Starting schema-registry controller - home");
  toastFactory.hideToast();
});