# HU::2027 — новогодний хакерский квест

Статический квест на GitHub Pages: игрок ищет флаги вида `FLAG{...}` на «закрытом канале».

## Файлы

| Файл | Назначение |
|---|---|
| `index.html` | Главный канал. Флаг №1 — в комментарии в `<head>` |
| `crt.css` | Зелёная CRT-тема (VT323, панель 860px, сканлайны) |
| `app.js` | Движок: вход, флаги, эфир, стена, терминал, финал |
| `admin-login.html` | Вход в штаб. Пароль — в комментарии в исходниках |
| `admin.html` | Штаб (защищён стражем сессии) |
| `admin-app.js` | Логика штаба: IDOR, роль, выход |
| `admin.css` | Янтарная тема штаба |
| `robots.txt` | Туманные намёки |

## Карта флагов

| № | Флаг | Где искать |
|---|---|---|
| 1 | `FLAG{WELCOME_2027}` | Комментарий в исходниках `index.html` |
| 2 | `FLAG{CONSOLE_2027}` | Консоль браузера: `console.hack()` |
| 3 | `FLAG{LIVE_BROADCAST_2027}` | Глитч-строка в эфире (кликнуть) |
| 4 | `FLAG{ADMIN_PANEL_H4CKED}` | Верный пароль на `admin-login.html` |
| 5 | `FLAG{IDOR_NOTE_3_2027}` | В штабе: `admin.html?note=3` или перебор записок |
| 6 | `FLAG{STORAGE_ROLE_2027}` | В штабе: в консоли `localStorage.setItem('hu_role','admin')`, затем вернуться на вкладку |
| ★ | секретный флаг | Любая «билибирда» в поле сдачи на странице ЗАДАНИЯ. Считается один раз, отображается как «★ секретный флаг», счётчик показывает 7/6 |

## Ключи доступа

- Код входа на канал: `HAPPYNEWHACK` (хранится в `localStorage.hu_access`)
- Пароль штаба: `hackmas2027` (сессия: `hu_admin_session`)

## Быстрая проверка

1. Открыть сайт → ввести `HAPPYNEWHACK`.
2. `F12` → в консоли `console.hack()` → флаг №2.
3. В поле сдачи ввести любую бессмыслицу → «★ секретный флаг».
4. `admin-login.html` → `hackmas2027` → флаг №4 → в штаб → `?note=3` → флаг №5.
5. В консоли `localStorage.setItem('hu_role','admin')` → вернуться на вкладку штаба → флаг №6.
6. В эфире дождаться глитч-строки (первые ~40 секунд) → клик → флаг №3.
7. Сдать всё на странице ЗАДАНИЯ → финал с конфетти.

## Сброс для теста

```js
localStorage.removeItem('hu_access');
localStorage.removeItem('hu_flags');
localStorage.removeItem('hu_secret_flag');
localStorage.removeItem('hu_admin_session');
localStorage.removeItem('hu_role');
```

## Команды терминала

`help`, `whoami`, `whoami --force-admin`, `flags`, `wall chat`, `xmas`, `clear`. Команда `submit` отказная — сдача только через страницу ЗАДАНИЯ.
