# HU::2027 — Новогодний квест Black Team

Праздничный сайт-квест: 8 флагов, живая стена, снег, гирлянды и финал-поздравление.

## Заливка
1. Все 8 файлов — в корень репозитория (Add file → Upload files → Commit changes).
2. GitHub Pages: Settings → Pages → main → Save.
3. Открыть сайт через Ctrl+F5.

## Карта флагов (только для владельца!)

| № | Флаг | Где | Как найти |
|---|------|-----|-----------|
| 1 | FLAG{HTML_C0MMENT_2027} | index.html | Комментарий сразу после `<body>` (Ctrl+U) |
| 2 | FLAG{C0NS0LE_M4STER} | app.js | Открывается в консоли браузера при загрузке (F12) |
| 3 | FLAG{NY_BR0ADCAST} | index.html | Досмотреть обращение до конца — сдается автоматически |
| 4 | FLAG{ADMIN_PANEL_H4CKED} | admin-login.html | Пароль в комментарии (`Ctrl+U`): M4ND4R1N2027 |
| 5 | FLAG{ID0R_N0TE_3} | admin.html | Открыть записку №3 (или `admin.html?note=3`) |
| 6 | FLAG{R0LE_SW4P_2027} | admin.html | В консоли: `localStorage.setItem('hu_role','admin')`, перезагрузить |
| 7 | FLAG{TERMIN4L_CHE4T_2027} | index.html | В терминале: `whoami --force-admin` |
| 8 | FLAG{ARCHIVE_CODE_2027} | admin-login + admin.html | В консоли декодировать `localStorage.getItem('backup_pin')` (ROT+3), ввести код в разделе «Резервный код» |

Декодирование флага №8:
```js
localStorage.getItem('backup_pin').split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('')
// → ARCHIVE_CODE_2027
```

## Порядок прохождения (растёт по сложности)
комментарий → консоль → эфир → robots+пароль → IDOR → смена роли → вежливый терминал → сейф.

## Прочее
- Прогресс: localStorage `hu_flags` (массив номеров), сброс — очистить ключ.
- Все 8 флагов → баннер «С Новым годом, Black Team!» + конфетти.
- На стене каждые 45 секунд всплывают «живые» сообщения (не подсказки).
- Пасхалки терминала: `xmas` (мандаринка 🍊), `newyear`, `wall chat`.
- Звук — кнопка 🔈 в шапке.
