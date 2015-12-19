(function () {
    angular
        .module('quartz.components')
        .factory('snippet', snippet);

    /*@ngInject*/
    function snippet(config, $q, $filter) {
        function randomString(length) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

            if (!length) {
                length = Math.floor(Math.random() * chars.length);
            }

            var str = '';
            for (var i = 0; i < length; i++) {
                str += chars[Math.floor(Math.random() * chars.length)];
            }
            return str;
        }

        function replaceParamsInString(string, params) {
            for (var param in params) {
                if (params.hasOwnProperty(param)) string = string.replace(eval("/\\" + param + "/g"), params[param]);
            }
            return string
        }

        function replaceParamsInObj(obj, params) {
            var objString = JSON.stringify(obj);
            objString = replaceParamsInString(objString, params);

            var replacedObj = JSON.parse(objString);

            for (var key in obj) {
                if (obj.hasOwnProperty(key) && (typeof obj[key] === 'function')) {
                    var paramReplacedKey = replaceParamsInString(key, params);
                    replacedObj[paramReplacedKey] = obj[key]
                }
            }

            return replacedObj
        }

        function evalAssignment(lhsArr, rhsArr) {

            var lhsPath = "",
                lhs = lhsArr[0];

            if (Object.prototype.toString.call(rhsArr) === '[object Array]') {
                var rhs = rhsArr[0];
            }

            function toPathArr(strOrArr) {
                return (typeof strOrArr === 'string') ? strOrArr.split('.') : strOrArr
            }

            if (lhsArr[1] != undefined) {
                var lhsPathArr = toPathArr(lhsArr[1]);

                for (var i = 0; i < lhsPathArr.length; i++) {
                    lhsPath = lhsPath + "['" + lhsPathArr[i] + "']";
                    if ((i + 1 < lhsPathArr.length) && typeof lhs[lhsPathArr[i]] != "object") {
                        eval("lhsArr[0]" + lhsPath + "={}")
                    } else {
                        lhs = lhs[lhsPathArr[i]];
                    }
                }
            }
            if (!rhsArr) return eval("lhsArr[0]" + lhsPath);
            if (typeof rhsArr === 'function') {
                eval("rhs=rhsArr(lhsArr[0]" + lhsPath + ")");
            } else {
                if (rhsArr[1] != undefined) {
                    var rhsPathArr = toPathArr(rhsArr[1]);
                    for (var j = 0; j < rhsPathArr.length; j++) {
                        if (rhs[rhsPathArr[j]] === undefined) {
                            rhs = undefined;
                            break;
                        }
                        rhs = rhs[rhsPathArr[j]];
                    }
                }
            }

            eval("lhsArr[0]" + lhsPath + "=rhs");


            //console.log(lhsArr[0]); TODO:reomove debug code here
            //console.log("lhsArr[0]"+lhsPath+"="+rhs);
            //console.log(eval("lhsArr[0]"+lhsPath));

        }

        function cloneObject(obj) {
            // return angular.extend({},obj);
            if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj) return obj;
            var temp = obj.constructor(); // changed
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj['isActiveClone'] = null;
                    temp[key] = cloneObject(obj[key]);
                    delete obj['isActiveClone'];
                }
            }
            return temp;
        }

        /**
         *
         * @param {object} rawDataObj - data that need to be shaped to fit the filter model.
         * @param {object} filterModel - the structure of the returned value.
         * @param {object} [opt] - options.
         * @param {string} opt.paramHeader - if the key value inside the filter model start with this value, every corresponding key in raw data will be reserved.  (ex: $uid)
         * @param {string} opt.useModelHeader - if the key value inside the filter model start with this value, the model data will be kept at this pos and the first character of the key will be removed
         * @param {string} opt.escape - if the endpoint === opt.escape inside the filter model, this end point won't be processed (default='"#")
         */
        function filterRawData(rawDataObj, filterModel, opt) {
            opt = opt || {};
            if (typeof rawDataObj !== 'object' || typeof filterModel !== 'object') return rawDataObj === filterModel;
            var res = isArray(rawDataObj) ? [] : {},
                fail = false;
            iterate(rawDataObj, filterModel, res, 'none');
            function isParam(key, opt) {
                var paramHeader = '$';
                if (typeof opt.paramHeader === 'string') paramHeader = opt.paramHeader;
                return key.charAt(0) === paramHeader;
            }

            function iterate(rawDataObj, filterModel, target, prevKey) {
                var useModelHeader = opt.useModelHeader || '_',
                    escape = opt.escape || '#';

                if (useModelHeader && typeof filterModel === 'object' && typeof rawDataObj !== 'object') {
                    console.log(prevKey);
                    console.log("error: raw data doesn't fit the filter", 'the key of the raw data is ' + prevKey);
                    fail = true;
                    return
                }

                function goDeeperOrStop(param, filterKey) {
                    var nextLevelFilter = filterModel[param] || filterModel[filterKey];
                    if (nextLevelFilter === escape) return;
                    if (filterKey.charAt(0) === useModelHeader) {
                        target[filterKey.slice(1)] = filterModel[filterKey];
                    } else if (typeof nextLevelFilter !== 'object') {
                        if (rawDataObj[param] === undefined && (opt.removeUndefined === undefined || opt.removeUndefined)) return;
                        target[param] = angular.extend({}, rawDataObj[param])
                    } else {
                        target[param] = isArray(nextLevelFilter) ? [] : {};
                        iterate(rawDataObj[param], nextLevelFilter, target[param], filterKey)
                    }
                }

                if (typeof filterModel === 'object' && typeof rawDataObj === 'object') {
                    for (var filterKey in filterModel) {
                        if (isParam(filterKey, opt)) {
                            for (var param in rawDataObj) {
                                goDeeperOrStop(param, filterKey);
                            }
                            break;
                        } else {
                            goDeeperOrStop(filterKey, filterKey)
                        }
                    }
                }
            }

            return fail ? false : res
        }

        function createBatchUpdateValues(rawData, structure) {
            var structureClone;
            if (typeof structure !== 'object') {
                console.log('error: structure is not an object');
                return structure
            }
            structureClone = angular.extend({},structure);

            function iterate(obj) {
                for (var key in obj) {
                    if (key === 'valueArr') {
                        for (var i = 0; i < obj['valueArr'].length; i++) {
                            var keyStr = obj['valueArr'][i];
                            if (obj['value'] === undefined) obj['value'] = {};
                            if (typeof keyStr === 'string') obj['value'][keyStr] = keyStr;
                        }
                        delete obj['valueArr'];
                        continue;
                    }
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'string') {
                            if (rawData[obj[key]] === '') {
                                obj[key] = ''
                            } else {
                                obj[key] = rawData[obj[key]] || obj[key];
                            }
                        } else if (typeof obj[key] === 'object') {
                            iterate(obj[key])
                        }
                    }
                }
            }

            iterate(structureClone);
            return structureClone
        }

        function checkIfPropertyExist(arr) {
            var obj = arr[0],
                pathArr = arr[1],
                isExist = true;
            for (var i = 0; i < pathArr.length; i++) {
                if (obj[pathArr[i]] === undefined || obj[pathArr[i]] === null) {
                    isExist = false;
                    break;
                }
                obj = obj[pathArr[i]]
            }
            return isExist
        }

        function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@')) || '');
        }

        function ucfirst(str) {
            // inspired by: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        }

        function DelayExec(delay) {
            this.delay = delay || 1000;
        }

        DelayExec.prototype = {
            reset: function (onComplete, customDelay) {
                var that = this;
                if (this.timeout != undefined) clearTimeout(this.timeout);
                this.timeout = setTimeout(function () {
                    onComplete.apply(null);
                    that.timeout = undefined;
                }, customDelay || this.delay);
                this.onComplete = onComplete;
            }
        };

        function DelayedFilter(scope, source, target, filter, isReverse, delayedTime) {
            var delay = new DelayExec(delayedTime || 1000),
                that = this;

            this.refresh = function () {
                delay.reset(function () {
                    scope[filter] = scope[filter] ? scope[filter] : {};
                    scope[target] = $filter('consecutive')(scope[source], scope[filter], isReverse);
                    scope.$digest();
                })
            };

            scope.$watch(filter, function () {
                that.refresh();
            });
            scope.$watch(source, function () {
                that.refresh();
            });
        }

        function isObjEmpty(obj) {
            return !Object.getOwnPropertyNames(obj).length > 0
        }


        return {
            DelayExec: DelayExec,
            DelayedFilter: DelayedFilter,
            cloneObject: cloneObject,
            evalAssignment: evalAssignment,
            checkIfPropertyExist: checkIfPropertyExist,
            replaceParamsInObj: replaceParamsInObj,
            replaceParamsInString: replaceParamsInString,
            createBatchUpdateValues: createBatchUpdateValues,
            filterRawData: filterRawData,
            firstPartOfEmail: firstPartOfEmail,
            ucfirst: ucfirst,
            randomString: randomString,
            isObjEmpty: isObjEmpty
        }
    }
})();

