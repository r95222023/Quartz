(function () {
    'use strict';

    angular
        .module('app.plugins.analytics')
        .factory('analysisService', AnalysisService);

    ////
    /* @ngInject */
    function AnalysisService($filter, $q, $firebase, syncTime, snippets) {
        var to2dig = snippets.to2dig;

        function getKey(time) {
            var _date = new Date(time),
                year = to2dig(_date.getFullYear() - 2000),
                month = to2dig(_date.getMonth() + 1),
                date = to2dig(_date.getDate()),
                key = year + '' + month + '' + date;

            return parseInt(key).toString(36);
        }

        function getData(rootRefUrl, startAt, endAt, opt) {
            var def = $q.defer(),
                ref = $firebase.ref(rootRefUrl).orderByKey(),
                _opt = opt || {};

            function resolve(snap) {
                def.resolve(snap.val());
            }

            var clearDate = _opt.removeDataInDays? endAt-_opt.removeDataInDays*24*60*60*1000:_opt.removeDataBefore;
            if (clearDate) {
                ref.endAt(getKey(clearDate)).once('child_added', function (snap) {
                    snap.ref().set(null);
                })
            }

            ref = ref.startAt(getKey(startAt));
            if (endAt) ref = ref.endAt(getKey(endAt));
            ref.once('value', resolve);
            return def.promise;
        }

        function label(key, opt) {
            var time = parseInt(key, 36) + '',
                year = time.substring(0, 2),
                month = time.substring(2, 4),
                date = time.substring(4);
            if (opt.monthOnly) {
                if (date !== '01') {
                    return '';
                } else {
                    return year + '/' + month;
                }
            }
            return year + '/' + month + '/' + date;
        }


        function toChartJS(val, opt) {
            var returnObj = {labels: []},
                _opt = opt || {};
            for (var key in val) {

                returnObj.labels.push(label(key, _opt));
                if(angular.isArray(_opt.items)){
                    angular.forEach(_opt.items, function(itemName){
                        returnObj[itemName]=returnObj[itemName]||{};
                        angular.forEach(val[key][itemName]||val[key], function(count, countName){
                            returnObj[itemName][countName] = returnObj[itemName][countName] || [];
                            returnObj[itemName][countName].push(count);
                        });
                    });
                } else {
                    angular.forEach(val[key]||val[key], function(count, countName){
                        returnObj[countName] = returnObj[countName] || [];
                        returnObj[countName].push(count);
                    });
                }
            }
            return returnObj;
        }

        function toArray(rawData){
            var items = {},
                itemsArr = [];
            angular.forEach(rawData, function (val, key) {
                angular.forEach(val, function (countVal, itemName) {
                    if (angular.isObject(countVal)) {
                        angular.forEach(countVal, function (count, property) {
                            items[itemName] = items[itemName] || {};
                            items[itemName][property] = items[itemName][property] ? items[itemName][property] + count : count;
                        })
                    } else {
                        items[itemName] = items[itemName] ? items[itemName] + countVal : countVal;
                    }
                });
            });

            angular.forEach(items, function (val, itemName) {
                var item = {name: itemName};
                if (angular.isObject(val)) {
                    angular.extend(item, val);
                } else {
                    item.count = val;
                }
                itemsArr.push(item);
            });
            return itemsArr;
        }


        function getAnalysis(rootRefUrl, start, end, opt) {
            var def = $q.defer();
            getData(rootRefUrl, start, end, opt).then(function (rawData) {
                def.resolve({
                    getChartData:function (opt) {
                        return toChartJS(rawData, opt)
                    },
                    getRankedArr:function (property, reverse) {
                        return $filter('orderBy')(toArray(rawData), property, reverse===undefined? true:reverse)
                    }
                });


            });
            return def.promise;
        }
        //
        // function getTopN(rootRefUrl, start, end, opt) {
        //
        //     getData(rootRefUrl, start, end, opt).then(function (rawData) {
        //         var def = $q.defer(),
        //             items = {},
        //             arr = [];
        //         angular.forEach(rawData, function (val, key) {
        //             angular.forEach(val, function (countVal, itemName) {
        //                 if (angular.isObject(countVal)) {
        //                     angular.forEach(countVal, function (count, property) {
        //                         items[itemName] = items[itemName] || {};
        //                         items[itemName][property] = items[itemName][property] ? items[itemName][property] + count : count;
        //                     })
        //                 } else {
        //                     items[itemName] = items[itemName] ? items[itemName] + countVal : countVal;
        //                 }
        //             });
        //         });
        //
        //         angular.forEach(items, function (val, itemName) {
        //             var item = {name: itemName};
        //             if (angular.isObject(val)) {
        //                 angular.extend(item, val);
        //             } else {
        //                 item.count = val;
        //             }
        //             arr.push(item);
        //         });
        //
        //         def.resolve(function (property, reverse) {
        //             return $filter('orderBy')(arr, property, reverse===undefined? true:reverse)
        //         });
        //     });
        //     return def.promise;
        // }


        function getDataInDays(rootRefUrl, days, opt){
            var def = $q.defer();
            syncTime.onReady().then(function(getTime){
                var nowTime=getTime();
                getAnalysis(rootRefUrl, nowTime-days*24*60*60*1000, nowTime, opt).then(def.resolve);
            });
            return def.promise;
        }

        function record(refUrl, itemName, eventArr){
            syncTime.onReady().then(function(getTime){
                var key = getKey(getTime()),
                    _itemName=itemName? '/'+itemName:'';
                $firebase.ref(refUrl+'/'+ key +_itemName+'@selectedSite').transaction(function (val) {
                    var _val = val||{};

                    angular.forEach(eventArr, function(eventName){
                        _val[eventName]=_val[eventName]? _val[eventName]+1:1;
                    });

                    return _val;
                });
            })
        }


        return {
            getAnalysis: getAnalysis,
            getDataInDays:getDataInDays,
            record:record
        }
    }

})();
