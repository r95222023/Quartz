(function () {
    'use strict';

    angular
        .module('app.plugins.allpay')
        .provider('$allpay', allpayProvider);

    ////

    function allpayProvider() {
        var isStage = true,
            config = {
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
            config = value;
        };

        function Allpay(config, isStage) {
            this.getAllpayForm = function (order, opt) {
                var payment = order.payment ? order.payment : {},
                    cart = order.cart ? order.cart : {},
                    _opt = opt || {},
                    params = payment.allpay ? payment.allpay : {},
                    now = new Date(),
                    hour = to2dig(now.getHours()),
                    min = to2dig(now.getMinutes()),
                    sec = to2dig(now.getSeconds()),
                    date = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + hour + ':' + min + ':' + sec;

                function to2dig(num) {
                    return num < 10 ? ('0' + num) : num;
                }

                var itemName = '';
                for (var key in cart) {
                    itemName = itemName + (_opt.namePrefix || '') + cart[key].name + (_opt.namePostfix || ' ') + (_opt.pricePrefix || '$') + cart[key].price + (_opt.pricePostfix || '') + (_opt.quantityPrefix || '*') + cart[key].quantity + (_opt.quantityPostfix || '') + '#'
                }
                itemName = itemName.slice(0, -1);

                var form = angular.extend({}, params, config);
                angular.extend(form, {
                    MerchantTradeDate: date,
                    TotalAmount: order.totalAmount
                });
                form.MerchantTradeNo = form.MerchantTradeNo || now.getTime();
                form.ItemName = form.ItemName || itemName || 'required, please set a value';
                order.payment.allpay = form;
                return order;
            }
        }

        this.$get = /* @ngInject */ function () {
            return new Allpay(config, isStage)
        }
    }

})();
