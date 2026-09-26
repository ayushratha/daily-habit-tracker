/**
 * Audio synthesis, Toast notifications & Web Notifications
 */

const NotificationManager = {
  audioCtx: null,

  // Initialize Web Audio API on user gesture
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  // Play gentle pop sound on stepper change
  playPopSound() {
    const settings = StorageManager.getSettings();
    if (!settings.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio might be blocked by browser policy
    }
  },

  // Play pleasant chime on completing a single habit
  playCompleteSound() {
    const settings = StorageManager.getSettings();
    if (!settings.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two harmonic notes (C5 -> G5)
      const notes = [523.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.15, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.35);
      });
    } catch (e) {}
  },

  // Play celebratory melody when all habits for the day are 100% completed
  playGrandTrophySound() {
    const settings = StorageManager.getSettings();
    if (!settings.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      melody.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.18, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.45);
      });
    } catch (e) {}
  },

  // Trigger colorful confetti celebration
  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
      });
    }
  },

  // Display modern toast on screen
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // Browser notification permission request
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showToast('Browser notifications enabled!', 'success');
      } else {
        this.showToast('Browser notifications were not allowed.', 'warning');
      }
      return permission;
    }
    return 'unsupported';
  },

  // Check and dispatch scheduled habit reminders
  checkScheduledReminders() {
    const settings = StorageManager.getSettings();
    if (!settings.notificationsEnabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    const habits = StorageManager.getHabits();
    const todayStr = TrackingManager.getTodayDateString();
    const completions = StorageManager.getCompletions(todayStr);

    habits.forEach(habit => {
      if (habit.reminder_time === currentTimeStr) {
        const comp = completions[habit.id];
        if (!comp || !comp.completed) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Habit Reminder: ${habit.name}`, {
              body: `Time for your daily ${habit.name}! Target: ${habit.target} ${habit.unit}`,
              icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>'
            });
          }
          this.showToast(`Reminder: Time for ${habit.icon} ${habit.name}!`, 'info');
        }
      }
    });
  }
};

window.NotificationManager = NotificationManager;
