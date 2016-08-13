angularAPP.controller('SubjectsCtrl', function ($rootScope, $scope, $routeParams, $log, $location, schemaRegistryFactory, toastFactory, Avro4ScalaFactory) {

  $log.debug("SubjectsCtrl - initializing for subject : " + $routeParams.subject + "/" + $routeParams.version);
  $scope.multipleVersionsOn = false;
  $scope.editor;
  $scope.aceString = "";

  function getScalaFiles(xx) {
    var scala = Avro4ScalaFactory.getScalaFiles(xx);
    $log.error("SCALA-> " + scala);
  }

  function IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  $scope.testAvroCompatibility = function () {
    $log.debug("Testing Avro compatibility");
    if ($scope.aceString == $scope.aceStringOriginal) {
      toastFactory.showSimpleToast("You have not changed the schema");
    } else {
      if (IsJsonString($scope.aceString)) {
        $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
      } else {
        $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
        toastFactory.showLongToast("Invalid Avro");
      }
      $log.debug("Testing compatibility");

    }
  };

  $scope.isAvroAceEditable = false;
  $scope.aceBackgroundColor = "white";
  $scope.cancelEditor = function () {
    $log.info("Canceling editor");
    $scope.aceBackgroundColor = "white";
    toastFactory.hideToast();
    $log.info("Setting " +$scope.aceStringOriginal);
    // $scope.editor.session
    $scope.isAvroAceEditable = false;
    $scope.aceString = $scope.aceStringOriginal;
    $scope.aceSchemaSession.setValue($scope.aceString);
  };
  $scope.toggleEditor = function () {
    $scope.isAvroAceEditable = !$scope.isAvroAceEditable;
    if ($scope.isAvroAceEditable) {
      toastFactory.showLongToast("You can now edit the schema");
      $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
    } else {
      $scope.aceBackgroundColor = "white";
      toastFactory.hideToast();
    }
  };

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

  // When the 'Ace' schema/view is loaded
  $scope.viewSchemaAceLoaded = function (_editor) {
    $log.info("me");
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
    $scope.aceSchemaSession = _editor.getSession(); // we can get data on changes now
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

  // When the 'Ace' schema/view is CHANGED
  $scope.viewSchemaAceChanged = function (_editor) {
    $log.info("Change detected");
    $scope.editor = _editor;
    var aceString = $scope.aceSchemaSession.getDocument().getValue();
    $scope.aceString = aceString;
  };

  if ($routeParams.subject && $routeParams.version) {
    var promise = schemaRegistryFactory.getSubject($routeParams.subject, $routeParams.version);
    promise.then(function (selectedSubject) {
      $log.info('Success fetching ' + $routeParams.subject + '/' + $routeParams.version); //+ JSON.stringify(selectedSubject));
      $rootScope.subjectObject = selectedSubject;
      $rootScope.schema = selectedSubject.Schema.fields;
      $scope.aceString = angular.toJson(selectedSubject.Schema, true);
      $scope.aceStringOriginal = $scope.aceString;
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
