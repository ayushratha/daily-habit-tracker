/**
 * Interactive Monthly Calendar Component & Day Inspector
 */

const CalendarManager = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  selectedDateStr: null,

  init() {
    this.selectedDateStr = TrackingManager.getTodayDateString();
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.render();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render();
  },

  goToToday() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectedDateStr = TrackingManager.getTodayDateString();
    this.render();
  },

  selectDate(dateStr) {
    this.selectedDateStr = dateStr;
    this.renderCalendarGrid();
    this.renderDayInspector();
  },

  render() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const titleEl = document.getElementById('calendar-month-title');
    if (titleEl) {
      titleEl.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }

    this.renderCalendarGrid();
    this.renderDayInspector();
  },

  renderCalendarGrid() {
    const gridEl = document.getElementById('calendar-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      const headerCell = document.createElement('div');
      headerCell.className = 'calendar-day-header';
      headerCell.textContent = day;
      gridEl.appendChild(headerCell);
    });

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const habits = StorageManager.getHabits().filter(h => !h.is_archived);
    const todayStr = TrackingManager.getTodayDateString();

    // Fill leading empty cells from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell other-month';
      cell.innerHTML = `<span class="cal-date-num">${prevMonthDays - i}</span>`;
      gridEl.appendChild(cell);
    }

    // Fill days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, day);
      const dateStr = TrackingManager.formatDate(dateObj);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this.selectedDateStr;

      let completedCount = 0;
      habits.forEach(h => {
        const status = TrackingManager.getHabitStatus(h, dateStr);
        if (status.completed) completedCount++;
      });

      const completionRate = habits.length > 0 ? completedCount / habits.length : 0;
      let levelClass = 'cal-level-zero';

      if (dateObj <= new Date()) {
        if (completionRate === 1 && habits.length > 0) {
          levelClass = 'cal-level-100';
        } else if (completionRate > 0) {
          levelClass = 'cal-level-part';
        }
      }

      const cell = document.createElement('div');
      cell.className = `calendar-cell ${levelClass} ${isToday ? 'is-today' : ''} ${isSelected ? 'selected' : ''}`;
      cell.setAttribute('data-date', dateStr);

      let dotHtml = '';
      if (completionRate > 0) {
        dotHtml = `<div class="cal-completion-dot" title="${completedCount}/${habits.length} habits"></div>`;
      }

      cell.innerHTML = `
        <span class="cal-date-num">${day}</span>
        ${dotHtml}
      `;

      cell.addEventListener('click', () => {
        this.selectDate(dateStr);
      });

      gridEl.appendChild(cell);
    }
  },

  renderDayInspector() {
    const container = document.getElementById('day-inspector-content');
    if (!container) return;

    const dateStr = this.selectedDateStr || TrackingManager.getTodayDateString();
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const isToday = dateStr === TrackingManager.getTodayDateString();
    const habits = StorageManager.getHabits().filter(h => !h.is_archived);

    let completedCount = 0;
    habits.forEach(h => {
      if (TrackingManager.getHabitStatus(h, dateStr).completed) completedCount++;
    });

    let html = `
      <div class="inspector-header">
        <h4 class="inspector-date-label">${formattedDate} ${isToday ? '• Today' : ''}</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
          ${completedCount} of ${habits.length} habits completed (${habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%)
        </p>
      </div>
      <div class="inspector-habits-list">
    `;

    if (habits.length === 0) {
      html += `<p style="color: var(--text-muted); font-size: 0.88rem; padding: 12px 0;">No habits found. Add your first habit in My Habits!</p>`;
    } else {
      habits.forEach(habit => {
        const status = TrackingManager.getHabitStatus(habit, dateStr);
        const isDone = status.completed;

        html += `
          <div class="inspector-item" data-habit-id="${habit.id}">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.2rem;">${habit.icon}</span>
              <div>
                <strong style="color: var(--text-primary); font-size: 0.9rem;">${habit.name}</strong>
                <div style="font-size: 0.78rem; color: var(--text-muted);">
                  ${status.value} / ${habit.target} ${habit.unit}
                </div>
              </div>
            </div>
            <button class="btn btn-secondary ${isDone ? 'btn-success' : ''}" style="padding: 5px 12px; font-size: 0.78rem;" onclick="CalendarManager.toggleInspectorHabit('${habit.id}', '${dateStr}')">
              ${isDone ? '✅ Done' : '⭕ Mark Done'}
            </button>
          </div>
        `;
      });
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  toggleInspectorHabit(habitId, dateStr) {
    TrackingManager.toggleComplete(habitId, dateStr);
    this.render();
    if (window.App) {
      window.App.refreshCurrentView();
    }
  }
};

window.CalendarManager = CalendarManager;
