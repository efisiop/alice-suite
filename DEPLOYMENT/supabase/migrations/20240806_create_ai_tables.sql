-- Create AI interactions table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN (
    'vocabulary_lookup',
    'content_summary',
    'quiz_generation',
    'reading_assistance',
    'definition_explanation',
    'translation',
    'personalized_recommendation',
    'learning_analytics',
    'chat_assistance'
  )) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  tokens_used INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary lookups table
CREATE TABLE IF NOT EXISTS vocabulary_lookups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  pronunciation TEXT,
  examples JSONB DEFAULT '[]',
  synonyms JSONB DEFAULT '[]',
  antonyms JSONB DEFAULT '[]',
  etymology TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI quizzes table
CREATE TABLE IF NOT EXISTS ai_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  topic TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  time_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT
);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN (
    'next_book',
    'similar_book',
    'difficulty_adjustment',
    'genre_exploration'
  )) NOT NULL,
  reason TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning analytics table
CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  reading_speed INTEGER, -- words per minute
  comprehension_score INTEGER CHECK (comprehension_score >= 0 AND comprehension_score <= 100),
  vocabulary_growth INTEGER,
  quiz_average INTEGER CHECK (quiz_average >= 0 AND quiz_average <= 100),
  streak_days INTEGER,
  total_reading_time INTEGER, -- minutes
  pages_per_session REAL,
  difficulty_progression JSONB DEFAULT '[]',
  learning_style TEXT,
  recommendations JSONB DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personalized learning paths table
CREATE TABLE IF NOT EXISTS personalized_learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  books JSONB NOT NULL,
  estimated_duration INTEGER, -- days
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  current_progress INTEGER CHECK (current_progress >= 0 AND current_progress <= 100) DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_book_id ON ai_interactions(book_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vocabulary_lookups_user_id ON vocabulary_lookups(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lookups_book_id ON vocabulary_lookups(book_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lookups_word ON vocabulary_lookups(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lookups_created_at ON vocabulary_lookups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_quizzes_user_id ON ai_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_quizzes_book_id ON ai_quizzes(book_id);
CREATE INDEX IF NOT EXISTS idx_ai_quizzes_difficulty ON ai_quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_ai_quizzes_created_at ON ai_quizzes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_book_id ON ai_recommendations(book_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_book_id ON learning_analytics(book_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_generated_at ON learning_analytics(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_personalized_learning_paths_user_id ON personalized_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_learning_paths_difficulty ON personalized_learning_paths(difficulty);
CREATE INDEX IF NOT EXISTS idx_personalized_learning_paths_created_at ON personalized_learning_paths(created_at DESC);

-- Create RLS policies
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_lookups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_learning_paths ENABLE ROW LEVEL SECURITY;

-- AI interactions policies
CREATE POLICY "Users can view own AI interactions" ON ai_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI interactions" ON ai_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vocabulary lookups policies
CREATE POLICY "Users can view own vocabulary lookups" ON vocabulary_lookups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vocabulary lookups" ON vocabulary_lookups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI quizzes policies
CREATE POLICY "Users can view own AI quizzes" ON ai_quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI quizzes" ON ai_quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI quizzes" ON ai_quizzes
  FOR UPDATE USING (auth.uid() = user_id);

-- AI recommendations policies
CREATE POLICY "Users can view own AI recommendations" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI recommendations" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning analytics policies
CREATE POLICY "Users can view own learning analytics" ON learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning analytics" ON learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Personalized learning paths policies
CREATE POLICY "Users can view own learning paths" ON personalized_learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning paths" ON personalized_learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning paths" ON personalized_learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_interactions_updated_at BEFORE UPDATE ON ai_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_lookups_updated_at BEFORE UPDATE ON vocabulary_lookups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalized_learning_paths_updated_at BEFORE UPDATE ON personalized_learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();