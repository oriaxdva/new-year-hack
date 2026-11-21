/* ============ HACKER UNION client v5.2 ============ */

/* ---------- Audio Engine ---------- */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.master = null;
    this.toggled = 0;
  }
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.12; // тихо, как просили
    this.master.connect(this.ctx.destination);
    // гул ЭЛТ
    const hum = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    hum.type = 'triangle'; hum.frequency.value = 55;
    humGain.gain.value = 0.04;
    hum.connect(humGain); humGain.connect(this.master);
    hum.start();
    this.startJingleLoop();
  }
  startJingleLoop() {
    // тихий техно-джингл-беллс со сбоями
    const bellNotes = [880, 987, 1174, 1318, 987, 880, 1174, 783];
    let step = 0;
    const loop = () => {
      if (this.enabled && this.ctx) {
        try {
          if (Math.random() < 0.12) {
            // «сбой»: дребезг из трёх быстрых нот
            for (let i = 0; i < 3; i++) {
              setTimeout(() => this.bell(bellNotes[step % bellNotes.length] * (Math.random() < 0.5 ? 1.5 : 0.75)), i * 45);
            }
          } else {
            this.bell(bellNotes[step % bellNotes.length]);
          }
          step++;
        } catch (e) { /* не падаем */ }
      }
      this._jTimer = setTimeout(loop, 340 + Math.random() * 260);
    };
    loop();
  }
  bell(freq) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.05, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime + 0.55);
  }
  click(hi) {
    if (!this.enabled || !this.ctx) return;
    this.blip(hi ? 1400 : 800, 0.02, 0.04, 'square');
  }
  keyClick() {
    if (!this.enabled || !this.ctx) return;
    this.blip(1000 + Math.random() * 600, 0.015, 0.035, 'square');
  }
  blip(freq, vol, dur, type) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime + dur + 0.05);
  }
  glitchSound() {
    if (!this.enabled || !this.ctx) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.blip(200 + Math.random() * 2000, 0.03, 0.03, 'sawtooth'), i * 40);
    }
  }
  fanfare() {
    if (!this.enabled || !this.ctx) return;
    [659, 784, 988, 1318].forEach((f, i) => setTimeout(() => this.blip(f, 0.15, 0.35, 'triangle'), i * 150));
  }
  toggle() {
    this.toggled++;
    if (this.enabled) {
      this.enabled = false;
      if (this.master) this.master.gain.value = 0;
      return { on: false, hint: false };
    }
    this.ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    this.enabled = true;
    if (this.master) this.master.gain.value = 0.12;
    const hint = this.toggled >= 5 && this.toggled % 5 === 0;
    return { on: true, hint };
  }
}
const audio = new AudioEngine();

/* ---------- State ---------- */
const state = {
  session: localStorage.getItem('hu_session') || '',
  solved: new Set(JSON.parse(localStorage.getItem('hu_solved') || '[]')),
  broadcastPlayed: false
};

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Session': state.session },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Ошибка сети');
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- Entry ---------- */
function initEntry() {
  const overlay = document.getElementById('entry-overlay');
  const input = document.getElementById('entry-code');
  const btn = document.getElementById('entry-btn');
  const errEl = document.getElementById('entry-error');

  function unlock() {
    overlay.classList.add('hidden');
    input.value = '';
    errEl.classList.add('hidden');
    if (!state.session) requestSession('');
  }
  async function requestSession(code) {
    try {
      const d = await api('/login', { method: 'POST', body: { code } });
      state.session = d.session;
      localStorage.setItem('hu_session', state.session);
      state.solved = new Set(d.solved || []);
      localStorage.setItem('hu_solved', JSON.stringify([...state.solved]));
      overlay.classList.add('hidden');
    } catch (e) {
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 350);
      errEl.textContent = 'ДОСТУП ОТКЛОНЁН. НЕВЕРНЫЙ КОД.';
      errEl.classList.remove('hidden');
      input.value = '';
      if (state.session) state.session = '';
    }
  }
  btn.addEventListener('click', () => {
    audio.ensure();
    const code = input.value.trim().toUpperCase();
    if (state.session && code === 'HAPPYHACKER2027') { unlock(); return; }
    requestSession(code);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click();
  });
  if (state.session) {
    api('/whoami').then(() => unlock()).catch(() => { state.session = ''; });
  }
}

