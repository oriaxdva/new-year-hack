/* ═══ BLACK OPS · терминал и панель · в коде нет ни ключа, ни двери ═══ */
'use strict';
(function(){
  /* ключ оператора хранится только как SHA-256 */
  var TERMINAL_HASH='bd03bee1b1f899071e7c6048d721c129eb141194fff23aec37524a1f6aa9eea5';
  var PENDING_TTL=10*60*1000;
  var IDLE_LIMIT=15*60*1000;
  var LOCK_WINDOW=15*60*1000;
  var LOCK_TIME=5*60*1000;
  var MAX_FAILS=6;

  /* без приглашения с двери — декоя-404 остаётся как есть */
  var pending=0;
  try{ pending=parseInt(sessionStorage.getItem('bo_pending')||'0',10); }catch(e){}
  if(!pending || Date.now()-pending>PENDING_TTL) return;
  try{ sessionStorage.removeItem('bo_pending'); }catch(e){}

  function sha(text){
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      .then(function(buf){
        return Array.prototype.map.call(new Uint8Array(buf), function(x){
          return ('0'+x.toString(16)).slice(-2);
        }).join('');
      });
  }
  function now(){ return Date.now(); }
  function z(n){ return String(n).padStart(2,'0'); }
  function fmtTime(ts){ var d=new Date(ts); return z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds()); }
  function fmtDate(ts){ var d=new Date(ts); return z(d.getDate())+'.'+z(d.getMonth()+1)+'.'+d.getFullYear(); }
  function fmtFull(ts){ return fmtDate(ts)+' '+fmtTime(ts); }
  function fmtDur(sec){
    if(sec<60) return sec+' сек';
    if(sec<3600) return Math.floor(sec/60)+' мин '+(sec%60)+' сек';
    return Math.floor(sec/3600)+' ч '+Math.floor((sec%3600)/60)+' мин';
  }
  function el(tag, cls, text){
    var d=document.createElement(tag);
    if(cls) d.className=cls;
    if(text!=null) d.textContent=text;
    return d;
  }

  /* ── журналы ── */
  function getVisits(){
    try{ return JSON.parse(localStorage.getItem('hu_visits')||'[]')||[]; }catch(e){ return []; }
  }
  function getAttempts(){
    try{ return JSON.parse(localStorage.getItem('bo_attempts')||'[]')||[]; }catch(e){ return []; }
  }
  function saveAttempts(list){
    try{ localStorage.setItem('bo_attempts', JSON.stringify(list.slice(-200))); }catch(e){}
  }
  function terminalFails(){
    return getAttempts().filter(function(x){ return x.kind==='terminal' && now()-x.ts<LOCK_WINDOW; });
  }
  function lockedUntil(){
    var f=terminalFails();
    if(f.length<MAX_FAILS) return 0;
    return f[f.length-1].ts+LOCK_TIME;
  }

  /* ── каркас CRT ── */
  function buildShell(){
    /* ── фикс: убираем прежний каркас и снег, чтобы не плодить дубли ── */
    var oldShell=document.getElementById('bo-shell');
    if(oldShell && oldShell.parentNode) oldShell.parentNode.removeChild(oldShell);
    var oldSnow=document.querySelector('.snow-layer');
    if(oldSnow && oldSnow.parentNode) oldSnow.parentNode.removeChild(oldSnow);

    var decoy=document.querySelector('.decoy-404');
    if(decoy && decoy.parentNode) decoy.parentNode.removeChild(decoy);
    document.body.classList.add('bo-crt');

    var snow=el('div','snow-layer');
    var glyphs='❄❅❆✦';
    for(var i=0;i<55;i++){
      var s=el('span');
      s.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
      s.style.left=(Math.random()*100)+'%';
      s.style.fontSize=(10+Math.random()*14)+'px';
      s.style.opacity=(0.25+Math.random()*0.5).toFixed(2);
      s.style.animationDuration=(9+Math.random()*14)+'s';
      s.style.animationDelay=(-Math.random()*20)+'s';
      snow.appendChild(s);
    }
    document.body.appendChild(snow);

    var frame=el('div','crt-frame'); frame.id='bo-shell';
    var garland=el('div','garland');
    var colors=['#7ee08c','#e06a5a','#e8b84a','#7ab8e0'];
    for(var j=0;j<22;j++){
      var b=el('span','bulb');
      var c=colors[j%colors.length];
      b.style.background=c; b.style.color=c;
      b.style.animationDelay=(Math.random()*2.4).toFixed(2)+'s';
      b.style.animationDuration=(1.8+Math.random()*2).toFixed(2)+'s';
      garland.appendChild(b);
    }
    frame.appendChild(garland);

    var header=el('header','crt-header');
    var top=el('div','header-top');
    var logo=el('div','logo');
    logo.appendChild(document.createTextNode('HU::2027 '));
    logo.appendChild(el('span','logo-accent','· BLACK OPS'));
    var right=el('div','header-right');
    var clock=el('span','clock','00:00:00'); clock.id='bo-clock';
    var out=el('button','header-btn','ЗАКРЫТЬ СЕССИЮ'); out.id='bo-logout'; out.type='button';
    right.appendChild(clock); right.appendChild(out);
    top.appendChild(logo); top.appendChild(right);
    header.appendChild(top);
    var nav=el('nav','crt-nav'); nav.id='bo-nav';
    [['bo-tab-visits','ВИЗИТЫ'],['bo-tab-attempts','ПОПЫТКИ'],['bo-tab-system','СИСТЕМА']].forEach(function(p){
      var b=el('button'); b.id=p[0]; b.type='button'; b.textContent=p[1];
      b.setAttribute('data-target', p[0].replace('tab','sec'));
      nav.appendChild(b);
    });
    header.appendChild(nav);
    frame.appendChild(header);

    var main=el('main','crt-main'); main.id='bo-main';
    frame.appendChild(main);
    frame.appendChild(el('div','scanlines'));
    frame.appendChild(el('div','tv-glass'));
    frame.appendChild(el('footer','crt-footer','🎄 🎄 🎄 BLACK OPS · закрытый контур · доступ только у владельца'));
    var ticker=el('div','bo-ticker'); ticker.id='bo-ticker';
    frame.appendChild(ticker);
    document.body.appendChild(frame);
  }

  /* ── терминал ── */
  function buildTerminal(){
    buildShell();
    var main=document.getElementById('bo-main');
    var term=el('section','crt-section active terminal-box'); term.id='bo-terminal';
    term.appendChild(el('h2','crt-title','BLACK OPS · ТЕРМИНАЛ'));
    term.appendChild(el('p','crt-text','введите ключ оператора. доступ одноразовый, попытки фиксируются.'));
    var line=el('div','terminal-line');
    line.appendChild(el('span','terminal-prompt','black-ops$'));
    var input=document.createElement('input');
    input.id='bo-key'; input.type='password'; input.autocomplete='off'; input.spellcheck=false;
    line.appendChild(input);
    term.appendChild(line);
    var err=el('p','terminal-err',''); err.id='bo-term-err';
    term.appendChild(err);
    main.appendChild(term);

    function showErr(t){ document.getElementById('bo-term-err').textContent=t; }
    function recordFail(v){
      var list=getAttempts();
      list.push({ ts:now(), kind:'terminal', ok:false, len:v.length });
      saveAttempts(list);
      var fails=terminalFails().length;
      document.body.classList.add('bo-glitch');
      setTimeout(function(){ document.body.classList.remove('bo-glitch'); }, 450);
      var lock=lockedUntil();
      if(lock && now()<lock){
        showErr('✘ превышен лимит попыток. ЗАМОК на 5 минут.');
      }else{
        showErr('✘ ключ отклонён. попытка зафиксирована. осталось: '+(MAX_FAILS-fails));
      }
      input.value='';
    }
    function submit(){
      if(!window.crypto || !window.crypto.subtle){ showErr('✘ нужен защищённый контекст (https). вход невозможен.'); return; }
      var lock=lockedUntil();
      if(lock && now()<lock){
        showErr('✘ ЗАМОК. до разблокировки: '+fmtDur(Math.ceil((lock-now())/1000)));
        input.value='';
        return;
      }
      var v=(input.value||'').trim();
      if(!v) return;
      sha(v).then(function(h){
        if(h===TERMINAL_HASH){
          saveAttempts(getAttempts().filter(function(x){ return x.kind!=='terminal'; }));
          buildPanel();
        }else{
          recordFail(v);
        }
      }).catch(function(){ showErr('✘ сбой шифрования.'); });
    }
    input.addEventListener('keydown', function(e){ if(e.key==='Enter') submit(); });
    setTimeout(function(){ input.focus(); }, 50);
  }

  /* ── панель ── */
  var clockI=null, idleI=null, tickI=null, lastAct=now(), sessionStart=now();

  function stopTimers(){ [clockI,idleI,tickI].forEach(function(t){ if(t) clearInterval(t); }); }
  function exitToDecoy(){ stopTimers(); try{ sessionStorage.removeItem('bo_pending'); }catch(e){} location.reload(); }

  function buildPanel(){
    buildShell();
    var main=document.getElementById('bo-main');
    [['bo-sec-visits','ВИЗИТЫ'],['bo-sec-attempts','ПОПЫТКИ'],['bo-sec-system','СИСТЕМА']].forEach(function(p){
      var s=el('section','crt-section'); s.id=p[0]; main.appendChild(s);
    });
    clockI=setInterval(function(){
      var d=new Date();
      document.getElementById('bo-clock').textContent=z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
    },1000);
    var btns=Array.prototype.slice.call(document.querySelectorAll('#bo-nav button'));
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        btns.forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        Array.prototype.forEach.call(main.children,function(s){ s.classList.remove('active'); });
        var id=b.getAttribute('data-target');
        document.getElementById(id).classList.add('active');
        renderTab(id);
      });
    });
    document.getElementById('bo-logout').addEventListener('click',exitToDecoy);
    ['mousemove','keydown','click','touchstart'].forEach(function(ev){
      document.addEventListener(ev,function(){ lastAct=Date.now(); },{passive:true});
    });
    idleI=setInterval(function(){ if(now()-lastAct>IDLE_LIMIT) exitToDecoy(); },30000);
    tickI=setInterval(renderTicker,1000);
    btns[0].click();
  }

  function activeTab(){
    var b=document.querySelector('#bo-nav button.active');
    return b ? b.getAttribute('data-target') : null;
  }
  function renderTab(id){
    if(id==='bo-sec-visits') renderVisits();
    else if(id==='bo-sec-attempts') renderAttempts();
    else renderSystem();
  }
  function renderTicker(){
    var t=document.getElementById('bo-ticker'); if(!t) return;
    var idle=Math.floor((now()-lastAct)/1000);
    t.textContent='СЕССИЯ '+fmtDur(Math.floor((now()-sessionStart)/1000))+
      ' // ВИЗИТОВ: '+getVisits().length+
      ' // ПОПЫТОК: '+getAttempts().length+
      ' // IDLE '+idle+'s // АВТОВЫХОД ЧЕРЕЗ '+fmtDur(Math.max(0,Math.ceil((IDLE_LIMIT-idle*1000)/1000)));
  }

  function renderVisits(){
    var sec=document.getElementById('bo-sec-visits');
    sec.innerHTML='';
    var list=getVisits().slice().sort(function(a,b){ return b.ts-a.ts; });
    var today=new Date();
    var sameDay=function(ts){
      var d=new Date(ts);
      return d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear();
    };
    var ips={};
    list.forEach(function(v){ if(v.ip && v.ip!=='…') ips[v.ip]=1; });
    var stats=el('div','stats-row');
    [
      ['ВСЕГО ВИЗИТОВ', String(list.length)],
      ['УНИКАЛЬНЫХ IP', String(Object.keys(ips).length)],
      ['СЕГОДНЯ', String(list.filter(function(v){return sameDay(v.ts);}).length)],
      ['ПОСЛЕДНИЙ', list.length ? fmtFull(list[0].ts) : '—']
    ].forEach(function(p){
      var card=el('div','stat-card');
      card.appendChild(el('div','stat-num',p[1]));
      card.appendChild(el('div','stat-label',p[0]));
      stats.appendChild(card);
    });
    sec.appendChild(stats);
    if(!list.length){
      sec.appendChild(el('p','crt-text','журнал пуст. визиты появятся, когда на главную кто-нибудь зайдёт.'));
      return;
    }
    var wrap=el('div','table-wrap');
    var table=el('table','data-table');
    var thead=document.createElement('thead'); var trh=document.createElement('tr');
    ['время','ip','страница','источник','экран','окно','час.пояс','язык','платформа','флаги','доступ','раздел','на сайте','user-agent'].forEach(function(h){
      trh.appendChild(el('th',null,h));
    });
    thead.appendChild(trh); table.appendChild(thead);
    var tbody=document.createElement('tbody');
    list.forEach(function(v){
      var tr=document.createElement('tr');
      [
        fmtFull(v.ts),
        v.ip||'—',
        v.page||'/',
        v.ref||'прямой',
        v.screen||'—',
        v.win||'—',
        v.tz||'—',
        v.lang||'—',
        v.plat||'—',
        (v.flags!=null ? v.flags+'/6' : '—'),
        (v.access ? 'открыт' : 'закрыт'),
        v.section||'—',
        (v.dwell!=null ? fmtDur(v.dwell) : '—'),
        v.ua||'—'
      ].forEach(function(val){ tr.appendChild(el('td',null,String(val))); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); wrap.appendChild(table); sec.appendChild(wrap);
    sec.appendChild(el('p','small','журнал хранится в этом браузере (до 400 записей). активная сессия обновляет себя каждые 5 секунд.'));
  }

  function renderAttempts(){
    var sec=document.getElementById('bo-sec-attempts'); sec.innerHTML='';
    var list=getAttempts().slice().sort(function(a,b){ return b.ts-a.ts; });
    var lock=lockedUntil();
    var lockTxt=(lock && now()<lock) ? 'активен до '+fmtFull(lock) : 'не активен';
    sec.appendChild(el('div','flag-banner','промахов за последние 15 минут: '+terminalFails().length+' · замок: '+lockTxt));
    if(!list.length){
      sec.appendChild(el('p','crt-text','попыток не зафиксировано. кто-то ведёт себя прилично.'));
      return;
    }
    var wrap=el('div','table-wrap');
    var table=el('table','data-table');
    var thead=document.createElement('thead'); var trh=document.createElement('tr');
    ['время','тип','длина ввода'].forEach(function(h){ trh.appendChild(el('th',null,h)); });
    thead.appendChild(trh); table.appendChild(thead);
    var tbody=document.createElement('tbody');
    list.forEach(function(v){
      var tr=document.createElement('tr');
      [fmtFull(v.ts), v.kind||'—', (v.len!=null?String(v.len):'—')].forEach(function(val){
        tr.appendChild(el('td',null,String(val)));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); wrap.appendChild(table); sec.appendChild(wrap);
    sec.appendChild(el('p','small','журнал последних 200 попыток. замок снимается сам по истечении 5 минут.'));
  }

  function renderSystem(){
    var sec=document.getElementById('bo-sec-system'); sec.innerHTML='';
    var bytes=0;
    try{ bytes=(localStorage.getItem('hu_visits')||'').length+(localStorage.getItem('bo_attempts')||'').length; }catch(e){}
    [
      ['старт сессии', fmtFull(sessionStart)],
      ['сессия длится', fmtDur(Math.floor((now()-sessionStart)/1000))],
      ['автовыход бездействия', fmtDur(IDLE_LIMIT/1000)],
      ['замок перебора', MAX_FAILS+' промахов за '+fmtDur(LOCK_WINDOW/1000)+' → блок '+fmtDur(LOCK_TIME/1000)],
      ['записей визитов', String(getVisits().length)],
      ['записей попыток', String(getAttempts().length)],
      ['объём журналов', bytes+' байт'],
      ['платформа оператора', navigator.platform||'—'],
      ['экран', screen.width+'×'+screen.height]
    ].forEach(function(p){
      var row=el('div','system-line');
      row.appendChild(el('span',null,p[0]));
      row.appendChild(el('b',null,String(p[1])));
      sec.appendChild(row);
    });
    var btns=el('div','btn-row');
    var refresh=el('button','btn-primary','ОБНОВИТЬ'); refresh.type='button';
    refresh.addEventListener('click',function(){ renderTab(activeTab()); });
    var clear=el('button','btn-ghost','ОЧИСТИТЬ ЖУРНАЛЫ'); clear.type='button';
    clear.addEventListener('click',function(){
      if(!confirm('стереть журналы визитов и попыток?')) return;
      try{ localStorage.removeItem('hu_visits'); localStorage.removeItem('bo_attempts'); }catch(e){}
      renderTab(activeTab());
    });
    btns.appendChild(refresh); btns.appendChild(clear);
    sec.appendChild(btns);
  }

  buildTerminal();
})();
