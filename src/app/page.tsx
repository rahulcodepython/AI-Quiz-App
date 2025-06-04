'use client'

import Chatbox from "@/components/Chatbox"
import Navbar from "@/components/Navbar"
import QuizForm from "@/components/QuizForm"
import { AI_MODELS } from "@/const"
import { AIService } from "@/lib/aiService"
import { AIModelType, ModelType, Question } from "@/types"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from 'react'

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true)
    const [prompt, setPrompt] = useState<string>('')
    const [generating, setGenerating] = useState<boolean>(false)
    const [questions, setQuestions] = useState<Question[] | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [attempted, setAttempted] = useState<Set<string>>(new Set())
    const [percentage, setPercentage] = useState<number>(0.0)
    const [marks, setMarks] = useState<number>(0)

    const [aiModel, setAiModel] = useState<AIModelType[] | null>(null)
    const [selectedModel, setSelectedModel] = useState<ModelType | null>(null)

    const handleChangeAnswer = (questionId: string, answer: string) => {
        setQuestions(prevQuestions => {
            if (!prevQuestions) return null;
            return prevQuestions.map(question =>
                question.id === questionId ? { ...question, userAnswer: answer } : question
            );
        });

        if (attempted.has(questionId)) return;
        setAttempted(prev => new Set(prev).add(questionId));
        setPercentage(((attempted.size + 1) / questions!.length) * 100);
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (!selectedModel) {
                alert('Please select an AI model first.');
                return;
            }

            if (!aiModel || !aiModel.length) {
                alert('No AI models available. Please set up an AI model first.');
                return;
            }

            const aiService = new AIService(selectedModel as ModelType, aiModel.find(m => m.id === selectedModel)?.apiKey!, AI_MODELS.find(m => m.id === selectedModel)?.endpoint!);

            const response = await aiService.gradeQuiz(JSON.stringify(questions));

            setQuestions(response.questions);
            setMarks(response.score);
            setPercentage((response.score / response.totalQuestions) * 100);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const setAIModel = (model: ModelType, apiKey: string) => {
        const selectedModel = AI_MODELS.find(m => m.id === model);
        if (selectedModel) {
            const currentAIModel = aiModel ? aiModel.find(m => m.id === model) : null;
            const newAIModel: AIModelType = {
                id: selectedModel.id as ModelType,
                apiKey: apiKey,
            };

            if (currentAIModel) {
                setAiModel(prev => {
                    const updatedAIModel = prev ? prev.map(m => m.id === model ? newAIModel : m) : [newAIModel]
                    localStorage.setItem('aiModel', JSON.stringify(updatedAIModel));
                    localStorage.setItem('currentAIModel', JSON.stringify(newAIModel.id));
                    return updatedAIModel;
                });
            } else {
                setAiModel(prev => {
                    const updatedAIModel = prev ? [...prev, newAIModel] : [newAIModel]
                    localStorage.setItem('aiModel', JSON.stringify(updatedAIModel));
                    localStorage.setItem('currentAIModel', JSON.stringify(newAIModel.id));
                    return updatedAIModel;
                });
            }

            setSelectedModel(newAIModel.id);
        } else {
            console.error('Selected AI model not found:', model);
        }
    }

    const submitPrompt = async () => {
        setGenerating(true);
        try {
            if (!prompt.trim()) {
                alert('Please enter a valid prompt.');
                return;
            }

            if (!selectedModel) {
                alert('Please select an AI model first.');
                return;
            }

            if (!aiModel || !aiModel.length) {
                alert('No AI models available. Please set up an AI model first.');
                return;
            }

            const aiService = new AIService(selectedModel as ModelType, aiModel.find(m => m.id === selectedModel)?.apiKey!, AI_MODELS.find(m => m.id === selectedModel)?.endpoint!);

            const response = await aiService.generateQuiz(prompt)

            setQuestions(response);
        } catch (error) {
            console.error('Error submitting prompt:', error);
        } finally {
            setGenerating(false);
            setPrompt('');
        }
    }

    const resetQuiz = () => {
        setQuestions(null);
        setAttempted(new Set());
        setPercentage(0.0);
        setMarks(0);
        setPrompt('');
        setIsSubmitting(false);
        setGenerating(false);
    }

    useEffect(() => {
        setPercentage((attempted.size / 20) * 100);

        const localAIModel = localStorage.getItem('aiModel');
        const currentAIModel = localStorage.getItem('currentAIModel');

        if (localAIModel) setAiModel(JSON.parse(localAIModel));
        if (currentAIModel) setSelectedModel(JSON.parse(currentAIModel));

        // setQuestions(
        //     [
        //         {
        //             "id": "1",
        //             "question": "Which of the following is a programming language?",
        //             "type": "mcq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": ["HTML", "Python", "HTTP", "URL"],
        //             "correctAnswer": "Python",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "2",
        //             "question": "What does CPU stand for?",
        //             "type": "saq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": [],
        //             "correctAnswer": "",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "3",
        //             "question": "Explain how the internet works in simple terms.",
        //             "type": "long",
        //             "difficulty": "easy",
        //             "marks": 5,
        //             "options": [],
        //             "correctAnswer": "",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "4",
        //             "question": "Which component is considered the 'brain' of the computer?",
        //             "type": "mcq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": ["Monitor", "Keyboard", "CPU", "Hard Drive"],
        //             "correctAnswer": "CPU",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "5",
        //             "question": "Name one input device used in computers.",
        //             "type": "saq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": [],
        //             "correctAnswer": "",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "6",
        //             "question": "Describe the function of an operating system.",
        //             "type": "long",
        //             "difficulty": "easy",
        //             "marks": 5,
        //             "options": [],
        //             "correctAnswer": "",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "7",
        //             "question": "Which of these is an example of an operating system?",
        //             "type": "mcq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": ["Google", "Facebook", "Windows", "Intel"],
        //             "correctAnswer": "Windows",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "8",
        //             "question": "What is the full form of 'URL'?",
        //             "type": "saq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": [],
        //             "correctAnswer": "",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "9",
        //             "question": "What does a web browser do?",
        //             "type": "long",
        //             "difficulty": "easy",
        //             "marks": 5,
        //             "options": [],
        //             "correctAnswer": "",
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "10",
        //             "question": "Which of the following is used to store data permanently?",
        //             "type": "mcq",
        //             "difficulty": "easy",
        //             "marks": 1,
        //             "options": ["RAM", "ROM", "Cache", "Hard Disk"],
        //             "correctAnswer": "Hard Disk",
        //             "userAnswer": "",
        //             "explanation": ""
        //         }
        //     ]
        // )
    }, [setPercentage, setAiModel, setSelectedModel]);

    return (
        <main className="flex flex-col h-screen">
            <Navbar isAuthenticated={isAuthenticated} aiModel={aiModel} setAIModel={setAIModel} selectedModel={selectedModel} />
            {
                generating ? <section className="container mx-auto py-8 flex justify-center items-center flex-1 min-h-0">
                    <h1 className="text-xs font-bold text-gray-500 flex items-center gap-2">
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                        </span>
                        Please hold a moment. AI is generating your question paper based on your interest. Let the site do it jobs...
                    </h1>
                </section> : questions ? <QuizForm questions={questions} handleChangeAnswer={handleChangeAnswer} isSubmitting={isSubmitting} handleSubmit={handleSubmit} percentage={percentage} attempted={attempted.size} marks={marks} resetQuiz={resetQuiz} /> : <section className="text-white py-20 px-4 md:px-0 flex-1 flex w-full h-full items-center justify-center">
                    <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-10 md:mb-0 px-4 md:px-10">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Welcome to <span className="text-yellow-300">QuizGen AI</span>!
                            </h1>

                            <p className="text-xl mb-8 opacity-90 leading-relaxed">
                                Please enter your prompt to generate a quiz.<br />
                                You can ask for any topic, and the AI will generate a quiz for you.
                            </p>
                        </div>

                        <div className="md:w-1/2 px-4 md:px-10">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/20">
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <i className="fas fa-lightbulb mr-3 text-yellow-300"></i>
                                    Prompt Structure
                                </h3>

                                <div className="prompt-structure bg-white/5 rounded-lg p-4 mb-6">
                                    <p className="text-sm font-mono text-white/90 mb-2">
                                        "Suppose you are a quiz master and you have to generate a
                                        <span className="bg-yellow-300/20 text-yellow-300 px-1.5 py-0.5 rounded">[difficulty]</span> level quiz about
                                        <span className="bg-yellow-300/20 text-yellow-300 px-1.5 py-0.5 rounded">[enter precise topic]</span> with
                                        <span className="bg-yellow-300/20 text-yellow-300 px-1.5 py-0.5 rounded">[count]</span> questions.
                                    </p>
                                    <p className="text-sm font-mono text-white/90">
                                        Question types to include:
                                        <span className="bg-yellow-300/20 text-yellow-300 px-1.5 py-0.5 rounded">[mcq, saq, long]</span>
                                        [any one or more type of questions]"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 bg-blue-500/20 rounded-full p-2 mr-3">
                                            <i className="fas fa-star text-blue-300"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Be specific</h4>
                                            <p className="text-sm opacity-80">The more details you provide, the better the quiz will be.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 bg-blue-500/20 rounded-full p-2 mr-3">
                                            <i className="fas fa-clock text-blue-300"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Examples work best</h4>
                                            <p className="text-sm opacity-80">"Generate an intermediate quiz about World War 2 with 10 questions"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
            <Chatbox prompt={prompt} setPrompt={setPrompt} generating={generating} submitPrompt={submitPrompt} />
        </main>
    )
}