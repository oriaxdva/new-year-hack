# HU::2027 · Black Team · карта флагов

## Код доступа на сайт
- `HAPPYNEWHACK` — окно входа на чёрном фоне. Хранится в localStorage (`hu_access`).
  Сброс: `localStorage.removeItem('hu_access')` + перезагрузка.

## Пароли
- Пароль штаба: `hackmas2027` (спрятан в комментарии admin-login.html)
- Сдача флагов — только на странице ЗАДАНИЯ на главной.

## Финал
При 6/6 открывается баннер «С Новым 2027-м, Black Team» с конфетти и кнопкой ЗАКРЫТЬ.
Сброс закрытия: `localStorage.removeItem('hu_finale_closed')`.

## Команды быстрого теста

// полный сброс квеста:
localStorage.clear(); location.reload();
```

## Состав файлов
- index.html / crt.css / app.js — главная
- admin-login.html / admin.html / admin-app.js / admin.css — штаб (страж: без сессии `hu_admin_session` страницы отдают на вход)
- robots.txt — намёки
