(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .factory('analyticsService', AnalysisService);

    ////
    /* @ngInject */
    function AnalysisService($firebase) {
        var orderAnalyticsRef = $firebase.queryRef('site-orders?type=analytics').child('days');

        function getOrderAnalytics(period, repeat) {
            var dateArr = [], periodPromises = [];
            var time = moment();
            for (var i = 1; i < repeat+2; i++) {
                dateArr.push({
                    time: time.valueOf(),
                    str: time.format('YYMMDD')
                });
                time = time.subtract(i*period, 'days');
            }

            dateArr.forEach(function (date, index) {
                if (index === dateArr.length-1)return;
                var end = dateArr[index].str;
                var start = dateArr[index+1].str;

                var dataPromises = [
                    orderAnalyticsRef.orderByKey().startAt(start).limitToFirst(1).once('child_added'),
                    orderAnalyticsRef.orderByKey().endAt(end).limitToLast(1).once('child_added')
                ];
                periodPromises[index] = Promise.all(dataPromises).then(function (periodData) {
                    var startValue = periodData[0].val() || {};
                    var endValue = periodData[1].val() || {};

                    return {
                        time: dateArr[index].time,
                        cs: (endValue.cs || 0) - (startValue.cs || 0),  //s:sales, i:incomes, cs = cumulative sales, g = gross (cumulative income)
                        g: (endValue.g || 0) - (startValue.g || 0)
                    }
                })
            });
            return Promise.all(periodPromises);
        }

        function getTopProducts(orderBy, topX) {
            return new Promise(function (resolve) {
                var now = moment();
                var day = now.format('YYMMDD'); //register the number of item sold to next 30 days summary = how many item sold within last 30 days

                $firebase.queryRef('products?type=analytics').child('days/'+day).orderByChild(orderBy).limitToLast(topX).once('value', function (snap) {
                    resolve(snap.val());
                });
            })
        }

        // function getDate(date) {
        //     var year = (date.getUTCFullYear() + '').substr(2, 2),
        //         month = to2dig(date.getUTCMonth() + 1),
        //         day = to2dig(date.getUTCDate());
        //     return year + month + day
        // }


        return {
            getOrderAnalytics: getOrderAnalytics,
            getTopProducts: getTopProducts
        }
    }


})();
