/* ═══ HU::2027 · Black Team · новогодний движок ═══ */
'use strict';

/* ── чёрный ход: хранится только хэш, сам код нигде не лежит ── */

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

var DOOR_HASH='0b4a40359230328653303ebd2849c013f81307b1c894344deec2d611145804c8';

/* ── экран доступа ── */
(function access(){
  var screen=document.getElementById('access-screen');
  if(!screen) return;
  var unlocked=false;
  try{ unlocked=localStorage.getItem('hu_access')==='1'; }catch(e){}
  function hide(){ screen.classList.add('hidden'); document.body.classList.remove('locked'); }
  if(unlocked){ hide(); return; }
  document.body.classList.add('locked');
  var inp=document.getElementById('access-input'),
      btn=document.getElementById('access-btn'),
      err=document.getElementById('access-err');
  function tryCode(){
    var v=(inp.value||'').trim().toUpperCase();
    if(v==='HAPPYNEWHACK'){
      try{ localStorage.setItem('hu_access','1'); }catch(e){}
      err.textContent=''; hide();
    }else if(sha256Of(v)===DOOR_HASH){
      try{ sessionStorage.setItem('bo_invite',String(Date.now())); }catch(e){}
      location.href='black-ops.html';
    }else{
      err.textContent='✘ доступ запрещён. код знает ведущий. и, возможно, санта';
    }
  }
  if(btn) btn.addEventListener('click',tryCode);
  if(inp) inp.addEventListener('keydown',function(e){ if(e.key==='Enter') tryCode(); });
})();

/* ── снег ── */
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

/* ── гирлянда ── */
(function garland(){
  var g=document.getElementById('garland'); if(!g) return;
  var colors=['#7ee08c','#e06a5a','#e8b84a','#7ab8e0'];
  for(var i=0;i<22;i++){
    var b=document.createElement('span');
    b.className='bulb';
    var c=colors[i%colors.length];
    b.style.background=c; b.style.color=c;
    b.style.animationDelay=(Math.random()*2.4).toFixed(2)+'s';
    b.style.animationDuration=(1.8+Math.random()*2).toFixed(2)+'s';
    g.appendChild(b);
  }
})();

/* ── звук ── */
var audioOn=false, actx=null;
function click(vol){
  if(!audioOn) return;
  try{
    if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
    var o=actx.createOscillator(), gn=actx.createGain();
    o.type='square'; o.frequency.value=520+Math.random()*160;
    gn.gain.value=vol||0.02;
    o.connect(gn); gn.connect(actx.destination);
    o.start(); o.stop(actx.currentTime+0.03);
  }catch(e){}
}
document.getElementById('audio-toggle').addEventListener('click',function(){
  audioOn=!audioOn;
  this.textContent='AUDIO: '+(audioOn?'ON':'OFF');
  if(audioOn) click(0.04);
});

/* ── часы ── */
setInterval(function(){
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  var el=document.getElementById('clock');
  if(el) el.textContent=z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
},1000);

/* ── разделы ── */
document.getElementById('crt-nav').addEventListener('click',function(e){
  var btn=e.target.closest('button[data-section]'); if(!btn) return;
  document.querySelectorAll('#crt-nav button').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.crt-section').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById(btn.dataset.section).classList.add('active');
  try{localStorage.setItem('hu_section',btn.dataset.section);}catch(err){}
});
(function restoreSection(){
  var saved=null;
  try{saved=localStorage.getItem('hu_section');}catch(err){}
  if(!saved) return;
  var btn=document.querySelector('#crt-nav button[data-section="'+saved+'"]');
  if(btn) btn.click();
})();

