schemaRegistryUIApp.controller('HomeCtrl', function ($mdToast, $log, schemaRegistryFactory) {
  $log.debug("Starting HomeCtrl");
  $mdToast.hide();
  schemaRegistryFactory.visibleCreateSubjectButton(true);
});