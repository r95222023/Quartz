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
                    {name: 'allpay', js: ['allpay/ctrl']},
                    {name: 'ngcart', js:['ngcart/ctrl','ngcart/directive','ngcart/service']}
                    ]
            }
            ,
            ngMaterial: {
                name: 'AngularJS + Material', id: 'ngMaterial',
                plugins: [
                    {name: 'Allpay', js: ['allpay/ctrl']},
                    {name: 'Simple Shop', js: ['shop/ctrl','allpay/ctrl','ngcart/ctrl','ngcart/directive','ngcart/service','auth/ctrl']},
                    {name: 'Cart', js:['ngcart/ctrl','ngcart/directive','ngcart/service']}
                    ]
            }
        };
    }
})();
