function isNumeric(e){return!Array.isArray(e)&&e-parseFloat(e)+1>=0}!function(){"use strict";function e(e){this.util=e,this.database=firebase.database(e.app)}window._core=window._core||{},window._core.Analysis=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e)}(),function(e){"use strict";function t(t){var r=t||c,o=r.appName||r.databaseURL;this.app=e.initializeApp(r,o),this.paths=r.paths||a,this.database=new window._core.DatabaseUtil(this),this.storage=new window._core.StorageUtil(this),this.elasticsearch=new window._core.ElasticSearch(this),this.usage=new window._core.Usage(this),this.usage.init(),this.auth=new window._core.Auth(this),this.loader=new window._core.Loader(this)}window._core=window._core||{},window._core.AppUtil=t,"function"==typeof define&&define.amd?define(function(){return t}):"undefined"!=typeof module&&null!=module&&(module.exports=t);var r="sites/detail/:siteName",o=r+"/users/detail/:userId",n="analysis/months/:month",i="analysis/weeks/:week",s="analysis/dates/:date",a={"order-analysis":r+"/orders/analysis/:path","order-analysis-month":r+"/orders/"+n,"order-analysis-week":r+"/orders/"+i,"order-analysis-date":r+"/orders/"+s,servers:"servers",queue:"queue","queue-tasks":"queue/tasks","queue-task":"queue/tasks/:id","query-request":"query/request","query-response":"query/response","query-specs":"query/specs","query-cache":"query/cache",templates:"templates/:type",template:"templates/:type/:id","my-sites":"users/detail/:uid/sites","user-path":"users/detail/:userId/:path",sites:"sites/:type",site:"sites/:type/:siteName","site-path":r+"/:path","site-config-preload":r+"/config/preload","site-config-payment":r+"/config/payment/:provider/:privacy",files:r+"/files","file-path":r+"/files/:path","file-root-path":r+"/files:path",user:o,"users-site":r+"/users/:type/:userId","site-users":r+"/users/:type","site-user":r+"/users/:type/:userId","root-user":"users/:type:/:userId/sites/:siteName",pages:r+"/pages/:type",page:r+"/pages/:type/:id","page-property":r+"/pages/:type/:id/:property",widgets:r+"/widgets/:type",widget:r+"/widgets/:type/:id",products:r+"/products/:type","product-categories":r+"/products/config/categories",product:r+"/products/:type/:id",articles:r+"/articles/:type","article-categories":r+"/articles/config/categories",article:r+"/articles/:type/:id",orders:r+"/orders/:type","order-payment":r+"/orders/:type/:orderId/payment","user-order-payment":o+"/orders/:type/:orderId/payment","user-orders":o+"/orders/:type","order-payment-allpay":r+"/orders/detail/:orderId/payment/allpay","orders-analysis":r+"/orders/analysis/:dateId",notifications:"users/detail/:uid/notifications"},c={apiKey:"AIzaSyAfxA30u_wPOkVCn727MJXZ4eFhg4raKdI",authDomain:"quartz.firebaseapp.com",databaseURL:"https://quartz.firebaseio.com",storageBucket:"project-3415547818359859659.appspot.com",appName:"quartz"};t.prototype.parseRefUrl=function(e,t,r){var o=e,n="object"==typeof t?t.params||t:{},i=Object.assign({},n),s=e.split("?"),a=(s[1]||"").split("&");if(""!==a[0]&&a.forEach(function(e){var t=e.split("=");i[t[0]]=t[1]}),this.paths[s[0]]){o=this.paths[s[0]];for(var c in i)o=o.replace(":"+c,i[c+""])}var u=1===o.split(".").length;return o=r&&u?o+".js":o},t.prototype.getSiteName=function(){var e=this;if(this.siteName)return Promise.resolve(this.siteName);if(-1!==location.href.search("localhost")||-1!==location.href.search("firebaseapp.com")){var t=/#!\/(.*?)\//,r=location.href.match(t);return Promise.resolve(r?r[1]:"default")}return new Promise(function(t){var r=location.href,o=r.split("//")[1].split("/")[0];e.database.queryRef("sites",{params:{type:"list"},orderBy:"Child: domain",equalTo:o,limitToFirst:1}).once("child_added",function(e){var o=e.val();t(o&&o.siteName?o.siteName:r.split("#!/")[1].split("/")[0])})})},t.prototype.setSiteName=function(e){this.siteName=e};var u={};t.prototype.getSitePreload=function(){var e=this;return new Promise(function(t,r){e.getSiteName().then(function(o){u[o]?t(u[o]):e.storage.getWithCache("site-config-preload?siteName="+o).then(function(e){t(e)}).catch(r)})})}}(firebase),function(){function e(e){this.util=e,this.database=firebase.database(e.app),this.auth=firebase.auth(e.app),this.currentUser=this.auth.currentUser}window._core=window._core||{},window._core.Auth=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e),e.prototype.loginWithProvider=function(e,t){var r,o="object"==typeof t?t:{};switch(e){case"google":r=new firebase.auth.GoogleAuthProvider;break;case"facebook":r=new firebase.auth.FacebookAuthProvider;break;case"twitter":r=new firebase.auth.TwitterAuthProvider;break;case"github":r=new firebase.auth.GithubAuthProvider}return o.popup===!1?this.auth.signInWithRedirect(r):this.auth.signInWithPopup(r)},e.prototype.checkIfAccountExist=function(){var e=this.currentUser,t=this;return new Promise(function(r,o){e||o("AUTH_NEEDED"),this.util.getSiteName().then(function(n){t.util.database.queryRef("site-user",{siteName:n,type:"detail",userId:e.uid}).child("createdTime").once("value",function(e){r(!!e.val())},function(e){o(e)})})})},e.prototype.getBasicUserData=function(){var e={createdTime:firebase.database.ServerValue.TIMESTAMP};return e},e.prototype.createAccount=function(){var e=this.currentUser,t=this,r=this.getBasicUserData(e);return new Promise(function(o,n){t.util.getSiteName().then(function(i){var s={siteName:i,userId:e.uid},a={};["site-user","root-user"].forEach(function(){["list","detail"].forEach(function(e){var o=t.util.parseRefUrl(o,Object.assign({type:e},s));a[o]=r})}),t.database.ref().update(a).then(o).catch(n)})})}}(),function(){"use strict";function e(e){this.util=e,this.database=firebase.database(e.app)}function t(e,t){var r=_core.encoding.decompress({compressed:t});return!(e&&e<r.cachedTime)}function r(e,t,r){var o=r||{},n=e.toString().split(".com/")[1];e.once("value",function(e){var r=_core.encoding.decompress(e.val());return r?(o.pre&&o.pre(e,r),void _core.syncTime().then(function(e){localStorage&&(r.cachedTime=e(),localStorage.setItem(n,_core.encoding.compress(r))),t(r)})):void t(null)})}function o(e){function t(e){return new Promise(function(t,r){var o=function(r){null!==r.val()&&(t(r.val()),e.off())};e.on("value",o,r)})}var r=[];return e.forEach(function(o,n){r[n]=t(e[n])}),Promise.all(r)}function n(e,t,r){var o=t||{};o.size=o.size||20,this.listRef=e,this.query=o,this.cache={},this.onData=r,this.result={total:0},this.cache={},this.maxCachedPage=0}function i(e,t,r){return"s"+t+"p"+e+"o"+r}window._core=window._core||{},window._core.DatabaseUtil=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e),e.prototype.queryRef=function(e,t){var r,o=t||{},n=this.database;if(!e)return n.ref().root;if(r=-1!==e.search("//")?n.refFromURL(this.util.parseRefUrl(e)):n.ref(this.util.parseRefUrl(e,o)),!o.orderBy)return r;var i="orderBy"+o.orderBy.split(":")[0];return r="orderByChild"===i?r[i](o.orderBy.split(":")[1]):r[i](),o.startAt&&(r=r.startAt(o.startAt)),o.endAt&&(r=r.endAt(o.endAt)),o.equalTo&&(r=r.equalTo(o.equalTo)),o.limitToFirst&&(r=r.limitToFirst(o.limitToFirst)),o.limitToLast&&(r=r.limitToLast(o.limitToLast)),r},e.prototype.getWithCache=function(e,o){var n="string"==typeof e?this.queryRef(e,o):e,i=n.toString().split(".com/")[1];return new Promise(function(e){if(localStorage&&localStorage.getItem(i)){var s=localStorage.getItem(i);n.child("editTime").once("value",function(i){t(i.val())?r(n,e,o):e(_core.encoding.decompress({compressed:s}))})}else r(n,e,o)})},e.prototype.request=function(e,t){var r=this;return new Promise(function(n,i){r.update(e.paths,e.data,e.params).then(function(){var e=[];t.forEach(function(t,o){e[o]=r.queryRef(t)}),o(e).then(n)}).catch(function(e){i(e)})})},e.prototype.update=function(e,t,r){var o=this,n={};return e.forEach(function(e,i){var s=o.util.parseRefUrl(e,{params:r||{}});n[s]={};for(var a in t){var c=t[a],u=a.split("@"),l=u[1]||"",d=u[0];(""===l||"all"===l||-1!==l.indexOf(i)||-1!==l.indexOf(e))&&(d?n[s][d]=c:n[s]=c)}}),this.queryRef().update(n)},e.prototype.Pagination=n,n.prototype.get=function(e,t,r){var o=this,n=this.query.preload||2,s=i(e,t,r);return o.cache&&o.cache[s]&&parseInt(e)+n<o.maxCachedPage?(o.result.hits=o.cache[s],Promise.resolve(o.cache[s])):(o.maxCachedPage=parseInt(e)+2*n,new Promise(function(n,i){o.listener(o.maxCachedPage,e,t,r,n,i)}))},n.prototype.listener=function(e,t,r,o,n,s){function a(e){var s=1,a=0,c=[];e.forEach(function(e){c.push(Object.assign({_key:e.key},e.val()))});var l=c;u.query.filter&&(l=u.query.filter(c,Object.assign({page:t,size:r,orderBy:o},u.query))),l.forEach(function(e){a++,a>s*parseInt(r)&&s++;var t=i(s,r,o);u.cache[t]=u.cache[t]||[],u.cache[t].push(e)});var d=u.cache[i(t,r,o)];u.result.total=l.length,u.result.hits=0===u.result.total?[]:d,n(d),u.onData&&u.onData({total:l.length,hits:d})}var c,u=this,l=e*parseInt(r),d=o.split("-")[1],p=d?d:o,f=d?"limitToLast":"limitToFirst";c=o?this.listRef.orderByChild(p.replace(".","/")):this.listRef.orderByKey();var h=""===this.query.equalTo?void 0:this.query.equalTo,m=""===this.query.startAt?void 0:this.query.startAt,g=""===this.query.endAt?void 0:this.query.endAt;void 0!==h?(isFinite(h)&&"boolean"!=typeof h&&(h=Number(h)),c=c.equalTo(h)):(isFinite(m)&&"boolean"!=typeof m&&(m=Number(m)),isFinite(g)&&"boolean"!=typeof g&&(g=Number(g)),c=void 0!==m?c.startAt(m):c,c=void 0!==g?c.endAt(g):c),"function"==typeof this.listenerCallback&&this.listRef.off("value",this.listenerCallback),this.listenerCallback=c[f](l).on("value",a,s)}}(),function(){"use strict";function e(){function e(e){return"?"==e.charAt(0)?!0:("/"==e.charAt(0)&&(e=e.substring(1)),!!l[e])}function t(e){var t="";for(var r in e){var o=e[r];for(var n in o){var i=o[n];if(null===i)return;var s="-"+i+" ",a=n+("all"===r)?"":"-"+r;switch(n){case"flex":"flex"===i&&(s=" ");break;case"flex-offset":case"flex-order":case"layout":case"layout-align":var c=i.x?"-"+i.x:"",u=i.y?"-"+i.y:"";s=c+u+" ";break;default:a=i?a+" ":"",s=""}t+=a+s}}return t}function r(r){r=r||{};var o,n=r.tag||"div",i=e(n),s=r.type;if(r.content){if(o=r.content,"text"===s)return o}else o="tag"===s?"<!--include-->":"";var a="";return r.id&&(a+='id="'+r.id+'" '),r.class&&(a+=' class="'+r.class+" "+t(r.layout)+'"'),r.style&&(a+=' style="'+r.style+'"'),r.attrs&&(a+=" "+r.attrs),r.ctrl&&(a+=' ng-controller="'+r.ctrl+" as "+(r.ctrlAs||"vm")+'"'),-1!==n.search("/")&&(i=!0),o="<--tag-- --custom-->"+(i?"":o+"<--endtag-->"),o=o.replace("--custom--",a),o=o.replace("--tag--",n),o=o.replace("--endtag--","/"+n)}function o(e){var t="";return e.forEach(function(e){var n=r(e);t+=n.replace("<!--include-->",e.divs?o(e.divs):"")}),t}function n(e,t){var n=Object.assign({},t||{});return n.content="<!--include-->",n.tag="md-content",n.style=n.style||"",r(n).replace("<!--include-->",o(e))}function i(e){return-1!==e.search("!--custom--")}function s(e){return-1!==e.search("!--tag--")&&-1!==e.search("!--endtag--")}var a=[null,0,5,10,15,20,25,30,33,35,40,45,50,55,60,65,66,70,75,80,85,90,95,100],c=["flex"].concat(a),u={breakpoints:["all","xs","gt-xs","sm","gt-sm","md","gt-md","lg","gt-lg","xl"],mediaQueries:["all","0~599","600~959","960~1279","1280~1919",">1920"],layout:{flex:c,"flex-offset":a,layout:[null,"row","column"],"layout-align":{x:[null,"start","center","end","space-around","space-between"],y:[null,"start","center","end","stretch"]}}},l={area:1,base:1,basefont:1,br:1,col:1,frame:1,hr:1,img:1,input:1,isindex:1,link:1,meta:1,param:1,embed:1};return{layoutOptions:u,compile:o,compileAll:n,compileElement:r,isAttrsConfigurable:i,isTagConfigurable:s}}return window._core=window._core||{},window._core.DesignService=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e),e}(),function(){"use strict";function e(e){this.util=e}function t(e,t,r,o){o.size=o.size||20,o.from=0,this.esClient=e,this.index=t,this.type=r,this.query=o,this.cache={}}function r(e){e=e.replace(".","_dot_");var t=e.split("-")[1],r=t?t:e,o={};return o[r]={order:t?"desc":"asc"},o}window._core=window._core||{},window._core.ElasticSearch=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e),e.prototype.query=function(e,t,r){var o=this,n=function(e,t,r,n,i){o.util.database.request({paths:[e],data:r},[t]).then(function(e){var t=_core.encoding.decompress(e[0]).result;n(t)},i)};return new Promise(function(i,s){var a=Object.assign({},{indexType:e+":"+t},r),c=_core.encoding.md5(a),u=o.util.paths,l=u["query-request"]+"/"+c,d=u["query-cache"]+"/"+e+t,p=d+"/"+c;o.util.storage.getWithCache(p).then(function(e){e?i(e.result||e):o.util.database.getWithCache(p).then(function(e){e?i(e.result||e):n(l,p,a,i,s)})})})},e.prototype.buildQuery=function(e,t,r){var o={cache:!0,reuse:200,body:{query:{filtered:{filter:{bool:{}}}}}};return e&&(o.body.query.filtered.filter.bool.must=e),t&&(o.body.query.filtered.filter.bool.must_not=t),r&&(o.body.query.filtered.query=r),o},e.prototype.pagination=function(e,r,o){return new t(this,e,r,o)},e.prototype.queryList=function(e){var r,o=e.type,n=e.index,i=isNaN(e.cate)?e.cate:null,s=isNaN(e.subCate)?e.subCate:null,a=e.tag||null,c=e.queryString||"",u=[],l=[{term:{show:!1}}];if("string"==typeof a){var d={};d["tags_dot_"+a]=1,u.push({term:d})}return parseInt(i)%1===0&&(u.push({term:{category:i}}),parseInt(s)%1===0&&u.push({term:{subcategory:s}})),"string"==typeof c&&""!==c.trim()&&(r={fields:"article"===o?["title","description"]:["itemName","description"],query:c,use_dis_max:!0}),new t(this,n,o,this.buildQuery(u,l,r))},t.prototype.get=function(e,t,o){var n=this,i=Object.assign({},this.query),s="p"+e+"l"+t+"o"+(o||"");return i.size=t,o&&(i.body.sort=r(o)),this.cache[s]||(this.cache[s]=new Promise(function(r,o){e=e||1,n.currentPage=e,n.query.from=parseInt(e-1)*parseInt(t),n.esClient.query(n.index,n.type,i).then(function(e){r(e)}).catch(function(e){o(e)})})),this.cache[s]},t.prototype.onReorder=function(e){this.query.body.sort=r(e),this.get(1,this.query.size,e)}}(),function(){function e(){}function t(e){if(Array.isArray(e))return e;var r=[],o={};for(var n in e)r.push(n);r.sort();for(var i=0;i<r.length;i++){var s=r[i];o[s]="object"==typeof e[s]&&null!==e[s]?t(e[s]):e[s]}return o}var r=new e;window._core=window._core||{},window._core.encoding=r,"function"==typeof define&&define.amd?define(function(){return r}):"undefined"!=typeof module&&null!=module&&(module.exports=r),e.prototype.LZString=function(){function e(e,t){if(!n[e]){n[e]={};for(var r=0;r<e.length;r++)n[e][e.charAt(r)]=r}return n[e][t]}var t=String.fromCharCode,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",n={},i={compressToBase64:function(e){if(null==e)return"";var t=i._compress(e,6,function(e){return r.charAt(e)});switch(t.length%4){default:case 0:return t;case 1:return t+"===";case 2:return t+"==";case 3:return t+"="}},decompressFromBase64:function(t){return null==t?"":""==t?null:i._decompress(t.length,32,function(o){return e(r,t.charAt(o))})},compressToUTF16:function(e){return null==e?"":i._compress(e,15,function(e){return t(e+32)})+" "},decompressFromUTF16:function(e){return null==e?"":""==e?null:i._decompress(e.length,16384,function(t){return e.charCodeAt(t)-32})},compressToUint8Array:function(e){for(var t=i.compress(e),r=new Uint8Array(2*t.length),o=0,n=t.length;n>o;o++){var s=t.charCodeAt(o);r[2*o]=s>>>8,r[2*o+1]=s%256}return r},decompressFromUint8Array:function(e){if(null===e||void 0===e)return i.decompress(e);for(var r=new Array(e.length/2),o=0,n=r.length;n>o;o++)r[o]=256*e[2*o]+e[2*o+1];var s=[];return r.forEach(function(e){s.push(t(e))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(e){return null==e?"":i._compress(e,6,function(e){return o.charAt(e)})},decompressFromEncodedURIComponent:function(t){return null==t?"":""==t?null:(t=t.replace(/ /g,"+"),i._decompress(t.length,32,function(r){return e(o,t.charAt(r))}))},compress:function(e){return i._compress(e,16,function(e){return t(e)})},_compress:function(e,t,r){if(null==e)return"";var o,n,i,s={},a={},c="",u="",l="",d=2,p=3,f=2,h=[],m=0,g=0;for(i=0;i<e.length;i+=1)if(c=e.charAt(i),Object.prototype.hasOwnProperty.call(s,c)||(s[c]=p++,a[c]=!0),u=l+c,Object.prototype.hasOwnProperty.call(s,u))l=u;else{if(Object.prototype.hasOwnProperty.call(a,l)){if(l.charCodeAt(0)<256){for(o=0;f>o;o++)m<<=1,g==t-1?(g=0,h.push(r(m)),m=0):g++;for(n=l.charCodeAt(0),o=0;8>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1}else{for(n=1,o=0;f>o;o++)m=m<<1|n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n=0;for(n=l.charCodeAt(0),o=0;16>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1}d--,0==d&&(d=Math.pow(2,f),f++),delete a[l]}else for(n=s[l],o=0;f>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1;d--,0==d&&(d=Math.pow(2,f),f++),s[u]=p++,l=String(c)}if(""!==l){if(Object.prototype.hasOwnProperty.call(a,l)){if(l.charCodeAt(0)<256){for(o=0;f>o;o++)m<<=1,g==t-1?(g=0,h.push(r(m)),m=0):g++;for(n=l.charCodeAt(0),o=0;8>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1}else{for(n=1,o=0;f>o;o++)m=m<<1|n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n=0;for(n=l.charCodeAt(0),o=0;16>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1}d--,0==d&&(d=Math.pow(2,f),f++),delete a[l]}else for(n=s[l],o=0;f>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1;d--,0==d&&(d=Math.pow(2,f),f++)}for(n=2,o=0;f>o;o++)m=m<<1|1&n,g==t-1?(g=0,h.push(r(m)),m=0):g++,n>>=1;for(;;){if(m<<=1,g==t-1){h.push(r(m));break}g++}return h.join("")},decompress:function(e){return null==e?"":""==e?null:i._decompress(e.length,32768,function(t){return e.charCodeAt(t)})},_decompress:function(e,r,o){var n,i,s,a,c,u,l,d,p=[],f=4,h=4,m=3,g="",y=[],v={val:o(0),position:r,index:1};for(i=0;3>i;i+=1)p[i]=i;for(a=0,u=Math.pow(2,2),l=1;l!=u;)c=v.val&v.position,v.position>>=1,0==v.position&&(v.position=r,v.val=o(v.index++)),a|=(c>0?1:0)*l,l<<=1;switch(n=a){case 0:for(a=0,u=Math.pow(2,8),l=1;l!=u;)c=v.val&v.position,v.position>>=1,0==v.position&&(v.position=r,v.val=o(v.index++)),a|=(c>0?1:0)*l,l<<=1;d=t(a);break;case 1:for(a=0,u=Math.pow(2,16),l=1;l!=u;)c=v.val&v.position,v.position>>=1,0==v.position&&(v.position=r,v.val=o(v.index++)),a|=(c>0?1:0)*l,l<<=1;d=t(a);break;case 2:return""}for(p[3]=d,s=d,y.push(d);;){if(v.index>e)return"";for(a=0,u=Math.pow(2,m),l=1;l!=u;)c=v.val&v.position,v.position>>=1,0==v.position&&(v.position=r,v.val=o(v.index++)),a|=(c>0?1:0)*l,l<<=1;switch(d=a){case 0:for(a=0,u=Math.pow(2,8),l=1;l!=u;)c=v.val&v.position,v.position>>=1,0==v.position&&(v.position=r,v.val=o(v.index++)),a|=(c>0?1:0)*l,l<<=1;p[h++]=t(a),d=h-1,f--;break;case 1:for(a=0,u=Math.pow(2,16),l=1;l!=u;)c=v.val&v.position,v.position>>=1,0==v.position&&(v.position=r,v.val=o(v.index++)),a|=(c>0?1:0)*l,l<<=1;p[h++]=t(a),d=h-1,f--;break;case 2:return y.join("")}if(0==f&&(f=Math.pow(2,m),m++),p[d])g=p[d];else{if(d!==h)return null;g=s+s.charAt(0)}y.push(g),p[h++]=s+g.charAt(0),f--,s=g,0==f&&(f=Math.pow(2,m),m++)}}};return i}(),e.prototype.MD5=function(){function e(e,t){var s=e[0],a=e[1],c=e[2],u=e[3];s=r(s,a,c,u,t[0],7,-680876936),u=r(u,s,a,c,t[1],12,-389564586),c=r(c,u,s,a,t[2],17,606105819),a=r(a,c,u,s,t[3],22,-1044525330),s=r(s,a,c,u,t[4],7,-176418897),u=r(u,s,a,c,t[5],12,1200080426),c=r(c,u,s,a,t[6],17,-1473231341),a=r(a,c,u,s,t[7],22,-45705983),s=r(s,a,c,u,t[8],7,1770035416),u=r(u,s,a,c,t[9],12,-1958414417),c=r(c,u,s,a,t[10],17,-42063),a=r(a,c,u,s,t[11],22,-1990404162),s=r(s,a,c,u,t[12],7,1804603682),u=r(u,s,a,c,t[13],12,-40341101),c=r(c,u,s,a,t[14],17,-1502002290),a=r(a,c,u,s,t[15],22,1236535329),s=o(s,a,c,u,t[1],5,-165796510),u=o(u,s,a,c,t[6],9,-1069501632),c=o(c,u,s,a,t[11],14,643717713),a=o(a,c,u,s,t[0],20,-373897302),s=o(s,a,c,u,t[5],5,-701558691),u=o(u,s,a,c,t[10],9,38016083),c=o(c,u,s,a,t[15],14,-660478335),a=o(a,c,u,s,t[4],20,-405537848),s=o(s,a,c,u,t[9],5,568446438),u=o(u,s,a,c,t[14],9,-1019803690),c=o(c,u,s,a,t[3],14,-187363961),a=o(a,c,u,s,t[8],20,1163531501),s=o(s,a,c,u,t[13],5,-1444681467),u=o(u,s,a,c,t[2],9,-51403784),c=o(c,u,s,a,t[7],14,1735328473),a=o(a,c,u,s,t[12],20,-1926607734),s=n(s,a,c,u,t[5],4,-378558),u=n(u,s,a,c,t[8],11,-2022574463),c=n(c,u,s,a,t[11],16,1839030562),a=n(a,c,u,s,t[14],23,-35309556),s=n(s,a,c,u,t[1],4,-1530992060),u=n(u,s,a,c,t[4],11,1272893353),c=n(c,u,s,a,t[7],16,-155497632),a=n(a,c,u,s,t[10],23,-1094730640),s=n(s,a,c,u,t[13],4,681279174),u=n(u,s,a,c,t[0],11,-358537222),c=n(c,u,s,a,t[3],16,-722521979),a=n(a,c,u,s,t[6],23,76029189),s=n(s,a,c,u,t[9],4,-640364487),u=n(u,s,a,c,t[12],11,-421815835),c=n(c,u,s,a,t[15],16,530742520),a=n(a,c,u,s,t[2],23,-995338651),s=i(s,a,c,u,t[0],6,-198630844),u=i(u,s,a,c,t[7],10,1126891415),c=i(c,u,s,a,t[14],15,-1416354905),a=i(a,c,u,s,t[5],21,-57434055),s=i(s,a,c,u,t[12],6,1700485571),u=i(u,s,a,c,t[3],10,-1894986606),c=i(c,u,s,a,t[10],15,-1051523),a=i(a,c,u,s,t[1],21,-2054922799),s=i(s,a,c,u,t[8],6,1873313359),u=i(u,s,a,c,t[15],10,-30611744),c=i(c,u,s,a,t[6],15,-1560198380),a=i(a,c,u,s,t[13],21,1309151649),s=i(s,a,c,u,t[4],6,-145523070),u=i(u,s,a,c,t[11],10,-1120210379),c=i(c,u,s,a,t[2],15,718787259),a=i(a,c,u,s,t[9],21,-343485551),e[0]=d(s,e[0]),e[1]=d(a,e[1]),e[2]=d(c,e[2]),e[3]=d(u,e[3])}function t(e,t,r,o,n,i){return t=d(d(t,e),d(o,i)),d(t<<n|t>>>32-n,r)}function r(e,r,o,n,i,s,a){return t(r&o|~r&n,e,r,i,s,a)}function o(e,r,o,n,i,s,a){return t(r&n|o&~n,e,r,i,s,a)}function n(e,r,o,n,i,s,a){return t(r^o^n,e,r,i,s,a)}function i(e,r,o,n,i,s,a){return t(o^(r|~n),e,r,i,s,a)}function s(t){var r,o=t.length,n=[1732584193,-271733879,-1732584194,271733878];for(r=64;r<=t.length;r+=64)e(n,a(t.substring(r-64,r)));t=t.substring(r-64);var i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(r=0;r<t.length;r++)i[r>>2]|=t.charCodeAt(r)<<(r%4<<3);if(i[r>>2]|=128<<(r%4<<3),r>55)for(e(n,i),r=0;16>r;r++)i[r]=0;return i[14]=8*o,e(n,i),n}function a(e){var t,r=[];for(t=0;64>t;t+=4)r[t>>2]=e.charCodeAt(t)+(e.charCodeAt(t+1)<<8)+(e.charCodeAt(t+2)<<16)+(e.charCodeAt(t+3)<<24);return r}function c(e){for(var t="",r=0;4>r;r++)t+=p[e>>8*r+4&15]+p[e>>8*r&15];return t}function u(e){for(var t=0;t<e.length;t++)e[t]=c(e[t]);return e.join("")}function l(e){return u(s(e))}function d(e,t){return e+t&4294967295}var p="0123456789abcdef".split("");return"5d41402abc4b2a76b9719d911017c592"!=l("hello")&&(d=function(e,t){var r=(65535&e)+(65535&t),o=(e>>16)+(t>>16)+(r>>16);return o<<16|65535&r}),l}(),e.prototype.compress=function(e){return this.LZString.compressToUTF16(JSON.stringify(e))},e.prototype.decompress=function(e){if(!e||!e.compressed)return e;var t,r;return e.compressed&&(t=JSON.parse(this.LZString.decompressFromUTF16(e.compressed))),"object"!=typeof t||Array.isArray(t)?r=t:(r=Object.assign({},e,t),delete r.compressed),r},e.prototype.md5=function(e){if("string"==typeof e)return this.MD5(e);var r=t(e);return this.MD5(JSON.stringify(r))}}(),function(){"use strict";function e(e){this.util=e}function t(e,t){return new Promise(function(o){var n=0,i=function(){n++,n<t.length?r(e,t[n],i):o()};t[0]&&r(e,t[0],i)})}function r(e,t,r){switch(e){case"style":var o=document.createElement("link");o.rel="stylesheet",o.type="text/css",o.href=t,o.onload=r,o.onerror=r,document.head.appendChild(o);break;case"script":var n=document.createElement("script");n.type="text/javascript",n.onload=r,n.onerror=r,document.body.appendChild(n),n.src=t}}window._core=window._core||{},window._core.Loader=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e);var o={ngMaterial:{v:"1.1.0",ngModule:"ngMaterial",css:"https://ajax.googleapis.com/ajax/libs/angular_material/:version/angular-material.min.css",js:"https://ajax.googleapis.com/ajax/libs/angular_material/:version/angular-material.min.js"}},n={ngMaterial:{js:[],css:[]},ng1:{js:[],css:[]}};e.prototype.loadPreset=function(e){var r=e||{},o=r.preset||"ng1",i=n[o],s=i.js.concat(["presets/"+o+"/scripts/main.js"]),a=i.css.concat(["presets/"+o+"/styles/vendor.css","presets/"+o+"/styles/main.css"]);t("script",s),t("style",a)},e.prototype.loadPackages=function(e,t,r){var n=t||{},i=n.version||o[e].v,s=[],a=document.createElement("script");a.type="text/javascript",n.js!==!1&&s.push(new Promise(function(t){a.onload=t,document.body.appendChild(a),a.src=o[e].js.replace(":version",i)}));var c=document.createElement("link");return c.rel="stylesheet",c.type="text/css",c.href=o[e].css.replace(":version",i),n.css!==!1&&s.push(new Promise(function(e){c.onload=e,document.head.appendChild(c)})),o[e].ngModule&&r.push(o[e].ngModule),Promise.all(s)},e.prototype.getExternalSourceUrls=function(e,t){var r=this,o=[],n=e||[];return n.forEach(function(e){if(-1!==e.search("//"))o.push(Promise.resolve(e));else{var n="/"===e.charAt(0)?"file-root-path?path="+e:"file-path?path="+e,i=r.util.storage.ref(n,{siteName:t||r.util.siteName}).getDownloadURL();o.push(i)}}),Promise.all(o)},e.prototype.getExternalSourceFromHtml=function(e){function t(e){var t="innerHtml"===e?">([\\s\\S]*)<":"<[\\s\\S]*"+e+"[\\s\\S]*?=[\\s\\S]*?['\"]([\\s\\S]*?)['\"][\\s\\S]*?>";return new RegExp(t)}var r={},o=e+"";return r.scriptRegEx=/<script[^>]*>[\s\S]*?<\/script>/gm,r.cssRegEx=new RegExp("<link[^>]*.css[^>]*>","gm"),r.scriptAttrs=["src","async","defer","type","innerHtml"],r.cssAttrs=["type","href","rel","media"],r.sources=[],["script","css"].forEach(function(n){r[n]=[],(e.match(r[n+"RegEx"])||[]).forEach(function(e,i){r[n][i]={},r[n+"Attrs"].forEach(function(o){r[n][i]["href"===o?"src":o]=(e.match(t(o))||[])[1]}),"script"===n&&(r[n][i].defer=!0),r.sources.push(r[n][i]),o=o.replace(e,"")})}),{script:r.script,css:r.css,sources:r.sources,html:o}}}(),window._core=window._core||{},Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),"function"!=typeof Object.assign&&(Object.assign=function(e){"use strict";if(null==e)throw new TypeError("Cannot convert undefined or null to object");e=Object(e);for(var t=1;t<arguments.length;t++){var r=arguments[t];if(null!=r)for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e}),window._core.isNumeric=isNumeric,function(){"use strict";var e={};window._core=window._core||{},window._core.siteUtil=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e),e.changeFavicon=function(e){var t=document.createElement("link"),r=document.getElementById("dynamic-favicon");t.id="dynamic-favicon",t.rel="shortcut icon",t.href=e,r&&document.head.removeChild(r),document.head.appendChild(t)},e.changeTitle=function(e){document.title=e},e.changeTitle=function(e){document.title=e}}(),function(){"use strict";function StorageUtil(e){this.util=e}function getRandomDownloadUrl(e){return Array.isArray(e)?e[Math.floor(Math.random()*e.length)]:e}function getId(e){return e.split(".js")[0]}function loadJsFromUrl(e,t){var r=document.createElement("script");r.type="text/javascript",r.src=e,t&&(r.id=t),document.body.appendChild(r)}function getFBS(e,t){window._core.usage.useBandwidth(e,"storage");var r=_core.encoding.decompress(e),o=getId(r.path);_core._storageResolves[o](r.value),delete _core._storageResolves[o],t&&t(r.value);var n=document.getElementById(o);n.outerHTML="",_core.syncTime().then(function(e){localStorage&&(r.cachedTime=e(),localStorage.setItem(o,_core.encoding.compress(r)))})}window._core=window._core||{},window._core.StorageUtil=StorageUtil,"function"==typeof define&&define.amd?define(function(){return StorageUtil}):"undefined"!=typeof module&&null!=module&&(module.exports=StorageUtil),StorageUtil.prototype.update=function(targetRef,value,onState,option){var self=this;return new Promise(function(resolve,reject){var _targetRef="string"==typeof targetRef?firebase.storage(self.util.app).ref(self.util.parseRefUrl(targetRef,option,!0)):targetRef,_path=_targetRef.fullPath,id=getId(_path),_onState="function"==typeof onState?onState:function(){},isCompress=!0,_value={path:_path,compressed:_core.encoding.compress({value:value})},_valStr=JSON.stringify(_value),dataString;try{eval("(function(){})("+_valStr+")")}catch(err){isCompress=!1}isCompress||(_valStr=JSON.stringify({path:_path,value:value})),dataString="_getFBS("+_valStr+");";var data=new Blob([dataString],{type:"text/javascript"});return storageReload[id]=!0,_targetRef.put(data).on("state_changed",_onState,reject,resolve)})},StorageUtil.prototype.getWithCache=function(e,t){var r="string"==typeof e?firebase.storage(this.util.app).ref(this.util.parseRefUrl(e,t,!0)):e,o=getId(r.fullPath);return storagePromises[o]&&!storageReload[o]?storagePromises[o]:(storagePromises[o]=new Promise(function(e,t){_core._storageResolves[o]=e,r.getMetadata().catch(function(r){"storage/object-not-found"===r.code?e(null):t(r)}).then(function(t){var r=getRandomDownloadUrl(t.downloadURLs),n=new Date(t.updated).getTime();if(localStorage&&localStorage.getItem(o)){var i=localStorage.getItem(o),s=_core.encoding.decompress({compressed:i});n<s.cachedTime?(e(s.value),console.log("from cache")):loadJsFromUrl(r,o)}else loadJsFromUrl(r,o)})}),storageReload[o]=!1,storagePromises[o])},StorageUtil.prototype.ref=function(e,t){var r=t||{};return firebase.storage(this.util.app).ref(this.util.parseRefUrl(e,r,!0))};var storagePromises={},storageReload={};_core._storageResolves={},window._getFBS=getFBS,window._getGetFBS=function(){return getFBS}}(),function(){"use strict";function e(){return r}window._core=window._core||{},window._core.syncTime=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e);var t,r=new Promise(function(e){var r,o=new XMLHttpRequest,n=(new Date).getTime();o.open("HEAD",document.location,!1),o.onreadystatechange=function(){if(4==o.readyState){var i=(new Date).getTime()-n,s=o.getResponseHeader("DATE");r=new Date(s),r.setMilliseconds(r.getMilliseconds()+i/2),t=r-new Date,e(function(){return t?(new Date).getTime()+t:void 0})}},o.send(null)})}(),function(){"use strict";function e(e){this.util=e,this.storageUsage=0,this.databaseUsage=0}window._core=window._core||{},window._core.Usage=e,"function"==typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&null!=module&&(module.exports=e),e.prototype.useBandwidth=function(e,t){this[t+"Usage"]+=window._core.isNumeric(e)?e:encodeURI(JSON.stringify(e)).split(/%..|./).length-1,console.log(t+" usage:",this[t+"Usage"])},e.prototype.init=function(){window._core.usage=this}}();