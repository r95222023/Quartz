(function () {
    'use strict';

    angular
        .module('app.plugins.stripe')
        .directive('stripeCheckout', stripeCheckout);

    ////

    /* @ngInject */
    function stripeCheckout(stripeCheckout, $mdMedia, $firebase, $sce, $timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                token: '='
            },
            transclude: true,
            templateUrl: function (element, attrs) {
                if (typeof attrs.templateUrl == 'undefined') {
                    return 'app/plugins/stripe/stripe-checkout.tmpl.html';
                } else {
                    return attrs.templateUrl;
                }
            },
            link: function (scope, element, attrs) {
                scope.checkout = function () {
                    //accept form like {clientInfo:{...}, cart:{...}, payment:{stripe:{...}}}

                    //TODO: throw error if scope.data is not in correct form

                    var data = angular.isFunction(scope.data) ? scope.data() : scope.data;
                    //allow scope.data() to be a promise
                    if(angular.isObject(data)&&angular.isFunction(data.then)){
                        data.then(onData);
                    } else {
                        onData(data);
                    }
                    function onData(data) {
                        var paymentInfo = data.payment.stripe;
                        if (!angular.isFunction(paymentInfo.token)) {
                            paymentInfo.token = angular.isFunction(scope.token) ? scope.token : function (token) {
                                data.id = data.id||(new Date()).getTime();
                                data.payment.stripe = token;
                                data.payment.type = 'stripe';
                                $firebase.request({
                                    request: [{
                                        refUrl: 'orders/'+data.id,
                                        value: data
                                    }],
                                    response: {
                                        res: 'orders/'+data.id
                                    }
                                }).then(function (res) {
                                    console.log(res);
                                }, function (error) {
                                    console.log(error);
                                });
                            };
                        }
                        stripeCheckout(paymentInfo)
                            .then(function (handler) {
                                handler.open(paymentInfo);
                            })
                    }
                };
            }

        };

    }

})();
