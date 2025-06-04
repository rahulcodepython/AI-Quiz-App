export interface Question {
    id: string;
    question: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    marks: number;
    options?: string[];
    userAnswer?: string;
    explanation?: string;
}

export type QuestionType = 'mcq' | 'saq' | 'long';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type ModelType = 'google';
// export type ModelType = 'openai' | 'anthropic' | 'google' | 'cohere';

export interface AIModelType {
    id: ModelType;
    apiKey: string;
    current?: boolean;
}

export type Quiz = Question[];

export interface GradeResult {
    questions: Question[];
    score: number;
    totalQuestions: number;
}