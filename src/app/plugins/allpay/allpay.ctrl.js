(function () {
    'use strict';

    angular
        .module('app.plugins.allpay')
        .controller('AllpayCtrl', AllpayCtrl);

    ////
    /* @ngInject */
    function AllpayCtrl($auth, $firebase, $mdMedia,$mdDialog, sitesService, $timeout, snippets, $sce) {
        var vm = this;
        vm.formAction = $sce.trustAsResourceUrl('https://payment-stage.allpay.com.tw/Cashier/AioCheckOut');
        var siteName = sitesService.siteName;
        var defaultAllpayParams = {
            ReturnURL: "http://http://24.14.103.233/allpayReceive",
            PaymentInfoURL: "http://24.14.103.233/allpayPaymentInfo",
            ChoosePayment: "ALL",
            // NeedExtraPaidInfo: "Y",
            TradeDesc: "required, please set a value."
        };

        vm.order = {
            payment: {},
            payer:{}
        };

        function getTotalAmount(plan, currentPlan){
            var diff= (plan.price||0)-(currentPlan.price||0);
            return diff>0? diff:0;
        }

        function buildAllpayParams(plan,currentPlan) {
            var to2dig = snippets.to2dig,
                now = (new Date(_core.getSyncTime())),
                month = to2dig(now.getMonth() + 1),
                day = to2dig(now.getDate()),
                hour = to2dig(now.getHours()),
                min = to2dig(now.getMinutes()),
                sec = to2dig(now.getSeconds()),
                date = now.getFullYear() + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;

            var paymentParams = Object.assign({}, defaultAllpayParams, {
                ReturnURL: "http://24.14.103.233/planAllpayReceive?sitename=" + siteName + '&uid=' + $auth.currentUser.uid,
                MerchantTradeDate: date,
                ChoosePayment:'Credit',
                // PeriodAmount: plan.periodAmount,
                TotalAmount: getTotalAmount(plan,currentPlan),
                // PeriodType:'M',
                // Frequency:1,
                // ExecTimes:99,
                PaymentType:'aio'
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

        function isRefillable(currentPlan) {
            var now = _core.getSyncTime(),
                billingTime = currentPlan.billingTime;
            switch (currentPlan.period) {
                case 'M':
                    return billingTime && now > (billingTime + 27 * 24 * 60 * 60000);
                    break;
            }
        }

        function setPlanType(plan, currentPlan){
            var type;
            if(plan.title==currentPlan.title&&isRefillable(currentPlan)) type= 'refill';
            if(plan.pid>currentPlan.pid) type= 'upgrade';
            if(plan.pid<currentPlan.pid) type= 'downgrade';
            vm.order.type=type;
            vm.order.pid=plan.pid;
            vm.order.prevPid=currentPlan.pid
        }

        function updateOrderData(plan,currentPlan) {
            return new Promise(function(resolve,reject){
                vm.order.id = vm.order.id||_core.getSyncTime();

                setPlanType(plan ,currentPlan);
                vm.order.siteName = siteName;
                vm.order.payer.id = $auth.currentUser.uid;
                vm.order.payment = {
                    provider: 'allpay',
                    allpay: buildAllpayParams(plan,currentPlan)
                };
                resolve(vm.order);
            });
        }

        function buildRequest(orderData) {
            var req = {payment: {allpay: {}}};
            angular.extend(req, orderData);

            req['_state'] = 'plan_allpay_gen_check_mac';
            return snippets.rectifyUpdateData(req);
        }

        vm.getCheckMacValue = getCheckMacValue;
        function getCheckMacValue(plan ,currentPlan) {
            return new Promise(function (resolve, reject) {
                updateOrderData(plan,currentPlan).then(function () {
                    var taskRef=$firebase.queryRef('queue-task?id=' + vm.order.id);
                    taskRef.set(buildRequest(vm.order))
                        .then(function(){
                            var listener=function(snap){
                                if(snap.val()&&snap.val().payment.allpay.CheckMacValue){
                                    vm.order.payment.allpay=snap.val().payment.allpay;
                                    $timeout(angular.noop, 0);
                                    console.log(vm.order.payment.allpay);
                                    taskRef.off('value',listener);
                                    resolve(vm.order);
                                }
                            };
                            taskRef.on('value', listener)
                        });
                    //
                    // $firebase.request(
                    //     {
                    //         paths: ['queue-task?id=' + vm.order.id],
                    //         data: buildRequest(vm.order)
                    //     },
                    //     ['queue-task?id=' + vm.order.id + '/payment/allpay'])
                    //     .then(function (res) {
                    //         vm.order.payment.allpay = res[0];
                    //
                    //         console.log(res[0]);
                    //         $timeout(angular.noop, 0);
                    //         resolve(vm.order);
                    //     }, function (error) {
                    //         reject(error);
                    //         console.log(error);
                    //     });
                });
            });
        }

        vm.showDialog = function (plan) {
            $mdDialog.show({
                parent: angular.element(document.body),
                // targetEvent: $event,
                templateUrl: 'app/plugins/allpay/allpayDialog.tmpl.html',
                controller: DialogController
            });

            /* @ngInject */
            function DialogController($scope, $mdDialog) {
                var allpayFormAction = vm.stage ? 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment.allpay.com.tw/Cashier/AioCheckOut';

                $scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);

                getCheckMacValue(plan).then(function (order) {
                    $scope.data = order;
                });

                $scope.submit = function () {
                    $scope.closeDialog();
                    var e = document.getElementsByName('allpay-checkout');
                    e[0].submit();
                };
                $scope.closeDialog = function () {
                    // remove data
                    // $firebase.queryRef('queue-task?id=' + data['_id']).child('status').set('canceled');
                    $mdDialog.hide();
                }
            }
        };
        vm.submit = function () {
            var e = document.getElementsByName('allpay-checkout');
            e[0].submit();
        };
    }

})();
