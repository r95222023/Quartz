(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .factory('orderService', OrderService);

    /* @ngInject */
    function OrderService($rootScope, ngCart, $allpay, $stripe, syncTime) {
        var order = {},
            paymentService = {allpay: $allpay, stripe: $stripe};

        //create allpay order whenever cart changes;
        $rootScope.$on('ngCart:change', function () {
            buildOrder('allpay');
        });

        function buildOrder(type, opt) {
            if (!$rootScope.user) return;
            var _opt = opt || {},
                now = _opt.timeStamp || (new Date(syncTime.getTime())) || (new Date());

            _opt.id = _opt.id || now.getTime();
            _opt.timeStamp = _opt.timeStamp || now;
            var _order = {
                id: _opt.id,
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
            order[type] = _order;
            return _order;
        }

        return {
            order: order,
            buildOrder: buildOrder
        }
    }
})();
