# Загрузка на сервер

**Важно:** папка на сервере (`beeeprotimeline` или другая из `remotePath`) должна **уже существовать**. Расширение не создаёт её — только заливает файлы. Создайте папку вручную в файловом менеджере, затем Upload Project.

Текущий путь: `crazy.studio/public_html/ai/beeeprotimeline` → ссылка **https://crazy.studio/ai/beeeprotimeline/**

---

# Загрузка на Beget (crazyportfolio.ru)

## Если после Upload папка остаётся пустой

Зайдите в папку `crazyportfolio.ru/public_html/beeepro/timeline` в файловом менеджере и нажмите **«Загрузить Файлы»**. Загрузите эти 3 файла из папки проекта на компьютере:

1. **index.html**
2. **styles.css**
3. **script.js**

Они лежат в корне папки `timeline` (рядом с этим DEPLOY.md). После загрузки сайт откроется по адресу: **https://crazyportfolio.ru/beeepro/timeline/**

---

## Загрузка из Cursor (если расширение сработает)

- Убедитесь, что в Cursor открыта именно папка **timeline** (та, где лежат index.html, styles.css, script.js).
- **Ctrl+Shift+P** → **SFTP: Upload Project**.

Путь в конфиге: `/crazyportfolio.ru/public_html/beeepro/timeline`.
