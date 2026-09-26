/**
 * Data Storage Manager (LocalStorage First + Supabase Schema Ready)
 * Handles data persistence, export/import, and initial seed dataset.
 */

const STORAGE_KEYS = {
  USER: 'habit_tracker_user',
  HABITS: 'habit_tracker_habits',
  COMPLETIONS: 'habit_tracker_completions',
  SETTINGS: 'habit_tracker_settings'
};

const DEFAULT_USER = {
  id: 'usr_ayush_01',
  name: 'Ayush',
  email: 'ayush@example.com',
  avatar: '👨‍💻'
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  soundEnabled: true,
  notificationsEnabled: true,
  dailyReminderTime: '20:00'
};

const StorageManager = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      this.setUser(DEFAULT_USER);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setSettings(DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.HABITS) || this.getHabits().length === 0) {
      this.seedDefaultData();
    }
  },

  // User Profile
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch (e) {
      return DEFAULT_USER;
    }
  },

  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  setSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Habits
  getHabits() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  setHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getHabitById(id) {
    return this.getHabits().find(h => h.id === id) || null;
  },

  // Daily Completions
  // Structure: { "2026-09-26": { "habit_id": { value: 30, completed: true, updatedAt: 12345 } } }
  getAllCompletions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  getCompletions(dateString) {
    const all = this.getAllCompletions();
    return all[dateString] || {};
  },

  saveCompletion(dateString, habitId, completionData) {
    const all = this.getAllCompletions();
    if (!all[dateString]) {
      all[dateString] = {};
    }
    all[dateString][habitId] = {
      ...all[dateString][habitId],
      ...completionData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(all));
  },

  // Seed Initial Realistic Habits & History matching the Project Definition
  seedDefaultData() {
    const initialHabits = [
      {
        id: 'h_reading',
        name: 'Reading',
        category: 'Productivity',
        icon: '📚',
        target: 30,
        unit: 'min',
        frequency: 'daily',
        reminder_time: '20:00',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'h_exercise',
        name: 'Exercise',
        category: 'Fitness',
        icon: '🏋️',
        target: 45,
        unit: 'min',
        frequency: 'daily',
        reminder_time: '07:30',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'h_study',
        name: 'Study',
        category: 'Productivity',
        icon: '📖',
        target: 3,
        unit: 'hrs',
        frequency: 'daily',
        reminder_time: '16:00',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'h_water',
        name: 'Water intake',
        category: 'Health',
        icon: '💧',
        target: 3,
        unit: 'L',
        frequency: 'daily',
        reminder_time: '09:00',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'h_meditation',
        name: 'Meditation',
        category: 'Mind',
        icon: '🧘',
        target: 15,
        unit: 'min',
        frequency: 'daily',
        reminder_time: '07:00',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'h_sleep',
        name: 'Sleep',
        category: 'Health',
        icon: '💤',
        target: 8,
        unit: 'hrs',
        frequency: 'daily',
        reminder_time: '23:00',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ];

    this.setHabits(initialHabits);

    // Populate completions for the past 14 days
    // Today is set as 2026-09-26 (or current system date)
    const completions = {};
    const baseDate = new Date();

    // Helper to format YYYY-MM-DD in local time
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Past 14 days generation
    for (let i = 14; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = formatDate(d);
      completions[dateStr] = {};

      if (i === 0) {
        // TODAY: Exactly matching user prompt dashboard!
        // Reading: 30/30 min ✅
        // Exercise: 30/45 min 🔄
        // Study: 3/3 hrs ✅
        // Water: 2/3 L 🔄
        // Meditation: 15/15 min ✅
        // Sleep: 7/8 hrs 🔄
        completions[dateStr]['h_reading'] = { value: 30, completed: true };
        completions[dateStr]['h_exercise'] = { value: 30, completed: false };
        completions[dateStr]['h_study'] = { value: 3, completed: true };
        completions[dateStr]['h_water'] = { value: 2, completed: false };
        completions[dateStr]['h_meditation'] = { value: 15, completed: true };
        completions[dateStr]['h_sleep'] = { value: 7, completed: false };
      } else if (i === 1 || i === 2 || i === 4 || i === 5) {
        // High completion days (creating 5-day current streak)
        initialHabits.forEach(h => {
          completions[dateStr][h.id] = { value: h.target, completed: true };
        });
      } else if (i === 3) {
        // Missed day mid-week (Wed in the 7-day strip layout: ✓ ✓ ✗ ✓ ✓ ✓)
        completions[dateStr]['h_reading'] = { value: 30, completed: true };
        completions[dateStr]['h_exercise'] = { value: 15, completed: false };
        completions[dateStr]['h_study'] = { value: 1, completed: false };
        completions[dateStr]['h_water'] = { value: 2, completed: false };
        completions[dateStr]['h_meditation'] = { value: 0, completed: false };
        completions[dateStr]['h_sleep'] = { value: 6, completed: false };
      } else {
        // Previous days
        const isSuccessfulDay = (i % 3 !== 0);
        initialHabits.forEach(h => {
          const done = isSuccessfulDay || Math.random() > 0.3;
          completions[dateStr][h.id] = {
            value: done ? h.target : Math.round(h.target * 0.4),
            completed: done
          };
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  },

  // Export Data as JSON
  exportData() {
    const backup = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      user: this.getUser(),
      habits: this.getHabits(),
      completions: this.getAllCompletions(),
      settings: this.getSettings()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Export Completions as CSV
  exportCSV() {
    const habits = this.getHabits();
    const completions = this.getAllCompletions();
    const habitMap = {};
    habits.forEach(h => habitMap[h.id] = h);

    let csvContent = 'Date,Habit ID,Habit Name,Category,Target,Unit,Logged Value,Completed\n';

    const dates = Object.keys(completions).sort();
    dates.forEach(date => {
      const dayCompletions = completions[date];
      Object.keys(dayCompletions).forEach(habitId => {
        const h = habitMap[habitId];
        const record = dayCompletions[habitId];
        if (h && record) {
          csvContent += `"${date}","${habitId}","${h.name}","${h.category}",${h.target},"${h.unit}",${record.value},${record.completed}\n`;
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit_tracker_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import JSON Backup
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits && Array.isArray(data.habits)) {
        this.setHabits(data.habits);
      }
      if (data.completions && typeof data.completions === 'object') {
        localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(data.completions));
      }
      if (data.user) {
        this.setUser(data.user);
      }
      if (data.settings) {
        this.setSettings(data.settings);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Reset Everything to clean state
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    this.seedDefaultData();
  }
};

window.StorageManager = StorageManager;
