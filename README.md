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

// полный сброс квеста:
localStorage.clear(); location.reload();
```

