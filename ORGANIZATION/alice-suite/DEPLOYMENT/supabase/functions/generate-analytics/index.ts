import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, bookId } = await req.json()
    
    if (!userId) {
      throw new Error('userId is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Fetch reading data
    const { data: readingData, error: readingError } = await supabaseClient
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)

    if (readingError) throw readingError

    // Fetch quiz data
    const { data: quizData, error: quizError } = await supabaseClient
      .from('ai_quizzes')
      .select('*')
      .eq('user_id', userId)

    if (quizError) throw quizError

    // Fetch vocabulary lookups
    const { data: vocabData, error: vocabError } = await supabaseClient
      .from('vocabulary_lookups')
      .select('*')
      .eq('user_id', userId)

    if (vocabError) throw vocabError

    // Calculate analytics
    const totalReadingTime = readingData?.reduce((sum, item) => sum + (item.time_spent || 0), 0) || 0
    const averageReadingSpeed = Math.round(250 + Math.random() * 100) // Mock calculation
    const comprehensionScore = Math.round(70 + Math.random() * 25) // Mock calculation
    const vocabularyGrowth = vocabData?.length || 0
    const quizAverage = quizData?.length > 0 
      ? Math.round(quizData.reduce((sum, item) => sum + (item.score || 0), 0) / quizData.length)
      : 0
    const streakDays = Math.round(5 + Math.random() * 10) // Mock calculation
    const pagesPerSession = Math.round(15 + Math.random() * 10) // Mock calculation

    const analytics = {
      userId,
      bookId: bookId || null,
      readingSpeed: averageReadingSpeed,
      comprehensionScore,
      vocabularyGrowth,
      quizAverage,
      streakDays,
      totalReadingTime,
      pagesPerSession,
      difficultyProgression: [1, 2, 3, 4, 5], // Mock progression
      learningStyle: 'Visual-Sequential',
      recommendations: [
        'Try reading at a consistent time each day',
        'Focus on vocabulary building exercises',
        'Practice with more challenging texts',
        'Join reading discussion groups'
      ],
      generatedAt: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(analytics),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})