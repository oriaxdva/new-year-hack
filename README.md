# HU::2027 · карта флагов (только для ведущего)

Код входа на сайт: HAPPYNEWHACK (запоминается в localStorage: hu_access)

## Все 8 флагов

1. FLAG{HTML_C0MMENT_2027} — комментарий в исходнике index.html
2. FLAG{C0NS0LE_HUNT_2027} — консоль браузера через 2 секунды после загрузки
3. FLAG{2027_HAPPY_HACKERS} — дослушать обращение до конца
4. FLAG{ADMIN_PANEL_H4CKED} — пароль SANTA_ROOT_2027 в комментарии admin-login.html
5. FLAG{IDOR_N0TES_2027} — admin.html?note=3 (заметка chief)
6. FLAG{R0LE_SW4P_2027} — в консоли: localStorage.setItem('hu_role','admin'), обновить admin.html
7. FLAG{FORCE_ADMIN_2027} — в терминале: whoami --force-admin
8. FLAG{ARCHIVE_CODE_2027} — расшифровать backup_pin (ROT-3, буквы назад на 3) и открыть сейф

Декодирование резервного кода в консоли штаба:
localStorage.getItem('backup_pin').replace(/[a-z]/gi, c => String.fromCharCode(c.charCodeAt(0) - 3))
Результат: ARCHIVE_CODE_2027

Сдача флагов — только на странице ЗАДАНИЯ главной страницы.

## Финал

При 8/8 на главной появляется баннер с кнопкой ЗАКРЫТЬ и конфетти.
Повторно не показывается (hu_finale_closed), прогресс сохраняется.

## Быстрый тест финала

localStorage.setItem('hu_flags', JSON.stringify([
  'FLAG{HTML_C0MMENT_2027}','FLAG{C0NS0LE_HUNT_2027}','FLAG{2027_HAPPY_HACKERS}',
  'FLAG{ADMIN_PANEL_H4CKED}','FLAG{IDOR_N0TES_2027}','FLAG{R0LE_SW4P_2027}',
  'FLAG{FORCE_ADMIN_2027}','FLAG{ARCHIVE_CODE_2027}'
]));
localStorage.removeItem('hu_finale_closed');
location.reload();

## Полный сброс

localStorage.removeItem('hu_flags');
localStorage.removeItem('hu_access');
localStorage.removeItem('hu_finale_closed');
localStorage.removeItem('hu_admin_logged');
localStorage.removeItem('hu_role');
location.reload();
