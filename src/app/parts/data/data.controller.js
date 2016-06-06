(function () {
    'use strict';

    angular
        .module('app.parts.data')
        .controller('CustomListController', CustomListController)
        .controller('I18nController', I18nController);

    /* @ngInject */
    function CustomListController($firebase, $firebaseStorage) {
        var vm = this,
            refPath = 'config/data/lists@selectedSite';
        $firebaseStorage.getWithCache(refPath).then(function (val) {
            if (!val) return;
            vm.lists = JSON.stringify(val);
        });

        vm.update = function () {
            //todo: check if vm.lists is valid
            $firebaseStorage.update(refPath, JSON.parse(vm.lists));
        }
    }

    /* @ngInject */
    function I18nController($firebase, $firebaseStorage) {
        var vm = this,
            refPath='config/data/i18n@selectedSite';

        $firebaseStorage.getWithCache(refPath).then(function (val) {
            if (!val) return;
            vm.i18n = JSON.stringify(val);
        });

        vm.update = function () {
            //todo: check if vm.lists is valid
            ref.update(update);
            $firebaseStorage.update(refPath,JSON.parse(vm.i18n))
        }
    }
})();
