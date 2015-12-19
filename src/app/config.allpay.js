(function () {
    'use strict';

    angular
        .module('app')
        .config(/* @ngInject */ function ($allpayProvider) {
            $allpayProvider.isStage(true);
            ////default already in $allpayProvider
            //$allpayProvider.setParams({
            //    MerchantID: '2000132',
            //    PaymentType: "aio",
            //    ReturnURL: "http://104.196.19.150/allpayReceive",
            //    PaymentInfoURL: "http://104.196.19.150/allpayPaymentInfo",
            //    ChoosePayment: "ALL",
            //    NeedExtraPaidInfo: "Y",
            //    TradeDesc: "required, please set a value."
            //});
        })
})();
