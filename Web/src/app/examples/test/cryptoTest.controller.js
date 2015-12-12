(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('CryptoTestController', CryptoTestController);

    /* @ngInject */
    function CryptoTestController(CryptoJS, config) {
        var vm = this;
        vm.md5= function (input) {
            vm.result= CryptoJS.MD5(input).toString().toUpperCase();
        };
        vm.sha256= function (input) {
            vm.result= CryptoJS.SHA256(input).toString().toUpperCase();
        };
    }
})();
