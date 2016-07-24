(function () {
    'use strict';

    angular
        .module('app.parts.design')
        .controller('SiteSettingCtrl', SiteSettingCtrl);

    /* @ngInject */
    function SiteSettingCtrl($firebase, $firebaseStorage) {
        var vm= this,path='config/preload@selectedSite';

        $firebaseStorage.getWithCache(path).then(function(preload){
            vm.css = preload.css;
            vm.js = preload.js;
        });
        vm.update = function(){
            var data = {};
            if(vm.css) data.css = vm.css.trim();
            if(vm.js) data.js = vm.js.trim();

            if(data.css||data.js) {
                $firebase.updateCacheable(path,data);
                $firebaseStorage.update(path, data);
            } else {
                $firebase.ref(path).remove();
                $firebaseStorage.remove(path);
            }
        };
    }
})();
