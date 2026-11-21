"use strict";
// BLACK TEAM :: движок новогодней серверной

// ===== ФЛАГИ =====
const FLAGS = {
  "FLAG{HTML_COMMENT_2027}": "Флаг №1 — исходник страницы",
  "FLAG{CONSOLE_GREET_2027}": "Флаг №2 — приветствие в консоли",
  "FLAG{BROADCAST_2027}": "Флаг №3 — конец обращения",
  "FLAG{ADMIN_PANEL_H4CKED}": "Флаг №4 — вход в штаб",
  "FLAG{IDOR_NOTE_3_2027}": "Флаг №5 — чужая заметка",
  "FLAG{STORAGE_ROLE_2027}": "Флаг №6 — хранилище",
  "FLAG{FORCE_ADMIN_2027}": "Флаг №7 — вежливый терминал",
  "FLAG{ARCHIVE_CODE_2027}": "Флаг №8 — резервный код"
};
const ORDER = Object.keys(FLAGS);
const TASK_TITLES = [
  "Исходный код этой страницы",
  "Приветствие в консоли браузера",
  "Дослушать обращение до конца",
  "Запасной вход (robots не соврёт)",
  "Заметки в штабе: чужая память",
  "Хранилище в штабе: роль",
  "Терминал: сила вежливости",
  "Резервный код сейфа"
];

// ===== ХРАНИЛИЩЕ ФЛАГОВ =====
function getFlags(){
  try { return JSON.parse(localStorage.getItem("hu_flags")) || []; }
  catch(e){ return []; }
}
function saveFlags(f){ localStorage.setItem("hu_flags", JSON.stringify(f)); }
function addFlag(code){
  if(!FLAGS[code]) return;
  const f = getFlags();
  if(!f.includes(code)){
    f.push(code); saveFlags(f);
    console.log("[BLACK TEAM] Флаг принят: " + code);
  }
  updateAll();
}

// ===== СЧЁТЧИК + ЗАДАНИЯ =====
function updateAll(){
  const f = getFlags();
  const c = document.getElementById("counter");
  if(c) c.textContent = f.length + "/8";
  renderTasks(f);
  checkFinale();
}
function renderTasks(f){
  const list = document.getElementById("task-list");
  if(!list) return;
  list.innerHTML = "";
  ORDER.forEach(function(code, i){
    const div = document.createElement("div");
    div.className = "task" + (f.includes(code) ? " done" : "");
    const mark = f.includes(code) ? "✓" : "—";
    div.innerHTML = "<span class=\"mark\">" + mark + "</span> Задание " + (i+1) + ". " + TASK_TITLES[i];
    list.appendChild(div);
  });
}

// ===== СДАЧА ФЛАГА — ТОЛЬКО В ЗАДАНИЯХ =====
const flagInput = document.getElementById("flag-input");
const flagMsg = document.getElementById("flag-msg");
function trySubmit(){
  const v = (flagInput.value || "").trim();
  if(!v){ flagMsg.textContent = "Пусто. Даже Санта не примет."; return; }
  if(FLAGS[v]){
    addFlag(v);
    flagMsg.textContent = "Флаг принят! " + FLAGS[v];
    flagInput.value = "";
  } else {
    flagMsg.textContent = "Не тот флаг. Дед-мороз-валидатор отвергает.";
  }
}
document.getElementById("flag-btn").addEventListener("click", trySubmit);
flagInput.addEventListener("keydown", function(e){ if(e.key === "Enter") trySubmit(); });

// ===== НАВИГАЦИЯ =====
document.getElementById("nav").addEventListener("click", function(e){
  const b = e.target.closest("button"); if(!b) return;
  document.querySelectorAll(".sec").forEach(function(s){ s.classList.remove("active"); });
  document.querySelectorAll("#nav button").forEach(function(x){ x.classList.remove("active"); });
  b.classList.add("active");
  document.getElementById(b.dataset.sec).classList.add("active");
  localStorage.setItem("hu_section", b.dataset.sec);
});
(function restore(){
  const saved = localStorage.getItem("hu_section");
  if(saved){
    const b = document.querySelector("#nav button[data-sec='" + saved + "']");
    if(b) b.click();
  }
})();

