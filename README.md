# HU::2027 // BLACK TEAM — новогодний квест

Карта флагов (только для организатора, игрокам не показывать):

1. `FLAG{H1DDEN_SOURC3}` — комментарий в исходнике `index.html` (Ctrl+U).
2. `FLAG{CONS0LE_NEWYEAR}` — приветствие в консоли браузера (F12) на главной.
3. `FLAG{L1VE_BR0ADCAST}` — досмотреть эфир в разделе «ОБРАЩЕНИЕ» до конца (печатается сам).
4. `FLAG{ADMIN_PANEL_H4CKED}` — `robots.txt` ведёт на `admin-login.html`; пароль `M4ND4R1N2027` лежит в комментарии исходника страницы входа. Сдаётся автоматически при входе.
5. `FLAG{ID0R_N0TE_3}` — в штабе открыть `admin.html?note=3` (в списке видны только заметки 1 и 2; заметка #2 намекает, что #3 «удалена»).
6. `FLAG{R0LE_SW4P_2027}` — в консоли: `localStorage.setItem('hu_role','admin')`, обновить `admin.html`. Хранилище само выдаст флаг.
7. `FLAG{TERMIN4L_CHE4T_2027}` — терминал на главной: `whoami --force-admin`.
8. `FLAG{ARC_H1VE_2027}` — в консоли: `localStorage.getItem('backup_pin').split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('')` → получить `ARCHIVE_CODE_2027`, ввести его в штабе в разделе «Резервный код».

Проверка кодировки: `ARCHIVE_CODE_2027` в ROT+3 даёт `DUFKLYH_FRGH_2027` — это значение лежит в `backup_pin` после входа на страницу штаба.

Финал: при 8/8 на главной открывается поздравление «С Новым годом, Black Team! Ты хороший боец. Без вас этот год был бы просто набором логов» и конфетти. Прогресс (`hu_flags`, `hu_finale`) хранится в localStorage; для полного перепрохождения очистить `hu_flags`, `hu_bc`, `hu_finale`, `hu_role`, `backup_pin`.

Сдача флагов — только в разделе «ЗАДАНИЯ» на главной. Флаги, полученные в штабе, попадают в общий счётчик автоматически.

Файлы: `index.html`, `crt.css`, `app.js`, `admin-login.html`, `admin.html`, `admin.css`, `robots.txt`.
