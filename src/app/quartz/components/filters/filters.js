(function () {
    'use strict';
    angular.module('quartz.components')
        .filter('reverse', /*@ngInject*/ function () {
            return function (items) {
                return items.slice().reverse();
            }
        })
        .filter('consecutive', /*@ngInject*/ function ($filter, snippet) {
            return function (items, input, isReverse) {
                var _items = items || [];
                var result = angular.copy(_items);

                if (typeof input === 'object') {
                    angular.forEach(input, function (value, key) {
                        if (!value && value !== '') return;
                        if (value === true) {
                            result = $filter('filter')(result, key);
                        } else {
                            result = $filter('filter')(result, value);
                        }
                    });
                } else if (typeof input === 'string') {
                    input = input.trim();
                    var keyArray = input.split(' ');
                    for (var i = 0; i < keyArray.length; i++) {
                        result = $filter('filter')(result, keyArray[i]);
                    }
                    result = input === '' ? _items : result
                }
                return isReverse ? result.slice().reverse() : result
            }
        })
        ////see http://jsfiddle.net/nirmalkumar_86/9F89Q/5/
        .filter('filterMultiple', /*@ngInject*/ function ($filter) {
            return function (items, keyObj) {
                var filterObj = {
                    data: items,
                    filteredData: [],
                    applyFilter: function (obj, key) {
                        var fData = [];
                        if (this.filteredData.length == 0)
                            this.filteredData = this.data;
                        if (obj) {
                            var fObj = {};
                            if (!angular.isArray(obj)) {
                                fObj[key] = obj;
                                fData = fData.concat($filter('filter')(this.filteredData, fObj));
                            } else if (angular.isArray(obj)) {
                                if (obj.length > 0) {
                                    for (var i = 0; i < obj.length; i++) {
                                        if (angular.isDefined(obj[i])) {
                                            fObj[key] = obj[i];
                                            fData = fData.concat($filter('filter')(this.filteredData, fObj));
                                        }
                                    }

                                }
                            }
                            if (fData.length > 0) {
                                this.filteredData = fData;
                            }
                        }
                    }
                };

                if (keyObj) {
                    angular.forEach(keyObj, function (obj, key) {
                        filterObj.applyFilter(obj, key);
                    });
                }

                return filterObj.filteredData;
            }
        })
        .filter('unique', /*@ngInject*/ function () {
            return function (input, key) {
                var unique = {};
                var uniqueList = [];
                for (var i = 0; i < input.length; i++) {
                    if (typeof unique[input[i][key]] == "undefined") {
                        unique[input[i][key]] = "";
                        uniqueList.push(input[i]);
                    }
                }
                return uniqueList;
            };
        })
        //see https://github.com/vpegado/angular-percentage-filter
        .filter('percentage', /*@ngInject*/ function ($window) {
            return function (input, decimals, suffix) {
                decimals = angular.isNumber(decimals) ? decimals : 3;
                suffix = suffix || '%';
                if ($window.isNaN(input)) {
                    return '';
                }
                return Math.round(input * Math.pow(10, decimals + 2)) / Math.pow(10, decimals) + suffix
            };
        });
})(angular);
