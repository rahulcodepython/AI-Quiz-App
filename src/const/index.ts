import { QuestionDifficulty } from "@/types";

export const AI_MODELS = [
    // { id: 'openai', name: 'OpenAI GPT-4', endpoint: 'https://api.openai.com/v1/chat/completions' },
    // { id: 'anthropic', name: 'Anthropic Claude', endpoint: 'https://api.anthropic.com/v1/messages' },
    { id: 'google', name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1/models' },
    // { id: 'cohere', name: 'Cohere Command', endpoint: 'https://api.cohere.ai/v1/generate' }
]

export const DIFFICULTY: { id: QuestionDifficulty; name: string }[] = [
    { id: 'easy', name: 'Easy' },
    { id: 'medium', name: 'Medium' },
    { id: 'hard', name: 'Hard' }
]

export const QUESTION_PATTERNS = [
    { id: 'only mcq', name: 'Only Multiple Choice Question' },
    { id: 'only saq', name: 'Only Short Answer Question' },
    { id: 'only long', name: 'Only Long Answer Question' },
    { id: 'mcq, saq, laq mixed', name: 'Mixed Question Types' }
]