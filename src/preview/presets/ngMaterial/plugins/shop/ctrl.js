(function () {
    'use strict';
    var pluginsModule;
    try{
        pluginsModule=angular.module('app.plugins');
    }catch(e){
        pluginsModule = angular.module('app.plugins',[]);
    }

    pluginsModule
        .controller('ProductDetail', ProductDetail)
        .controller('Toolbar', Toolbar)
        .controller('Checkout', Checkout);

    ////
    /* @ngInject */
    function ProductDetail($ngCart, $auth, $firebase,$firebaseStorage, $mdMedia, $timeout, snippets, $stateParams) {
        var pd = this;
        var params = JSON.parse($stateParams.params||"{}");
        params = angular.isObject(params)? params:{};
        var pdParams = params.pd||{};
        pdParams.id = pdParams.id||'pd-001';
        angular.extend(pd, pdParams);

        $firebaseStorage.getWithCache('product?type=detail&id='+pd.id).then(function(val){
            pd.product = val||{};
        });
    }

    /* @ngInject */
    function Toolbar($auth, config, $scope, ngCart, $mdMedia, $translate, $state, $stateParams, $element, $filter, $mdUtil, $mdSidenav, $mdToast, $timeout) {
        var tb = this;
        tb.emailNew = false;
        tb.logout = logout;
        tb.openSidenav = openSidenav;
        tb.getCartTotalItems=function(){
            return ngCart.getTotalItems()||0;
        };

        ////////////////

        function logout() {
            if($stateParams.siteName&&$stateParams.pageName){
                $state.go($stateParams.stateName||'customPage',$stateParams);
            } else {
                $state.go(config.home);
            }
            $auth.signOut();
        }
        function openSidenav(navID) {
            $mdUtil.debounce(function () {
                $mdSidenav(navID).toggle();
            }, 300)();
        }

        // function switchLanguage(languageCode) {
        //     $translate.use(languageCode)
        //         .then(function () {
        //             $mdToast.show(
        //                 $mdToast.simple()
        //                     .content($filter('translate')('MESSAGES.LANGUAGE_CHANGED'))
        //                     .position('bottom right')
        //                     .hideDelay(500)
        //             );
        //         });
        // }

        // function hideMenuButton() {
        //     return qtLayout.layout.sideMenuSize !== 'hidden' && $mdMedia('gt-sm');
        // }

        // function toggleNotificationsTab(tab) {
        //     $rootScope.$broadcast('qtSwitchNotificationTab', tab);
        //     vm.openSideNav('notifications');
        // }
        //
        // function notificationSubTotal() {
        //     return qtNotificationsService.getSubTotal()
        // }

        //
        // $scope.$on('newMailNotification', function () {
        //     vm.emailNew = true;
        // });
    }

    function Checkout($ngCart, $auth, $firebase,$firebaseStorage, $mdMedia, $timeout, snippets, $stateParams) {
        var checkout = this;
    }
})();
