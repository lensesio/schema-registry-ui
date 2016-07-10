schemaRegistryUIApp.controller('SubjectsCtrl', function ($rootScope, $scope, $routeParams, $log, $mdToast, $location, schemaRegistryFactory) {

  $log.debug("sbjCtrl - initializing for subject : " + $routeParams.subject + "/" + $routeParams.version);
  schemaRegistryFactory.visibleCreateSubjectButton(true);
  $scope.multipleVersionsOn = false;
  $scope.editor;

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
  };

  //TODO is not propagating the error
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


  $scope.go = function (name, version) {
      $location.path('/subjects/' + name + '/version/' + version);
    };

  $scope.onTabSelected = function(tabIndex) {
     $rootScope.tabIndex = tabIndex;
  };
}); //end of controller

schemaRegistryUIApp.directive('clickLink', ['$location', function($location) {
    return {
        link: function(scope, element, attrs) {
            element.on('click', function() {
                scope.$apply(function() {
                    $location.path(attrs.clickLink);
                });
            });
        }
    }
}]);