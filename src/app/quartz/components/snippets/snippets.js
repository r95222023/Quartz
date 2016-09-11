(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('snippets', Snippets);

    /* @ngInject */
    function Snippets() {
        //credit to http://www.myersdaily.org/joseph/javascript/md5-text.html
        var MD5;
        (function () {
            function md5cycle(x, k) {
                var a = x[0], b = x[1], c = x[2], d = x[3];

                a = ff(a, b, c, d, k[0], 7, -680876936);
                d = ff(d, a, b, c, k[1], 12, -389564586);
                c = ff(c, d, a, b, k[2], 17, 606105819);
                b = ff(b, c, d, a, k[3], 22, -1044525330);
                a = ff(a, b, c, d, k[4], 7, -176418897);
                d = ff(d, a, b, c, k[5], 12, 1200080426);
                c = ff(c, d, a, b, k[6], 17, -1473231341);
                b = ff(b, c, d, a, k[7], 22, -45705983);
                a = ff(a, b, c, d, k[8], 7, 1770035416);
                d = ff(d, a, b, c, k[9], 12, -1958414417);
                c = ff(c, d, a, b, k[10], 17, -42063);
                b = ff(b, c, d, a, k[11], 22, -1990404162);
                a = ff(a, b, c, d, k[12], 7, 1804603682);
                d = ff(d, a, b, c, k[13], 12, -40341101);
                c = ff(c, d, a, b, k[14], 17, -1502002290);
                b = ff(b, c, d, a, k[15], 22, 1236535329);

                a = gg(a, b, c, d, k[1], 5, -165796510);
                d = gg(d, a, b, c, k[6], 9, -1069501632);
                c = gg(c, d, a, b, k[11], 14, 643717713);
                b = gg(b, c, d, a, k[0], 20, -373897302);
                a = gg(a, b, c, d, k[5], 5, -701558691);
                d = gg(d, a, b, c, k[10], 9, 38016083);
                c = gg(c, d, a, b, k[15], 14, -660478335);
                b = gg(b, c, d, a, k[4], 20, -405537848);
                a = gg(a, b, c, d, k[9], 5, 568446438);
                d = gg(d, a, b, c, k[14], 9, -1019803690);
                c = gg(c, d, a, b, k[3], 14, -187363961);
                b = gg(b, c, d, a, k[8], 20, 1163531501);
                a = gg(a, b, c, d, k[13], 5, -1444681467);
                d = gg(d, a, b, c, k[2], 9, -51403784);
                c = gg(c, d, a, b, k[7], 14, 1735328473);
                b = gg(b, c, d, a, k[12], 20, -1926607734);

                a = hh(a, b, c, d, k[5], 4, -378558);
                d = hh(d, a, b, c, k[8], 11, -2022574463);
                c = hh(c, d, a, b, k[11], 16, 1839030562);
                b = hh(b, c, d, a, k[14], 23, -35309556);
                a = hh(a, b, c, d, k[1], 4, -1530992060);
                d = hh(d, a, b, c, k[4], 11, 1272893353);
                c = hh(c, d, a, b, k[7], 16, -155497632);
                b = hh(b, c, d, a, k[10], 23, -1094730640);
                a = hh(a, b, c, d, k[13], 4, 681279174);
                d = hh(d, a, b, c, k[0], 11, -358537222);
                c = hh(c, d, a, b, k[3], 16, -722521979);
                b = hh(b, c, d, a, k[6], 23, 76029189);
                a = hh(a, b, c, d, k[9], 4, -640364487);
                d = hh(d, a, b, c, k[12], 11, -421815835);
                c = hh(c, d, a, b, k[15], 16, 530742520);
                b = hh(b, c, d, a, k[2], 23, -995338651);

                a = ii(a, b, c, d, k[0], 6, -198630844);
                d = ii(d, a, b, c, k[7], 10, 1126891415);
                c = ii(c, d, a, b, k[14], 15, -1416354905);
                b = ii(b, c, d, a, k[5], 21, -57434055);
                a = ii(a, b, c, d, k[12], 6, 1700485571);
                d = ii(d, a, b, c, k[3], 10, -1894986606);
                c = ii(c, d, a, b, k[10], 15, -1051523);
                b = ii(b, c, d, a, k[1], 21, -2054922799);
                a = ii(a, b, c, d, k[8], 6, 1873313359);
                d = ii(d, a, b, c, k[15], 10, -30611744);
                c = ii(c, d, a, b, k[6], 15, -1560198380);
                b = ii(b, c, d, a, k[13], 21, 1309151649);
                a = ii(a, b, c, d, k[4], 6, -145523070);
                d = ii(d, a, b, c, k[11], 10, -1120210379);
                c = ii(c, d, a, b, k[2], 15, 718787259);
                b = ii(b, c, d, a, k[9], 21, -343485551);

                x[0] = add32(a, x[0]);
                x[1] = add32(b, x[1]);
                x[2] = add32(c, x[2]);
                x[3] = add32(d, x[3]);

            }

            function cmn(q, a, b, x, s, t) {
                a = add32(add32(a, q), add32(x, t));
                return add32((a << s) | (a >>> (32 - s)), b);
            }

            function ff(a, b, c, d, x, s, t) {
                return cmn((b & c) | ((~b) & d), a, b, x, s, t);
            }

            function gg(a, b, c, d, x, s, t) {
                return cmn((b & d) | (c & (~d)), a, b, x, s, t);
            }

            function hh(a, b, c, d, x, s, t) {
                return cmn(b ^ c ^ d, a, b, x, s, t);
            }

            function ii(a, b, c, d, x, s, t) {
                return cmn(c ^ (b | (~d)), a, b, x, s, t);
            }

            function md51(s) {
                var txt = '';
                var n = s.length,
                    state = [1732584193, -271733879, -1732584194, 271733878], i;
                for (i = 64; i <= s.length; i += 64) {
                    md5cycle(state, md5blk(s.substring(i - 64, i)));
                }
                s = s.substring(i - 64);
                var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (i = 0; i < s.length; i++)
                    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
                tail[i >> 2] |= 0x80 << ((i % 4) << 3);
                if (i > 55) {
                    md5cycle(state, tail);
                    for (i = 0; i < 16; i++) tail[i] = 0;
                }
                tail[14] = n * 8;
                md5cycle(state, tail);
                return state;
            }

            function md5blk(s) { /* I figured global was faster.   */
                var md5blks = [], i;
                /* Andy King said do it this way. */
                for (i = 0; i < 64; i += 4) {
                    md5blks[i >> 2] = s.charCodeAt(i)
                        + (s.charCodeAt(i + 1) << 8)
                        + (s.charCodeAt(i + 2) << 16)
                        + (s.charCodeAt(i + 3) << 24);
                }
                return md5blks;
            }

            var hex_chr = '0123456789abcdef'.split('');

            function rhex(n) {
                var s = '', j = 0;
                for (; j < 4; j++)
                    s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
                        + hex_chr[(n >> (j * 8)) & 0x0F];
                return s;
            }

            function hex(x) {
                for (var i = 0; i < x.length; i++)
                    x[i] = rhex(x[i]);
                return x.join('');
            }

            function md5(s) {
                return hex(md51(s));
            }

            /* this function is much faster,
             so if possible we use it. Some IEs
             are the only ones I know of that
             need the idiotic second function,
             generated by an if clause.  */

            function add32(a, b) {
                return (a + b) & 0xFFFFFFFF;
            }

            if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
                add32 = function (x, y) {
                    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                    return (msw << 16) | (lsw & 0xFFFF);
                }
            }
            MD5 = md5;
        })();

        var TEA;
        (function () {
            /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
            /*  Block TEA (xxtea) Tiny Encryption Algorithm         (c) Chris Veness 2002-2014 / MIT Licence  */
            /*   - www.movable-type.co.uk/scripts/tea-block.html                                              */
            /*                                                                                                */
            /*  Algorithm: David Wheeler & Roger Needham, Cambridge University Computer Lab                   */
            /*             http://www.cl.cam.ac.uk/ftp/papers/djw-rmn/djw-rmn-tea.html (1994)                 */
            /*             http://www.cl.cam.ac.uk/ftp/users/djw3/xtea.ps (1997)                              */
            /*             http://www.cl.cam.ac.uk/ftp/users/djw3/xxtea.ps (1998)                             */
            /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

            /* jshint node:true */
            /* global define, escape, unescape, btoa, atob */


            /**
             * Tiny Encryption Algorithm
             *
             * @namespace
             */
            var Tea = {};


            /**
             * Encrypts text using Corrected Block TEA (xxtea) algorithm.
             *
             * @param   {string} plaintext - String to be encrypted (multi-byte safe).
             * @param   {string} password - Password to be used for encryption (1st 16 chars).
             * @returns {string} Encrypted text (encoded as base64).
             */
            Tea.encrypt = function (plaintext, password) {
                plaintext = String(plaintext);
                password = String(password);

                if (plaintext.length == 0) return ('');  // nothing to encrypt

                //  v is n-word data vector; converted to array of longs from UTF-8 string
                var v = Tea.strToLongs(plaintext.utf8Encode());
                //  k is 4-word key; simply convert first 16 chars of password as key
                var k = Tea.strToLongs(password.utf8Encode().slice(0, 16));
                var n = v.length;

                v = Tea.encode(v, k);

                // convert array of longs to string
                var ciphertext = Tea.longsToStr(v);

                // convert binary string to base64 ascii for safe transport
                return ciphertext.base64Encode();
            };


            /**
             * Decrypts text using Corrected Block TEA (xxtea) algorithm.
             *
             * @param   {string} ciphertext - String to be decrypted.
             * @param   {string} password - Password to be used for decryption (1st 16 chars).
             * @returns {string} Decrypted text.
             */
            Tea.decrypt = function (ciphertext, password) {
                ciphertext = String(ciphertext);
                password = String(password);

                if (ciphertext.length == 0) return ('');

                //  v is n-word data vector; converted to array of longs from base64 string
                var v = Tea.strToLongs(ciphertext.base64Decode());
                //  k is 4-word key; simply convert first 16 chars of password as key
                var k = Tea.strToLongs(password.utf8Encode().slice(0, 16));
                var n = v.length;

                v = Tea.decode(v, k);

                var plaintext = Tea.longsToStr(v);

                // strip trailing null chars resulting from filling 4-char blocks:
                plaintext = plaintext.replace(/\0+$/, '');

                return plaintext.utf8Decode();
            };


            /**
             * XXTEA: encodes array of unsigned 32-bit integers using 128-bit key.
             *
             * @param   {number[]} v - Data vector.
             * @param   {number[]} k - Key.
             * @returns {number[]} Encoded vector.
             */
            Tea.encode = function (v, k) {
                if (v.length < 2) v[1] = 0;  // algorithm doesn't work for n<2 so fudge by adding a null
                var n = v.length;

                var z = v[n - 1], y = v[0], delta = 0x9E3779B9;
                var mx, e, q = Math.floor(6 + 52 / n), sum = 0;

                while (q-- > 0) {  // 6 + 52/n operations gives between 6 & 32 mixes on each word
                    sum += delta;
                    e = sum >>> 2 & 3;
                    for (var p = 0; p < n; p++) {
                        y = v[(p + 1) % n];
                        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
                        z = v[p] += mx;
                    }
                }

                return v;
            };


            /**
             * XXTEA: decodes array of unsigned 32-bit integers using 128-bit key.
             *
             * @param   {number[]} v - Data vector.
             * @param   {number[]} k - Key.
             * @returns {number[]} Decoded vector.
             */
            Tea.decode = function (v, k) {
                var n = v.length;

                var z = v[n - 1], y = v[0], delta = 0x9E3779B9;
                var mx, e, q = Math.floor(6 + 52 / n), sum = q * delta;

                while (sum != 0) {
                    e = sum >>> 2 & 3;
                    for (var p = n - 1; p >= 0; p--) {
                        z = v[p > 0 ? p - 1 : n - 1];
                        mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
                        y = v[p] -= mx;
                    }
                    sum -= delta;
                }

                return v;
            };


            /**
             * Converts string to array of longs (each containing 4 chars).
             * @private
             */
            Tea.strToLongs = function (s) {
                // note chars must be within ISO-8859-1 (Unicode code-point <= U+00FF) to fit 4/long
                var l = new Array(Math.ceil(s.length / 4));
                for (var i = 0; i < l.length; i++) {
                    // note little-endian encoding - endianness is irrelevant as long as it matches longsToStr()
                    l[i] = s.charCodeAt(i * 4) + (s.charCodeAt(i * 4 + 1) << 8) +
                        (s.charCodeAt(i * 4 + 2) << 16) + (s.charCodeAt(i * 4 + 3) << 24);
                }
                return l; // note running off the end of the string generates nulls since bitwise operators
            };            // treat NaN as 0


            /**
             * Converts array of longs to string.
             * @private
             */
            Tea.longsToStr = function (l) {
                var a = new Array(l.length);
                for (var i = 0; i < l.length; i++) {
                    a[i] = String.fromCharCode(l[i] & 0xFF, l[i] >>> 8 & 0xFF, l[i] >>> 16 & 0xFF, l[i] >>> 24 & 0xFF);
                }
                return a.join('');  // use Array.join() for better performance than repeated string appends
            };


            /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


            /** Extend String object with method to encode multi-byte string to utf8
             *  - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html */
            if (typeof String.prototype.utf8Encode == 'undefined') {
                String.prototype.utf8Encode = function () {
                    return unescape(encodeURIComponent(this));
                };
            }

            /** Extend String object with method to decode utf8 string to multi-byte */
            if (typeof String.prototype.utf8Decode == 'undefined') {
                String.prototype.utf8Decode = function () {
                    try {
                        return decodeURIComponent(escape(this));
                    } catch (e) {
                        return this; // invalid UTF-8? return as-is
                    }
                };
            }


            /** Extend String object with method to encode base64
             *  - developer.mozilla.org/en-US/docs/Web/API/window.btoa, nodejs.org/api/buffer.html
             *  note: if btoa()/atob() are not available (eg IE9-), try github.com/davidchambers/Base64.js */
            if (typeof String.prototype.base64Encode == 'undefined') {
                String.prototype.base64Encode = function () {
                    if (typeof btoa != 'undefined') return btoa(this); // browser
                    if (typeof Buffer != 'undefined') return new Buffer(this, 'utf8').toString('base64'); // Node.js
                    throw new Error('No Base64 Encode');
                };
            }

            /** Extend String object with method to decode base64 */
            if (typeof String.prototype.base64Decode == 'undefined') {
                String.prototype.base64Decode = function () {
                    if (typeof atob != 'undefined') return atob(this); // browser
                    if (typeof Buffer != 'undefined') return new Buffer(this, 'base64').toString('utf8'); // Node.js
                    throw new Error('No Base64 Decode');
                };
            }
            TEA = Tea;
        })();

        ///////////
        function sortObjectByPropery(obj) {
            var keys = [],
                sortedObj = {};

            angular.forEach(obj, function (value, key) {
                keys.push(key);
            });

            keys.sort();

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (angular.isObject(obj[key])) {
                    sortedObj[key] = sortObjectByPropery(obj[key]);
                } else {
                    sortedObj[key] = obj[key];
                }
            }
            return sortedObj;
        }

        function md5Obj(searchObj) {
            var sorted = sortObjectByPropery(searchObj);
            return MD5(JSON.stringify(sorted));
        }

        function removeItemFromArray(arr, item) {
            for (var i = arr.length; i--;) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                }
            }
        }

        function getFirebaseArrayData(data) {
            function toPosInt(key) {
                var n = Number(key);
                return !n % 1 === 0 && n > -1 ? n : false;
            }

            function iterate(data) {
                var arr = [],
                    obj = {},
                    isArray = true;
                angular.forEach(data, function (value, key) {
                    var n = toPosInt(key);
                    if (n !== false) {
                        arr[key] = angular.isObject(value) ? iterate(value) : value;
                    } else {
                        isArray = false;
                        return false;
                    }
                });
                if (isArray === false) angular.forEach(data, function (value, key) {
                    obj[key] = angular.isObject(value) ? iterate(value) : value;
                });
                return isArray ? arr : obj;
            }

            return iterate(data);
        }

        function debounce(func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }

        function rectifyUpdateData(data) {
            var datastring = JSON.stringify(data).replace('undefined', 'null');
            return JSON.parse(datastring);
        }

        function to2dig(num) {
            return num < 10 ? ('0' + num) : num;
        }

        function saveData(data, fileName, type) {
            var a = document.createElement("a"),
                _data=data;
            document.body.appendChild(a);
            a.style = "display: none";
            if(fileName.split('.json')[1]==='') {
                _data = JSON.stringify(data);
            }
            var blob = new Blob([_data], {type: type||"text/plain"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        }

        function downloadURI(uri, name) {
            var link = document.createElement("a");
            if(name) link.download = name;
            link.href = uri;
            link.click();
        }

        //http://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
        function toDataUrl(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
                var reader = new FileReader();
                reader.onloadend = function() {
                    callback(reader.result);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.send();
        }

        function iterateFileTree(table, onNode, path) {
            var _path = path||'';
            if (table&&table['_content']) {
                angular.forEach(table['_content'], function (val,key) {
                    if(key!=='__created') iterateFileTree(table[key]||val, onNode, _path+'/'+val.name);
                })
            } else {
                onNode(table, _path)
            }
        }

        return {
            debounce: debounce,
            md5: MD5,
            md5Obj: md5Obj,
            Tea: TEA,
            to2dig: to2dig,
            sortObjectByPropery: sortObjectByPropery,
            saveData: saveData,
            downloadURI:downloadURI,
            toDataUrl:toDataUrl,
            getFirebaseArrayData: getFirebaseArrayData,
            removeItemFromArray: removeItemFromArray,
            rectifyUpdateData: rectifyUpdateData,
            iterateFileTree:iterateFileTree
        };
    }
})();
