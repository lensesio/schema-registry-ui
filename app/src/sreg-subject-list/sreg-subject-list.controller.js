schemaRegistryUIApp.controller('SubjectListCtrl', function ($scope, $rootScope, $log, $mdMedia, schemaRegistryFactory) {

    $log.debug("SubjectListCtrl - starting - cleaning page cache - building subject CACHE");

    /* Watchers */
    $scope.$watch(function() {
      return $rootScope.newCreated;
    }, function(a) {
      if(a != undefined && a == true) {
        loadCache(); //When new is created refresh the list
        $rootScope.newCreated = false;
      }
    }, true);

    //In small devices the list is hidden
    $scope.$mdMedia = $mdMedia;
    $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(display) {
      $rootScope.showList = display;
    });

    /* Init */
    loadCache();
    function loadCache() {
      $rootScope.subjectCACHE = [];
      schemaRegistryFactory.visibleCreateSubjectButton(true);
      var promise = schemaRegistryFactory.fetchLatestSubjects();
      promise.then(function (cachedData) {
        $log.info('Success at fetching ' + cachedData.length + ' subjects');
        $rootScope.subjectCACHE = cachedData;
      }, function (reason) {
        $log.error('Failed: ' + reason);
      }, function (update) {
        $log.debug('Got notification: ' + update);
      });
    }

    /* Api */
    $scope.toggleList = function () {
      $rootScope.showList = !($scope.showList);
    }

    $scope.handleList = function () {
      if(!$mdMedia('gt-sm')) { $rootScope.showList = false; }
    }

});