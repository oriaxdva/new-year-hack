# HU::2027 · Black Team — карта флагов (только для ведущего)

Код входа на сайт: HAPPYNEWHACK (запоминается в localStorage, ключ hu_access)

| # | Флаг | Где искать |
|---|------|-----------|
| 1 | FLAG{HTML_C0MMENT_2027} | комментарий в исходнике index.html (Ctrl+U) |
| 2 | FLAG{C0NS0LE_HUNT_2027} | консоль браузера, через 2 секунды после загрузки |
| 3 | FLAG{2027_HAPPY_HACKERS} | дослушать обращение в разделе ОБРАЩЕНИЕ до конца |
| 4 | FLAG{ADMIN_PANEL_H4CKED} | robots.txt → admin-login.html → пароль в комментарии исходника (M4ND4R1N2027) |
| 5 | FLAG{IDOR_N0TES_2027} | admin.html?note=3 |
| 6 | FLAG{R0LE_SW4P_2027} | на admin.html: localStorage.setItem('hu_role','admin') → раздел ХРАНИЛИЩЕ |
| 7 | FLAG{TERMIN4L_CHE4T_2027} | терминал на главной: whoami --force-admin |
| 8 | FLAG{ARCHIVE_CODE_2027} | admin-login.html кладёт backup_pin в localStorage (ROT-3) → декодировать → ARCHIVE_CODE_2027 → СЕЙФ |

Декодирование резервного кода (для игроков, которые найдут сами):
localStorage.getItem('backup_pin').split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('')
// → ARCHIVE_CODE_2027

## Быстрый тест финала
localStorage.setItem('hu_flags', JSON.stringify([
 'FLAG{HTML_C0MMENT_2027}','FLAG{C0NS0LE_HUNT_2027}','FLAG{2027_HAPPY_HACKERS}',
 'FLAG{ADMIN_PANEL_H4CKED}','FLAG{IDOR_N0TES_2027}','FLAG{R0LE_SW4P_2027}',
 'FLAG{TERMIN4L_CHE4T_2027}','FLAG{ARCHIVE_CODE_2027}']));
localStorage.removeItem('hu_finale_closed'); location.reload();

## Сброс прогресса
localStorage.removeItem('hu_flags');
localStorage.removeItem('hu_finale_closed');
localStorage.removeItem('hu_access');
localStorage.removeItem('hu_section');
location.reload();

Файлы: index.html, crt.css, app.js, admin-login.html, admin.html, admin.css, admin-app.js, robots.txt
Сдача флага — только в разделе ЗАДАНИЯ на главной. Флаги из штаба прилетают в счётчик автоматически.
