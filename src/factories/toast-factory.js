var angular = require('angular');
var angularAPP = angular.module('angularAPP');

var toastFactory = function ($rootScope, $mdToast, $window) {

  var last = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  var toastPosition = angular.extend({}, last);

  /* Public API of this factory*/
  this.getToastPosition = function () {
    this.sanitizePosition();

    return Object.keys(toastPosition)
      .filter(function (pos) {
        return toastPosition[pos];
      })
      .join(' ');
  };

  this.sanitizePosition = function () {
    var current = toastPosition;
    if (current.bottom && last.top) current.top = false;
    if (current.top && last.bottom) current.bottom = false;
    if (current.right && last.left) current.left = false;
    if (current.left && last.right) current.right = false;
    last = angular.extend({}, current);
  };

  this.showSimpleToast = function (message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position(this.getToastPosition())
        .hideDelay(2000)
    );
  };

  this.showSimpleToastToTop = function (message) {
    this.showSimpleToast(message);
    $window.scrollTo(0, 0);
  };

  this.showLongToast = function (message) {
    var last = this.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position(last)
        .hideDelay(5000)
    );
    $window.scrollTo(0, 0);
  };

  this.showActionToast = function (message) {
    var toast = $mdToast.simple()
      .textContent(message)
      .action('DELETE')
      .highlightAction(true)
      //.highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
      .position(this.getToastPosition())
      .hideDelay(2000);

    $mdToast.show(toast).then(function (response) {
      if (response === 'ok') {
        //alert('You clicked the \'UNDO\' action.');
      }
    });
  };

  this.hideToast = function () {
    $mdToast.hide();
  };

};

toastFactory.$inject = ['$rootScope', '$mdToast', '$window', '$log'];

angularAPP.service('toastFactory', toastFactory);