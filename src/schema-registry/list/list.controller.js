angularAPP.controller('SubjectListCtrl', function ($scope, $rootScope, $log, $mdMedia, SchemaRegistryFactory, env) {

  $log.info("Starting schema-registry controller : list ( initializing subject cache )");

  /**
   * Watch the 'newCreated' and update the subject-cache accordingly
   */
  $scope.$watch(function () {
    return $rootScope.newCreated;
  }, function (a) {
    if (a != undefined && a == true) {
      loadCache(); //When new is created refresh the list
      $rootScope.newCreated = false;
    }
  }, true);
  // listen for the event in the relevant $scope
  $scope.$on('newEvolve', function (event, args) {
    loadCache();
  });

  $scope.$watch(function () {
    return env.getSelectedCluster().NAME;
  }, function (a) {
      loadCache(); //When new is created refresh the list
  }, true);



  $scope.cluster = env.getSelectedCluster().NAME;
  /**
   * Load cache by fetching all latest subjects
   */
  loadCache();
  function loadCache() {
    $rootScope.allSchemas = [];
    var promise = SchemaRegistryFactory.refreshLatestSubjectsCACHE();
    promise.then(function (cachedData) {
      $rootScope.allSchemas = cachedData;
    }, function (reason) {
      $log.error('Failed at loadCache : ' + reason);
    }, function (update) {
      $log.debug('Got notification: ' + update);
    });
  }

});

//In small devices the list is hidden
// $scope.$mdMedia = $mdMedia;
// $scope.$watch(function () {
//   return $mdMedia('gt-sm');
// }, function (display) {
//   $rootScope.showList = display;
// });
