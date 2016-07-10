
schemaRegistryUIApp.controller('SubjectListCtrl', function ($scope, $rootScope, $log, $mdMedia, schemaRegistryFactory) {
  $log.debug("SubjectListCtrl - starting - cleaning page cache - building subject CACHE");
  schemaRegistryFactory.visibleCreateSubjectButton(true);
  var promise = schemaRegistryFactory.fetchLatestSubjects();
  promise.then(function (cachedData) {
    $log.info('Success at fetching ' + cachedData.length + ' subjects');// ' + JSON.stringify(cachedData));
    $rootScope.subjectCACHE = cachedData;
  }, function (reason) {
    $log.error('Failed: ' + reason);
  }, function (update) {
    $log.debug('Got notification: ' + update);
  });


  $scope.$mdMedia = $mdMedia;
  $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(display) {
      $rootScope.showList = display;
  });

  $scope.toggleList = function () {
    $rootScope.showList = !($scope.showList);
  }

  $scope.handleList = function () {
  console.log("------ > " +$mdMedia('gt-sm'))
    if(!$mdMedia('gt-sm')) {

    $rootScope.showList = false;
    }
  }

});