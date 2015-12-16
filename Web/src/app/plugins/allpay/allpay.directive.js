(function () {
    'use strict';

    angular
        .module('app.plugins.allpay')
        .directive('allpayCheckout', allpayCheckout);

    ////

    /* @ngInject */
    function allpayCheckout($mdMedia, $firebase, $sce, $timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            transclude: true,
            templateUrl: function (element, attrs) {
                if (typeof attrs.templateUrl == 'undefined') {
                    return 'app/plugins/allpay/allpayCheckout.tmpl.html';
                } else {
                    return attrs.templateUrl;
                }
            },
            link: function (scope, element, attrs) {
                scope.allpaySubmit = submit;

                function submit() {
                    if ($mdMedia('xs')) {
                        scope.data.payment.allpay.DeviceSource = 'M'
                    } else {
                        scope.data.payment.allpay.DeviceSource = 'P'
                    }
                    $firebase.request({
                        request: [{
                            refUrl: 'orders/' + scope.data.payment.allpay.MerchantTradeNo,
                            value: scope.data
                        }],
                        response: {
                            checkMacValue: 'orders/' + scope.data.payment.allpay.MerchantTradeNo + '/payment/allpay/CheckMacValue'
                        }
                    }).then(function (res) {
                        scope.data.payment.allpay['CheckMacValue'] = res.checkMacValue;
                        $timeout(function () {
                            var e = document.getElementsByName('allpay-checkout');
                            e[0].submit();
                        }, 0, false);
                    }, function (error) {
                        console.log(error);
                    });
                }

                var allpayFormAction = attrs.stage !== '' ? 'https://payment.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut';
                scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);
                scope.attrs = attrs;
            }

        };

    }

})();
