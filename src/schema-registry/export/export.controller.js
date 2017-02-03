angularAPP.controller('ExportSchemasCtrl', function ($rootScope, $scope, env,SchemaRegistryFactory, $location, $log) {
  $scope.$on('$routeChangeSuccess', function() {
       $scope.cluster = env.getSelectedCluster().NAME;//$routeParams.cluster;
  })


  var d = new Date()
  $scope.date = '-'+d.getDate()+''+(d.getMonth()+1)+''+d.getFullYear()+''+d.getHours()+''+d.getMinutes()
  var script = '\n\n # To restore the schema - edit & run the following \n # cat "$schema" | sed -e \'s/"/\\"/g\' -e \'s/\\n//g\' -e \'1s/^/{ "schema": "/\' -e \'$s/$/"}/\' | curl -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data @- "SCHEMA_REGISTRY_URL/subjects/$SUBJECT/versions" \n # done'

//  $scope.downloadLatestSchemas = function (schemas) {
//    var downloadFileLatest = '';
//
//    angular.forEach(schemas, function (schema, key) {
//      downloadFileLatest += '\n echo >>>' + schema.subjectName +'.'+ schema.version + '.json << \n' + schema.schema + ' \n \n EOF';
//      if (key==schemas.length - 1){
//        downloadFileLatest += script;
//        var curlsBlob = new Blob([ downloadFileLatest ], { type : 'text/plain' });
//        $scope.curlsURL = (window.URL || window.webkitURL).createObjectURL( curlsBlob );
//      }
//    })
//  }
//
//  $scope.downloadAllSchemas = function (schemas) {
//    var downloadFileAll = '';
//
//    angular.forEach(schemas, function (schema, key) {
//      downloadFileAll += '\n echo >>>' + schema.subject +'.'+ schema.version + '.json << \n' + schema.schema + ' \n \n EOF';
//      if (key==schemas.length - 1){
//        downloadFileAll += script;
//        var curlsBlob = new Blob([ downloadFileAll ], { type : 'text/plain' });
//        $scope.curlsURL = (window.URL || window.webkitURL).createObjectURL( curlsBlob );
//      }
//    })
//    }

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

  var latestLink = document.getElementById('latestSchemas');
  if (JSZip.support.blob) {
    function downloadWithBlob() {
      latestZip.generateAsync({type:"blob"}).then(function (blob) {
        saveAs(blob, "latestSchemas"+$scope.date+".zip");
      }, function (err) {
          latestLink.innerHTML += " " + err;
      });
      return false;
    }
    bindEvent(latestLink, 'click', downloadWithBlob);
  } else {
    latestLink.innerHTML += " (not supported on this browser)";
  }


  var allLink = document.getElementById('allSchemas');
  if (JSZip.support.blob) {
    function downloadWithBlob() {
      allZip.generateAsync({type:"blob"}).then(function (blob) {
        saveAs(blob, "allSchemas"+$scope.date+".zip");
      }, function (err) {
          allLink.innerHTML += " " + err;
      });
      return false;
    }
    bindEvent(allLink, 'click', downloadWithBlob);
  } else {
    allLink.innerHTML += " (not supported on this browser)";
  }

})

