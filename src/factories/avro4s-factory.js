angularAPP.factory('Avro4ScalaFactory', function ($rootScope, $http, $location, $q, $log) {

  /* Public API */
  return {
    getScalaFiles: function (apiData) {
      $log.warn(apiData);
      $http.defaults.useXDomain = true;

      var singleLineApiData = apiData.split("\n").join(" ");

      var req = {
        method: 'POST',
        data: singleLineApiData,
        crossDomain: true,
        url: ENV.AVRO4S,
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
      };

      $http(req)
        .success(function (data) {
          $log.info("Received a response with: " + data);
          var results = data.split("###");
          $log.info(results);
          if (results[0] == "scala") {
            $log.info("It's Scala !! ");
            $log.info("It's Scala :" + results[1]);
            //alg0
            var scalaResult = results[1];
            return scalaResult;
          }
        })
        .error(function (data, status) {
          $log.error("Bad data [" + data + "] status [" + status + "]");
        });
    }
  }
});

// curl 'https://platform.landoop.com/avro4s/avro4s' -H 'Pragma: no-cache' -H 'Origin: https://avro4s-ui.landoop.com' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.8,el;q=0.6' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Cache-Control: no-cache' -H 'Referer: https://avro4s-ui.landoop.com/' -H 'Connection: keep-alive' --data-binary '{   "type": "record",   "name": "Evolution",   "namespace": "com.landoop",   "fields": [     {         "name": "name",         "type": "string"     },     {         "name": "number1",         "type": "int"     },     {         "name": "number2",         "type": "float"     },     {         "name": "text",         "type": [             "string",             "null"         ],         "default": ""     }   ] }' --compressed