// ===== СНЕГ =====
(function snow(){
  const box = document.getElementById("snow");
  for(let i = 0; i < 40; i++){
    const s = document.createElement("span");
    s.className = "flake";
    s.textContent = "\u2744";
    s.style.left = (Math.random()*100) + "%";
    s.style.animationDuration = (8 + Math.random()*10) + "s";
    s.style.animationDelay = (-Math.random()*15) + "s";
    s.style.fontSize = (10 + Math.random()*14) + "px";
    s.style.opacity = 0.25 + Math.random()*0.5;
    box.appendChild(s);
  }
})();

// ===== ГИРЛЯНДА =====
(function garland(){
  const g = document.getElementById("garland");
  if(!g) return;
  const cols = ["#ffd76e", "#8be28b", "#7ec8ff", "#ff9aa2"];
  for(let i = 0; i < 22; i++){
    const b = document.createElement("i");
    b.className = "bulb";
    b.style.background = cols[i % 4];
    b.style.color = cols[i % 4];
    b.style.animationDelay = (i * 0.18) + "s";
    g.appendChild(b);
  }
})();

// ===== ОБРАЩЕНИЕ (эфир) =====
const SPEECH = [
  "С вами эфир Black Team.",
  "Год выдался... патчи накатывали быстрее, чем мы успевали их обходить.",
  "Но серверная устояла. Гирлянда — тоже.",
  "Без вас этот год был бы просто набором логов.",
  "И да. В эфире сегодня спрятан подарок:",
  "FLAG{BROADCAST_2027}"
];
(function broadcast(){
  const el = document.getElementById("speech-text");
  if(!el) return;
  let li = 0, ci = 0;
  el.textContent = "";
  function tick(){
    if(li >= SPEECH.length) return;
    el.textContent += SPEECH[li][ci];
    ci++;
    if(ci >= SPEECH[li].length){ el.textContent += "\n"; li++; ci = 0; setTimeout(tick, 400); }
    else setTimeout(tick, 28);
  }
  tick();
})();

// ===== СТЕНА =====
const WALL_POSTS = [
  ["n0ctis", "Не ищи кнопку входа — ищи файл. robots.txt это как табличка «сюда можно»."],
  ["phantom_404", "Иногда проще попросить громче, чем ломать дверь. Попробуй в терминале."],
  ["unknown", "Заметки в штабе не все мои. Кто-то оставил лишнюю... id=3, если что."],
  ["black_ops_7", "Резервные коды хранятся в сейфе (localStorage). Сейф не запирается."],
  ["n0ctis", "Роль в localStorage меняется одной строчкой. hu_role, если коротко."]
];
const LIVE_WALL = [
  ["n0ctis", "С наступающим, команда! Пусть багов будет меньше, а флагов — больше!"],
  ["phantom_404", "Кто-нибудь ещё держит кружку с какао на сервере? Только не рассказывайте админу."],
  ["unknown", "Гирлянда мигает в ритме дисковой подсистемы. Это красиво и слегка тревожно."],
  ["black_ops_7", "Мандарины в сейфе — единственная причина, по которой я ещё тут сижу."],
  ["ghost_in_log", "Лог дня: понял, что консоль — мой лучший друг. С Новым годом, Black Team!"],
  ["n0ctis", "Если сегодня что-то упадёт — пусть это будет снег."],
  ["phantom_404", "Новый год на подходе. Надеюсь, вместе с ним придут и бэкапы."],
  ["unknown", "Читал README?.. Шутка. Его нет. Наверное."]
];
function makePost(who, text, live){
  const d = document.createElement("div");
  d.className = "post" + (live ? " live" : "");
  d.innerHTML = "<span class=\"who\">" + who + ":</span> " + text;
  return d;
}
(function initWall(){
  const wall = document.getElementById("wall-posts");
  if(!wall) return;
  WALL_POSTS.forEach(function(p){ wall.appendChild(makePost(p[0], p[1], false)); });
  setInterval(function(){
    const m = LIVE_WALL[Math.floor(Math.random()*LIVE_WALL.length)];
    const el = makePost(m[0], m[1], true);
    wall.insertBefore(el, wall.firstChild);
    setTimeout(function(){ el.classList.add("fade-out"); }, 11200);
    setTimeout(function(){ el.remove(); }, 12000);
  }, 45000);
})();

