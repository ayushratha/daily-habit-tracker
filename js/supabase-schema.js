/**
 * Supabase / PostgreSQL Schema Definition & Integration Helper
 * Provides SQL script for college project database submission & setup.
 */

const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- Daily Habit Tracker Database Schema (Supabase / PostgreSQL)
-- Target System: Supabase PostgreSQL 15+
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    icon VARCHAR(10) DEFAULT '📌',
    target NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(30) DEFAULT 'times',
    frequency VARCHAR(30) DEFAULT 'daily', -- 'daily', 'weekdays', 'weekends'
    reminder_time TIME,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Habit Completions Table (Tracking per day)
CREATE TABLE IF NOT EXISTS public.habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(habit_id, date)
);

-- 5. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON public.habit_completions(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON public.habit_completions(user_id, date);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own habits
CREATE POLICY "Users can manage their own habits" 
ON public.habits FOR ALL 
USING (auth.uid() = user_id);

-- Allow users to manage their daily habit completions
CREATE POLICY "Users can manage completions" 
ON public.habit_completions FOR ALL 
USING (auth.uid() = user_id);
`;

window.SUPABASE_SCHEMA_SQL = SUPABASE_SCHEMA_SQL;
