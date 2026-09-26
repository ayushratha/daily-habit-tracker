/**
 * Analytics & Statistics View with Chart.js
 */

const StatisticsManager = {
  trendChartInstance: null,
  categoryChartInstance: null,

  render() {
    this.renderKPIs();
    this.renderTrendChart();
    this.renderCategoryChart();
    this.renderHabitLeaderboard();
  },

  renderKPIs() {
    const weeklyStats = TrackingManager.getWeeklyStats();
    const streakStats = TrackingManager.getStreakStats();
    const habits = StorageManager.getHabits().filter(h => !h.is_archived);

    const weeklyEl = document.getElementById('stats-kpi-weekly');
    if (weeklyEl) weeklyEl.textContent = `${weeklyStats.weeklyPercentage}%`;

    const currentStreakEl = document.getElementById('stats-kpi-streak');
    if (currentStreakEl) currentStreakEl.textContent = `${streakStats.currentStreak} Days`;

    const bestStreakEl = document.getElementById('stats-kpi-best-streak');
    if (bestStreakEl) bestStreakEl.textContent = `${streakStats.bestStreak} Days`;

    const totalCompletionsEl = document.getElementById('stats-kpi-total');
    if (totalCompletionsEl) totalCompletionsEl.textContent = `${streakStats.totalCompletions}`;
  },

  renderTrendChart() {
    const canvas = document.getElementById('chart-weekly-trend');
    if (!canvas || typeof Chart === 'undefined') return;

    // Collect past 7 days data
    const labels = [];
    const percentages = [];
    const today = new Date();
    const habits = StorageManager.getHabits().filter(h => !h.is_archived);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = TrackingManager.formatDate(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayName);

      let done = 0;
      habits.forEach(h => {
        if (TrackingManager.getHabitStatus(h, dateStr).completed) done++;
      });
      const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
      percentages.push(pct);
    }

    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    this.trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Completion %',
          data: percentages,
          borderColor: '#6366f1',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#6366f1',
          pointHoverRadius: 6,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Completion: ${context.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: textColor,
              callback: val => `${val}%`
            },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        }
      }
    });
  },

  renderCategoryChart() {
    const canvas = document.getElementById('chart-category-donut');
    if (!canvas || typeof Chart === 'undefined') return;

    const habits = StorageManager.getHabits().filter(h => !h.is_archived);
    const categoryCounts = {};
    HabitManager.CATEGORIES.forEach(c => categoryCounts[c] = 0);

    habits.forEach(h => {
      const cat = h.category || 'Productivity';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts).filter(k => categoryCounts[k] > 0);
    const data = labels.map(k => categoryCounts[k]);

    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];

    this.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: isDark ? '#151c2e' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 14
            }
          }
        },
        cutout: '68%'
      }
    });
  },

  renderHabitLeaderboard() {
    const listEl = document.getElementById('stats-habit-leaderboard');
    if (!listEl) return;

    const habits = StorageManager.getHabits().filter(h => !h.is_archived);
    const completions = StorageManager.getAllCompletions();
    const dates = Object.keys(completions);
    const totalDays = Math.max(1, dates.length);

    const scores = habits.map(habit => {
      let completedDays = 0;
      dates.forEach(d => {
        if (completions[d]?.[habit.id]?.completed) completedDays++;
      });
      const rate = Math.round((completedDays / totalDays) * 100);
      return { habit, completedDays, rate };
    });

    scores.sort((a, b) => b.rate - a.rate);

    let html = '';
    scores.forEach(item => {
      html += `
        <div class="leaderboard-row">
          <div class="row-left">
            <span style="font-size: 1.4rem;">${item.habit.icon}</span>
            <div>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${item.habit.name}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${item.habit.category} • Target: ${item.habit.target} ${item.habit.unit}</div>
            </div>
          </div>
          <div class="row-bar-wrap">
            <div class="row-bar-track">
              <div class="row-bar-fill" style="width: ${item.rate}%;"></div>
            </div>
          </div>
          <div style="text-align: right; min-width: 48px;">
            <span style="font-weight: 800; font-size: 1.05rem; color: var(--accent-success);">${item.rate}%</span>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }
};

window.StatisticsManager = StatisticsManager;
