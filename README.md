# HU::2027 · Black Team · карта флагов

Внутренняя карта. Игрокам не показывать (но они всё равно прочитают — им можно).

## Код доступа на сайт
- `HAPPYNEWHACK` — окно входа на чёрном фоне. Хранится в localStorage (`hu_access`).
  Сброс: `localStorage.removeItem('hu_access')` + перезагрузка.

## Флаги (6)

| # | Флаг | Где лежит |
|---|------|-----------|
| 1 | `FLAG{HTML_C0MMENT_2027}` | комментарий в исходнике index.html |
| 2 | `FLAG{C0NS0LE_HUNT_2027}` | консоль браузера (появляется через 2 сек) |
| 3 | `FLAG{2027_HAPPY_HACKERS}` | досмотреть трансляцию в разделе ЭФИР до конца |
| 4 | `FLAG{ADMIN_PANEL_H4CKED}` | пароль штаба на admin-login.html (в комментарии исходника) |
| 5 | `FLAG{IDOR_N0TES_2027}` | открыть admin.html?note=3 — записка, которой нет в списке |
| 6 | `FLAG{R0LE_SW4P_2027}` | в консоли: localStorage.setItem('hu_role','admin'), затем обновить штаб |

## Пароли
- Пароль штаба: `hackmas2027` (спрятан в комментарии admin-login.html)
- Сдача флагов — только на странице ЗАДАНИЯ на главной.

## Финал
При 6/6 открывается баннер «С Новым 2027-м, Black Team» с конфетти и кнопкой ЗАКРЫТЬ.
Сброс закрытия: `localStorage.removeItem('hu_finale_closed')`.

## Команды быстрого теста
```js
// все флаги сразу (проверка финала):
localStorage.setItem('hu_flags', JSON.stringify(['FLAG{HTML_C0MMENT_2027}','FLAG{C0NS0LE_HUNT_2027}','FLAG{2027_HAPPY_HACKERS}','FLAG{ADMIN_PANEL_H4CKED}','FLAG{IDOR_N0TES_2027}','FLAG{R0LE_SW4P_2027}']));
localStorage.removeItem('hu_finale_closed'); location.reload();

// полный сброс квеста:
localStorage.clear(); location.reload();
```

## Состав файлов
- index.html / crt.css / app.js — главная
- admin-login.html / admin.html / admin-app.js / admin.css — штаб (страж: без сессии `hu_admin_session` страницы отдают на вход)
- robots.txt — намёки
