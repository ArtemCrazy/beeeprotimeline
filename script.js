const STORAGE_KEY = "beeepro-sprint-timeline-v3";

const laneConfig = [
  {
    id: "design",
    title: "Дизайн",
    hint: "Флоу, UI, прототипы",
  },
  {
    id: "layout",
    title: "Верстка",
    hint: "Экраны, компоненты, адаптив",
  },
  {
    id: "integration",
    title: "Интеграция",
    hint: "API, логика, платежи",
  },
];

// Одинаковый набор этапов для всех трёх дорожек (Дизайн, Верстка, Интеграция)
const cardTitles = [
  "Главная (логин не нужен)",
  "Главная (авторизован)",
  "Список игр",
  "Категория Roblox",
  "Подкатегория Blade Ball",
  "Каталог товаров в подкатегории",
  "Фильтрация (открыта)",
  "Пустой каталог",
  "Обычная карточка",
  "Свободный лот (экран просмотра)",
  "Без наличия",
  "С инструкцией (длинной)",
  "С разными валютами/пакетами",
  "Результаты поиска",
  "Поиск с подсказками",
  "Ошибка поиска",
  "Пополнение Steam",
  "Пополнение Robux",
  "Ошибка валидации ID",
  "Успешная выдача",
  "Ошибка выдачи",
  "Корзина (Список): Товары, сумма, про...",
  "Корзина (Пустая)",
  "Чекаут (Выбор метода)",
  "Чекаут (Ожидание оплаты)",
  "Экран Успеха (Success Page)",
  "Экран Ошибки (Fail Page)",
  "Оставить отзыв (Форма)",
  "Список чатов (Все)",
  "Список чатов (Пустой)",
  "Окно переписки (Стандартное)",
  "Окно переписки (Спор / Арбитраж)",
  "Окно переписки (Заблокировано)",
  "Вложения: Вид прикрепленного файла",
  "Системные уведомления",
  "Тикет поддержки",
  "Тикет открыт / тикет решён",
  "Мой баланс: Главная страница кошелька",
  "Пополнение (Выбор метода)",
  "Вывод средств (Заявка)",
  "История операций",
  "Детали операции",
  "Мои отзывы (Я покупатель)",
  "Настройка безопасности",
  "Главный профиль",
  "История покупок",
  "Избранное",
  "Настройки",
  "Все уведомления",
  "Настройки уведомлений",
  "Вход / Регистрация",
  "Восстановление пароля",
  "Новый пароль",
  "2FA (Ввод кода)",
  "Дашборд",
  "Настройки магазина: Аватарка магазина",
  "Создание лота",
  "Экран аналитики",
  "Управление товарами (Инвентарь)",
  "Редактирование товара",
  "Массовое редактирование",
  "Мои Продажи (Заказы)",
  "Управление командой",
  "Настройка прав сотрудника",
  "Отзывы обо мне (Я продавец)",
  "Страница 404 (Не найдено)",
  "Страница 500 (Технические работы)",
  "Оферта (Terms of Service)",
  "Политика конфиденциальности",
  "Политика возвратов",
  "FAQ",
  "Инструкция по Roblox",
  "Инструкция по Steam",
];

const defaultCards = [
  ...cardTitles.map((title, i) => ({ id: `design-${i}`, lane: "design", title })),
  ...cardTitles.map((title, i) => ({ id: `layout-${i}`, lane: "layout", title })),
  ...cardTitles.map((title, i) => ({ id: "integration-" + i, lane: "integration", title })),
];

const monthNames = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const shortMonthNames = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

const weekdayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const weekColumns = buildWeekColumns(
  new Date(2026, 2, 2),
  new Date(2026, 7, 31),
  5
);

let state = loadState();

const poolGrid = document.getElementById("poolGrid");
const timelineBoard = document.getElementById("timelineBoard");
const cardTemplate = document.getElementById("cardTemplate");
const addCardBtn = document.getElementById("addCardBtn");

render();
bindEvents();

