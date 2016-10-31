(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .factory('analyticsService', AnalysisService);

    ////
    /* @ngInject */
    function AnalysisService($filter, $q, $firebase, snippets) {
        var to2dig = snippets.to2dig;
        var orderAnalyticsRef = $firebase.queryRef('site-orders?&type=analytics').child('days');
        var productAnalyticsRef = $firebase.queryRef('products?&type=analytics').child('summary');

        var nowDate = new Date();

        function getOrderAnalytics(period, repeat) {
            var dateArr = [], periodPromises = [];
            for (var i = repeat; i > -1; i--) {
                var time = nowDate.getTime() - i * period * 86400000;
                dateArr[repeat-i] = {
                    time:time,
                    str:getDate(new Date(time))
                };
            }
            dateArr.forEach(function (date, index) {
                if (index === 0)return;
                var start = dateArr[index - 1].str;
                var end = dateArr[index].str;

                var dataPromises = [
                    orderAnalyticsRef.orderByKey().startAt(start).limitToFirst(1).once('child_added'),
                    orderAnalyticsRef.orderByKey().endAt(end).limitToLast(1).once('child_added')
                ];
                periodPromises[index] = new Promise(function (resolve) {
                    Promise.all(dataPromises).then(function (periodData) {
                        var startValue = periodData[0].val() || {};
                        var endValue = periodData[1].val() || {};
                        resolve({
                            time: dateArr[index].time,
                            cs: (endValue.cs || 0) - (startValue.cs || 0),  //s:sales, i:incomes, cs = cumulative sales, g = gross (cumulative income)
                            g: (endValue.g || 0) - (startValue.g || 0)
                        })
                    })
                });
            });
            return Promise.all(periodPromises);
        }

        function getTopProducts(orderBy, topX){
            return new Promise(function(resolve){
                productAnalyticsRef.orderByChild(orderBy).limitToLast(topX).once('value', function(snap){
                    resolve(snap.val());
                });
            })
        }

        function getDate(date) {
            var year = (date.getUTCFullYear() + '').substr(2, 2),
                month = to2dig(date.getUTCMonth() + 1),
                day = to2dig(date.getUTCDate());
            return year + month + day
        }


        return {
            getOrderAnalytics:getOrderAnalytics,
            getTopProducts:getTopProducts
        }
    }


})();
