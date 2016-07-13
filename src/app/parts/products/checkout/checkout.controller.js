(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('AllpayCheckoutCtrl', AllpayCheckoutCtrl);

    /* @ngInject */
    function AllpayCheckoutCtrl($q, $scope, ngCart, $mdMedia, $firebase, $sce, $timeout, snippets, $mdDialog, customParams) {
        var vm = this,
            params = customParams.get();

        var allpayFormAction = !params.stage ? 'https://payment.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut';
        $scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);

        function getCheckMacValue() {
            $firebase.request({
                request: [{
                    refUrl: 'queue/tasks/$qid@serverFb',
                    value: buildRequest($scope.data)
                }],
                response: {
                    "checkMacValue": 'queue/tasks/$qid/payment/allpay/CheckMacValue'
                }
            }).then(function (res) {
                $timeout(function () {
                    $scope.data.payment.allpay['CheckMacValue'] = res.checkMacValue;
                    $scope.data['_id'] = res.params['$qid'];
                }, 0);

                console.log('order mac: ' + res.checkMacValue);
            }, function (error) {
                console.log(error);
            });
        }

        function buildRequest(data) {
            var req = {payment: {allpay: {}}};
            angular.extend(req, data);

            if ($mdMedia('xs')) {
                req.payment.allpay.DeviceSource = 'M'
            } else {
                req.payment.allpay.DeviceSource = 'P'
            }
            req.id = data.id || data.payment.allpay.MerchantTradeNo;
            req.siteName = sitesService.siteName;
            req.payment.type = 'allpay';
            req['_state'] = 'order_validate';
            return snippets.rectifyUpdateData(req);
        }

        $scope.onFormReady = function () {
            getCheckMacValue(data);
        };

        $scope.submit = function () {
            $scope.closeDialog();
            $firebase.ref('queue/tasks/' + $scope.data['_id'] + '@serverFb').update($scope.data);

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
