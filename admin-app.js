/* ── штаб: заметки, хранилище, сейф ── */
'use strict';
var NOTES={
  1:{who:'santa.exe',txt:'список подарков проверен дважды. мандарины — под тройной защитой кожуры.'},
  2:{who:'sec_ops',txt:'пароли менять не обязательно. скорее всего, никто не догадается. скорее всего.'},
  3:{who:'anon',txt:'эту заметку не должен был увидеть никто. FLAG{IDOR_N0TES_2027}'}
};
var FLAGS_MAP={
  'FLAG{ADMIN_PANEL_H4CKED}':1,
  'FLAG{IDOR_N0TES_2027}':1,
  'FLAG{R0LE_SW4P_2027}':1,
  'FLAG{ARCHIVE_CODE_2027}':1
};
function getFlags(){ try{return JSON.parse(localStorage.getItem('hu_flags')||'[]');}catch(e){return [];} }
function saveFlag(f){
  var arr=getFlags();
  if(arr.indexOf(f)===-1){ arr.push(f); try{localStorage.setItem('hu_flags',JSON.stringify(arr));}catch(e){} }
}
/* заметки */
var q=new URLSearchParams(location.search);
var noteId=parseInt(q.get('note')||'0',10);
var box=document.getElementById('notes-box');
if(box){
  if(noteId>0){
    var n=NOTES[noteId];
    if(n){
      var d=document.createElement('div');
      d.className='note'+(n.flag?' flagged':'');
      d.innerHTML='<div class="who">'+n.who+' · заметка #'+noteId+'</div><div class="txt"></div>';
      d.querySelector('.txt').textContent=n.txt;
      box.appendChild(d);
      if(n.flag) saveFlag(n.flag);
    }else{
      box.innerHTML='<p class="dim">заметка #'+noteId+' не найдена. видимо, её уже съели.</p>';
    }
  }else{
    var a=document.createElement('div');
    a.className='note';
    a.innerHTML='<div class="who">santa.exe · заметка #1</div><div class="txt"></div>';
    a.querySelector('.txt').textContent=NOTES[1].txt;
    box.appendChild(a);
    var b=document.createElement('div');
    b.className='note';
    b.innerHTML='<div class="who">sec_ops · заметка #2</div><div class="txt"></div>';
    b.querySelector('.txt').textContent=NOTES[2].txt;
    box.appendChild(b);
  }
}
/* навигация */
document.getElementById('admin-nav').addEventListener('click',function(e){
  var btn=e.target.closest('button[data-sec]'); if(!btn) return;
  document.querySelectorAll('#admin-nav button').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.crt-section').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById('sec-'+btn.dataset.sec).classList.add('active');
});
/* хранилище */
var sc=document.getElementById('storage-content');
if(sc){
  var role=null;
  try{role=localStorage.getItem('hu_role');}catch(e){}
  if(role==='admin'){
    sc.innerHTML='<div class="flag-banner">★ FLAG{R0LE_SW4P_2027} — роль подменена, сервер верит твоей строке ★</div>'+
      '<p class="crt-text" style="margin-top:14px">дамп хранилища:</p>'+
      '<pre class="term-out">hu_role: admin\nbackup_pin: [скрыто]\nsession_token: XMAS-2027-STAY\nlast_note_read: 3</pre>'+
      '<p class="dim small">поздравляем, вы теперь админ. по крайней мере, сервер так думает.</p>';
    saveFlag('FLAG{R0LE_SW4P_2027}');
  }else{
    sc.innerHTML='<div class="access-denied"><p>ДОСТУП ЗАПРЕЩЁН</p>'+
      '<p class="dim small">обратитесь к администратору. или станьте им. сервер решает по строке в вашем localStorage.</p></div>';
  }
}
/* сейф */
var safe=document.getElementById('safe-go');
if(safe) safe.addEventListener('click',function(){
  var v=(document.getElementById('safe-code').value||'').trim().toUpperCase();
  var msg=document.getElementById('safe-msg');
  var banner=document.getElementById('safe-banner');
  if(v==='ARCHIVE_CODE_2027'){
    msg.textContent='✔ сейф открыт. внутри мандарины и резервный код.';
    banner.textContent='★ FLAG{ARCHIVE_CODE_2027} — сейф не запирался с прошлого года ★';
    banner.classList.remove('hidden');
    saveFlag('FLAG{ARCHIVE_CODE_2027}');
  }else{
    msg.textContent='✘ не тот код. сейф молча осуждает.';
    banner.classList.add('hidden');
  }
});
