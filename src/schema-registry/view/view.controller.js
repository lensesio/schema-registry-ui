angularAPP.controller('SubjectsCtrl', function ($rootScope, $scope, $routeParams, $log, $location, schemaRegistryFactory, Avro4ScalaFactory) {

  $log.debug("SubjectsCtrl - initializing for subject : " + $routeParams.subject + "/" + $routeParams.version);
  $scope.multipleVersionsOn = false;
  $scope.editor;
  $scope.aceString = "";

  function getScalaFiles(xx) {
    var scala = Avro4ScalaFactory.getScalaFiles(xx);
    $log.error("SCALA-> " + scala);
  }

  /************************* md-table ***********************/
  $scope.tableOptions = {
    rowSelection: false,
    multiSelect: false,
    autoSelect: false,
    decapitate: false,
    largeEditDialog: false,
    boundaryLinks: false,
    limitSelect: true,
    pageSelect: true
  };

  $scope.query = {
    order: 'name',
    limit: 100,
    page: 1
  };

  $scope.logOrder = function (a, b) {
    $log.info("Ordering event " + a);
    sortSchema(a);
  };

  function sortSchema(type) {
    var reverse = 1;
    if (type.indexOf('-') == 0) {
      // remove the - symbol
      type = type.substring(1, type.length);
      reverse = -1;
    }
    $log.info(type + " " + reverse);
    $scope.schema = sortByKey($scope.schema, type, reverse);
  }

  function sortByKey(array, key, reverse) {
    return array.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return ((x < y) ? -1 * reverse : ((x > y) ? 1 * reverse : 0));
    });
  }
  /************************* md-table ***********************/

  // When the 'Ace' schema/view is laoded
  $scope.viewSchemaAceLoaded = function (_editor) {
    $log.info("me");
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
    var lines = $scope.aceString.split("\n").length;
    // TODO : getScalaFiles($scope.aceString);
    // Add one extra line for each command > 110 characters
    angular.forEach($scope.aceString.split("\n"), function (line) {
      lines = lines + Math.floor(line.length / 110);
    });
    if (lines <= 1) {
      lines = 10;
    }
    // $log.warn("Lines loaded for curl create connector -> " + lines + "\n" + $scope.curlCommand);
    _editor.setOptions({
      minLines: lines,
      maxLines: lines,
      highlightActiveLine: false
    });
    // var _renderer = _editor.renderer;
    // _renderer.animatedScroll = false;
  };

  if ($routeParams.subject && $routeParams.version) {
    var promise = schemaRegistryFactory.getSubject($routeParams.subject, $routeParams.version);
    promise.then(function (selectedSubject) {
      $log.info('Success fetching ' + $routeParams.subject + '/' + $routeParams.version); //+ JSON.stringify(selectedSubject));
      $rootScope.subjectObject = selectedSubject;
      $rootScope.schema = selectedSubject.Schema.fields;
      $scope.aceString = angular.toJson(selectedSubject.Schema, true);
      $scope.multipleVersionsOn = $scope.subjectObject.otherVersions.length > 0;
      $scope.aceReady = true;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  }

}); //end of controller

// Useful for browsing through different versions of a schema
angularAPP.directive('clickLink', ['$location', function ($location) {
  return {
    link: function (scope, element, attrs) {
      element.on('click', function () {
        scope.$apply(function () {
          $location.path(attrs.clickLink);
        });
      });
    }
  }
}]);
