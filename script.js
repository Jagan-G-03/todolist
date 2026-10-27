const STORAGE_KEY = "focus-list-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskSummary = document.querySelector("#task-summary");
const completedSummary = document.querySelector("#completed-summary");
const clearCompletedButton = document.querySelector("#clear-completed");
const currentDate = document.querySelector("#current-date");
const progressBar = document.querySelector("#progress-bar");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

const savedTheme = localStorage.getItem("focus-list-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
}
updateThemeButton();

currentDate.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric"
}).format(new Date());

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  taskList.innerHTML = "";

  if (visibleTasks.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = activeFilter === "all" ? "Your list is clear. Add a task to get started." : `No ${activeFilter} tasks.`;
    taskList.append(emptyState);
  } else {
    visibleTasks.forEach((task) => taskList.append(createTaskElement(task)));
  }

  const remainingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;
  taskSummary.textContent = `${remainingCount} ${remainingCount === 1 ? "task" : "tasks"} left`;
  completedSummary.textContent = `${completedCount} completed`;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", String(Math.round(progress)));
  clearCompletedButton.disabled = completedCount === 0;
  clearCompletedButton.setAttribute("aria-disabled", String(completedCount === 0));
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " completed" : ""}`;

  const checkButton = document.createElement("button");
  checkButton.className = "check-button";
  checkButton.type = "button";
  checkButton.setAttribute("aria-label", task.completed ? `Mark ${task.text} as active` : `Complete ${task.text}`);
  checkButton.textContent = task.completed ? "✓" : "";
  checkButton.addEventListener("click", () => {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => {
    item.classList.add("removing");
    window.setTimeout(() => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      saveTasks();
      renderTasks();
    }, 220);
  });

  item.append(checkButton, text, deleteButton);
  return item;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => filterButton.classList.toggle("active", filterButton === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("focus-list-theme", isDark ? "dark" : "light");
  updateThemeButton();
});

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark-theme");
  themeToggle.textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

renderTasks();
