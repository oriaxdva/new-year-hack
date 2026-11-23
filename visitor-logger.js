/* ═══ visitor-logger · тихий учёт визитов (всё в localStorage, без сервера) ═══ */
'use strict';
(function(){
  var KEY='bo_visits', MAX=500;
  function load(k,d){try{var r=localStorage.getItem(k);return r?JSON.parse(r):d;}catch(e){return d;}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  try{
    var arr=load(KEY,[]);
    arr.push({
      t:Date.now(),
      p:location.pathname,
      ref:(document.referrer||'').slice(0,200),
      w:window.innerWidth||0,
      h:window.innerHeight||0,
      tz:(Intl&&Intl.DateTimeFormat)?(Intl.DateTimeFormat().resolvedOptions().timeZone||'-'):'-'
    });
    if(arr.length>MAX) arr=arr.slice(arr.length-MAX);
    save(KEY,arr);
  }catch(e){}
})();
