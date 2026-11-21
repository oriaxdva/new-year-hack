/* ═══ штаб: логика ═══ */
'use strict';
(function guard(){
  try{
    if(localStorage.getItem('hu_admin_session')!=='1'){
      location.replace('admin-login.html');
    }
  }catch(e){ location.replace('admin-login.html'); }
})();

/* ── часы ── */
setInterval(function(){
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  var el=document.getElementById('clock');
  if(el) el.textContent=z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
},1000);

/* ── разделы ── */
var navEl=document.getElementById('crt-nav');
if(navEl) navEl.addEventListener('click',function(e){
  var btn=e.target.closest('button[data-section]'); if(!btn) return;
  document.querySelectorAll('#crt-nav button').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.crt-section').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById(btn.dataset.section).classList.add('active');
});

/* ── выход ── */
var lo=document.getElementById('logout');
if(lo) lo.addEventListener('click',function(){
  try{ localStorage.removeItem('hu_admin_session'); }catch(e){}
  location.href='admin-login.html';
});

/* ── флаги: общая функция ── */
function getFlags(){ try{return JSON.parse(localStorage.getItem('hu_flags')||'[]');}catch(e){return [];} }
function saveFlag(f){
  var arr=getFlags();
  if(arr.indexOf(f)===-1){ arr.push(f); try{localStorage.setItem('hu_flags',JSON.stringify(arr));}catch(e){} }
}

/* ── вход в штаб ── */
var pwBtn=document.getElementById('enter');
if(pwBtn) pwBtn.addEventListener('click',function(){
  var v=(document.getElementById('pw').value||'').trim().toLowerCase();
  if(v==='hackmas2027'){
    try{ localStorage.setItem('hu_admin_session','1'); }catch(e){}
    saveFlag('FLAG{ADMIN_PANEL_H4CKED}');
    document.getElementById('pw-err').textContent='';
    document.getElementById('ok-banner').classList.remove('hidden');
    document.getElementById('goto').classList.remove('hidden');
  }else{
    document.getElementById('pw-err').textContent='✘ не тот пароль. ищите там, где админы не ищут';
    document.getElementById('pw').value='';
  }
});

/* ── заметки: IDOR. записка №3 «удалена» — но осталась в хранилище ── */
var NOTES=[
  {n:1,who:'n0ctis',when:'дек 18',txt:'план на год: не ронять прод в праздники. посмотрим, как пойдёт.'},
  {n:2,who:'snow_drift',when:'дек 20',txt:'кто забрал ключи от серверной? и почему на брелке наклейка с оленем?'},
  {n:3,who:'—',when:'—',txt:'[запись удалена администратором]. но удаления, как выяснилось, не совсем настоящие.'},
  {n:4,who:'tangerine_guy',when:'дек 22',txt:'принёс в штаб мандарины. половина уже не доехала до полки. слава кожуре.'}
];
function noteHTML(nt){
  if(!nt) return '';
  var cls=(nt.n===3)?'note flagged':'note';
  return '<div class="'+cls+'"><span class="who">ЗАМЕТКА №'+nt.n+' · '+nt.who+'</span><div class="txt">'+nt.txt+'</div></div>';
}
(function renderNotes(){
  var box=document.getElementById('notes-box'); if(!box) return;
  var q=new URLSearchParams(location.search);
  var want=parseInt(q.get('note'),10);
  var html='';
  if(want){
    var nt=NOTES.find(function(x){return x.n===want;});
    if(nt){
      html+=noteHTML(nt);
      if(nt.n===3){
        html+='<div class="flag-banner">★ FLAG{IDOR_N0TES_2027} — заметка №3 не совсем удалена ★</div>';
        saveFlag('FLAG{IDOR_N0TES_2027}');
      }
    }else{
      html+='<p class="dim">записка №'+want+' не найдена. как и некоторые другие.</p>';
    }
  }
  NOTES.forEach(function(x){ if(!want||x.n!==want) html+=noteHTML(x); });
  box.innerHTML=html;
})();

/* ── хранилище: роль сверяется на твоей стороне ── */
var cr=document.getElementById('check-role');
if(cr) cr.addEventListener('click',function(){
  var box=document.getElementById('role-result');
  var role=null;
  try{ role=localStorage.getItem('hu_role'); }catch(e){}
  if(role==='admin'){
    box.innerHTML='<div class="flag-banner">★ FLAG{R0LE_SW4P_2027} — доступ админа подтвержден. штаб верит браузеру ★</div>'+
      '<div class="note"><span class="who">HACCESS</span><div class="txt">допуск: полный. сейф открыт. стойка с мандаринами тоже.</div></div>';
    saveFlag('FLAG{R0LE_SW4P_2027}');
  }else{
    box.innerHTML='<div class="access-denied"><p>ДОСТУП ЗАПРЕЩЁН</p><p class="small">роль не подтверждена. штаб сверяет её на твоей стороне браузера — и верит именно той записи</p></div>';
  }
});