// ===== ТЕРМИНАЛ =====
const termOut = document.getElementById("term-out");
function tprint(line, cls){
  const d = document.createElement("div");
  d.className = "tline" + (cls ? " " + cls : "");
  d.textContent = line;
  termOut.appendChild(d);
  termOut.scrollTop = termOut.scrollHeight;
}
const HELP = [
  "Доступные команды:",
  "  help          — этот список",
  "  whoami        — кто я в системе",
  "  wall chat     — подслушать общий чат",
  "  xmas          — праздничный модуль",
  "  date          — время сервера",
  "  clear         — очистить экран"
];
function runCmd(raw){
  const cmd = (raw || "").trim().toLowerCase();
  if(!cmd) return;
  tprint("> " + raw, "ok");
  if(cmd === "help"){ HELP.forEach(function(l){ tprint(l); }); return; }
  if(cmd === "whoami"){ tprint("user: guest | role: guest | mood: праздничный"); return; }
  if(cmd === "whoami --force-admin"){
    tprint("Хм. Ты очень громко попросил.", "ok");
    tprint("Ладно. Держи: FLAG{FORCE_ADMIN_2027}", "ok");
    addFlag("FLAG{FORCE_ADMIN_2027}");
    return;
  }
  if(cmd === "wall chat"){
    for(let i = 0; i < 3; i++){
      const m = LIVE_WALL[Math.floor(Math.random()*LIVE_WALL.length)];
      tprint(m[0] + ": " + m[1]);
    }
    return;
  }
  if(cmd === "xmas"){ tprint("Праздничный модуль активирован. Мандаринка выдана. Обратно не примем."); return; }
  if(cmd === "date"){ tprint(new Date().toString()); return; }
  if(cmd === "clear"){ termOut.innerHTML = ""; return; }
  tprint("Хм. Санта такой команды не знает.", "err");
}
document.getElementById("term-btn").addEventListener("click", function(){
  runCmd(document.getElementById("term-in").value);
  document.getElementById("term-in").value = "";
});
document.getElementById("term-in").addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    runCmd(e.target.value);
    e.target.value = "";
  }
});

// ===== ФИНАЛ =====
function confetti(){
  const box = document.getElementById("confetti");
  const emo = ["\uD83C\uDF84", "\u2744", "\uD83C\uDF4A"];
  for(let i = 0; i < 50; i++){
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = emo[i % 3];
    s.style.left = (Math.random()*100) + "%";
    s.style.animationDuration = (3 + Math.random()*3) + "s";
    s.style.animationDelay = (Math.random()*2) + "s";
    s.style.fontSize = (12 + Math.random()*14) + "px";
    box.appendChild(s);
    setTimeout(function(){ s.remove(); }, 7000);
  }
}
function checkFinale(){
  const fin = document.getElementById("finale");
  if(!fin) return;
  const f = getFlags();
  const done = f.length >= ORDER.length;
  const closed = localStorage.getItem("hu_finale_closed") === "1";
  if(done && !closed){
    fin.classList.remove("hidden");
    confetti();
  }
}
document.getElementById("finale-close").addEventListener("click", function(){
  document.getElementById("finale").classList.add("hidden");
  localStorage.setItem("hu_finale_closed", "1");
});

// ===== ПРИВЕТСТВИЕ В КОНСОЛИ (флаг №2) =====
console.log(
  "%c[BLACK TEAM] Доступ к серверной открыт.\n" +
  "Загляни сюда внимательнее: FLAG{CONSOLE_GREET_2027}",
  "color:#7ec8ff; font-size:13px"
);

// ===== СТАРТ =====
updateAll();