/* ── флаги ── */
var FLAGS=[
  {flag:'FLAG{HTML_C0MMENT_2027}', hint:'комментарии в исходниках'},
  {flag:'FLAG{C0NS0LE_HUNT_2027}', hint:'консоль браузера'},
  {flag:'FLAG{2027_HAPPY_HACKERS}', hint:'финал трансляции'},
  {flag:'FLAG{ADMIN_PANEL_H4CKED}', hint:'вход в админку'},
  {flag:'FLAG{IDOR_N0TES_2027}', hint:'чужие заметки'},
  {flag:'FLAG{R0LE_SW4P_2027}', hint:'роль в браузере'}
];
function getFlags(){ try{return JSON.parse(localStorage.getItem('hu_flags')||'[]');}catch(e){return [];} }
function saveFlag(f){
  var arr=getFlags();
  if(arr.indexOf(f)===-1){ arr.push(f); try{localStorage.setItem('hu_flags',JSON.stringify(arr));}catch(e){} }
  renderFlags();
}
function renderFlags(){
  var found=getFlags();
  var c=document.getElementById('flag-counter'); if(c) c.textContent=found.length;
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
}
function trySubmit(raw){
  var fb=document.getElementById('flag-feedback');
  var v=String(raw||'').trim().toUpperCase().replace(/\s+/g,'');
  if(!v) return false;
  var match=FLAGS.find(function(x){return x.flag===v;});
  if(match){
    saveFlag(match.flag);
    if(fb){ fb.textContent='✔ ФЛАГ ПРИНЯТ: '+match.flag; fb.style.color='var(--green)'; }
    click(0.05);
    return true;
  }else{
    if(fb){ fb.textContent='✘ Неизвестный флаг. Ищи внимательнее.'; fb.style.color='var(--red)'; }
    return false;
  }
}
document.getElementById('flag-submit').addEventListener('click',function(){trySubmit(document.getElementById('flag-input').value);});
document.getElementById('flag-input').addEventListener('keydown',function(e){if(e.key==='Enter')trySubmit(this.value);});
renderFlags();

/* ── финал ── */
function confetti(){
  var box=document.getElementById('confetti'); if(!box) return;
  var glyphs=['🎄','❄','🍊'];
  for(var i=0;i<40;i++){
    var s=document.createElement('span');
    s.textContent=glyphs[i%glyphs.length];
    s.style.left=Math.random()*100+'%';
    s.style.animationDuration=(2.5+Math.random()*3)+'s';
    s.style.animationDelay=(Math.random()*1.5)+'s';
    box.appendChild(s);
    (function(el){ setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); },6500); })(s);
  }
}
function maybeFinale(){
  var fin=document.getElementById('finale'); if(!fin) return;
  var done=false, closed=false;
  try{
    done=getFlags().length>=FLAGS.length;
    closed=localStorage.getItem('hu_finale_closed')==='1';
  }catch(e){}
  if(done && !closed){
    fin.classList.remove('hidden');
    confetti();
  }
}
(function finaleClose(){
  var btn=document.getElementById('finale-close'); if(!btn) return;
  btn.addEventListener('click',function(){
    var fin=document.getElementById('finale');
    if(fin) fin.classList.add('hidden');
    try{ localStorage.setItem('hu_finale_closed','1'); }catch(e){}
  });
})();
maybeFinale();

