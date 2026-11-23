/* ═══ BLACK OPS · терминал и панель · сборка 5 ═══
   Схема входа: код двери на экране доступа (app.js) → приглашение →
   этот файл строит терминал (ключ оператора) → панель.
   Без приглашения страница остаётся декоей-404. Коды хранятся только хэшами. */
'use strict';
(function(){
  var INVITE_KEY='bo_invite';
  var INVITE_TTL=10*60*1000;    /* приглашение живёт 10 минут */
  var LOCK_WINDOW=15*60*1000;   /* окно учёта промахов */
  var LOCK_MAX=6;               /* промахов до блокировки */
  var LOCK_TIME=5*60*1000;      /* блокировка перебора */
  var IDLE_MS=15*60*1000;       /* авто-выход без действия */
  var OP_HASH='bd03bee1b1f899071e7c6048d721c129eb141194fff23aec37524a1f6aa9eea5';    /* sha256 ключа оператора — сам ключ нигде не лежит */
  var SHA_ABC='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';


/* ── sha256 · компактная реализация (utf-8) ── */
var __sha256=function(ascii){
  function rightRotate(value,amount){return (value>>>amount)|(value<<(32-amount));}
  var maxWord=Math.pow(2,32),i,j,result='';
  var words=[],asciiBitLength=ascii.length*8;
  var hash=__sha256.h=__sha256.h||[],k=__sha256.k=__sha256.k||[];
  var primeCounter=k.length,isComposite={};
  for(var candidate=2;primeCounter<64;candidate++){
    if(!isComposite[candidate]){
      for(i=0;i<313;i+=candidate){isComposite[i]=candidate;}
      hash[primeCounter]=(Math.pow(candidate,.5)*maxWord)|0;
      k[primeCounter++]=(Math.pow(candidate,1/3)*maxWord)|0;
    }
  }
  ascii+='\x80';
  while(ascii.length%64-56) ascii+='\x00';
  for(i=0;i<ascii.length;i++){
    j=ascii.charCodeAt(i);
    if(j>>8) return '';
    words[i>>2]|=j<<((3-i)%4)*8;
  }
  words[words.length]=(asciiBitLength/maxWord)|0;
  words[words.length]=asciiBitLength;
  for(j=0;j<words.length;){
    var w=words.slice(j,j+=16);
    var oldHash=hash;
    hash=hash.slice(0,8);
    for(i=0;i<64;i++){
      var w15=w[i-15],w2=w[i-2];
      var a=hash[0],e=hash[4];
      var temp1=hash[7]
        +(rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25))
        +((e&hash[5])^((~e)&hash[6]))
        +k[i]
        +(w[i]=(i<16)?w[i]:(w[i-16]+(rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3))+w[i-7]+(rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10)))|0);
      var temp2=(rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      hash=[(temp1+temp2)|0].concat(hash);
      hash[4]=(hash[4]+temp1)|0;
    }
    for(i=0;i<8;i++){hash[i]=(hash[i]+oldHash[i])|0;}
  }
  for(i=0;i<8;i++){
    for(j=3;j+1;j--){
      var b=(hash[i]>>(j*8))&255;
      result+=((b<16)?'0':'')+b.toString(16);
    }
  }
  return result;
};
function sha256Of(s){return __sha256(unescape(encodeURIComponent(s)));}

  /* самопроверка реализации: если sha256 сломан — тихо остаёмся декоей */
  if(sha256Of('abc')!==SHA_ABC) return;

  /* ── хранилище ── */
  function load(k,d){try{var r=localStorage.getItem(k);return r?JSON.parse(r):d;}catch(e){return d;}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function now(){return Date.now();}

  /* ── страж приглашения ── */
  function invited(){
    var raw=null;
    try{ raw=sessionStorage.getItem(INVITE_KEY)||localStorage.getItem(INVITE_KEY); }catch(e){}
    if(!raw) return false;
    if(raw==='1') return true;          /* совместимость со старой меткой */
    var t=parseInt(raw,10);
    return t>0 && (now()-t)<INVITE_TTL; /* свежее приглашение */
  }
  function destroySession(){
    try{ sessionStorage.removeItem(INVITE_KEY); }catch(e){}
    try{ localStorage.removeItem(INVITE_KEY); }catch(e){}
  }
  if(!invited()) return; /* декоя: ничего не строим, страница остаётся 404 */

  /* ── журнал попыток ── */
  function attempts(){return load('bo_attempts',[]);}
  function freshFails(){return attempts().filter(function(x){return !x.ok&&(now()-x.t)<LOCK_WINDOW;});}
  function logAttempt(ok){
    var a=attempts(); a.push({t:now(),ok:!!ok});
    a=a.filter(function(x){return (now()-x.t)<LOCK_WINDOW;});
    save('bo_attempts',a);
  }
  function lockLeft(){
    var f=freshFails();
    if(f.length<LOCK_MAX) return 0;
    return Math.max(0,LOCK_TIME-(now()-f[f.length-1].t));
  }

  /* ── dom-хелперы ── */
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function clearBody(){document.body.innerHTML='';}
  function fmt(t){
    var d=new Date(t),z=function(n){return String(n).padStart(2,'0');};
    return z(d.getDate())+'.'+z(d.getMonth()+1)+' '+z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
  }

  /* ── терминал ── */
  function buildTerminal(){
    clearBody();
    document.title='BLACK OPS';
    var wrap=el('div','bo-shell');
    var frame=el('div','bo-frame');
    wrap.appendChild(frame);
    frame.appendChild(el('div','bo-scan'));
    frame.appendChild(el('div','bo-title','BLACK OPS // ЗАКРЫТЫЙ КОНТУР'));
    var out=el('div','bo-out');
    frame.appendChild(out);
    var row=el('div','bo-inputrow');
    row.appendChild(el('span','bo-prompt','key>'));
    var input=document.createElement('input');
    input.className='bo-input'; input.type='password';
    input.autocomplete='off'; input.spellcheck=false;
    row.appendChild(input);
    var btn=el('button','bo-btn','ВОЙТИ');
    row.appendChild(btn);
    frame.appendChild(row);
    frame.appendChild(el('div','bo-hint','ключ оператора · enter — отправить · все попытки пишутся в журнал'));
    document.body.appendChild(wrap);

    var line=0,boot=['> канал: BLACK OPS','> приглашение: ПРИНЯТО','> ожидается ключ оператора'];
    (function typeLine(){
      if(line>=boot.length){input.focus();return;}
      out.appendChild(el('div','bo-line',boot[line++]));
      setTimeout(typeLine,260);
    })();

    function print(text,cls){
      out.appendChild(el('div','bo-line '+(cls||''),text));
      out.scrollTop=out.scrollHeight;
    }
    function tryKey(){
      var lock=lockLeft();
      if(lock>0){print('> ЗАБЛОКИРОВАНО // ещё '+Math.ceil(lock/1000)+' сек','bo-err');return;}
      var v=(input.value||'');
      input.value='';
      if(sha256Of(v)===OP_HASH){
        save('bo_attempts',[]);
        print('> КЛЮЧ ПРИНЯТ // открываю контур','bo-ok');
        setTimeout(buildPanel,500);
      }else{
        logAttempt(false);
        print('> ОТКАЗ // попытка записана','bo-err');
        frame.classList.add('bo-glitch');
        setTimeout(function(){frame.classList.remove('bo-glitch');},450);
        if(freshFails().length>=LOCK_MAX){
          print('> КОНТУР ЗАБЛОКИРОВАН // 5 минут','bo-err');
        }
      }
    }
    btn.addEventListener('click',tryKey);
    input.addEventListener('keydown',function(e){if(e.key==='Enter')tryKey();});
    setTimeout(function(){input.focus();},900);
  }

  /* ── панель ── */
  var idleTimer=null,lastActive=Date.now();
  function bump(){lastActive=Date.now();}
  function buildPanel(){
    clearBody();
    document.title='BLACK OPS';
    var wrap=el('div','bo-shell');
    var frame=el('div','bo-frame bo-wide');
    wrap.appendChild(frame);
    frame.appendChild(el('div','bo-scan'));
    var head=el('div','bo-head');
    head.appendChild(el('div','bo-title','BLACK OPS // ПАНЕЛЬ ОПЕРАТОРА'));
    var clock=el('span','bo-clock','--:--:--');
    head.appendChild(clock);
    frame.appendChild(head);

    var visits=load('bo_visits',[]);
    var atts=load('bo_attempts',[]);
    var days={};
    visits.forEach(function(v){var d=new Date(v.t);days[d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()]=1;});
    var last=visits.length?visits[visits.length-1]:null;

    var stats=el('div','bo-stats');
    [[visits.length,'визитов'],[Object.keys(days).length,'дней'],[atts.length,'попыток входа'],[last?fmt(last.t):'—','последний визит']].forEach(function(p){
      var c=el('div','bo-card');
      c.appendChild(el('div','bo-num',String(p[0])));
      c.appendChild(el('div','bo-cap',p[1]));
      stats.appendChild(c);
    });
    frame.appendChild(stats);

    frame.appendChild(el('div','bo-sub','ВИЗИТЫ // последние 12'));
    var tv=el('table','bo-table');
    var h1=el('tr');
    ['время','страница','источник','экран','пояс'].forEach(function(x){h1.appendChild(el('th','',x));});
    tv.appendChild(h1);
    visits.slice(-12).reverse().forEach(function(v){
      var tr=el('tr');
      [fmt(v.t),v.p||'/',v.ref||'—',(v.w||0)+'×'+(v.h||0),v.tz||'—'].forEach(function(x){tr.appendChild(el('td','',String(x)));});
      tv.appendChild(tr);
    });
    if(!visits.length){
      var tr=el('tr');var td=el('td','bo-dim','журнал пуст');td.colSpan=5;tr.appendChild(td);tv.appendChild(tr);
    }
    frame.appendChild(tv);

    frame.appendChild(el('div','bo-sub','ПОПЫТКИ ВХОДА // последние 12'));
    var ta=el('table','bo-table');
    var h2=el('tr');
    ['время','результат'].forEach(function(x){h2.appendChild(el('th','',x));});
    ta.appendChild(h2);
    atts.slice(-12).reverse().forEach(function(a){
      var tr=el('tr');
      tr.appendChild(el('td','',fmt(a.t)));
      tr.appendChild(el('td',a.ok?'bo-ok':'bo-err',a.ok?'успех':'отказ'));
      ta.appendChild(tr);
    });
    if(!atts.length){
      var tr2=el('tr');var td2=el('td','bo-dim','попыток не было');td2.colSpan=2;tr2.appendChild(td2);ta.appendChild(tr2);
    }
    frame.appendChild(ta);

    var btns=el('div','bo-btns');
    var b1=el('button','bo-btn','ОБНОВИТЬ');
    b1.addEventListener('click',buildPanel);
    var b2=el('button','bo-btn','ОЧИСТИТЬ ЖУРНАЛЫ');
    b2.addEventListener('click',function(){save('bo_visits',[]);save('bo_attempts',[]);buildPanel();});
    var b3=el('button','bo-btn bo-danger','ЗАКРЫТЬ СЕССИЮ');
    b3.addEventListener('click',function(){destroySession();location.reload();});
    btns.appendChild(b1);btns.appendChild(b2);btns.appendChild(b3);
    frame.appendChild(btns);
    frame.appendChild(el('div','bo-hint','без действия 15 минут сессия закроется сама'));
    document.body.appendChild(wrap);

    /* часы */
    var t=setInterval(function(){
      if(!document.body.contains(clock)){clearInterval(t);return;}
      var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
      clock.textContent=z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
    },1000);

    /* авто-выход без действия */
    document.addEventListener('mousemove',bump);
    document.addEventListener('keydown',bump);
    if(idleTimer)clearInterval(idleTimer);
    idleTimer=setInterval(function(){
      if(Date.now()-lastActive>IDLE_MS){
        clearInterval(idleTimer);
        destroySession();
        location.reload();
      }
    },5000);
  }

  buildTerminal();
})();
