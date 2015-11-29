(function() {
    'use strict';

    angular
        .module('app.plugins.ngcart')
        .run(['$rootScope', 'ngCart','ngCartItem', 'store', function ($rootScope, ngCart, ngCartItem, store) {

            $rootScope.$on('ngCart:change', function(){
                ngCart.$save();
            });

            if (angular.isObject(store.get('cart'))) {
                ngCart.$restore(store.get('cart'));

            } else {
                ngCart.init();
            }

        }])
        .value('version', '1.0.0');

})();
