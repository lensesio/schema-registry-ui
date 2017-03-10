angularAPP.factory('env', function ($rootScope) {

//  var ENV = clusters; //TODO if empty env.js

  var clusterArray = (typeof clusters !== "undefined") ? angular.copy(clusters) : [];
  var selectedCluster = null;
  setCluster();

  return {
    setSelectedCluster : function(clusterName) { setCluster(clusterName)},
    getSelectedCluster : function() { return selectedCluster; },
    getClusters : function() { return clusters} ,

    SCHEMA_REGISTRY : function () { return selectedCluster.SCHEMA_REGISTRY; },
    AVRO4S : 'https://platform.landoop.com/avro4s/avro4s', // Not currently used, will be used for converting Avro -> Scala Case classes
    COLOR : function () { return selectedCluster.COLOR; },
    allowGlobalConfigChanges : function () { return selectedCluster.allowGlobalConfigChanges; },
    allowTransitiveCompatibilities: function () { return selectedCluster.allowTransitiveCompatibilities; }
    }

  function setCluster(clusterName) {
    if(clusterArray.length == 0) {
        $rootScope.missingEnvJS = true;
              console.log("NOT EXISTS env.js")
     }
     if(angular.isUndefined(clusterName)) {
          selectedCluster = clusterArray[0];
     } else {
          var filteredArray = clusterArray.filter(function(el) {return el.NAME == clusterName})
          selectedCluster = filteredArray.length == 1 ?  filteredArray[0]  : clusterArray[0]
     }
  }
});