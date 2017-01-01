(function () {
    'use strict';

    var m;
    try{
        m=angular.module('app.plugins');
    }catch(e){
        m = angular.module('app.plugins',[]);
    }

    m
        .controller('Cart', Cart)
        .controller('AddToCartController', AddToCartController)
        .controller('CartTableAdvancedController', CartTableAdvancedController);

    /* @ngInject */
    function Cart($scope, ngCart) {
        var cart = this;
        $scope.ngCart = ngCart;
        cart.getCart = function(){
            return ngCart.getCart();
        };
        cart.getTotalItems = function(){
            return ngCart.getTotalItems();
        };
        cart.clear = function(){
            ngCart.empty();
        };
        cart.removeItem=function(item){
            ngCart.removeItemById(item.getId());
        };
    }

    /* @ngInject */
    function AddToCartController($scope, ngCart){
        //in directive
    }

    /* @ngInject */
    function CartTableAdvancedController($scope, $timeout, $q) {
        var vm = this;
        vm.query = {
            filter: '',
            limit: '10',
            order: '-id',
            page: 1
        };
        vm.selected = [];
        vm.filter = {
            options: {
                debounce: 500
            }
        };
        //vm.getUsers = getUsers;
        vm.removeFilter = removeFilter;

        activate();

        ////////////////

        function activate() {
            var bookmark;
            $scope.$watch('vm.query.filter', function (newValue, oldValue) {
                if(!oldValue) {
                    bookmark = vm.query.page;
                }

                if(newValue !== oldValue) {
                    vm.query.page = 1;
                }

                if(!newValue) {
                    vm.query.page = bookmark;
                }
            });
        }

        function removeFilter() {
            vm.filter.show = false;
            vm.query.filter = '';

            if(vm.filter.form.$dirty) {
                vm.filter.form.$setPristine();
            }
        }
    }

})();
