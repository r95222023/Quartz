(function () {
    'use strict';

    angular
        .module('quartz.components')
        .service('lzString', lzString);

    /* @ngInject */
    function lzString() {
        this.decompress = decompress;
        this.compress = compress;
        function decompress(val) {
            if (!val) return val;

            var decompressed, res;
            if (val.compressed) {
                decompressed = JSON.parse(LZString.decompressFromUTF16(val.compressed));
            }


            if(angular.isObject(decompressed)&&!angular.isArray(decompressed)){
                res = angular.extend({}, val, decompressed);
                delete res.compressed;
            } else {
                res = decompressed;
            }

            return res;
        }

        function compress(data) {
            return LZString.compressToUTF16(JSON.stringify(data));
        }
    }
})();
