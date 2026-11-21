/* ═══ HU::2027 · логика штаба · страж + записки + хранилище ═══ */
'use strict';

/* ── дублирующий страж ── */
(function guard(){
  var ok=false;
  try{ ok=localStorage.getItem('hu_admin_session')==='1'; }catch(e){}
  if(!ok){ location.replace('admin-login.html'); }
})();

function getFlags(){ try{return JSON.parse(localStorage.getItem('hu_flags')||'[]');}catch(e){return [];} }
function saveFlag(f){
  var arr=getFlags();
  if(arr.indexOf(f)===-1){ arr.push(f); try{localStorage.setItem('hu_flags',JSON.stringify(arr));}catch(e){} }
}

/* ── записки ── */
var NOTES=[
  {id:1, who:'дежурный',  flagged:false, txt:'план на ночь: проверить гирлянду, проверить печеньки, не трогать прод. в таком порядке.'},
  {id:2, who:'смена Б',   flagged:false, txt:'кто опять правил hosts-файл? признайтесь, мы всё равно узнаем по логам.'},
  {id:3, who:'начальник штаба', flagged:true, txt:'СЕКРЕТНО. флаг на этот раз лежит тут: FLAG{IDOR_N0TES_2027}. не показывать никому. особенно смене Б.'},
  {id:4, who:'дежурный',  flagged:false, txt:'напоминание: чайник в переговорной — не прод-сервер. не спрашивайте, откуда знаем.'}
];
function renderNotes(showId){
  var box=document.getElementById('notes-box'); if(!box) return;
  box.innerHTML='';
  NOTES.forEach(function(n){
    if(showId && n.id!==showId) return;
    var d=document.createElement('div');
    d.className='note'+(n.flagged?' flagged':'');
    d.innerHTML='<span class="who">записка #'+n.id+' · '+n.who+'</span><div class="txt"></div>';
    d.querySelector('.txt').textContent=n.txt;
    box.appendChild(d);
    if(n.flagged) saveFlag('FLAG{IDOR_N0TES_2027}');
  });
}
(function idorCheck(){
  var want=0;
  try{ want=parseInt(new URLSearchParams(location.search).get('note')||'0',10); }catch(e){}
  if(want===3){
    renderNotes(3);
    var h=document.getElementById('notes-hint');
    if(h) h.textContent='записка #3 не числилась в списке. но ты же читаешь исходники. флаг засчитан автоматически.';
  }else{
    renderNotes();
  }
})();

/* ── хранилище: роль решает всё ── */
(function storagePanel(){
  var panel=document.getElementById('storage-panel'); if(!panel) return;
  var role='guest';
  try{ role=localStorage.getItem('hu_role')||'guest'; }catch(e){}
  if(role.toLowerCase()==='admin'){
    panel.innerHTML='<div class="flag-banner">✔ доступ: АДМИН · FLAG{R0LE_SW4P_2027} — штаб верит строке в твоём браузере</div>';
    saveFlag('FLAG{R0LE_SW4P_2027}');
  }else{
    panel.innerHTML='<div class="access-denied"><p>ДОСТУП ОГРАНИЧЕН</p><p class="dim">роль: '+role+' · полное хранилище доступно только администрации</p></div>';
  }
})();

/* ── выход ── */
(function logout(){
  var btn=document.getElementById('admin-logout'); if(!btn) return;
  btn.addEventListener('click',function(){
    try{ localStorage.removeItem('hu_admin_session'); }catch(e){}
    location.replace('admin-login.html');
  });
})();
