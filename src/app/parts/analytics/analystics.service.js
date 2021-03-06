(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .factory('analysticService', AnalysticService);

    /* @ngInject */
    function AnalysticService($rootScope, $q, $firebase, syncTime, snippet, sitesService) {
        var to2dig = snippet.to2dig;

        function getKey(time) {
            var _date = new Date(time),
                year = to2dig(_date.getFullYear() - 2000),
                month = to2dig(_date.getMonth() + 1),
                date = to2dig(_date.getDate()),
                key = year + '' + month + '' + date;

            return parseInt(key).toString(36);
        }

        function getData(rootRefUrl, startAt, endAt) {
            var def = $q.defer(),
                ref = $firebase.ref(rootRefUrl).orderByKey();


            function resolve(snap) {
                def.resolve(snap.val());
            }

            ref = ref.startAt(getKey(startAt));
            if (endAt) ref = ref.endAt(getKey(endAt));
            ref.once('value', resolve);
            return def.promise;
        }

        function label(key, opt){
            var time = parseInt(key),
                year = time.substring(0,2),
                month = time.substring(2,4),
                date = time.substring(4);
            if(opt.monthOnly) {
                if(date!=='01') {
                    return '';
                } else {
                    return year+'/'+month;
                }
            }
            return year+'/'+month+'/'+date;
        }


        function toChartJS(val, opt) {
            var returnObj = {labels: []},
                _opt = opt||{};
            for (var key in val) {

                returnObj.labels.push(label(key, _opt), 36);
                for (var subkey in val[key]) {
                    returnObj[subkey] = returnObj[subkey] || [];
                    returnObj[subkey].push(val[key][subkey]);
                }
            }
            return returnObj;
        }


        function getOrderAnalysis(rootRefUrl, start, end) {
            var def = $q.defer();
            getData(rootRefUrl, start, end).then(function(rawData){
                def.resolve(toChartJS(rawData));
            });
            return def.promise;
        }

        function getProductAnalysis(rootRefUrl, start, end) {
            var def = $q.defer();
            getData(rootRefUrl, start, end).then(function(rawData){
                def.resolve(toChartJS(rawData));
            });
            return def.promise;
        }


        return {
            getOrderAnalysis:getOrderAnalysis
        }
    }
})();
