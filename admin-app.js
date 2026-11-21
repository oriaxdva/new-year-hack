'use strict';
/* дублирующий страж штаба */
(function(){ if(!localStorage.getItem('hu_admin_session')){ location.replace('admin-login.html'); } })();

(function () {
  function ls(k, v) {
    if (arguments.length > 1) { try { localStorage.setItem(k, v); } catch (e) {} }
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function safe(name, fn) {
    try { fn(); } catch (e) { console.warn('[ШТАБ] секция "' + name + '" не поднялась:', e.message); }
  }
  function $(id) { return document.getElementById(id); }

  /* выход */
  safe('logout', function () {
    var b = $('logout');
    if (!b) return;
    b.addEventListener('click', function () {
      ls('hu_admin_session', null); try { localStorage.removeItem('hu_admin_session'); } catch (e) {}
      location.replace('admin-login.html');
    });
  });

  /* заметки (IDOR: третья должна была быть удалена) */
  safe('notes', function () {
    var NOTES = {
      '1': ['заметка 1: план сани', 'полировка полозьев завершена. секретного тут нет, но было приятно читать'],
      '2': ['заметка 2: реестр подарков', 'стол №4 просит ещё мандаринов. админство забирает всё лучшее'],
      '3': ['заметка 3: [удалено модератором]', 'кто-то стёр эту заметку, но ссылка осталась жива. классика.\n\nFLAG{IDOR_NOTE_3_2027}']
    };
    var params = new URLSearchParams(location.search);
    var n = params.get('note');
    if (!NOTES[n]) return;
    var modal = $('note-modal'), title = $('note-title'), body = $('note-body'), close = $('note-close');
    if (!modal || !title || !body) return;
    title.textContent = NOTES[n][0];
    body.textContent = NOTES[n][1];
    modal.hidden = false;
    if (close && !close.dataset.wired) {
      close.dataset.wired = '1';
      close.addEventListener('click', function () { modal.hidden = true; });
    }
  });

  /* роли: настоящая дверь через localStorage */
  safe('roles', function () {
    var roleNow = $('role-now'), input = $('role-input'), btn = $('role-apply'), msg = $('role-msg');
    if (!roleNow || !input || !btn) return;
    roleNow.textContent = ls('hu_role') || 'guest';
    btn.addEventListener('click', function () {
      var v = (input.value || '').trim().toLowerCase();
      ls('hu_role', v || 'guest');
      roleNow.textContent = v || 'guest';
      if (!msg) return;
      if (v === 'admin') {
        msg.textContent = 'роль admin применена. система довольна и испугана: FLAG{STORAGE_ROLE_2027}';
        msg.className = 'ok';
      } else {
        msg.textContent = 'роль «' + v + '» применена. особых привилегий не наблюдается';
        msg.className = '';
      }
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
  });
})();
