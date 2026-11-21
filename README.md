# Новогодний квест Black Team 2027 — карта флагов (только для тебя)

## 8 флагов

| № | Флаг | Где лежит | Как получить |
|---|------|-----------|--------------|
| 1 | `FLAG{HTML_COMMENT_2027}` | index.html | Ctrl+U, комментарий после `<body>` |
| 2 | `FLAG{CONSOLE_GREET_2027}` | app.js | Открыть консоль (F12) при загрузке главной |
| 3 | `FLAG{BROADCAST_2027}` | app.js | Дослушать «Обращение» до конца |
| 4 | `FLAG{ADMIN_PANEL_H4CKED}` | admin-login.html | Пароль `M4ND4R1N2027` из комментария |
| 5 | `FLAG{IDOR_NOTE_3_2027}` | admin.html | `admin.html?note=3` — IDOR |
| 6 | `FLAG{STORAGE_ROLE_2027}` | admin.html | `localStorage.setItem('hu_role','admin')` затем «Проверить доступ» |
| 7 | `FLAG{FORCE_ADMIN_2027}` | app.js | Терминал: `whoami --force-admin` |
| 8 | `FLAG{ARCHIVE_CODE_2027}` | admin.html | Код в `localStorage.backup_pin` (ROT+3), ввести в сейф |

## Быстрый тест финала

```js
localStorage.setItem('hu_flags', JSON.stringify([
  'FLAG{HTML_COMMENT_2027}','FLAG{CONSOLE_GREET_2027}','FLAG{BROADCAST_2027}',
  'FLAG{ADMIN_PANEL_H4CKED}','FLAG{IDOR_NOTE_3_2027}','FLAG{STORAGE_ROLE_2027}',
  'FLAG{FORCE_ADMIN_2027}','FLAG{ARCHIVE_CODE_2027}'
]));
localStorage.removeItem('hu_finale_closed');
location.reload();
```

Сброс прогресса:
```js
localStorage.removeItem('hu_flags');
localStorage.removeItem('hu_finale_closed');
localStorage.removeItem('hu_role');
localStorage.removeItem('hu_section');
location.reload();
```

## Проверка ROT-3

`ARCHIVE_CODE_2027` + ROT3 = `DUFKLYH_FRGH_2027` (ключ `backup_pin`).

## Сдача флагов

Только в разделе «ЗАДАНИЯ» на главной. Флаги из штаба прилетают в счётчик автоматически.

## Живая стена

Каждые 45 секунд всплывает случайное сообщение (без подсказок, только атмосфера),
живёт 12 секунд. В терминале: `wall chat` — три подслушанных сообщения.

## Финал

При всех 8 флагах появляется поздравление с кнопкой ЗАКРЫТЬ.
Кнопка ставит `hu_finale_closed=1` — баннер больше не мешает, прогресс сохраняется.
При пустом прогрессе финал НЕ показывается: счётчик честно стартует с 0/8.
