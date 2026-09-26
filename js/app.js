/**
 * HabitFlow - Main Application Controller
 * Handles Routing, State Coordination, Modal Dialogs & UI Events
 */

const App = {
  currentView: 'dashboard',
  habitFilter: 'all', // 'all' | 'pending' | 'completed'
  manageSearchQuery: '',
  selectedEmoji: '📚',

  quotes: [
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "Small daily improvements over time lead to stunning results.",
    "Motivation gets you started. Habit is what keeps you going.",
    "Success is the product of daily habits—not once-in-a-lifetime transformations.",
    "Consistency is the true foundation of trust in yourself."
  ],

  init() {
    StorageManager.init();
    CalendarManager.init();

    this.bindEvents();
    this.applyTheme(StorageManager.getSettings().theme);
    this.renderUserProfile();
    this.showView('dashboard');

    // Run scheduled reminder check every 45 seconds
    setInterval(() => {
      NotificationManager.checkScheduledReminders();
    }, 45000);
  },

  bindEvents() {
    // Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        this.showView(targetView);

        // Auto close mobile sidebar
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar && window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Quick Add Button in Header
    const btnQuickAdd = document.getElementById('btn-quick-add');
    if (btnQuickAdd) {
      btnQuickAdd.addEventListener('click', () => {
        this.openAddHabitModal();
      });
    }

    // Dashboard Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.habitFilter = pill.getAttribute('data-filter');
        this.renderDashboardHabits();
      });
    });

    // Habit Manager Search
    const searchInput = document.getElementById('manager-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.manageSearchQuery = e.target.value.toLowerCase();
        this.renderHabitsManager();
      });
    }

    // Habit Modal Form Submit
    const habitForm = document.getElementById('form-habit-modal');
    if (habitForm) {
      habitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveHabitForm();
      });
    }

    // Settings Profile Form
    const profileForm = document.getElementById('form-settings-profile');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('settings-user-name').value;
        const email = document.getElementById('settings-user-email').value;
        const avatar = document.getElementById('settings-user-avatar').value;

        StorageManager.setUser({ id: 'usr_ayush_01', name, email, avatar });
        this.renderUserProfile();
        this.renderGreeting();
        NotificationManager.showToast('Profile updated!', 'success');
      });
    }

    // Settings Theme Select
    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        this.applyTheme(theme);
        const settings = StorageManager.getSettings();
        settings.theme = theme;
        StorageManager.setSettings(settings);
      });
    }

    // Settings Toggles
    const soundToggle = document.getElementById('toggle-sound');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        const settings = StorageManager.getSettings();
        settings.soundEnabled = e.target.checked;
        StorageManager.setSettings(settings);
        if (e.target.checked) NotificationManager.playPopSound();
      });
    }

    const notifToggle = document.getElementById('toggle-notifications');
    if (notifToggle) {
      notifToggle.addEventListener('change', async (e) => {
        const settings = StorageManager.getSettings();
        settings.notificationsEnabled = e.target.checked;
        StorageManager.setSettings(settings);
        if (e.target.checked) {
          await NotificationManager.requestNotificationPermission();
        }
      });
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) themeSelect.value = theme;
    if (this.currentView === 'statistics') {
      StatisticsManager.render();
    }
  },

  showView(viewName) {
    this.currentView = viewName;

    // Update Nav Link Active Class
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide all view sections and show active
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Update Header title & description
    const titleEl = document.getElementById('header-view-title');
    const descEl = document.getElementById('header-view-desc');
    const titles = {
      dashboard: { title: 'Dashboard', desc: 'Track your progress and maintain your daily streak' },
      habits: { title: 'My Habits', desc: 'Create, customize, and manage your habits & daily goals' },
      calendar: { title: 'Calendar', desc: 'Historical completion logs and day-by-day inspector' },
      statistics: { title: 'Statistics & Analytics', desc: '7-day completion trends, streaks, and category distribution' },
      settings: { title: 'Settings', desc: 'Manage your profile, preferences, data backups & database schema' }
    };
    if (titleEl && titles[viewName]) titleEl.textContent = titles[viewName].title;
    if (descEl && titles[viewName]) descEl.textContent = titles[viewName].desc;

    // View specific renders
    if (viewName === 'dashboard') {
      this.renderDashboard();
    } else if (viewName === 'habits') {
      this.renderHabitsManager();
    } else if (viewName === 'calendar') {
      CalendarManager.render();
    } else if (viewName === 'statistics') {
      StatisticsManager.render();
    } else if (viewName === 'settings') {
      this.renderSettings();
    }

    this.updateSidebarStreak();
  },

  refreshCurrentView() {
    this.showView(this.currentView);
  },

  renderUserProfile() {
    const user = StorageManager.getUser();
    const avatarEl = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    if (avatarEl) avatarEl.textContent = user.avatar || '👨‍💻';
    if (nameEl) nameEl.textContent = user.name || 'Ayush';
  },

  renderGreeting() {
    const greetingEl = document.getElementById('hero-greeting-text');
    const user = StorageManager.getUser();
    const now = new Date();
    const hour = now.getHours();

    let timeGreeting = 'Good evening';
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 22 || hour < 5) timeGreeting = 'Time to rest';

    if (greetingEl) {
      greetingEl.innerHTML = `${timeGreeting}, ${user.name || 'Ayush'} 👋`;
    }

    // Random quote
    const quoteEl = document.getElementById('hero-quote-text');
    if (quoteEl) {
      const qIndex = now.getDate() % this.quotes.length;
      quoteEl.textContent = `"${this.quotes[qIndex]}"`;
    }

    // Date badge
    const dateBadgeEl = document.getElementById('hero-date-badge');
    if (dateBadgeEl) {
      dateBadgeEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  },

  updateSidebarStreak() {
    const streak = TrackingManager.getStreakStats();
    const sideStreakVal = document.getElementById('sidebar-streak-value');
    if (sideStreakVal) {
      sideStreakVal.textContent = `${streak.currentStreak} Days`;
    }
    const habitBadge = document.getElementById('nav-habits-count');
    if (habitBadge) {
      habitBadge.textContent = StorageManager.getHabits().length;
    }
  },

  /* ==========================================================================
     DASHBOARD RENDERING
     ========================================================================== */
  renderDashboard() {
    this.renderGreeting();
    this.renderDashboardProgress();
    this.renderDashboardHabits();
    this.renderWeeklyProgressWidget();
  },

  renderDashboardProgress() {
    const stats = TrackingManager.getTodayStats();
    const fillEl = document.getElementById('today-progress-fill');
    const pctEl = document.getElementById('today-progress-percentage');
    const counterEl = document.getElementById('today-progress-counter');

    if (fillEl) {
      fillEl.style.width = `${stats.percentage}%`;
      if (stats.percentage === 100) fillEl.classList.add('complete');
      else fillEl.classList.remove('complete');
    }
    if (pctEl) pctEl.textContent = `${stats.percentage}%`;
    if (counterEl) counterEl.textContent = `${stats.completed} of ${stats.total} completed`;
  },

  renderDashboardHabits() {
    const container = document.getElementById('today-habits-list');
    if (!container) return;

    let habits = StorageManager.getHabits().filter(h => !h.is_archived);
    const todayStr = TrackingManager.getTodayDateString();

    // Apply Filter
    if (this.habitFilter === 'completed') {
      habits = habits.filter(h => TrackingManager.getHabitStatus(h, todayStr).completed);
    } else if (this.habitFilter === 'pending') {
      habits = habits.filter(h => !TrackingManager.getHabitStatus(h, todayStr).completed);
    }

    if (habits.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <h4>No habits here</h4>
          <p>You're all caught up or no habits match this filter.</p>
          <button class="btn btn-primary" onclick="App.openAddHabitModal()">+ Create New Habit</button>
        </div>
      `;
      return;
    }

    let html = '';
    habits.forEach(habit => {
      const status = TrackingManager.getHabitStatus(habit, todayStr);
      const isCompleted = status.completed;

      let tagClass = 'tag-productivity';
      const cat = (habit.category || '').toLowerCase();
      if (cat.includes('fit') || cat.includes('gym')) tagClass = 'tag-fitness';
      else if (cat.includes('health') || cat.includes('water') || cat.includes('sleep')) tagClass = 'tag-health';
      else if (cat.includes('mind') || cat.includes('meditat')) tagClass = 'tag-mind';
      else if (cat.includes('life')) tagClass = 'tag-lifestyle';

      html += `
        <div class="habit-card ${isCompleted ? 'completed' : ''}" data-id="${habit.id}">
          <div class="habit-card-left">
            <div class="habit-icon-circle">${habit.icon}</div>
            <div class="habit-details">
              <div class="habit-name">
                ${habit.name}
                <span class="category-tag ${tagClass}">${habit.category}</span>
              </div>
              <div class="habit-target-text">
                Target: ${habit.target} ${habit.unit} ${habit.reminder_time ? '• ⏰ ' + habit.reminder_time : ''}
              </div>
            </div>
          </div>

          <div class="habit-controls">
            <div class="habit-progress-badge">
              <div class="habit-val-text">${status.value} / ${habit.target} <span style="font-size:0.75rem; color:var(--text-muted);">${habit.unit}</span></div>
            </div>

            <!-- Stepper controls -->
            <div class="stepper-group">
              <button class="stepper-btn" title="Decrease" onclick="App.handleHabitStep('${habit.id}', -1)">-</button>
              <button class="stepper-btn" title="Increase" onclick="App.handleHabitStep('${habit.id}', 1)">+</button>
            </div>

            <!-- Complete Toggle -->
            <button class="complete-toggle-btn ${isCompleted ? 'is-completed' : ''}" 
                    title="${isCompleted ? 'Mark Incomplete' : 'Complete Habit'}"
                    onclick="App.handleToggleHabit('${habit.id}')">
              ${isCompleted ? '✓' : '○'}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  handleHabitStep(habitId, delta) {
    TrackingManager.adjustValue(habitId, delta);
    this.renderDashboardProgress();
    this.renderDashboardHabits();
    this.renderWeeklyProgressWidget();
    this.updateSidebarStreak();
  },

  handleToggleHabit(habitId) {
    TrackingManager.toggleComplete(habitId);
    this.renderDashboardProgress();
    this.renderDashboardHabits();
    this.renderWeeklyProgressWidget();
    this.updateSidebarStreak();
  },

  renderWeeklyProgressWidget() {
    const weekly = TrackingManager.getWeeklyStats();
    const streak = TrackingManager.getStreakStats();

    // Update Weekly %
    const weekPctEl = document.getElementById('widget-weekly-pct');
    if (weekPctEl) weekPctEl.textContent = `${weekly.weeklyPercentage}%`;

    const weekDoneEl = document.getElementById('widget-weekly-done');
    if (weekDoneEl) weekDoneEl.textContent = `${weekly.totalCompleted}`;

    const weekMissedEl = document.getElementById('widget-weekly-missed');
    if (weekMissedEl) weekMissedEl.textContent = `${weekly.missedHabits}`;

    // Streak
    const streakDaysEl = document.getElementById('widget-streak-days');
    if (streakDaysEl) streakDaysEl.textContent = `${streak.currentStreak} Days`;

    const bestStreakEl = document.getElementById('widget-best-streak');
    if (bestStreakEl) bestStreakEl.textContent = `${streak.bestStreak} Days`;

    // Weekdays strip (Mon to Sun)
    const stripEl = document.getElementById('weekdays-strip');
    if (stripEl) {
      let stripHtml = '';
      weekly.weekDays.forEach(day => {
        let statusClass = 'status-pending';
        if (day.statusType === 'done') statusClass = 'status-done';
        else if (day.statusType === 'missed') statusClass = 'status-missed';

        stripHtml += `
          <div class="day-pill ${day.isToday ? 'is-today' : ''}">
            <span class="day-pill-name">${day.dayName}</span>
            <div class="day-status-icon ${statusClass}">
              ${day.symbol}
            </div>
            <span style="font-size:0.68rem; color:var(--text-muted);">${day.completedCount}/${day.scheduledCount}</span>
          </div>
        `;
      });
      stripEl.innerHTML = stripHtml;
    }
  },

  /* ==========================================================================
     MY HABITS VIEW (MANAGEMENT)
     ========================================================================== */
  renderHabitsManager() {
    const container = document.getElementById('habits-manager-grid');
    if (!container) return;

    let habits = StorageManager.getHabits();
    if (this.manageSearchQuery) {
      habits = habits.filter(h => 
        h.name.toLowerCase().includes(this.manageSearchQuery) ||
        h.category.toLowerCase().includes(this.manageSearchQuery)
      );
    }

    if (habits.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📋</div>
          <h4>No habits match your query</h4>
          <p>Try searching for a different keyword or create a new habit.</p>
          <button class="btn btn-primary" onclick="App.openAddHabitModal()">+ Create Habit</button>
        </div>
      `;
      return;
    }

    let html = '';
    habits.forEach(habit => {
      html += `
        <div class="habit-manage-card" data-id="${habit.id}">
          <div class="manage-card-top">
            <div class="manage-card-meta">
              <span style="font-size: 2rem;">${habit.icon}</span>
              <div>
                <strong style="font-size: 1.05rem; color: var(--text-primary); display:block;">${habit.name}</strong>
                <span class="category-tag tag-productivity">${habit.category}</span>
              </div>
            </div>
            <div class="manage-card-actions">
              <button class="action-btn-sm" title="Edit Habit" onclick="App.openEditHabitModal('${habit.id}')">✏️</button>
              <button class="action-btn-sm delete" title="Delete Habit" onclick="App.handleDeleteHabit('${habit.id}')">🗑️</button>
            </div>
          </div>

          <div class="manage-card-stats">
            <div class="manage-stat-item">
              <span>DAILY TARGET</span>
              <span>${habit.target} ${habit.unit}</span>
            </div>
            <div class="manage-stat-item">
              <span>REMINDER</span>
              <span>${habit.reminder_time ? '⏰ ' + habit.reminder_time : 'None'}</span>
            </div>
            <div class="manage-stat-item">
              <span>FREQUENCY</span>
              <span style="text-transform: capitalize;">${habit.frequency}</span>
            </div>
            <div class="manage-stat-item">
              <span>CREATED</span>
              <span>${new Date(habit.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  handleDeleteHabit(id) {
    if (confirm('Are you sure you want to delete this habit?')) {
      HabitManager.deleteHabit(id);
      this.renderHabitsManager();
      this.updateSidebarStreak();
    }
  },

  /* ==========================================================================
     MODALS
     ========================================================================== */
  openAddHabitModal() {
    const dialog = document.getElementById('dialog-habit');
    if (!dialog) return;

    document.getElementById('modal-habit-title').textContent = 'Create New Habit';
    document.getElementById('habit-form-id').value = '';
    document.getElementById('habit-form-name').value = '';
    document.getElementById('habit-form-category').value = 'Productivity';
    document.getElementById('habit-form-target').value = '30';
    document.getElementById('habit-form-unit').value = 'min';
    document.getElementById('habit-form-frequency').value = 'daily';
    document.getElementById('habit-form-reminder').value = '';

    this.setupEmojiPicker('📚');
    this.setupPresetButtons();
    dialog.showModal();
  },

  openEditHabitModal(id) {
    const habit = StorageManager.getHabitById(id);
    if (!habit) return;

    const dialog = document.getElementById('dialog-habit');
    if (!dialog) return;

    document.getElementById('modal-habit-title').textContent = 'Edit Habit';
    document.getElementById('habit-form-id').value = habit.id;
    document.getElementById('habit-form-name').value = habit.name;
    document.getElementById('habit-form-category').value = habit.category;
    document.getElementById('habit-form-target').value = habit.target;
    document.getElementById('habit-form-unit').value = habit.unit;
    document.getElementById('habit-form-frequency').value = habit.frequency;
    document.getElementById('habit-form-reminder').value = habit.reminder_time || '';

    this.setupEmojiPicker(habit.icon);
    this.setupPresetButtons();
    dialog.showModal();
  },

  closeHabitModal() {
    const dialog = document.getElementById('dialog-habit');
    if (dialog) dialog.close();
  },

  setupEmojiPicker(currentEmoji = '📚') {
    this.selectedEmoji = currentEmoji;
    const container = document.getElementById('emoji-selector-strip');
    if (!container) return;

    const emojis = ['📚', '🏋️', '📖', '💧', '🧘', '💤', '💻', '✍️', '🏃', '🥗', '🎯', '⚡'];
    container.innerHTML = emojis.map(em => `
      <button type="button" class="emoji-choice-btn ${em === currentEmoji ? 'selected' : ''}" data-emoji="${em}">
        ${em}
      </button>
    `).join('');

    container.querySelectorAll('.emoji-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.emoji-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedEmoji = btn.getAttribute('data-emoji');
      });
    });
  },

  setupPresetButtons() {
    const container = document.getElementById('habit-presets-strip');
    if (!container) return;

    container.innerHTML = HabitManager.PRESET_HABITS.map(p => `
      <button type="button" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" data-preset="${p.name}">
        ${p.icon} ${p.name}
      </button>
    `).join('');

    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-preset');
        const preset = HabitManager.PRESET_HABITS.find(p => p.name === name);
        if (preset) {
          document.getElementById('habit-form-name').value = preset.name;
          document.getElementById('habit-form-category').value = preset.category;
          document.getElementById('habit-form-target').value = preset.target;
          document.getElementById('habit-form-unit').value = preset.unit;
          document.getElementById('habit-form-reminder').value = preset.reminder;
          this.setupEmojiPicker(preset.icon);
        }
      });
    });
  },

  handleSaveHabitForm() {
    const id = document.getElementById('habit-form-id').value;
    const name = document.getElementById('habit-form-name').value;
    const category = document.getElementById('habit-form-category').value;
    const target = document.getElementById('habit-form-target').value;
    const unit = document.getElementById('habit-form-unit').value;
    const frequency = document.getElementById('habit-form-frequency').value;
    const reminder_time = document.getElementById('habit-form-reminder').value;

    const data = {
      name,
      category,
      icon: this.selectedEmoji,
      target,
      unit,
      frequency,
      reminder_time
    };

    try {
      if (id) {
        HabitManager.updateHabit(id, data);
      } else {
        HabitManager.createHabit(data);
      }
      this.closeHabitModal();
      this.refreshCurrentView();
      this.updateSidebarStreak();
    } catch (err) {
      alert(err.message);
    }
  },

  /* ==========================================================================
     SETTINGS VIEW
     ========================================================================== */
  renderSettings() {
    const user = StorageManager.getUser();
    const settings = StorageManager.getSettings();

    document.getElementById('settings-user-name').value = user.name || '';
    document.getElementById('settings-user-email').value = user.email || '';
    document.getElementById('settings-user-avatar').value = user.avatar || '👨‍💻';

    document.getElementById('settings-theme-select').value = settings.theme || 'dark';
    document.getElementById('toggle-sound').checked = Boolean(settings.soundEnabled);
    document.getElementById('toggle-notifications').checked = Boolean(settings.notificationsEnabled);

    // Populate SQL display box
    const sqlBox = document.getElementById('supabase-sql-code');
    if (sqlBox && window.SUPABASE_SCHEMA_SQL) {
      sqlBox.textContent = window.SUPABASE_SCHEMA_SQL;
    }
  },

  copySupabaseSQL() {
    if (window.SUPABASE_SCHEMA_SQL) {
      navigator.clipboard.writeText(window.SUPABASE_SCHEMA_SQL).then(() => {
        NotificationManager.showToast('Supabase SQL copied to clipboard!', 'success');
      });
    }
  },

  handleExportJSON() {
    StorageManager.exportData();
    NotificationManager.showToast('Data exported successfully!', 'success');
  },

  handleExportCSV() {
    StorageManager.exportCSV();
    NotificationManager.showToast('History CSV exported!', 'success');
  },

  triggerImportJSON() {
    const input = document.getElementById('json-import-input');
    if (input) input.click();
  },

  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = StorageManager.importData(e.target.result);
      if (res.success) {
        NotificationManager.showToast('Data imported successfully!', 'success');
        this.renderUserProfile();
        this.refreshCurrentView();
      } else {
        alert('Failed to import: ' + res.error);
      }
    };
    reader.readAsText(file);
  },

  handleResetData() {
    if (confirm('Reset habits and history back to demo defaults?')) {
      StorageManager.resetAllData();
      NotificationManager.showToast('Reset to demo data!', 'info');
      this.refreshCurrentView();
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
