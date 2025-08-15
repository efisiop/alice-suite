import type { AIInteraction, AIInteractionType, AIInteractionContext, AIVocabularyLookup, AIQuiz, AIRecommendation, LearningAnalytics, PersonalizedLearningPath, ApiResponse } from './types';
export declare class AIClient {
    /**
     * Create a new AI interaction
     */
    createAIInteraction(userId: string, bookId: string, type: AIInteractionType, prompt: string, response: string, context?: AIInteractionContext): Promise<ApiResponse<AIInteraction>>;
    /**
     * Get AI interactions for a user
     */
    getAIInteractions(userId: string, bookId?: string, type?: AIInteractionType): Promise<ApiResponse<AIInteraction[]>>;
    /**
     * Create vocabulary lookup
     */
    createVocabularyLookup(userId: string, bookId: string, word: string, vocabularyData: Omit<AIVocabularyLookup, 'word'>): Promise<ApiResponse<AIVocabularyLookup>>;
    /**
     * Get vocabulary lookups for a user
     */
    getVocabularyLookups(userId: string, bookId?: string): Promise<ApiResponse<AIVocabularyLookup[]>>;
    /**
     * Create AI quiz
     */
    createAIQuiz(quiz: Omit<AIQuiz, 'id' | 'createdAt'>): Promise<ApiResponse<AIQuiz>>;
    /**
     * Get AI quizzes for a user
     */
    getAIQuizzes(userId: string, bookId?: string): Promise<ApiResponse<AIQuiz[]>>;
    /**
     * Update AI quiz with results
     */
    updateAIQuizResults(quizId: string, score: number, feedback?: string): Promise<ApiResponse<AIQuiz>>;
    /**
     * Create AI recommendation
     */
    createAIRecommendation(recommendation: Omit<AIRecommendation, 'id' | 'createdAt'>): Promise<ApiResponse<AIRecommendation>>;
    /**
     * Get AI recommendations for a user
     */
    getAIRecommendations(userId: string, type?: AIRecommendation['type']): Promise<ApiResponse<AIRecommendation[]>>;
    /**
     * Create learning analytics
     */
    createLearningAnalytics(analytics: Omit<LearningAnalytics, 'generatedAt'>): Promise<ApiResponse<LearningAnalytics>>;
    /**
     * Get learning analytics for a user
     */
    getLearningAnalytics(userId: string, bookId?: string): Promise<ApiResponse<LearningAnalytics[]>>;
    /**
     * Create personalized learning path
     */
    createLearningPath(path: Omit<PersonalizedLearningPath, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PersonalizedLearningPath>>;
    /**
     * Get personalized learning paths for a user
     */
    getLearningPaths(userId: string): Promise<ApiResponse<PersonalizedLearningPath[]>>;
    /**
     * Update learning path progress
     */
    updateLearningPathProgress(pathId: string, progress: number, achievements?: string[]): Promise<ApiResponse<PersonalizedLearningPath>>;
    /**
     * Generate content summary using AI
     */
    generateContentSummary(bookId: string, pageRange?: [number, number]): Promise<ApiResponse<{
        summary: string;
        keyPoints: string[];
    }>>;
    /**
     * Generate vocabulary quiz for a book
     */
    generateVocabularyQuiz(bookId: string, difficulty: 'easy' | 'medium' | 'hard', count?: number): Promise<ApiResponse<AIQuiz>>;
    /**
     * Get personalized recommendations
     */
    getPersonalizedRecommendations(userId: string): Promise<ApiResponse<AIRecommendation[]>>;
    /**
     * Generate learning analytics
     */
    generateLearningAnalytics(userId: string, bookId?: string): Promise<ApiResponse<LearningAnalytics>>;
}
export declare const aiClient: AIClient;