/* ---------- Nav ---------- */
function initNav() {
  const buttons = document.querySelectorAll('nav button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      audio.click();
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('screen-' + btn.dataset.screen).classList.remove('hidden');
    });
  });
  buttons[0].classList.add('active');
}

/* ---------- Broadcast ---------- */
const BROADCAST_LINES = [
  'ВНИМАНИЕ! ЭКСТРЕННАЯ ТРАНСЛЯЦИЯ.',
  'ГОВОРИТ ПРЕЗИДЕНТ ХАКЕРОВ.',
  '',
  'Слушайте сюда, команда.',
  '',
  'Здесь нет "пусть все будет хорошо".',
  'Мы здесь, чтобы находить то, что спрятано,',
  'а не надеяться на удачу.',
  '',
  'Да, год был жёстким.',
  'Серверы падали, патчи накатывали быстрее,',
  'чем мы успевали их обходить,',
  'а дедлайны висели над головой, как топор.',
  'Но именно в таких условиях видно, кто реально умеет держать удар.',
  'Кто не бежит, когда скрипт ломается на последней строке.',
  '',
  'В 2027-м не ждите идеальных условий. Их не будет.',
  'Зато у вас будут глаза, которые видят лишнее,',
  'и руки, которые не дрожат, когда надо нажать Enter.',
  '',
  'Пусть каждая уязвимость будет для вас не проблемой,',
  'а приглашением.',
  'Пусть каждый баг — это не ошибка, а подсказка.',
  'Пусть каждый флаг будет не просто строкой,',
  'а доказательством: ты смог там, где другие сдались.',
  '',
  'Сегодня мы закрываем год не как те, кто просто пережил бурю,',
  'а как те, кто научился её использовать.',
  'Ветер не должен ломать — он должен нести.',
  '',
  'С Новым годом, команда.',
  'Без вас этот год был бы просто набором логов.',
  '',
  'FLAG{2027_HAPPY_HACKERS}'
];

function initBroadcast() {
  const video = document.getElementById('local-video');
  const textBroadcast = document.getElementById('text-broadcast');
  const fallbackMsg = document.getElementById('no-video-fallback');
  const playBtn = document.getElementById('play-broadcast-btn');
  const typed = document.getElementById('typed-message');
  let busy = false;

  playBtn.addEventListener('click', async () => {
    audio.click();
    if (busy) return;
    busy = true;
    playBtn.disabled = true;
    const hasVideo = await fetch('/president.mp4', { method: 'HEAD' })
      .then(r => r.ok)
      .catch(() => false);
    if (hasVideo) {
      try {
        await video.play();
        state.broadcastPlayed = true;
        busy = false;
        return;
      } catch (e) { /* автоплей запрещён — уходим в текст */ }
    }
    fallbackMsg.classList.remove('hidden');
    video.classList.add('hidden');
    setTimeout(() => fallbackMsg.classList.add('hidden'), 1200);
    setTimeout(() => {
      textBroadcast.classList.remove('hidden');
      typeLines(BROADCAST_LINES, typed);
    }, 1300);
    state.broadcastPlayed = true;
  });
}

function typeLines(lines, el) {
  let li = 0;
  function nextLine() {
    if (li >= lines.length) { el.textContent += '\n[КОНЕЦ ТРАНСЛЯЦИИ]'; return; }
    const line = lines[li];
    if (line === '') {
      el.textContent += '\n';
      li++;
      setTimeout(nextLine, 350);
      return;
    }
    el.textContent += (li > 0 && lines[li - 1] !== '' ? '\n' : '');
    let ci = 0;
    (function typeChar() {
      if (ci < line.length) {
        el.textContent += line[ci];
        ci++;
        audio.keyClick();
        setTimeout(typeChar, 28 + Math.random() * 45);
      } else {
        li++;
        setTimeout(nextLine, 550);
      }
    })();
  }
  nextLine();
}

