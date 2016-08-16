angularAPP.controller('HomeCtrl', function ($log, SchemaRegistryFactory, toastFactory) {
  $log.debug("Starting HomeCtrl");
  toastFactory.hideToast();
});