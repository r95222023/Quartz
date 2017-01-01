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
            {id:'7d',name: 'ANALYTICS.LAST7DAYS', period: 1, repeat: 7},
            {id:'35d',name: 'ANALYTICS.LAST5WEEKS', period: 7, repeat: 5},
            {id:'180d',name: 'ANALYTICS.LAST6MONTHES', period: 30, repeat: 6}
        ];
        vm.selectedPeriod = vm.periods[0];

        // vm.barChart = {
        //     type: 'Bar',
        //     data: [
        //         ['Month', 'Sales', 'Expenses', 'Profit'],
        //         ['JAN.', 1000, 400, 200],
        //         ['FEB.', 1170, 460, 250],
        //         ['MAR.', 660, 1120, 300],
        //         ['APR.', 1030, 540, 350]
        //     ],
        //     options: {
        //         chart: {
        //             title: 'Company Performance',
        //             subtitle: 'Sales, Expenses, and Profit: January-April'
        //         },
        //         bars: 'vertical',
        //         // width: 800,
        //         height: 600
        //     }
        // };
        vm.series=['ANALYTICS.SALES', 'ANALYTICS.GROSS'];

        vm.onPeriodChange= function (){
            analyticsService.getOrderAnalytics(vm.selectedPeriod.period, vm.selectedPeriod.repeat).then(function(res){
                var cs=[];
                var g=[];
                var labels=[];
                vm.cs=0;vm.g=0;
                angular.forEach(res, function(dateData){
                    cs.push(dateData.cs);
                    vm.cs+=dateData.cs;
                    g.push(dateData.g);
                    vm.g+=dateData.g;

                    var time = new Date(dateData.time);
                    var year = time.getFullYear();
                    var month = time.getMonth();
                    var date = time.getMonth();

                    labels.push((year-2000)+'/'+month+'/'+date);
                });
                vm.data=[cs,g];
                vm.labels=labels;
                $timeout(angular.noop,0);
            });
        };


        vm.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        vm.salesSeries = ['Sales'/*, 'Series B'*/];
        vm.incomeSeries = ['Sales'/*, 'Series B'*/];

        vm.orderSeries = ['Daily Orders'];
        vm.datasetOverride = [{lineTension: 0}];
        /////////

        function randomData(dataName, serieName, lableName, order) {
            vm[dataName] = [];
            for (var series = 0; series < vm[serieName].length; series++) {
                var row = [];
                for (var label = 0; label < vm[lableName].length; label++) {
                    row.push(Math.floor((Math.random() * (order || 100)) + 1));
                }
                vm[dataName].push(row);
            }
        }

        // init

        randomData('salesData', 'salesSeries', 'labels', 100);
        randomData('incomeData', 'incomeSeries', 'labels', 10000);

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

        vm.topSales = [
            {id: 'P100001', name: 'Apple', count: 43},
            {id: 'P100003', name: 'Orange', count: 31},
            {id: 'P100002', name: 'Pearl', count: 25},
            {id: 'P100004', name: 'Guava', count: 20},
            {id: 'P100005', name: 'Banana', count: 11}
        ];
        vm.topIncome = [
            {id: 'P100003', name: 'Orange', count: 5400},
            {id: 'P100004', name: 'Guava', count: 3850},
            {id: 'P100002', name: 'Pearl', count: 3230},
            {id: 'P100001', name: 'Apple', count: 3210},
            {id: 'P100005', name: 'Banana', count: 1880}
        ];
        console.log(vm.data)
        console.log(vm.labels)

    }
})();