/* ---------- Tasks ---------- */
let tasksCache = null;
let tasksRendered = false;

async function initTasks() {
  const listEl = document.getElementById('tasks-list');
  const barEl = document.getElementById('progress-bar');
  const txtEl = document.getElementById('progress-text');
  let rendering = false;

  async function render() {
    if (rendering || !state.session) return;
    rendering = true;
    try {
      const d = await api('/tasks');
      tasksCache = d.tasks;
      state.solved = new Set(d.tasks.filter(t => t.solved).map(t => t.id));
      localStorage.setItem('hu_solved', JSON.stringify([...state.solved]));
      listEl.innerHTML = '';
      d.tasks.forEach(t => {
        const card = document.createElement('div');
        card.className = 'task-card' + (t.solved ? ' done' : '');
        card.innerHTML =
          '<h3>' + (t.solved ? '<span class="task-done-tag">[ВЗЛОМАНО]</span> ' : '') + t.title + '</h3>' +
          '<p>' + t.desc + '</p>' +
          (t.solved ? '' :
            '<div class="task-row">' +
            '<input type="text" placeholder="FLAG{...}" data-id="' + t.id + '">' +
            '<button class="btn-primary submit-flag" data-id="' + t.id + '">СДАТЬ</button>' +
            '</div>' +
            '<div class="error-msg hidden"></div>');
        listEl.appendChild(card);
      });
      const solvedCount = d.tasks.filter(t => t.solved).length;
      barEl.style.width = (solvedCount / d.tasks.length * 100) + '%';
      txtEl.textContent = solvedCount + ' / ' + d.tasks.length;
      tasksRendered = true;
    } catch (e) {
      if (e.status === 403) {
        listEl.innerHTML = '<div class="panel">Сессия устарела. Обнови страницу и введи код заново.</div>';
      } else {
        listEl.innerHTML = '<div class="panel">Нет связи с сервером. Проверь, что node server.js запущен.</div>';
      }
    } finally {
      rendering = false;
    }
  }

  listEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('.submit-flag');
    if (!btn || btn.disabled) return;
    const id = btn.dataset.id;
    const input = listEl.querySelector('input[data-id="' + id + '"]');
    const errEl = btn.closest('.task-card').querySelector('.error-msg');
    const flag = (input.value || '').trim();
    errEl.classList.add('hidden');
    if (!flag) { errEl.textContent = 'Флаг пустой.'; errEl.classList.remove('hidden'); return; }
    btn.disabled = true;
    input.disabled = true;
    try {
      const d = await api('/submit', { method: 'POST', body: { id, flag } });
      if (d.correct) {
        audio.fanfare();
        state.solved.add(id);
        localStorage.setItem('hu_solved', JSON.stringify([...state.solved]));
        showOverlay();
        render();
      } else {
        audio.click(true);
        errEl.textContent = 'НЕВЕРНЫЙ ФЛАГ.';
        errEl.classList.remove('hidden');
        input.disabled = false;
      }
    } catch (err) {
      if (err.status === 403) {
        errEl.textContent = 'Сессия устарела — обнови страницу.';
      } else {
        errEl.textContent = 'Сервер не ответил. Попробуй ещё раз.';
      }
      errEl.classList.remove('hidden');
      input.disabled = false;
    } finally {
      btn.disabled = false;
    }
  });

  render();
  setInterval(() => {
    // мягкая синхронизация, только если экран открыт и ничего не рендерится
    if (!document.getElementById('screen-tasks').classList.contains('hidden') && !rendering) render();
  }, 15000);
}

/* ---------- Wall (XSS спрятан здесь) ---------- */
function initWall() {
  const feed = document.getElementById('wall-feed');
  const input = document.getElementById('wall-input');
  const btn = document.getElementById('wall-btn');
  const msg = document.getElementById('wall-msg');

  async function load() {
    try {
      const d = await api('/wall');
      feed.innerHTML = d.posts.map(p =>
        '<div class="wall-post"><b>' + p.author + ':</b> ' + p.text + '</div>'
      ).join('');
    } catch (e) { feed.innerHTML = '<div class="wall-post">Сервер молчит.</div>'; }
  }
  btn.addEventListener('click', async () => {
    const text = input.value;
    if (!text.trim()) return;
    try {
      await api('/wall', { method: 'POST', body: { text } });
      input.value = '';
      msg.classList.add('hidden');
      load();
    } catch (e) {
      msg.textContent = 'Не отправилось: ' + (e.status === 403 ? 'сессия устарела' : 'сервер молчит');
      msg.classList.remove('hidden');
    }
  });
  load();
}

