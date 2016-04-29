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
            if(!val) return val;

            var decompressed;
            if (val.compressed) {
                decompressed = JSON.parse(LZString.decompressFromUTF16(val.compressed));
            }

            
            var res = angular.extend({}, val, decompressed);
            delete res.compressed;
            return res;
        }

        function compress(data) {
            return LZString.compressToUTF16(JSON.stringify(data));
        }
    }
})();
