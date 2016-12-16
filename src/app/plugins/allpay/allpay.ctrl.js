(function () {
    'use strict';

    angular
        .module('app.plugins.allpay')
        .controller('AllpayCtrl', AllpayCtrl);

    ////
    /* @ngInject */
    function AllpayCtrl($auth, $firebase, $mdMedia, $mdDialog, sitesService, $timeout, snippets, $sce) {
        var vm = this;
        vm.formAction = $sce.trustAsResourceUrl('https://payment-stage.allpay.com.tw/Cashier/AioCheckOut');
        var siteName = sitesService.siteName;
        var defaultAllpayParams = {
            ChoosePayment: "ALL",
            // NeedExtraPaidInfo: "Y",
            TradeDesc: "required, please set a value."
        };

        vm.order = {
            payment: {},
            payer: {}
        };


        function buildAllpayParams(plan, currentPlan) {
            // var date = moment(_core.getSyncTime()).format('YYYY/MM/DD HH:mm:ss');

            var paymentParams = Object.assign({}, defaultAllpayParams, {
                ReturnURL: "http://131.193.191.5/planAllpayReceive?sitename=" + siteName + '&uid=' + $auth.currentUser.uid,
                // MerchantTradeDate: date,
                ChoosePayment: 'Credit',
                // PeriodAmount: plan.periodAmount,
                // PeriodType:'M',
                // Frequency:1,
                // ExecTimes:99,
                PaymentType: 'aio'
            });

            if ($mdMedia('xs')) {
                paymentParams.DeviceSource = 'M'
            } else {
                paymentParams.DeviceSource = 'P'
            }

            paymentParams.MerchantTradeNo = vm.order.id;
            paymentParams.ItemName = plan.desc;

            return paymentParams;
        }

        function setPlanType(plan, currentPlan) {
            // var type;
            // if(plan.pid==currentPlan.pid&&isRefillable(currentPlan)) type= 'refill';
            // if(plan.pid>currentPlan.pid) type= 'upgrade';
            // if(plan.pid<currentPlan.pid) type= 'downgrade';
            // vm.order.type=type;
            vm.order.plan = {current: currentPlan.pid, changeTo: plan.pid};
        }

        function getOrderData(plan, currentPlan) {
            vm.order.id = vm.order.id || _core.getSyncTime();

            setPlanType(plan, currentPlan);
            vm.order.siteName = siteName;
            vm.order.payer.id = $auth.currentUser.uid;
            vm.order.payment = {
                provider: 'allpay',
                allpay: buildAllpayParams(plan, currentPlan)
            };
            return vm.order;
        }

        function buildRequest(orderData) {
            var req = {payment: {allpay: {}}};
            angular.extend(req, orderData);

            req['_state'] = 'plan_allpay_gen_check_mac';
            return snippets.rectifyUpdateData(req);
        }

        vm.getCheckMacValue = getCheckMacValue;
        function getCheckMacValue(plan, currentPlan) {
            return new Promise(function (resolve, reject) {
                getOrderData(plan, currentPlan);
                var taskRef = $firebase.queryRef('queue-task?id=' + vm.order.id);
                taskRef.set(buildRequest(vm.order))
                    .then(function () {
                        var listener = function (snap) {
                            if (snap.val() && snap.val().payment.allpay.CheckMacValue) {
                                vm.order.payment.allpay = snap.val().payment.allpay;
                                $timeout(angular.noop, 0);
                                console.log(vm.order.payment.allpay);
                                taskRef.off('value', listener);
                                resolve(vm.order);
                            }
                        };
                        taskRef.on('value', listener)
                    });
            });
        }

        vm.submit = function () {
            var e = document.getElementsByName('allpay-checkout');
            e[0].submit();
        };
    }

})();
