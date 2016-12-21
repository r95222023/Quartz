(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('SiteSettingAdvanceCtrl', SiteSettingAdvanceCtrl);
    /* @ngInject */
    function SiteSettingAdvanceCtrl() {
        var vm = this;
        vm.presets = {
            ng1: {
                name: 'AngularJS', id: 'ng1',
                plugins: [
                    {name: 'allpay', js: ['/ctrl']},
                    {name: 'ngcart', js:['/ctrl','/directive','/service']}
                    ]
            }
            ,
            ngMaterial: {
                name: 'AngularJS + Material', id: 'ngMaterial',
                plugins: [
                    {name: 'allpay', js: ['/ctrl']},
                    {name: 'ngcart', js:['/ctrl','/directive','/service']}
                    ]
            }
        };
    }
})();
