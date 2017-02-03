(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .controller('AnalyticsController', AnalyticsController);

    /* @ngInject */
    function AnalyticsController($firebase, $timeout, analyticsService, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.orderData = {};
        // analyticsService.getOrderAnalytics('7',1).then(function(res){console.log(res)});
        vm.periods = [
            {type:'7d',name: 'ANALYTICS.LAST7DAYS'},
            {type:'6w',name: 'ANALYTICS.LAST6WEEKS'},
            {type:'6m',name: 'ANALYTICS.LAST6MONTHES'}
        ];
        vm.selectedPeriod = vm.periods[0];

        // function mockOrderAnalytics(){
        //     var cs=0, g=0;
        //     var time = moment().subtract(31, 'days');
        //     var res = {};
        //     for(var i=0; i<31; i++){
        //         time = time.add(1,'days');
        //         var rs = Math.floor((Math.random() * (100)) + 1);
        //         var ri = Math.floor((Math.random() * (10000)) + 1);
        //
        //         cs+=rs;
        //         g+=ri;
        //         res[time.format('YYMMDD')]={
        //             s:rs,
        //             i:ri,
        //             cs:cs,
        //             g:g
        //         };
        //     }
        //     console.log(res);
        //     $firebase.queryRef('site-orders?type=analytics').child('days').update(res);
        //     $firebase.queryRef('site-orders?type=analytics').child('summary').update({cs:cs,g:g});
        //
        // }
        // mockOrderAnalytics();
        vm.series=['ANALYTICS.SALES', 'ANALYTICS.GROSS'];
        vm.changePeriod=function(period){
            analyticsService.getOrderAnalytics(period.type).then(function(res){
                var sales=[];
                var income=[];
                var labels=[];
                vm.cs=0;vm.g=0;
                console.log(res);

                angular.forEach(res, function(periodData){
                    sales.unshift(periodData.cs);
                    vm.cs+=periodData.cs;
                    income.unshift(periodData.g);
                    vm.g+=periodData.g;
                    labels.unshift(moment(periodData.time).format('YY/MM/DD'));
                });
                vm.salesData=[sales];
                vm.incomeData=[income];

                vm.labels=labels;
                vm.from = '20'+labels[0];
                vm.to = '20'+labels[labels.length-1];

                $timeout(angular.noop,0);
            });
        };
        vm.changePeriod(vm.selectedPeriod);
        // vm.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        vm.salesSeries = ['Sales'/*, 'Series B'*/];
        vm.incomeSeries = ['Incomes'/*, 'Series B'*/];

        vm.orderSeries = ['Daily Orders'];
        vm.datasetOverride = [{lineTension: 0}];
        /////////

        // function randomData(dataName, serieName, lableName, order) {
        //     vm[dataName] = [];
        //     for (var series = 0; series < vm[serieName].length; series++) {
        //         var row = [];
        //         for (var label = 0; label < vm[lableName].length; label++) {
        //             row.push(Math.floor((Math.random() * (order || 100)) + 1));
        //         }
        //         vm[dataName].push(row);
        //     }
        // }

        // init
        //
        // randomData('salesData', 'salesSeries', 'labels', 100);
        // randomData('incomeData', 'incomeSeries', 'labels', 10000);

        function getTopProducts(topX){
            vm.topProducts={};
            ['s','g'].forEach(function(type){
                analyticsService.getTopProducts(type, topX).then(function(res){
                    vm.topProducts[type] = res;
                    console.log(vm.topProducts);
                    $timeout(angular.noop,0);
                });
            });
        }
        getTopProducts(5);

        var productNames={};
        vm.getProductName = function(id){
            if(productNames[id]==='_loading'){
                //
            } else if(productNames[id]===undefined){
                productNames[id]='_loading';
                $firebase.queryRef('products?type=list').child(id).child('itemName').once('value')
                    .then(function(snap){
                        productNames[id] = snap.val();
                    })
            } else {
                return productNames[id]
            }
        };
    }
})();
