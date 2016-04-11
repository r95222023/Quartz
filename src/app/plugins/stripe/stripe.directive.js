(function () {
    'use strict';

    angular
        .module('app.plugins.stripe')
        .directive('stripeCheckout', stripeCheckout);

    ////

    /* @ngInject */
    function stripeCheckout(stripeCheckout, $mdMedia, $firebase, $sce, $timeout, ngCart, sitesService) {
        return {
            restrict: 'E',
            scope: {
                buildData: '=',
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

                    var data = scope.buildData();

                    onData(data);

                    function onData(data) {
                        var paymentInfo = data.payment.stripe;
                        if (!angular.isFunction(paymentInfo.token)) {
                            paymentInfo.token = angular.isFunction(scope.token) ? scope.token : function (token) {
                                data.id = data.id || (new Date()).getTime();
                                data.siteName = sitesService.siteName;
                                data.payment.stripe = token;
                                data.payment.type = 'stripe';
                                data['_state'] = 'order_validate';
                                $firebase.request({
                                    request: [{
                                        refUrl: 'queue/tasks/$qid@serverFb',
                                        value: data
                                    }],
                                    response: {
                                        "_id": 'queue/tasks/$qid/_id'
                                    }
                                }).then(function (res) {
                                    console.log(res);
                                    ngCart.empty();
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
