(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('SiteSettingAdvanceCtrl', SiteSettingAdvanceCtrl);
    /* @ngInject */
    function SiteSettingAdvanceCtrl() {
        var vm = this;
        vm.presets = [
            {
                name: 'AngularJS', id: 'ng1'
            },
            {
                name: 'AngularJS + Material', id: 'ngMaterial'
            }
        ];
    }
})();
