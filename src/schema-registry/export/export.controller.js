var angular = require('angular');
var angularAPP = angular.module('angularAPP');
var JSZip = require('jszip');
var FileSaver = require('file-saver');

var ExportSchemasCtrl = function ($rootScope, $scope, env, SchemaRegistryFactory) {

  $scope.$on('$routeChangeSuccess', function () {
    $scope.cluster = env.getSelectedCluster().NAME;//$routeParams.cluster;
  });

  var d = new Date();
  $scope.date = '-' + d.getDate() + '' + (d.getMonth() + 1) + '' + d.getFullYear() + '' + d.getHours() + '' + d.getMinutes();
  var script = '\n\n # To restore the schema - edit & run the following \n # cat "$schema" | sed -e \'s/"/\\"/g\' -e \'s/\\n//g\' -e \'1s/^/{ "schema": "/\' -e \'$s/$/"}/\' | curl -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data @- "SCHEMA_REGISTRY_URL/subjects/$SUBJECT/versions" \n # done';

  var latestZip = new JSZip();
  var allZip = new JSZip();
  $scope.allSchemasForExport = []
  $scope.latestSchemasForExport = []

  SchemaRegistryFactory.subjects().then(function (res) {
    angular.forEach(res.data, function (schema) {
      SchemaRegistryFactory.subject(schema, 'latest').then(function (latestSchema) {

        latestZip.file(latestSchema.data.subject + '.' + latestSchema.data.version + '.json', latestSchema.data.schema);
        for (i = 1; i <= latestSchema.data.version; i++) {
          SchemaRegistryFactory.subject(latestSchema.data.subject, i).then(function (selectedSubject) {
            allZip.file(selectedSubject.data.subject + '.' + selectedSubject.data.version + '.json', selectedSubject.data.schema);
            //$rootScope.downloadFile += '\n echo >>>' + selectedSubject.subject +'.'+ selectedSubject.version + '.json <<< \n' + schema.schema + ' \n \n EOF';
          })
        }
      })
    })
  })

  function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
      // standard way
      el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
      // old IE
      el.attachEvent('on' + eventName, eventHandler);
    }
  }

  function downloadLatestSchemasWithBlob() {
    latestZip.generateAsync({type: "blob"}).then(function (blob) {
      FileSaver.saveAs(blob, "latestSchemas" + $scope.date + ".zip");
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
    allZip.generateAsync({type: "blob"}).then(function (blob) {
      FileSaver.saveAs(blob, "allSchemas" + $scope.date + ".zip");
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

};

ExportSchemasCtrl.$inject = ['$rootScope', '$scope', 'env', 'SchemaRegistryFactory', '$location'];

angularAPP.controller('ExportSchemasCtrl', ExportSchemasCtrl);

