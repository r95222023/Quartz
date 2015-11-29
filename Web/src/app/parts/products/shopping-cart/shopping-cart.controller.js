(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ShoppingCartController', ShoppingCartController);

    /* @ngInject */
    function ShoppingCartController($firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
    }
})();
