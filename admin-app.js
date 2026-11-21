/* ============================================================
   HU::ADMIN — логика штаба
   Страж сессии, записки с IDOR, проверка роли, выход.
   ============================================================ */
'use strict';
(function () {

  /* ---------- страж: без сессии сразу на вход ---------- */
  if (!localStorage.getItem('hu_admin_session')) {
    document.documentElement.style.visibility = 'hidden';
    location.replace('admin-login.html');
    return;
  }

  function $(id) { return document.getElementById(id); }

  function section(name, fn) {
    try { fn(); } catch (e) { console.warn('[HU:ADMIN] секция ' + name + ':', e && e.message); }
  }

  /* ---------- записки с IDOR ---------- */
  var NOTES = {
    1: 'деда мороз видит всё. особенно незакрытые Pull-реквесты.\nнапоминаю:дедлайн 25 декабря все флаги должны быть у ведущего.',
    2: 'кто-то съел мои мандарины из сейфа. мстить не буду, но помню.\nнарисовал ёлку на доске. она кривая, но смешная.'
  };
  var NOTE3 = 'секретная записка #3:\nфлаг для своих: FLAG{IDOR_NOTE_3_2027}\n(мы всё ещё уверены, что нумерация последовательная)';

  function showNote(n) {
    var view = $('note-view');
    if (!view) return;
    n = parseInt(n, 10);
    if (n === 1 || n === 2) {
      view.textContent = NOTES[n];
    } else if (n === 3) {
      if (view.dataset.flagged === '1') {
        view.textContent = 'записка уже прочитана. ведущий всё видел.';
      } else {
        view.textContent = NOTE3;
        view.dataset.flagged = '1';
        console.info('[HU:ADMIN] флаг из записки #3 получен через IDOR');
      }
    } else {
      view.textContent = 'записки с таким номером нет. и не было. наверное.';
    }
  }

  function setupNotes() {
    var tabs = document.querySelectorAll('.note-tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showNote(t.dataset.note); });
    });
    /* прямой параметр ?note=3 — ровно та дыра, ради которой всё затевалось */
    var params = new URLSearchParams(location.search);
    var noteParam = params.get('note');
    if (noteParam) showNote(noteParam);
  }

  /* ---------- проверка роли через localStorage ---------- */
  function roleView() {
    var view = $('role-view');
    if (!view) return;
    var role = null;
    try { role = localStorage.getItem('hu_role'); } catch (e) {}
    if (role === 'admin') {
      view.innerHTML = 'текущая роль: <span class="role-admin">admin</span>' +
        '<div class="ok-line">✔ права повышены. сам себя не похвалишь — никто не похвалит</div>' +
        '<div class="flag-line">FLAG{STORAGE_ROLE_2027}</div>' +
        '<div class="dim">// флаг запиши на странице ЗАДАНИЯ главного канала</div>';
    } else {
      view.innerHTML = 'текущая роль: <span class="role-guest">' + (role || 'guest') + '</span>' +
        '<div class="dim">// браузер хранит то, что ему сказали. подскажи ему роль — вдруг согласится</div>';
    }
  }

  function setupRole() {
    roleView();
    var input = $('cmd-input');
    var btn = $('cmd-btn');
    var msg = $('cmd-msg');
    function run() {
      var v = (input.value || '').trim().toLowerCase();
      input.value = '';
      if (v === 'whoami') {
        msg.textContent = 'роль: ' + (localStorage.getItem('hu_role') || 'guest');
      } else if (v === 'whoami --force-admin' || v === 'set role admin') {
        msg.textContent = 'роли командой не раздают. но браузер хранит кое-что в localStorage — hu_role';
      } else if (v !== '') {
        msg.textContent = 'команда не найдена: ' + v;
      }
    }
    if (btn) btn.addEventListener('click', run);
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); run(); }
    });
    /* смена роли через localStorage подхватывается при возврате на вкладку */
    window.addEventListener('focus', roleView);
    window.addEventListener('storage', roleView);
  }

  /* ---------- выход ---------- */
  function setupLogout() {
    var link = $('logout-link');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.removeItem('hu_admin_session'); } catch (err) {}
      location.replace('admin-login.html');
    });
  }

  section('notes', setupNotes);
  section('role', setupRole);
  section('logout', setupLogout);
  console.info('[HU:ADMIN] штаб готов.');

})();
