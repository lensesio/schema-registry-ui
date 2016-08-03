schemaRegistryUIApp.controller('SubjectsCtrl', function ($rootScope, $scope, $routeParams, $log, $mdToast, $location, schemaRegistryFactory) {

  $log.debug("SubjectsCtrl - initializing for subject : " + $routeParams.subject + "/" + $routeParams.version);
  schemaRegistryFactory.visibleCreateSubjectButton(true);
  $scope.multipleVersionsOn = false;
  $scope.editor;

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
  };

  if ($routeParams.subject && $routeParams.version) {
    var promise = schemaRegistryFactory.getSubject($routeParams.subject, $routeParams.version);
    promise.then(function (selectedSubject) {
      $log.info('Success fetching ' + $routeParams.subject + '/' + $routeParams.version); //+ JSON.stringify(selectedSubject));
      $rootScope.subjectObject = selectedSubject;
      $scope.aceString = angular.toJson(selectedSubject.Schema, true);
      $scope.multipleVersionsOn = $scope.subjectObject.otherVersions.length > 0;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  }

}); //end of controller
