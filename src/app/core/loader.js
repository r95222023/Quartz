(function () {
    'use strict';
    window._core = window._core || {};
    window._core.Loader = Loader;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Loader;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = Loader
    }

    function Loader(util) {
        //constructor
        this.util = util;
    }


    Loader.prototype.getExternalSourceUrls = function (sources, siteName) {
        var self = this,
            promises = [];
        var _sourcesArr = sources || [];
        _sourcesArr.forEach(function (src, index) {
            if (src.search('//') !== -1) {
                promises.push(Promise.resolve(src));
            } else {
                var _path = src.charAt(0) === '/' ? 'file-root-path?path=' + src : 'file-path?path=' + src,
                    promise = self.util.storage.ref(_path, {siteName: siteName || self.util.siteName}).getDownloadURL();
                promises.push(promise);
            }
        });
        return Promise.all(promises);
    };

    Loader.prototype.getExternalSourceFromHtml = function (html) {
        var res = {},
            _html=html+'';

        res.scriptRegEx=/<script[^>]*>[\s\S]*?<\/script>/gm;
        res.cssRegEx= new RegExp('<link[^>]*.css[^>]*>', 'gm');

        res.scriptAttrs = ['src', 'async', 'defer', 'type','innerHTML'];
        res.cssAttrs = ['type', 'href', 'rel', 'media'];
        res.sources=[];

        ['script','css'].forEach(function(type){
            res[type]=[];
            (html.match(res[type+'RegEx'])||[]).forEach(function(matchStr,index){
                res[type][index]={};
                res[type+'Attrs'].forEach(function (attr) {
                    var val = (matchStr.match(getAttrRegEx(attr))||[])[1];
                    if(val) res[type][index][attr==='href'? 'src':attr]= val;
                });
                if(type==='script'){res[type][index].defer=true;}
                // var source=res[type][index].src||res[type][index].href;
                if(!res[type][index].src) return;
                res.sources.push(res[type][index]);
                _html=_html.replace(matchStr,'');
            })
        });



        return {script:res.script,css:res.css, sources:res.sources, html:_html};
    };
    function getAttrRegEx(attr) {
        var regExStr=(attr==='innerHTML')? '>([\\s\\S]*)<':'<[\\s\\S]*'+attr + '[\\s\\S]*?=[\\s\\S]*?[\'\"]([\\s\\S]*?)[\'\"][\\s\\S]*?>';

        return new RegExp(regExStr);
    }
})();
