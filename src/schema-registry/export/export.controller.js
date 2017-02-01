angularAPP.controller('ExportSchemasCtrl', function ($rootScope, $scope, env,SchemaRegistryFactory, $location, $log) {
  $scope.$on('$routeChangeSuccess', function() {
       $scope.cluster = env.getSelectedCluster().NAME;//$routeParams.cluster;
  })
  $scope.$watch(function () {
    return $rootScope.showSpinner;
  }, function (a) {
    $scope.allSchemas = SchemaRegistryFactory.getAllSchemas($rootScope.Cache)
  }, true);

  var d = new Date()
  $scope.date = '-'+d.getDate()+''+(d.getMonth()+1)+''+d.getFullYear()+''+d.getHours()+''+d.getMinutes()
  var script = '\n\n # To restore the schema - edit & run the following \n # cat "$schema" | sed -e \'s/"/\\"/g\' -e \'s/\\n//g\' -e \'1s/^/{ "schema": "/\' -e \'$s/$/"}/\' | curl -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data @- "SCHEMA_REGISTRY_URL/subjects/$SUBJECT/versions" \n # done'

  $scope.downloadLatestSchemas = function (schemas) {
    var downloadFileLatest = '';

    angular.forEach(schemas, function (schema, key) {
      downloadFileLatest += '\n echo >>>' + schema.subjectName +'.'+ schema.version + '.json << \n' + schema.schema + ' \n \n EOF';
      if (key==schemas.length - 1){
        downloadFileLatest += script;
        var curlsBlob = new Blob([ downloadFileLatest ], { type : 'text/plain' });
        $scope.curlsURL = (window.URL || window.webkitURL).createObjectURL( curlsBlob );
      }
    })
  }

  $scope.downloadAllSchemas = function (schemas) {
    var downloadFileAll = '';

    angular.forEach(schemas, function (schema, key) {
      downloadFileAll += '\n echo >>>' + schema.subject +'.'+ schema.version + '.json << \n' + schema.schema + ' \n \n EOF';
      if (key==schemas.length - 1){
        downloadFileAll += script;
        var curlsBlob = new Blob([ downloadFileAll ], { type : 'text/plain' });
        $scope.curlsURL = (window.URL || window.webkitURL).createObjectURL( curlsBlob );
      }
    })
    }

})

