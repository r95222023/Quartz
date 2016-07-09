(function () {
    'use strict';

    angular
        .module('app.parts.pages')
        .controller('SiteSettingCtrl', SiteSettingCtrl);

    /* @ngInject */
    function SiteSettingCtrl($firebaseStorage, sitesData) {
        var vm= this;
        vm.css = sitesData.siteCSS;
        vm.js = sitesData.siteJS;

        vm.update = function(){
            var data = {};
            if(vm.css) data.css = vm.css.trim();
            if(vm.js) data.js = vm.js.trim();

            if(data.css||data.js) {
                $firebaseStorage.update('pages/config/preload@selectedSite', data);
            } else {
                $firebaseStorage.remove('pages/config/preload@selectedSite');
            }
        };
    }
})();
