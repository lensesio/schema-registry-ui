angularAPP.controller('ExportSchemasCtrl', function ($rootScope, $scope, env,SchemaRegistryFactory, $location) {
  $scope.$on('$routeChangeSuccess', function() {
       $scope.cluster = env.getSelectedCluster().NAME;//$routeParams.cluster;
  })


  var d = new Date()
  $scope.date = '-'+d.getDate()+''+(d.getMonth()+1)+''+d.getFullYear()+''+d.getHours()+''+d.getMinutes()
  var script = '\n\n # To restore the schema - edit & run the following \n # cat "$schema" | sed -e \'s/"/\\"/g\' -e \'s/\\n//g\' -e \'1s/^/{ "schema": "/\' -e \'$s/$/"}/\' | curl -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data @- "SCHEMA_REGISTRY_URL/subjects/$SUBJECT/versions" \n # done'

  var latestZip = new JSZip();
  var allZip = new JSZip();



  if($rootScope.Cache && $rootScope.Cache.length > 0) {
  angular.forEach($scope.allSchemas, function (schema, key) {
    latestZip.file(schema.subjectName +'.'+ schema.version + '.json', schema.schema);
  })
  } else {
  SchemaRegistryFactory.refreshLatestSubjectsCACHE().then(function(latestSchemas) {
    angular.forEach(latestSchemas, function (schema) {
      latestZip.file(schema.subjectName +'.'+ schema.version + '.json', schema.schema);
    })
  })
  }


  $scope.$watch(function () {
    return $rootScope.showSpinner;
  }, function (a) {
    $scope.allSchemas = SchemaRegistryFactory.getAllSchemas($rootScope.Cache)
  }, true);

  $scope.$watch(function () {
    return $rootScope.allSchemasCache;
  }, function (a) {
    angular.forEach($rootScope.allSchemasCache, function (schema) {
      allZip.file(schema.subject +'.'+ schema.version + '.json', schema.schema);
  })  }, true);

  function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener){
      // standard way
      el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent){
      // old IE
      el.attachEvent('on'+eventName, eventHandler);
    }
  }

  function downloadLatestSchemasWithBlob() {
    latestZip.generateAsync({type:"blob"}).then(function (blob) {
      saveAs(blob, "latestSchemas"+$scope.date+".zip");
    }, function (err) {
        latestLink.innerHTML += " " + err;
    });
    return false;
  }
  var latestLink = document.getElementById('latestSchemas');
  if (JSZip.support.blob) {
    bindEvent(latestLink, 'click', downloadLatestSchemasWithBlob);
  } else {
    latestLink.innerHTML += " (not supported on this browser)";
  }

  function downloadAllSchemasWithBlob() {
    allZip.generateAsync({type:"blob"}).then(function (blob) {
      saveAs(blob, "allSchemas"+$scope.date+".zip");
    }, function (err) {
        allLink.innerHTML += " " + err;
    });
    return false;
  }
  var allLink = document.getElementById('allSchemas');
  if (JSZip.support.blob) {
    bindEvent(allLink, 'click', downloadAllSchemasWithBlob);
  } else {
    allLink.innerHTML += " (not supported on this browser)";
  }

})