function bindEvents() {
  const boardScroll = document.querySelector(".board-scroll");
  if (boardScroll) {
    let scrollStartX = 0;
    let scrollLeftStart = 0;

    timelineBoard.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".month-cell, .week-cell, .corner-cell")) return;
      e.preventDefault();
      scrollStartX = e.clientX;
      scrollLeftStart = boardScroll.scrollLeft;
      document.body.classList.add("board-scroll-dragging");
      e.currentTarget.setPointerCapture(e.pointerId);
    });

    timelineBoard.addEventListener("pointermove", (e) => {
      if (!document.body.classList.contains("board-scroll-dragging")) return;
      const dx = scrollStartX - e.clientX;
      boardScroll.scrollLeft = scrollLeftStart + dx;
    });

    timelineBoard.addEventListener("pointerup", (e) => {
      if (document.body.classList.contains("board-scroll-dragging")) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        document.body.classList.remove("board-scroll-dragging");
      }
    });

    timelineBoard.addEventListener("pointercancel", (e) => {
      if (document.body.classList.contains("board-scroll-dragging")) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        document.body.classList.remove("board-scroll-dragging");
      }
    });
  }

  document.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task-card");

    if (!card) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.dataset.cardId);
    card.classList.add("is-dragging");
  });

  document.addEventListener("dragend", (event) => {
    const card = event.target.closest(".task-card");

    if (card) {
      card.classList.remove("is-dragging");
    }

    document
      .querySelectorAll(".is-drop-target")
      .forEach((element) => element.classList.remove("is-drop-target"));
  });

  document.addEventListener("dragover", (event) => {
    const zone = event.target.closest("[data-dropzone='true']");

    if (!zone) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  document.addEventListener("dragenter", (event) => {
    const zone = event.target.closest("[data-dropzone='true']");

    if (zone) {
      zone.classList.add("is-drop-target");
    }
  });

  document.addEventListener("dragleave", (event) => {
    const zone = event.target.closest("[data-dropzone='true']");

    if (zone && !zone.contains(event.relatedTarget)) {
      zone.classList.remove("is-drop-target");
    }
  });

  document.addEventListener("drop", (event) => {
    const zone = event.target.closest("[data-dropzone='true']");

    if (!zone) {
      return;
    }

    event.preventDefault();
    zone.classList.remove("is-drop-target");

    const cardId = event.dataTransfer.getData("text/plain");
    const card = state.cards.find((item) => item.id === cardId);

    if (!card) {
      return;
    }

    card.location = {
      type: zone.dataset.type,
      lane: zone.dataset.lane,
      weekId: zone.dataset.weekId || null,
    };

    persistState();
    render();
  });

  addCardBtn.addEventListener("click", () => {
    const title = window.prompt("Название карточки");

    if (!title || !title.trim()) {
      return;
    }

    const ts = Date.now();
    const laneIds = ["design", "layout", "integration"];

    laneIds.forEach((lane) => {
      state.cards.push({
        id: `card-${ts}-${lane}`,
        lane,
        title: title.trim(),
        location: { type: "pool", lane, weekId: null },
      });
    });

    persistState();
    render();
  });
}

function render() {
  renderPool();
  renderBoard();
}

function renderPool() {
  poolGrid.innerHTML = "";

  laneConfig.forEach((lane) => {
    const column = document.createElement("article");
    column.className = "pool-column";
    column.dataset.lane = lane.id;

    const head = document.createElement("div");
    head.className = "pool-column-head";
    head.innerHTML = `
      <div class="lane-badge">
        <span class="lane-dot" data-lane="${lane.id}"></span>
        <span>${lane.title}</span>
      </div>
    `;

    const stack = document.createElement("div");
    stack.className = "task-stack";
    stack.dataset.dropzone = "true";
    stack.dataset.type = "pool";
    stack.dataset.lane = lane.id;

    const cards = getCardsForLocation({ type: "pool", lane: lane.id, weekId: null });

    if (cards.length === 0) {
      const empty = document.createElement("div");
      empty.className = "dropzone-empty";
      empty.textContent = "Этапы этой дорожки уже распределены";
      stack.appendChild(empty);
    } else {
      cards.forEach((card) => stack.appendChild(createCard(card)));
    }

    column.append(head, stack);
    poolGrid.appendChild(column);
  });
}

function getCurrentSprintIndex() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < weekColumns.length; i++) {
    const start = new Date(weekColumns[i].start);
    const end = new Date(weekColumns[i].end);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (today >= start && today <= end) return i;
  }
  return -1;
}

