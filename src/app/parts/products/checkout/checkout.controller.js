(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('AllpayCheckoutCtrl', AllpayCheckoutCtrl);

    /* @ngInject */
    function AllpayCheckoutCtrl($q, $scope, ngCart, $mdMedia, $firebase, $sce, $timeout, snippets, $mdDialog, sitesService) {
        var vm = this;
        
        var allpayFormAction = attrs.stage !== '' ? 'https://payment.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut';
        $scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);

        var requested=false;
        $scope.onFormReady = function (){
            if(!requested){
                requested=true;
                getCheckMacValue(data).then(function(_data){
                    $scope.data = _data;
                })
            }
        };

        $scope.submit = function () {
            $scope.closeDialog();
            var e = document.getElementsByName('allpay-checkout');
            e[0].submit();
            //clear cart
            ngCart.empty();
        };
        $scope.closeDialog = function () {
            // remove data
            $firebase.ref('queue/tasks/' + data['_id'] + '@serverFb').child('status').set('canceled');
            $mdDialog.hide();
        }
    }
})();
