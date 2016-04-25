(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('syncTime', syncTime);

    /* @ngInject */
    function syncTime($q) {
        var offset,
            ready = $q.defer();

        function getTime() {
            if (offset) return (new Date()).getTime() + offset;
        }

        function getDate() {
            var now = getTime();
            return (new Date(now));
        }

        getServerTime().then(function (now) {
            //the difference between two date object is the time difference in ms
            offset = now - (new Date());
            ready.resolve(getTime);
        });


        function getServerTime() {
            var def = $q.defer();
            // Set up our time object, synced by the HTTP DATE header
            // Fetch the page over JS to get just the headers
            console.log("syncing time");
            var r = new XMLHttpRequest();
            var start = (new Date).getTime(),
                systemtime;

            r.open('HEAD', document.location, false);
            r.onreadystatechange = function () {
                if (r.readyState != 4) {
                    return;
                }
                var latency = (new Date).getTime() - start;
                var timestring = r.getResponseHeader("DATE");

                // Set the time to the **slightly old** date sent from the
                // server, then adjust it to a good estimate of what the
                // server time is **right now**.
                systemtime = new Date(timestring);
                systemtime.setMilliseconds(systemtime.getMilliseconds() + (latency / 2));
                def.resolve(systemtime);
            };
            r.send(null);
            return def.promise;
        }

        return {
            getTime: getTime,
            // getServerTime: getServerTime,
            onReady: function () {
                return ready.promise;
            },
            getDate: getDate
        };
    }
})();