function renderBoard() {
  timelineBoard.innerHTML = "";
  timelineBoard.style.setProperty("--week-count", String(weekColumns.length));
  const currentSprintIndex = getCurrentSprintIndex();

  const corner = document.createElement("div");
  corner.className = "corner-cell";
  corner.style.gridColumn = "1 / 2";
  corner.style.gridRow = "1 / 3";
  corner.innerHTML = `
    <strong>Команда</strong>
    <span class="corner-caption">Слева дорожки, справа недельные спринты</span>
  `;
  timelineBoard.appendChild(corner);

  weekColumns.forEach((week, index) => {
    const monthCell = document.createElement("div");
    monthCell.className = "month-cell";
    monthCell.style.gridColumn = `${index + 2} / span ${week.span}`;
    monthCell.style.gridRow = "1 / 2";
    monthCell.innerHTML = `
      <span class="month-name">${week.monthLabel}</span>
    `;

    if (week.startsMonth) {
      timelineBoard.appendChild(monthCell);
    }
  });

  weekColumns.forEach((week, index) => {
    const weekCell = document.createElement("div");
    weekCell.className = "week-cell" + (index === currentSprintIndex ? " current-sprint" : "");
    weekCell.style.gridColumn = `${index + 2} / ${index + 3}`;
    weekCell.style.gridRow = "2 / 3";
    weekCell.innerHTML = `
      <span class="week-date">${formatWeekRange(week.start, week.end)}</span>
    `;
    timelineBoard.appendChild(weekCell);
  });

  laneConfig.forEach((lane, laneIndex) => {
    const row = laneIndex + 3;
    const label = document.createElement("div");
    label.className = "lane-cell";
    label.style.gridColumn = "1 / 2";
    label.style.gridRow = `${row} / ${row + 1}`;
    label.innerHTML = `
      <div class="lane-label">
        <span class="lane-title">${lane.title}</span>
        <span class="lane-hint">${lane.hint}</span>
      </div>
    `;
    timelineBoard.appendChild(label);

    weekColumns.forEach((week, weekIndex) => {
      const zone = document.createElement("div");
      zone.className = "dropzone" + (weekIndex === currentSprintIndex ? " current-sprint" : "");
      zone.dataset.dropzone = "true";
      zone.dataset.type = "week";
      zone.dataset.lane = lane.id;
      zone.dataset.weekId = week.id;
      zone.style.gridColumn = `${weekIndex + 2} / ${weekIndex + 3}`;
      zone.style.gridRow = `${row} / ${row + 1}`;

      const stack = document.createElement("div");
      stack.className = "task-stack";

      const cards = getCardsForLocation({ type: "week", lane: lane.id, weekId: week.id });

      if (cards.length > 0) {
        cards.forEach((card) => stack.appendChild(createCard(card)));
      }

      zone.appendChild(stack);
      timelineBoard.appendChild(zone);
    });
  });
}

function createCard(card) {
  const cardElement = cardTemplate.content.firstElementChild.cloneNode(true);
  cardElement.textContent = card.title;
  cardElement.dataset.cardId = card.id;
  cardElement.dataset.lane = card.lane;
  cardElement.title = `${card.title} • ${getLaneTitle(card.lane)}`;
  return cardElement;
}

function getCardsForLocation(location) {
  return state.cards.filter((card) => {
    return (
      card.location.type === location.type &&
      card.location.lane === location.lane &&
      card.location.weekId === location.weekId
    );
  });
}

function getLaneTitle(laneId) {
  return laneConfig.find((lane) => lane.id === laneId)?.title ?? laneId;
}

function createInitialState() {
  return {
    cards: defaultCards.map((card) => ({
      ...card,
      location: { type: "pool", lane: card.lane, weekId: null },
    })),
  };
}

function loadState() {
  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(saved);

    if (!parsed || !Array.isArray(parsed.cards)) {
      return createInitialState();
    }

    // Сохраняем раскладку как есть: карточки в пуле и в спринтах по неделям не сбрасываются
    return {
      cards: parsed.cards.map((card) => ({
        id: card.id,
        lane: card.lane,
        title: card.title,
        location: {
          type: card.location?.type ?? "pool",
          lane: card.location?.lane ?? card.lane,
          weekId: card.location?.weekId ?? null,
        },
      })),
    };
  } catch {
    return createInitialState();
  }
}

function persistState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Пятидневка: спринт = понедельник–пятница (5 дней). Следующий спринт — в следующий понедельник (+7 дней).
function buildWeekColumns(startDate, endDate, daysPerSprint = 5) {
  const weeks = [];
  const endTime = endDate.getTime();
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  let currentMonthKey = null;
  let currentMonthIndex = null;

  while (cursor.getTime() <= endTime) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const d = cursor.getDate();
    const weekStart = new Date(y, m, d);
    const weekEnd = new Date(y, m, d + (daysPerSprint - 1));
    const visibleWeekEnd = weekEnd.getTime() > endTime ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : weekEnd;

    const monthKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;
    const startsMonth = monthKey !== currentMonthKey;

    if (startsMonth) {
      currentMonthKey = monthKey;
      currentMonthIndex = weeks.length;
    }

    weeks.push({
      id: toIsoDate(weekStart),
      start: weekStart,
      end: visibleWeekEnd,
      monthLabel: monthNames[weekStart.getMonth()],
      year: weekStart.getFullYear(),
      startsMonth,
      span: 1,
    });

    const monthGroupStart = weeks[currentMonthIndex];
    monthGroupStart.span = weeks.length - currentMonthIndex;

    // Следующий спринт — через неделю (следующий понедельник)
    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

function formatWeekRange(startDate, endDate) {
  return `${startDate.getDate()}–${endDate.getDate()}`;
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