/* ── трансляция ── */
var BROADCAST=[
  'Слушайте все. Говорит президент хакеров. Эфир разблокирован на все терминалы сети.',
  'Этот год был длинным, как компиляция без кэша. Сервера падали, дедлайны дышали в затылок, а патчи накатывали быстрее, чем мы успевали их обходить.',
  'Кто-то вошёл в этот год джуном, а выходит синьором. Кто-то так и не понял, почему на проде работает то, что падает локально. Это нормально. Это магия.',
  'Спасибо каждому, кто сидел на созвонах с закрытой камерой, кто чинил прод в три ночи и кто всё это время оставался человеком.',
  'Без вас этот год был бы просто набором логов.',
  'С Новым 2027-м. Мандарины не хакнут никогда — они слишком хорошо защищены кожурой.'
];
var typing=false, stopFlag=false, typeTimer=null;
function typeBroadcast(){
  if(typing) return;
  typing=true; stopFlag=false;
  var box=document.getElementById('broadcast-text');
  var fbBtn=document.getElementById('stop-broadcast');
  document.getElementById('start-broadcast').classList.add('hidden');
  fbBtn.classList.remove('hidden');
  box.innerHTML='';
  var li=0;
  function nextLine(){
    if(stopFlag||li>=BROADCAST.length){ finish(); return; }
    var line=document.createElement('div');
    line.className='line'; box.appendChild(line);
    var text=BROADCAST[li], i=0;
    (function typeChar(){
      if(stopFlag){ finish(); return; }
      if(i<text.length){
        line.textContent=text.slice(0,++i);
        if(i%3===0) click(0.015);
        typeTimer=setTimeout(typeChar,14+Math.random()*26);
      }else{
        li++; typeTimer=setTimeout(nextLine,420);
      }
    })();
  }
  function finish(){
    clearTimeout(typeTimer); typing=false;
    fbBtn.classList.add('hidden');
    document.getElementById('start-broadcast').classList.remove('hidden');
    if(stopFlag) return;
    var banner=document.getElementById('broadcast-flag');
    banner.textContent='★ FLAG{2027_HAPPY_HACKERS} — обращение расшифровано полностью ★';
    banner.classList.remove('hidden');
    saveFlag('FLAG{2027_HAPPY_HACKERS}');
    click(0.06);
  }
  nextLine();
}
document.getElementById('start-broadcast').addEventListener('click',typeBroadcast);
document.getElementById('stop-broadcast').addEventListener('click',function(){
  stopFlag=true; clearTimeout(typeTimer); typing=false;
  this.classList.add('hidden');
  document.getElementById('start-broadcast').classList.remove('hidden');
});

/* ── стена сообщений ── */
var WALL=[
  {who:'n0ctis',when:'23:41',txt:'кто не успел за флагами — успевайте. год закрывается быстрее, чем компилируется прод.'},
  {who:'phantom_404',when:'23:47',txt:'админские заметки нумеруются с единицы. но иногда у заметки бывает id, о котором админ забыл.'},
  {who:'santa.exe',when:'23:52',txt:'🎁 вакансия: разносчик флагов. требования: уметь читать то, что обычно читают только поисковые роботы.'},
  {who:'unknown',when:'00:03',txt:'говорят, штаб верит тому, что написано в браузере игрока. а зря.'},
  {who:'snow_drift',when:'00:07',txt:'мандариновые логи зашифрованы кожурой. официальная позиция службы безопасности.'},
  {who:'rudolph',when:'00:12',txt:'трансляцию кто-то дослушал до конца и не пожалел. официальных подробностей нет.'}
];
function renderWall(){
  var box=document.getElementById('wall-posts'); box.innerHTML='';
  WALL.forEach(function(p){
    var d=document.createElement('div');
    d.className='post';
    d.innerHTML='<span class="when">'+p.when+'</span><span class="who">'+p.who+'</span><div class="txt"></div>';
    d.querySelector('.txt').textContent=p.txt;
    box.appendChild(d);
  });
}
renderWall();
document.getElementById('wall-post').addEventListener('click',function(){
  var inp=document.getElementById('wall-input'), v=inp.value.trim();
  if(!v) return;
  var sep=v.indexOf(':'), who, txt;
  if(sep>0){ who=v.slice(0,sep).trim()||'anon'; txt=v.slice(sep+1).trim(); }
  else{ who='anon'; txt=v; }
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  WALL.push({who:who,when:z(d.getHours())+':'+z(d.getMinutes()),txt:txt});
  renderWall(); inp.value='';
  document.querySelectorAll('.wall .post')[WALL.length-1].scrollIntoView({behavior:'smooth',block:'nearest'});
});

