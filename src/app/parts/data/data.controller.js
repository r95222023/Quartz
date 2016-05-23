(function () {
    'use strict';

    angular
        .module('app.parts.data')
        .controller('CustomListController', CustomListController)
        .controller('I18nController', I18nController);

    /* @ngInject */
    function CustomListController($firebase, lzString) {
        var vm = this,
            ref = $firebase.ref('config/data/lists@selectedSite');

        $firebase.cache('datalists@selectedTime', ref.child('editTime'), ref).then(function (val) {
            if (!val) return;
            delete val.cachedTime;
            delete val.editTime;
            angular.forEach(val, function (subVal, key) {
                val[key] = lzString.decompress(subVal);
            });
            vm.lists = JSON.stringify(val);
        });

        vm.update = function () {

            //todo: check if vm.lists is valid
            var data = JSON.parse(vm.lists),
                update = {};

            if (!angular.isObject(data)) return;
            angular.forEach(data, function (val, key) {
                update[key] = {compressed: lzString.compress(val)};
                update.editTime = firebase.database.ServerValue.TIMESTAMP;
            });

            ref.update(update);
        }
    }

    /* @ngInject */
    function I18nController($firebase, lzString) {
        var vm = this,
            ref = $firebase.ref('config/data/i18n@selectedSite');

        $firebase.cache('datai18n@selectedTime', ref.child('editTime'), ref).then(function (val) {
            val = lzString.decompress(val);

            if (!val) return;
            delete val.cachedTime;
            delete val.editTime;
            vm.i18n = JSON.stringify(val);
        });

        ref.once('value', function (snap) {
            var val = lzString.decompress(snap.val());
            if (!val) return;
            delete val.editTime;
            vm.i18n = JSON.stringify(val);
        });

        vm.update = function () {

            //todo: check if vm.lists is valid
            var data = JSON.parse(vm.i18n),
                update;

            if (!angular.isObject(data)) return;
            update = {compressed: lzString.compress(data), editTime: firebase.database.ServerValue.TIMESTAMP};

            ref.update(update);
        }
    }
})();