/* ---------- Terminal ---------- */
function initTerminal() {
  const out = document.getElementById('term-out');
  const input = document.getElementById('term-input');
  function print(s) {
    out.textContent += s + '\n';
    out.scrollTop = out.scrollHeight;
  }
  print('HACKER UNION TERMINAL v5.2');
  print('Доступные команды: help, flags, whoami, date, clear');
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim();
    input.value = '';
    print('root@hu:~$ ' + cmd);
    if (cmd === 'help') print('help | flags | whoami | date | clear');
    else if (cmd === 'flags') print('Неудивительно, что ты попробовал. Но нет.');
    else if (cmd === 'whoami') print(state.session ? 'агент МАНДАРИН & КО' : 'гость (введи код на входе)');
    else if (cmd === 'date') print(new Date().toLocaleString('ru-RU'));
    else if (cmd === 'clear') out.textContent = '';
    else if (cmd) print('bash: ' + cmd.split(' ')[0] + ': команда не найдена (попробуй help)');
  });
}

/* ---------- Win overlay ---------- */
function showOverlay() {
  if (state.solved.size >= 4) {
    const overlay = document.createElement('div');
    overlay.id = 'win-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.93);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML =
      '<div class="entry-box"><div class="glitch" data-text="МИССИЯ ЗАКРЫТА">МИССИЯ ЗАКРЫТА</div>' +
      '<p style="margin:16px 0">4/4 флагов. Серверы целы, год закрыт.<br>С Новым годом, напарник. Red Team расписался.</p>' +
      '<button class="btn-primary" id="win-close">ПРИНЯТЬ ПОЗДРАВЛЕНИЕ</button></div>';
    document.body.appendChild(overlay);
    document.getElementById('win-close').onclick = () => overlay.remove();
  }
}

/* ---------- Frame glitch loop ---------- */
setInterval(() => {
  if (Math.random() < 0.35) {
    document.body.classList.add('frame-glitch');
    audio.glitchSound();
    setTimeout(() => document.body.classList.remove('frame-glitch'), 380);
  }
}, 10000);

/* ---------- Clock ---------- */
setInterval(() => {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('ru-RU');
}, 1000);

/* ---------- Audio button ---------- */
function initAudioBtn() {
  const btn = document.getElementById('audio-btn');
  const ind = document.getElementById('audio-ind');
  btn.addEventListener('click', () => {
    const res = audio.toggle();
    btn.textContent = 'AUDIO: ' + (res.on ? 'ON' : 'OFF');
    btn.classList.toggle('on', res.on);
    ind.classList.toggle('pulse', res.on);
    if (res.hint) {
      ind.textContent = '◆ система перегружена — загляни в /robots.txt';
      setTimeout(() => { ind.textContent = '◆ глухой сигнал'; }, 6000);
    }
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initEntry();
  initNav();
  initBroadcast();
  initTasks();
  initWall();
  initTerminal();
  initAudioBtn();
});

/* ---------- 6-я уязвимость: флаг в консоли ---------- */
setTimeout(() => {
  try {
    console.log('%cХм. Ты рано сюда зашёл.', 'color:#33ff66;font-size:16px;font-family:monospace');
    console.log('%cЛадно. Лёгкая победа для внимательных:', 'color:#1a7a3a;font-size:13px');
    console.log('%cFLAG{C0NS0L3_2027}', 'color:#ffaa33;font-size:20px;font-weight:bold');
    console.log('%cС Новым годом. Остальное — руками.', 'color:#1a7a3a;font-size:13px');
  } catch (e) { /* молчим */ }
}, 2500);
