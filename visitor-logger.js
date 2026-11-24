/* ═══ visitor-logger · тихий учёт визитов квеста ═══ */
'use strict';
(function(){
  var KEY='hu_visits', SID='vlog_sid', IPK='vlog_ip', MAX=400, PERIOD=5000;
  var sid=(function(){
    try{
      var s=sessionStorage.getItem(SID);
      if(!s){
        s=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
        sessionStorage.setItem(SID,s);
      }
      return s;
    }catch(e){ return 'n/a'; }
  })();
  function safe(fn){ try{ return fn(); }catch(e){ return null; } }
  function getVisits(){ return safe(function(){ return JSON.parse(localStorage.getItem(KEY)||'[]'); })||[]; }
  function setVisits(list){ safe(function(){ localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); }); }
  function flagsCount(){ return (safe(function(){ return JSON.parse(localStorage.getItem('hu_flags')||'[]'); })||[]).length; }
  function accessOn(){ return safe(function(){ return localStorage.getItem('hu_access')==='1'; })||false; }
  function section(){ return safe(function(){ return localStorage.getItem('hu_section'); })||'брифинг'; }
  function cachedIp(){ return safe(function(){ return localStorage.getItem(IPK); })||'…'; }

  var index=-1;
  function touch(final){
    var list=getVisits();
    if(index<0){
      for(var i=0;i<list.length;i++){ if(list[i].sid===sid){ index=i; break; } }
    }
    var r={
      sid: sid,
      ts: Date.now(),
      ip: cachedIp(),
      page: safe(function(){ return location.pathname; })||'/',
      ref: safe(function(){ return document.referrer; })||'прямой',
      screen: safe(function(){ return screen.width+'×'+screen.height; })||'—',
      win: safe(function(){ return window.innerWidth+'×'+window.innerHeight; })||'—',
      tz: safe(function(){ return Intl.DateTimeFormat().resolvedOptions().timeZone; })||'—',
      lang: navigator.language||'—',
      plat: navigator.platform||'—',
      ua: (navigator.userAgent||'—').slice(0,64),
      flags: flagsCount(),
      access: accessOn(),
      section: section(),
      dwell: 0
    };
    if(index>=0){
      r.ts=list[index].ts;
      r.ip=list[index].ip||r.ip;
      r.dwell=Math.floor((Date.now()-r.ts)/1000);
      list[index]=r;
    }else{
      list.push(r);
      index=list.length-1;
    }
    setVisits(list);
  }

  touch(false);
  setInterval(function(){ touch(false); }, PERIOD);
  window.addEventListener('beforeunload', function(){ touch(true); });

  /* ip — один запрос на браузер, кэшируется */
  if(cachedIp()==='…'){
    try{
      fetch('https://api.ipify.org?format=json')
        .then(function(r){ return r.json(); })
        .then(function(d){
          if(d && d.ip){
            safe(function(){ localStorage.setItem(IPK, d.ip); });
            touch(false);
          }
        })
        .catch(function(){});
    }catch(e){}
  }
})();
