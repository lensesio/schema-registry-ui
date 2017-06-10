var angular = require('angular');
var angularAPP = angular.module('angularAPP');

/**
 * Schema-Registry angularJS Factory
 *
 * Landoop - version 0.9.x (May.2017)
 */
var SchemaRegistryFactory = function ($rootScope, $http, $location, $q, $log, HttpFactory, env) {

  var prefix =  env.SCHEMA_REGISTRY();

  return {

       subjects: function() {
           return HttpFactory.req('GET', prefix + '/subjects')
       },
       subject: function(subject, version) {
           return HttpFactory.req('GET', prefix + '/subjects/' + subject+ '/versions/' + version)
       },
       subjectVersions: function(subject) {
           return HttpFactory.req('GET', prefix + '/subjects/' + subject+ '/versions')
       },
       createSchema: function(data) {
           return HttpFactory.req('POST', prefix)
       },
       globalConfig: function() {
           return HttpFactory.req('GET', prefix + '/config')
       },
       subjectConfig: function(subject) {
           return HttpFactory.req('GET', prefix + '/config/' + subject)
       }
  }

};

SchemaRegistryFactory.$inject = ['$rootScope', '$http', '$location', '$q', '$log', 'UtilsFactory', 'HttpFactory', 'env'];

angularAPP.factory('SchemaRegistryFactory', SchemaRegistryFactory);
