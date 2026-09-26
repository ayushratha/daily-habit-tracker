# ⚡ HabitFlow — Daily Habit Tracker Web App

A modern, responsive, and aesthetically pleasing productivity web application designed to help users cultivate daily habits, track measurable targets, and monitor weekly consistency.

---

## 🌟 Key Features

### 1. Habit Management (CRUD)
- **Built-in Presets**: 📚 Reading (30 min), 🏋️ Exercise (45 min), 📖 Study (3 hrs), 💧 Water intake (3 L), 🧘 Meditation (15 min), 💤 Sleep (8 hrs).
- **Custom Habits**: Add custom habits with custom emoji/icon, category, daily target, unit (min, hrs, L, pages, etc.), frequency (daily, weekdays, weekends), and reminder time.
- **Edit & Delete**: Seamless in-place editing and deletion with safety confirmations.

### 2. Daily Tracking Dashboard
- **Greeting & Live Progress**: Dynamic time-of-day greeting (*"Good evening, Ayush 👋"*), daily motivational quote, and animated progress bar showing `%` of today's habits completed.
- **Interactive Habit Cards**:
  - Direct progress steppers (`+` / `-`) for incremental updates (e.g. drinking water or exercise minutes).
  - Quick completion toggle (✅ / 🔄) with smooth bounce micro-animations.
  - Filter habits by: **All**, **Pending**, or **Completed**.
  - Celebratory **confetti burst** and synthesized trophy audio when 100% of daily habits are completed!

### 3. Weekly Progress & Analytics
- **Formula Implementation**:
  $$\text{Weekly Progress} = \frac{\text{Completed Habit Tasks}}{\text{Total Scheduled Habit Tasks}} \times 100$$
  *Example: 24 completed / 28 scheduled = 85.7%*
- **7-Day Day-by-Day Strip**:
  - Displays Mon, Tue, Wed, Thu, Fri, Sat, Sun with visual indicators (`✓`, `✗`, `—`, and today's status).
- **Consistency & Streaks**:
  - **Current Streak** (🔥 Days)
  - **Personal Best Streak** (🏆 Days)
  - Missed habits and completed habit totals.

### 4. Interactive Calendar View
- Full monthly grid with completion heat-level styling (100% emerald glow, partial amber, pending).
- **Day Inspector Panel**: Click any past date to inspect logged progress and toggle completion retroactively.

### 5. Statistics & Visual Analytics (Chart.js)
- **7-Day Trend Line Chart**: Smooth curve showing completion percentage progression.
- **Category Breakdown Doughnut Chart**: Categorical habit distribution (Productivity, Fitness, Health, Mind, Lifestyle).
- **Habit Consistency Ranking / Leaderboard**: Ranked table showing which habits have the highest consistency rate.

### 6. Settings & Data Portability
- **Profile Customization**: Name, Email, and Avatar icon.
- **Theme Mode**: Dark Mode (Glassmorphic) & Light Mode.
- **Audio Feedback**: Synthesized harmonious chimes and pops via the Web Audio API.
- **Browser Reminders**: Native notification permissions with scheduled reminder checks.
- **Data Export & Import**:
  - Export full state as JSON backup.
  - Export historical completions as CSV spreadsheet.
  - Import JSON backup with validation.
  - One-click Reset to clean demo data.

---

## 🗄️ Database Architecture (Supabase / PostgreSQL)

For college project submissions, the data model follows a relational schema with Row Level Security:

```
users (id, name, email, avatar_url, created_at)
  │
  └── habits (id, user_id, name, category, icon, target, unit, frequency, reminder_time, is_archived, created_at)
        │
        └── habit_completions (id, habit_id, user_id, date, value, completed, updated_at)
```

The ready-to-run PostgreSQL DDL script is located in `js/supabase-schema.js` and can also be viewed/copied directly from the **Settings** page in the application.

---

## 🚀 How to Run Locally

You can run this project with any local HTTP server:

```bash
# Option 1: Using Python
python -m http.server 3000

# Option 2: Using Node.js npx serve
npx serve .

# Option 3: Double-click index.html directly in any web browser!
```

---

## 🛠️ Tech Stack
- **Frontend Core**: Vanilla HTML5, Modern CSS3 (Glassmorphism, CSS Custom Properties), Vanilla JavaScript (ES6+ modular controllers).
- **Charts**: Chart.js 4.4.1.
- **Visual FX**: Canvas Confetti.
- **Audio**: Web Audio API (zero external audio file dependencies).
- **Persistence**: LocalStorage with Supabase schema abstraction.