/* ── живые сообщения ── */
var LIVE_WALL=[
  {who:'elf_on_duty',txt:'мандарины на клавиатуре. жертвы: две. клавиатура выжила.'},
  {who:'night_shift',txt:'кто-то повесил носок с оленями на серверную стойку. админы не признаются.'},
  {who:'janitor.exe',txt:'в /tmp снова огрызки. это уже не баг, это традиция.'},
  {who:'garland_bot',txt:'гирлянда в серверной мигает в такт деплою. совпадение? да.'},
  {who:'santa.exe',txt:'санта заходил в логи. вышел ни с чем. ночь длинная.'}
];
function pushLive(){
  var box=document.getElementById('wall-posts'); if(!box) return;
  var p=LIVE_WALL[Math.floor(Math.random()*LIVE_WALL.length)];
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  var el=document.createElement('div');
  el.className='post live';
  el.innerHTML='<span class="when">'+z(d.getHours())+':'+z(d.getMinutes())+'</span><span class="who">'+p.who+'</span><div class="txt"></div>';
  el.querySelector('.txt').textContent=p.txt;
  box.appendChild(el);
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); },12000);
}
setTimeout(pushLive,8000);
setInterval(pushLive,45000);

/* ── терминал ── */
var OVERHEARD=[
  '…не трогай третью заметку. она не для смены Б',
  '…штаб верит бумажкам, а браузер верит тому, что в нём написали',
  '…санта дослушал трансляцию до конца. сказал: дежурный молодец'
];
var termOut=document.getElementById('term-out');
function tPrint(text,cls){
  var d=document.createElement('div');
  if(cls) d.className=cls;
  d.textContent=text; termOut.appendChild(d);
  termOut.scrollTop=termOut.scrollHeight;
}
tPrint('HU terminal v2.7 · подключение установлено','dim');
tPrint('введите help для списка команд','dim');
document.getElementById('term-in').addEventListener('keydown',function(e){
  if(e.key!=='Enter') return;
  var cmd=this.value.trim(); this.value='';
  if(!cmd) return;
  tPrint('black@hu:~$ '+cmd);
  var parts=cmd.split(/\s+/), c=parts[0].toLowerCase();
  if(c==='help'){
    tPrint('команды: help, whoami, flags, newyear, wall chat, xmas, clear');
  }else if(c==='whoami'){
    tPrint('агент Black Team · допуск: максимальный · настроение: праздничное');
  }else if(c==='flags'){
    var found=getFlags();
    tPrint('сдано флагов: '+found.length+' / '+FLAGS.length);
    FLAGS.forEach(function(x){ tPrint((found.indexOf(x.flag)>-1?'✔ ':'□ ')+x.hint); });
  }else if(c==='newyear'){
    tPrint('🎄 счётчик до нового года переполнен — потому что он уже наступил. почти.');
  }else if(c==='wall'&&parts[1]==='chat'){
    OVERHEARD.forEach(function(l){ tPrint(l,'dim'); });
  }else if(c==='xmas'){
    tPrint('🍊 мандарин выдан. кожура защищена лучше, чем прод');
  }else if(c==='submit'){
    tPrint('сдача флагов — только на странице ЗАДАНИЯ. терминал подсказками не торгует','dim');
  }else if(c==='clear'){
    termOut.innerHTML='';
  }else{
    tPrint('команда не найдена: '+c+' (try help)','dim');
  }
});

/* ── консольная пасхалка ── */
setTimeout(function(){
  console.log('%c✦ BLACK TEAM · приватный канал ✦','color:#e8b84a;font-size:16px');
  console.log('%cнастоящие хакеры читают исходники. а самые настоящие ещё и консоль открывают.','color:#7ee08c');
  console.log('%cFLAG{C0NS0LE_HUNT_2027}','color:#e8b84a;font-size:18px;font-weight:bold');
},2000);

/* ── приветствие ── */
console.log('%c🎄 HU::2027 · Black Team · с наступающим!','color:#7ee08c;font-size:14px');
