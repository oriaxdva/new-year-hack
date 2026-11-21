// HACKER UNION :: 2027 — движок страницы
(function(){
  'use strict';

  /* ---------- ЧАСЫ ---------- */
  const clockEl = document.getElementById('clock');
  function tick(){
    if(!clockEl) return;
    const d = new Date();
    const p = n => String(n).padStart(2,'0');
    clockEl.textContent = p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  }
  tick(); setInterval(tick, 1000);

  /* ---------- ЦИФРОВАЯ МЕТЕЛЬ ---------- */
  const snowLayer = document.getElementById('snow');
  const GLYPHS = ['*','+','0','1','❄','·'];
  function spawnFlake(){
    if(!snowLayer) return;
    const f = document.createElement('span');
    f.className = 'flake' + (Math.random() < 0.12 ? ' amber' : '');
    f.textContent = GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    f.style.left = Math.random()*100 + 'vw';
    f.style.fontSize = (10 + Math.random()*14) + 'px';
    f.style.animationDuration = (6 + Math.random()*10) + 's';
    f.style.animationDelay = (-Math.random()*10) + 's';
    snowLayer.appendChild(f);
    f.addEventListener('animationend', () => f.remove());
  }
  if (snowLayer && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    for(let i=0;i<40;i++) spawnFlake();
    setInterval(spawnFlake, 400);
  }

  /* ---------- ЗВУК ---------- */
  let audioOn = false, audioCtx = null;
  const audioBtn = document.getElementById('audio-btn');
  if (audioBtn){
    audioBtn.addEventListener('click', () => {
      audioOn = !audioOn;
      audioBtn.textContent = 'AUDIO: ' + (audioOn ? 'ON' : 'OFF');
      if (audioOn && !audioCtx){
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
      }
    });
  }
  function click(){
    if(!audioOn || !audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type='square'; o.frequency.value = 700 + Math.random()*300;
    g.gain.value = 0.02;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.03);
  }

  /* ---------- ОБРАЩЕНИЕ (текст трансляции) ---------- */
  const SPEECH = [
    'ПРЕРЫВАЕМ СИГНАЛ... ПЕРЕХОДИМ НА РЕЗЕРВНЫЙ КАНАЛ.',
    '',
    'Внимание. Говорит президент хакеров.',
    '',
    'Друзья. Год был тяжёлым: дедлайны висели над головой, как топор.',
    'Но мы выстояли. Мы не сдали ни одного пароля в открытом виде.',
    'Ну... почти.',
    '',
    'Поздравляю всех бойцов Red Team с наступающим 2027-м.',
    'Пусть в новом году ваши эксплойты будут элегантными,',
    'а багрепорты — щедро оплаченными.',
    '',
    'Оставил для вас подарок. Четыре флага уже нашли смелые.',
    'Пятый лежит в штабе. Шестой — только для тех, кто умеет',
    'становиться тем, кем не является.',
    '',
    'Берегите друг друга. И помните: настоящий хакер',
    'оставляет систему чище, чем нашёл её.',
    '',
    'С праздником. Эфир окончен.'
  ];
  const textEl = document.getElementById('broadcast-text');
  const boxEl = document.getElementById('message-box');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  let typing = null, started = false;

  function typeSpeech(){
    if (typing) clearInterval(typing);
    textEl.textContent = '';
    if (!document.querySelector('.cursor')){
      const c = document.createElement('span');
      c.className = 'cursor'; c.textContent = '_';
      textEl.appendChild(c);
    }
    let li = 0, ci = 0;
    const cursor = textEl.querySelector('.cursor');
    function step(){
      if (li >= SPEECH.length){
        finishSpeech();
        return;
      }
      const line = SPEECH[li];
      if (ci < line.length){
        cursor.before(line[ci]); ci++; click();
        setTimeout(step, 30 + Math.random()*60);
      } else {
        cursor.before('\n'); li++; ci = 0;
        typing = setTimeout(step, 350);
      }
    }
    step();
  }

  function finishSpeech(){
    clearInterval(typing); typing = null;
    const banner = document.createElement('div');
    banner.className = 'flag-banner';
    banner.textContent = '>>> FLAG{2027_HAPPY_HACKERS} <<<';
    boxEl.appendChild(banner);
    submitFlag('FLAG{2027_HAPPY_HACKERS}', true);
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
  }

  if (startBtn){
    startBtn.addEventListener('click', () => {
      started = true;
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      typeSpeech();
    });
    stopBtn.addEventListener('click', () => {
      if (typing){ clearInterval(typing); typing = null; }
      startBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
    });
  }

  /* ---------- ФЛАГИ ---------- */
  const FLAGS = {
    'FLAG{HTML_C0MMENT_2027}': 'Исходник главной страницы',
    'FLAG{C0NS0LE_HUNT_2027}': 'Консоль браузера (F12)',
    'FLAG{2027_HAPPY_HACKERS}': 'Трансляция президента',
    'FLAG{ADMIN_PANEL_H4CKED}': 'Вход в админку',
    'FLAG{IDOR_N0TES_2027}': 'Служебная заметка id=3',
    'FLAG{R0LE_SW4P_2027}': 'Хранилище флагов в админке'
  };
  const counterEl = document.getElementById('flag-counter');
  const inputEl = document.getElementById('flag-input');
  const submitBtn = document.getElementById('submit-flag');
  const msgEl = document.getElementById('flag-msg');

  function norm(s){ return (s||'').trim().toUpperCase().replace(/\s+/g,'_'); }
  function getFound(){ try { return JSON.parse(localStorage.getItem('hu_flags') || '[]'); } catch(e){ return []; } }
  function saveFound(list){ localStorage.setItem('hu_flags', JSON.stringify(list)); }
  function renderCounter(){ if(counterEl) counterEl.textContent = getFound().length + ' / ' + Object.keys(FLAGS).length; }

  function submitFlag(raw, silent){
    const f = norm(raw);
    if (!f) return;
    if (!FLAGS[f]){
      if(!silent && msgEl){ msgEl.textContent = 'НЕВЕРНЫЙ ФЛАГ. ИЩИ ДАЛЬШЕ.'; msgEl.classList.add('amber'); }
      return;
    }
    const found = getFound();
    if (!found.includes(f)){
      found.push(f); saveFound(found);
    }
    renderCounter();
    if(msgEl){
      msgEl.textContent = 'ФЛАГ ПРИНЯТ [' + f + '] — найдено ' + found.length + ' из ' + Object.keys(FLAGS).length;
      msgEl.classList.add('amber');
    }
  }

  if (submitBtn){
    submitBtn.addEventListener('click', () => submitFlag(inputEl.value));
    inputEl.addEventListener('keydown', e => { if(e.key === 'Enter') submitFlag(inputEl.value); });
  }
  renderCounter();

  /* ---------- ПАСХАЛКА В КОНСОЛИ ---------- */
  console.log('%c=== HACKER UNION :: 2027 ===', 'color:#0f0;font-size:18px;font-weight:bold');
  console.log('%cНастоящие хакеры читают исходники.', 'color:#0f0');
  console.log('%cФЛАГ: FLAG{C0NS0LE_HUNT_2027}', 'color:#ffb000;font-size:16px');
  console.log('%cP.S. Админка существует. И хранилище в ней.', 'color:#7fdc7f');
})();
