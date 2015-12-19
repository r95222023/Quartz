(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('CryptoTestController', CryptoTestController);

    /* @ngInject */
    function CryptoTestController(CryptoJS, config) {
        var vm = this;
        vm.md5 = function (input) {
            vm.result = CryptoJS.MD5(input).toString().toUpperCase();
        };
        vm.sha256 = function (input) {
            vm.result = CryptoJS.SHA256(input).toString().toUpperCase();
        };

        vm.aesMessage='';
        vm.aesSecret='Secret Passphrase';
        vm.encrypt = function (message, secret) {
            if (!vm.aesMessage || !vm.aesSecret) vm.aesError = 'please enter the secret and message';
            vm.aesEncrypted = '' + CryptoJS.AES.encrypt(message, secret);
            vm.aesDecrypted = CryptoJS.AES.decrypt(vm.aesEncrypted, secret).toString(CryptoJS.enc.Utf8);
        }
    }
})();
