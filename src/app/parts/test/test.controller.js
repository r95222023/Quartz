(function () {
    'use strict';

    angular
        .module('app.parts.test')
        .controller('TestPageController', TestPageController);

    /* @ngInject */
    function TestPageController(ngCart,$firebase, $firebaseStorage, snippets,$timeout, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.ngCart =ngCart;
        vm.test='test'
    }
})();
