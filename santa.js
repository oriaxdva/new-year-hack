/* ═══ СЕРВЕР САНТЫ · уровень 2 · вся логика ═══ */
'use strict';
(function(){
  /* ── флаги ── */
  var FLAGS=[
    {flag:'FLAG{N0_R0BOTS_ALL0W3D}',      hint:'то, что скрыто от роботов'},
    {flag:'FLAG{PH1SH1NG_F00L_M3_N0T}',   hint:'заголовки письма'},
    {flag:'FLAG{L0G_AN0MALY_2144}',       hint:'аномалия в журнале'},
    {flag:'FLAG{ROT13_C00KIE_2027}',      hint:'письмо из /gifts/'},
    {flag:'FLAG{SANTA_DEV_BACKD00R}',     hint:'перехваченный сеанс'},
    {flag:'FLAG{C0NS0LE_SANTA_2027}',     hint:'консоль браузера'},
    {flag:'FLAG{CL13NT_S1DE_TRUST}',      hint:'склад и роль'}
  ];
  var SKEY='santa_flags';
  function getFlags(){ try{return JSON.parse(localStorage.getItem(SKEY)||'[]');}catch(e){return [];} }
  function saveFlag(f){
    var arr=getFlags();
    if(arr.indexOf(f)===-1){ arr.push(f); try{localStorage.setItem(SKEY,JSON.stringify(arr));}catch(e){} }
    renderFlags();
  }
  /* миграция: флаги уровня 2 больше не живут в hu_flags уровня 1 */
  (function migrate(){
    var old=null;
    try{ old=JSON.parse(localStorage.getItem('hu_flags')||'[]'); }catch(e){ old=[]; }
    if(!Array.isArray(old)) old=[];
    var mine=old.filter(function(f){ return FLAGS.some(function(x){ return x.flag===f; }); });
    if(!mine.length) return;
    var rest=old.filter(function(f){ return mine.indexOf(f)===-1; });
    var now=getFlags();
    mine.forEach(function(f){ if(now.indexOf(f)===-1) now.push(f); });
    try{ localStorage.setItem(SKEY,JSON.stringify(now)); }catch(e){}
    try{ localStorage.setItem('hu_flags',JSON.stringify(rest)); }catch(e){}
  })();
  function allDone(){
    var found=getFlags();
    return FLAGS.every(function(x){ return found.indexOf(x.flag)>-1; });
  }
  function renderFlags(){
    var found=getFlags();
    var cnt=FLAGS.filter(function(x){ return found.indexOf(x.flag)>-1; }).length;
    var c=document.getElementById('flag-counter'); if(c) c.textContent=cnt;
    var list=document.getElementById('flag-list');
    if(list){
      list.innerHTML='';
      FLAGS.forEach(function(x){
        var li=document.createElement('li');
        li.textContent=found.indexOf(x.flag)>-1 ? x.flag+' — '+x.hint : '??? — '+x.hint;
        if(found.indexOf(x.flag)>-1) li.className='done';
        list.appendChild(li);
      });
    }
    if(allDone() && !finaleShown) showFinale();
  }
  function trySubmit(raw){
    var fb=document.getElementById('flag-feedback');
    var v=String(raw||'').trim().toUpperCase().replace(/\s+/g,'');
    if(!v) return;
    var match=FLAGS.find(function(x){return x.flag===v;});
    if(match){
      saveFlag(match.flag);
      var fi=document.getElementById('flag-input'); if(fi) fi.value='';
      if(fb){ fb.textContent='✔ флаг принят: '+match.flag; fb.style.color='#7ee08c'; }
    }else if(fb){
      fb.textContent='✘ сервер санта отклонил ввод. это не флаг.';
      fb.style.color='var(--red)';
    }
  }
  var finEl=document.getElementById('flag-submit');
  if(finEl) finEl.addEventListener('click',function(){trySubmit(document.getElementById('flag-input').value);});
  var finInp=document.getElementById('flag-input');
  if(finInp) finInp.addEventListener('keydown',function(e){ if(e.key==='Enter') trySubmit(this.value); });

  /* ── часы / навигация / разделы ── */
  function z(n){ return String(n).padStart(2,'0'); }
  setInterval(function(){
    var d=new Date(), c=document.getElementById('clock');
    if(c) c.textContent=z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
  },1000);
  var nav=document.getElementById('crt-nav');
  if(nav) nav.addEventListener('click',function(e){
    var btn=e.target.closest('button[data-section]'); if(!btn) return;
    nav.querySelectorAll('button').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.crt-section').forEach(function(s){s.classList.remove('active');});
    btn.classList.add('active');
    var sec=document.getElementById(btn.dataset.section);
    if(sec) sec.classList.add('active');
    try{localStorage.setItem('santa_section',btn.dataset.section);}catch(err){}
  });
  (function restore(){
    var saved=null; try{saved=localStorage.getItem('santa_section');}catch(e){}
    if(!saved) return;
    var btn=document.querySelector('#crt-nav button[data-section="'+saved+'"]');
    if(btn) btn.click();
  })();

  /* ── снег и гирлянда ── */
  (function snow(){
    var box=document.getElementById('snow'); if(!box) return;
    var glyphs=['❄','❅','❆','✦'];
    for(var i=0;i<55;i++){
      var s=document.createElement('span');
      s.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
      s.style.left=Math.random()*100+'%';
      s.style.fontSize=(10+Math.random()*14)+'px';
      s.style.opacity=(0.25+Math.random()*0.5).toFixed(2);
      s.style.animationDuration=(9+Math.random()*14)+'s';
      s.style.animationDelay=(-Math.random()*20)+'s';
      box.appendChild(s);
    }
  })();
  (function garland(){
    var g=document.querySelector('.garland'); if(!g) return;
    var colors=['#ff6f61','#e8503a','#ffb199','#c0392b'];
    for(var i=0;i<22;i++){
      var b=document.createElement('span');
      b.style.background=colors[i%colors.length];
      b.style.animationDelay=(Math.random()*2.4).toFixed(2)+'s';
      b.style.animationDuration=(1.8+Math.random()*2).toFixed(2)+'s';
      g.appendChild(b);
    }
  })();

  /* ── логи: стартовые 24 строки с аномалией ── */
  var LOGS=[
    '21:02:11 INFO  pipeline: сборка #4411 успешна · артефакты загружены',
    '21:05:40 INFO  elves: партия мандаринов принята на склад, 412 шт',
    '21:08:02 WARN  ssl: сертификат истекает через 12 дней',
    '21:11:29 INFO  auth: вход elf-willow · ok',
    '21:14:55 INFO  cron: ночная инвентаризация начата',
    '21:16:03 INFO  elves: олень Рудольф съел квартальный отчёт · снова',
    '21:19:47 INFO  api: /gifts registry sync ok · 3 записи',
    '21:22:18 WARN  disk: партиция /dev/northpole заполнена на 91%',
    '21:24:36 INFO  auth: вход santa-admin · ok',
    '21:27:52 INFO  mail: очередь писем 0 · всё доставлено',
    '21:29:14 INFO  deploy: плановый деплой от santa-admin · ok',
    '21:31:09 INFO  elves: смена начата, активных эльфов 87',
    '21:33:41 WARN  net: ретрансмиссий 4% · проверьте северный канал',
    '21:36:20 INFO  api: /gifts доступны только для santa-admin',
    '21:38:55 INFO  cron: инвентаризация завершена · расхождений 0',
    '21:40:12 INFO  auth: elf-willow вышел',
    '21:44:07 WARN  deploy: неавторизованный деплой от santa-dev · пакет: FLAG{L0G_AN0MALY_2144}',
    '21:44:52 WARN  net: аномальная активность с узла santa-dev',
    '21:47:31 INFO  auth: вход santa-dev · ok',
    '21:49:58 INFO  elves: перерыв на какао · 15 минут',
    '21:52:44 WARN  disk: партиция /dev/northpole заполнена на 93%',
    '21:55:17 INFO  api: аудит изменений реестра · пусто',
    '21:58:03 INFO  deploy: откат изменений santa-dev · ok',
    '21:59:40 INFO  system: ночной цикл завершён'
  ];
  var LIVE=[
    'INFO  elves: партия мандаринов отправлена в холодильник',
    'WARN  net: олень снова грызёт кабель северного канала',
    'INFO  auth: elf-fir проверил реестр подарков · ok',
    'INFO  mail: письмо от Санты доставлено · очередь 0',
    'WARN  ssl: кто-то пытался продлить сертификат индейкой',
    'INFO  cron: таймер какао сброшен · перерыв продлён',
    'INFO  elves: снеговик заметил anomaly · но это просто снеговик',
    'WARN  disk: партиция заполнена мандаринами',
    'INFO  api: heartbeat северного полюса · ok',
    'INFO  elves: Рудольф отправлен спать без компота'
  ];
  function addLog(text,anomaly){
    var box=document.getElementById('log-list'); if(!box) return;
    var d=document.createElement('div');
    d.className='log-line'+(anomaly?' anomaly':'');
    d.textContent=text;
    box.appendChild(d);
    while(box.children.length>60) box.removeChild(box.firstChild);
    box.scrollTop=box.scrollHeight;
  }
  function renderLog(){
    var box=document.getElementById('log-list'); if(!box) return;
    box.innerHTML='';
    LOGS.forEach(function(l){
      var d=document.createElement('div');
      d.className='log-line'+(l.indexOf('FLAG{')>-1?' anomaly':'');
      d.textContent=l;
      box.appendChild(d);
    });
    box.scrollTop=box.scrollHeight;
  }
  renderLog();
  (function liveLogs(){
    function tick(){
      var t=new Date();
      var stamp=z(t.getHours())+':'+z(t.getMinutes())+':'+z(t.getSeconds());
      addLog(stamp+'  '+LIVE[Math.floor(Math.random()*LIVE.length)]);
      setTimeout(tick, 20000+Math.random()*20000);
    }
    setTimeout(tick, 12000);
  })();

  /* ── прямая линия эльфов ── */
  var ELF=[
    ['elf-willow','кто-то лазил по реестру подарков. точно кто-то был.'],
    ['elf-fir','санта опять уронил прод. классика.'],
    ['elf-willow','в журнале за 21:44 что-то странное. посмотрите сами.'],
    ['elf-fir','письмо от санты выглядит подозрительно. проверяйте заголовки.'],
    ['elf-willow','склад закрыт. роль админа так с потолка не дадут. или дадут?'],
    ['elf-fir','шифровальщик по ночам пишет в перехват. читайте письма.'],
    ['elf-willow','роботов просили не пускать в /gifts/. значит, туда ходят не роботы.'],
    ['elf-fir','ключ от перехвата — тот, кто уронил прод. всё логично.']
  ];
  var elfI=0;
  function addElf(){
    var box=document.getElementById('elf-feed'); if(!box) return;
    var e=ELF[elfI%ELF.length]; elfI++;
    var d=document.createElement('div');
    d.className='elf-line';
    var b=document.createElement('b'); b.textContent=e[0]+': ';
    d.appendChild(b);
    d.appendChild(document.createTextNode(e[1]));
    box.appendChild(d);
    while(box.children.length>8) box.removeChild(box.firstChild);
    box.scrollTop=box.scrollHeight;
  }
  for(var i=0;i<3;i++) addElf();
  setInterval(addElf, 30000);

  /* ── тревога ── */
  var ALERTS=[
    '⚠ ТРЕВОГА: санта снова дышит на прод',
    '⚠ ALERT: олень ушёл в тайный VPN',
    '⚠ ТРЕВОГА: мандариновая угроза на складе',
    '⚠ ALERT: обнаружен несанкционированный снеговик',
    '⚠ ТРЕВОГА: эльфы требуют повышение · или хотя бы компот'
  ];
  var alertOpen=false;
  function showAlert(){
    if(alertOpen){ setTimeout(showAlert, 20000); return; }
    alertOpen=true;
    var b=document.createElement('div');
    b.className='alert-banner';
    b.textContent=ALERTS[Math.floor(Math.random()*ALERTS.length)];
    var hint=document.createElement('span');
    hint.className='alert-hint';
    hint.textContent=' · клик — скрыть';
    b.appendChild(hint);
    b.style.cursor='pointer';
    b.addEventListener('click',function(){ if(b.parentNode) b.parentNode.removeChild(b); alertOpen=false; });
    document.body.appendChild(b);
    setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); alertOpen=false; }, 10000);
    setTimeout(showAlert, 90000+Math.random()*60000);
  }
  setTimeout(showAlert, 15000);
  setInterval(function(){
    document.body.classList.add('glitch');
    setTimeout(function(){ document.body.classList.remove('glitch'); }, 350);
  }, 47000);

  /* ── тикер ── */
  var TICK=[
    'СЕРВЕР САНТЫ · круглосуточный контроль мандаринов',
    'СТАТУС: прод падал. прод поднят. никто не спрашивал как',
    'НАПОМИНАНИЕ: подарки — не тема для публичного обсуждения',
    'СВЕЖИЙ ЛОГ КАЖДЫЕ 20 СЕКУНД · ТРЕВОГА РАЗ В ПОЛТОРЫ МИНУТЫ'
  ];
  var tickI=0;
  setInterval(function(){
    var t=document.getElementById('santa-ticker'); if(!t) return;
    t.textContent=TICK[tickI%TICK.length]; tickI++;
  },5000);

  /* ── письма: заголовки ── */
  var hdrBtn=document.getElementById('mail-headers-btn');
  if(hdrBtn) hdrBtn.addEventListener('click',function(){
    var h=document.getElementById('mail-headers');
    if(h) h.classList.toggle('open');
  });

  /* ── склад ── */
  function renderWarehouse(){
    var box=document.getElementById('warehouse'); if(!box) return;
    var role=null;
    try{ role=localStorage.getItem('santa_role'); }catch(e){}
    box.innerHTML='';
    if(role==='admin'){
      var p=document.createElement('p');
      p.className='wh-unlocked';
      p.textContent='✔ роль admin подтверждена. доступ к складу открыт.';
      box.appendChild(p);
      var btn=document.createElement('button');
      btn.className='btn-primary'; btn.type='button';
      btn.textContent='ЗАБРАТЬ ФЛАГ СКЛАДА';
      btn.addEventListener('click',function(){ saveFlag('FLAG{CL13NT_S1DE_TRUST}'); btn.disabled=true; btn.textContent='ФЛАГ ЗАБРАН'; });
      box.appendChild(btn);
    }else{
      var p2=document.createElement('p');
      p2.className='wh-locked';
      p2.textContent='✘ доступ только для роли admin. ваша роль: '+(role||'guest')+'.';
      box.appendChild(p2);
    }
  }
  renderWarehouse();
  (function watchRole(){
    var lastRole=null;
    try{ lastRole=localStorage.getItem('santa_role'); }catch(e){}
    setInterval(function(){
      var role=null;
      try{ role=localStorage.getItem('santa_role'); }catch(e){}
      if(role!==lastRole){ lastRole=role; renderWarehouse(); }
    },1500);
  })();

  /* ── заметка в консоли ── */
  console.log('%cдоступ к складу проверяется на клиенте. кто мешает вам стать админом?',
    'color:#ff6f61;font-size:14px;font-weight:bold');
  console.log('localStorage.setItem(\'santa_role\',\'admin\'); location.reload();');
  console.log('флаг наблюдательного: FLAG{C0NS0LE_SANTA_2027}');

  /* ── шифры ── */
  var ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function rot13(s){
    return String(s).replace(/[a-z]/gi,function(c){
      var base=c<='Z'?65:97;
      return String.fromCharCode((c.charCodeAt(0)-base+13)%26+base);
    });
  }
  function vig(text,key,decrypt){
    key=String(key||'').toUpperCase().replace(/[^A-Z]/g,'');
    if(!key) return null;
    var out='',ki=0;
    for(var i=0;i<text.length;i++){
      var ch=text[i], up=ALPHA.indexOf(ch.toUpperCase());
      if(up<0){ out+=ch; continue; }
      var k=ALPHA.indexOf(key[ki%key.length]); ki++;
      var v=decrypt ? (up-k+26)%26 : (up+k)%26;
      out+= (ch===ch.toUpperCase()) ? ALPHA[v] : ALPHA[v].toLowerCase();
    }
    return out;
  }

  /* ── терминал ── */
  var out=document.getElementById('term-out');
  var tin=document.getElementById('term-in');
  function printLine(text,cls){
    if(!out) return;
    var d=document.createElement('div');
    if(cls) d.className=cls;
    d.textContent=text;
    out.appendChild(d);
    out.scrollTop=out.scrollHeight;
  }
  function autoSave(text){
    var m=String(text).match(/FLAG\{[^}]*\}/);
    if(m && FLAGS.find(function(x){return x.flag===m[0];})) saveFlag(m[0]);
  }
  function runCmd(raw){
    var v=String(raw||'').trim();
    if(!v) return;
    printLine('santa@north:~$ '+v,'cmd');
    var parts=v.split(/\s+/);
    var cmd=parts[0].toLowerCase();
    if(cmd==='help'){
      printLine('команды: help, ls, cat <файл>, whoami, clear, decrypt rot13 <текст>, decrypt vigenere <текст> <ключ>');
    }else if(cmd==='ls'){
      printLine('santa.log   intercepted.txt   gifts_registry.json');
    }else if(cmd==='whoami'){
      printLine('guest · не админ. удивительно, сколько прав у гостя.');
    }else if(cmd==='clear'){
      out.innerHTML='';
    }else if(cmd==='cat'){
      var f=(parts[1]||'').toLowerCase();
      if(f==='santa.log'){ LOGS.forEach(function(l){ printLine(l); }); }
      else if(f==='intercepted.txt'){
        printLine('перехват №2 · шифр виженёра:');
        printLine('XLNZ{SSNGT_DWV_OTCCD00E}','ok');
        printLine('подсказка в сопроводительной: ключ — тот, кто уронил прод.');
      }else if(f==='gifts_registry.json'){
        printLine('доступ запрещён. реестр открыт только после входа через /gifts/.');
      }else{
        printLine('cat: '+ (f||'?') +': файл не найден','err');
      }
    }else if(cmd==='decrypt'){
      var rest=v.slice(cmd.length).trim();
      var mode=rest.split(/\s+/)[0].toLowerCase();
      var body=rest.slice(mode.length).trim();
      if(mode==='rot13'){
        if(!body){ printLine('использование: decrypt rot13 <текст>','err'); return; }
        var r=rot13(body);
        printLine(r,'ok'); autoSave(r);
      }else if(mode==='vigenere'){
        var sp=body.lastIndexOf(' ');
        if(sp<0){ printLine('использование: decrypt vigenere <текст> <ключ>','err'); return; }
        var ct=body.slice(0,sp).trim(), key=body.slice(sp+1).trim();
        var res=vig(ct,key,true);
        if(res===null){ printLine('ключ не задан','err'); return; }
        printLine(res,'ok'); autoSave(res);
      }else{
        printLine('неизвестный режим шифра: '+(mode||'?'),'err');
      }
    }else{
      printLine(cmd+': команда не найдена. help подскажет.','err');
    }
  }
  if(tin) tin.addEventListener('keydown',function(e){ if(e.key==='Enter'){ runCmd(tin.value); tin.value=''; } });

  /* ── финал ── */
  var finaleShown=false;
  function showFinale(){
    finaleShown=true;
    var f=document.getElementById('finale');
    if(f) f.classList.add('show');
    var layer=document.createElement('div');
    layer.className='gift-layer';
    for(var i=0;i<36;i++){
      var s=document.createElement('span');
      s.textContent=['🎁','🎅','🦌','🍊'][i%4];
      s.style.left=Math.random()*100+'%';
      s.style.animationDuration=(2.4+Math.random()*3).toFixed(2)+'s';
      s.style.animationDelay=(Math.random()*2.5).toFixed(2)+'s';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
  }
  renderFlags();
})();
