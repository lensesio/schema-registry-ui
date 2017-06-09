var angular = require('angular');
var angularAPP = angular.module('angularAPP');

var HttpFactory = function ($http, $q, $log) {

    return {
     req :function (method, url, data) {

         var deferred = $q.defer();
         var request = {
               method: method,
               url: url,
               data: data,
               dataType: 'json',
               headers: {'Content-Type': 'application/json', 'Accept': 'application/json, text/plain' }
             };

         $http(request)
           .then(

           function (response) {
              deferred.resolve(response);
            },

            function (responseError) {
                var msg = "Failed at method [" + method + "] [" + url + "] with error: \n" + JSON.stringify(responseError);
                $log.error(msg);
                deferred.reject(responseError);
            });

         return deferred.promise;
    }

    }

}

HttpFactory.$inject = [ '$http', '$q', '$log'];

angularAPP.factory('HttpFactory', HttpFactory);