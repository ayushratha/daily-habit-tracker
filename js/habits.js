/**
 * Habit Management (CRUD, Presets, Categories)
 */

const HabitManager = {
  PRESET_HABITS: [
    { name: 'Reading', icon: '📚', category: 'Productivity', target: 30, unit: 'min', reminder: '20:00' },
    { name: 'Exercise', icon: '🏋️', category: 'Fitness', target: 45, unit: 'min', reminder: '07:30' },
    { name: 'Study', icon: '📖', category: 'Productivity', target: 3, unit: 'hrs', reminder: '16:00' },
    { name: 'Water intake', icon: '💧', category: 'Health', target: 3, unit: 'L', reminder: '09:00' },
    { name: 'Meditation', icon: '🧘', category: 'Mind', target: 15, unit: 'min', reminder: '07:00' },
    { name: 'Sleep', icon: '💤', category: 'Health', target: 8, unit: 'hrs', reminder: '23:00' },
    { name: 'Coding', icon: '💻', category: 'Productivity', target: 2, unit: 'hrs', reminder: '14:00' },
    { name: 'Journaling', icon: '✍️', category: 'Mind', target: 10, unit: 'min', reminder: '21:30' }
  ],

  CATEGORIES: ['Productivity', 'Fitness', 'Health', 'Mind', 'Lifestyle'],

  // Create new habit
  createHabit(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Habit name is required.');
    }
    const target = parseFloat(data.target);
    if (isNaN(target) || target <= 0) {
      throw new Error('Target must be a positive number.');
    }

    const habits = StorageManager.getHabits();
    const newHabit = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: data.name.trim(),
      category: data.category || 'Productivity',
      icon: data.icon || '📌',
      target: target,
      unit: data.unit || 'min',
      frequency: data.frequency || 'daily',
      reminder_time: data.reminder_time || '',
      is_archived: false,
      created_at: new Date().toISOString()
    };

    habits.push(newHabit);
    StorageManager.setHabits(habits);
    NotificationManager.showToast(`Habit "${newHabit.name}" created!`, 'success');
    return newHabit;
  },

  // Update existing habit
  updateHabit(id, data) {
    const habits = StorageManager.getHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Habit not found');

    const target = parseFloat(data.target);
    if (isNaN(target) || target <= 0) {
      throw new Error('Target must be a positive number.');
    }

    habits[index] = {
      ...habits[index],
      name: data.name.trim(),
      category: data.category,
      icon: data.icon,
      target: target,
      unit: data.unit,
      frequency: data.frequency,
      reminder_time: data.reminder_time
    };

    StorageManager.setHabits(habits);
    NotificationManager.showToast(`Habit "${habits[index].name}" updated!`, 'success');
    return habits[index];
  },

  // Delete habit
  deleteHabit(id) {
    const habits = StorageManager.getHabits();
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const filtered = habits.filter(h => h.id !== id);
    StorageManager.setHabits(filtered);
    NotificationManager.showToast(`Deleted "${habit.name}"`, 'info');
  }
};

window.HabitManager = HabitManager;
