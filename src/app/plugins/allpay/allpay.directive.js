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
                scope.allpaySubmit = getCheckMacValue;
                scope.getCheckMacValue=getCheckMacValue;

                function submit() {
                    if ($mdMedia('xs')) {
                        scope.data.payment.allpay.DeviceSource = 'M'
                    } else {
                        scope.data.payment.allpay.DeviceSource = 'P'
                    }
                    scope.data.id = scope.data.id||scope.data.payment.allpay.MerchantTradeNo;
                    scope.data.payment.type = 'allpay';
                    $firebase.request({
                        request: [{
                            refUrl: 'orders/' + scope.data.id,
                            value: scope.data
                        }],
                        response: {
                            checkMacValue: 'orders/' + scope.data.id + '/payment/allpay/CheckMacValue'
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

                function getCheckMacValue(){
                    $firebase.request({
                        request: [{
                            refUrl: 'queue/tasks/$qid@serverFb',
                            value: buildRequest(scope.data)
                        }],
                        response: {
                            checkMacValue: 'queue/tasks/$qid/payment/allpay/CheckMacValue'
                        }
                    }).then(function (res) {
                        scope.data.payment.allpay['CheckMacValue'] = res.checkMacValue;
                        console.log('order mac: '+res.checkMacValue);
                    }, function (error) {
                        console.log(error);
                    });
                }

                function buildRequest(data){
                    console.log(data);
                    var req = {payment:{allpay:{}}};
                    angular.extend(req,data);

                    if ($mdMedia('xs')) {
                        req.payment.allpay.DeviceSource = 'M'
                    } else {
                        req.payment.allpay.DeviceSource = 'P'
                    }
                    req.id = data.id||data.payment.allpay.MerchantTradeNo;
                    req.payment.type = 'allpay';
                    req['_state']='order_validate';
                    return rectifyUpdateData(req);
                }

                function rectifyUpdateData(data){
                    var datastring=JSON.stringify(data).replace('undefined', 'null');
                    return JSON.parse(datastring);
                }

                var allpayFormAction = attrs.stage !== '' ? 'https://payment.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut';
                scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);
            }

        };

    }

})();
