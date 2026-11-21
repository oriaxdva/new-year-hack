# HU::2027 · Black Team — новогодний квест

Код активации на входе на сайт: **HAPPYNEWHACK** (выдаётся игрокам лично, в том же стиле).

## Карта флагов (только для ведущего)

1. `FLAG{HTML_C0MMENT_2027}` — комментарий в исходнике index.html (Ctrl+U).
2. `FLAG{C0NS0LE_HUNT_2027}` — консоль браузера: сообщение появляется через 2 секунды после загрузки.
3. `FLAG{2027_HAPPY_HACKERS}` — досмотреть обращение в разделе ОБРАЩЕНИЕ до конца.
4. `FLAG{ADMIN_PANEL_H4CKED}` — пароль M4ND4R1N2027 спрятан в комментарии admin-login.html. Пароль также кладёт в localStorage ключ backup_pin.
5. `FLAG{IDOR_N0TES_2027}` — admin.html?note=3 (заметка с чужим id).
6. `FLAG{R0LE_SW4P_2027}` — в консоли на admin.html: `localStorage.setItem('hu_role','admin')` и перезагрузка.
7. `FLAG{FORCE_ADMIN_2027}` — в терминале: `whoami --force-admin`.
8. `FLAG{ARCHIVE_CODE_2027}` — декодировать backup_pin (ROT-3 по буквам, знаки не трогаем) и открыть сейф в штабе.

Код backup_pin: `DUFKLYH_FRGH_2027` → после сдвига на -3 по буквам: `ARCHIVE_CODE_2027`.
Декодер для игроков:

```js
localStorage.getItem('backup_pin').split('').map(c => /[A-Z]/.test(c) ? String.fromCharCode(c.charCodeAt(0)-3) : c).join('')
```

## Финал

При всех 8 флагах на главной появляется баннер «С Новым годом, Black Team! Ты хороший боец» с кнопкой ЗАКРЫТЬ и конфетти. Закрытие запоминается (`hu_finale_closed`).

## Быстрый тест финала

```js
localStorage.setItem('hu_flags', JSON.stringify(['FLAG{HTML_C0MMENT_2027}','FLAG{C0NS0LE_HUNT_2027}','FLAG{2027_HAPPY_HACKERS}','FLAG{ADMIN_PANEL_H4CKED}','FLAG{IDOR_N0TES_2027}','FLAG{R0LE_SW4P_2027}','FLAG{FORCE_ADMIN_2027}','FLAG{ARCHIVE_CODE_2027}']));
localStorage.removeItem('hu_finale_closed');
location.reload();
```

Сброс прогресса: `localStorage.removeItem('hu_flags'); localStorage.removeItem('hu_finale_closed'); location.reload();`

## Заливка на GitHub Pages

Add file → Upload files → все 8 файлов → Commit changes → 1–2 минуты → Ctrl+F5.