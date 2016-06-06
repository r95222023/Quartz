(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .factory('orderService', OrderService);

    /* @ngInject */
    function OrderService($rootScope, $q, $firebase, ngCart, $allpay, $stripe, syncTime, sitesService) {
        var order = {},
            paymentService = {allpay: $allpay, stripe: $stripe};

        function buildOrder(type, opt) {
            var def = $q.defer();
            $firebase.ref('config/payment/' + type + '/public@selectedSite').once('value', function (snap) {
                var _opt = (snap.val() !== null) ? angular.extend({}, {paymentParams: snap.val()}, opt || {}) : opt || {},
                    now = _opt.timeStamp || (new Date(syncTime.getTime())) || (new Date());

                _opt.id = _opt.id || (sitesService.siteName + now.getTime());
                _opt.timeStamp = _opt.timeStamp || now;
                var _order = {
                    id: _opt.id,
                    siteName: sitesService.siteName,
                    clientInfo: {
                        uid: $rootScope.user.uid
                    }
                };

                _order.cart = ngCart.toObject();
                _order.totalAmount = ngCart.totalCost();
                var payment = {};
                payment[type] = paymentService[type].getPaymentInfo(_order, _opt);
                angular.extend(_order, {
                    payment: payment
                });
                def.resolve(_order);
                order[type] = _order;
            });

            return def.promise;
        }

        return {
            order: order,
            buildOrder: buildOrder
        }
    }
})();
