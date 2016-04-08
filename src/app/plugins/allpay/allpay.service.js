(function () {
    'use strict';

    angular
        .module('app.plugins.allpay')
        .provider('$allpay', allpayProvider);

    ////

    function allpayProvider() {
        var isStage = true,
            defaultConfig = {
                MerchantID: '2000132',
                PaymentType: "aio",
                ReturnURL: "http://104.196.19.150/allpayReceive",
                PaymentInfoURL: "http://104.196.19.150/allpayPaymentInfo",
                ChoosePayment: "ALL",
                NeedExtraPaidInfo: "Y",
                TradeDesc: "required, please set a value."
            };

        this.isStage = function (value) {
            isStage = !!value;
        };
        this.setParams = function (value) {
            defaultConfig = value;
        };

        function Allpay(defaultConfig, isStage) {
            this.defaultConfig = defaultConfig;
        }

        Allpay.prototype.getPaymentInfo = function (order, opt) {
            var cart = order.cart ? order.cart : {},
                items= cart.items||[],
                _opt = opt || {},
                config = _opt.config || {},
                now = _opt.timeStamp||(new Date()),
                month = to2dig(now.getMonth()+1),
                day = to2dig(now.getDate()),
                hour = to2dig(now.getHours()),
                min = to2dig(now.getMinutes()),
                sec = to2dig(now.getSeconds()),
                date = now.getFullYear() + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;

            function to2dig(num) {
                return num < 10 ? ('0' + num) : num;
            }

            //for description
            var itemName = '';
            for (var key in items) {
                itemName = itemName + (_opt.namePrefix || '') + items[key].name + (_opt.namePostfix || ' ') + (_opt.pricePrefix || '$') + items[key].price + (_opt.pricePostfix || '') + (_opt.quantityPrefix || '*') + items[key].quantity + (_opt.quantityPostfix || '') + '#'
            }
            itemName = itemName.slice(0, -1);

            //for total amount
            var amount = 0;
            if (angular.isNumber(order.totalAmount)||angular.isNumber(_opt.totalAmount)) {
                amount = order.totalAmount||_opt.totalAmount;
            } else if (angular.isFunction(_opt.totalAmount)) {
                amount = _opt.totalAmount(order);
            } else {
                angular.forEach(cart, function (item, name) {
                    amount = amount+(item.quantity*item.price);
                });
            }

            var form = angular.extend({}, this.defaultConfig, {
                MerchantTradeDate: date,
                TotalAmount: amount
            });

            form.MerchantTradeNo = order.id || now.getTime();
            form.ItemName = form.ItemName || itemName || 'required, please set a value';
            return form;
        };


        this.$get = /* @ngInject */ function () {
            return new Allpay(defaultConfig, isStage)
        }
    }

})();
