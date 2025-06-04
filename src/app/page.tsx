'use client'

import Navbar from "@/components/Navbar"
import QuizForm from "@/components/QuizForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AI_MODELS, DIFFICULTY, QUESTION_PATTERNS } from "@/const"
import { AIService } from "@/lib/aiService"
import { AIModelType, ModelType, Question, QuestionDifficulty } from "@/types"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from 'react'
import { toast } from "sonner"

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true)
    const [generating, setGenerating] = useState<boolean>(false)
    const [questions, setQuestions] = useState<Question[] | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [attempted, setAttempted] = useState<Set<string>>(new Set())
    const [percentage, setPercentage] = useState<number>(0.0)
    const [marks, setMarks] = useState<number>(0)
    const [totalMarks, setTotalMarks] = useState<number>(0)

    const [aiModel, setAiModel] = useState<AIModelType[] | null>(null)
    const [selectedModel, setSelectedModel] = useState<ModelType | null>(null)

    const [topic, setTopic] = useState<string>('')
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium')
    const [pattern, setPattern] = useState<string>('')
    const [numQuestions, setNumQuestions] = useState<number>(10)

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
                toast('Please select an AI model first.');
                return;
            }

            if (!aiModel || !aiModel.length) {
                toast('No AI models available. Please set up an AI model first.');
                return;
            }

            const aiService = new AIService(selectedModel as ModelType, aiModel.find(m => m.id === selectedModel)?.apiKey!, AI_MODELS.find(m => m.id === selectedModel)?.endpoint!);

            const response = await aiService.gradeQuiz(JSON.stringify(questions));

            setQuestions(response.questions);
            setMarks(response.score);
            setTotalMarks(response.totalMarks);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setIsSubmitting(false);
            if (questions) {
                setAttempted(new Set(questions.map(q => q.id)));
                setPercentage(100);
            }
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
            if (!topic || !topic.trim() || topic.length <= 5) {
                toast('Please enter a precise topic for the quiz.');
                return;
            }

            if (!pattern || !pattern.trim()) {
                toast('Please select a valid question pattern.');
                return;
            }

            if (!selectedModel) {
                toast('Please select an AI model first.');
                return;
            }

            if (!aiModel || !aiModel.length) {
                toast('No AI models available. Please set up an AI model first.');
                return;
            }

            const aiService = new AIService(selectedModel as ModelType, aiModel.find(m => m.id === selectedModel)?.apiKey!, AI_MODELS.find(m => m.id === selectedModel)?.endpoint!);
            const prompt = `Generate an ${difficulty} quiz about ${topic} with ${numQuestions} questions including ${pattern}.`;
            const response = await aiService.generateQuiz(prompt)

            setQuestions(response);
        } catch (error) {
            console.error('Error submitting prompt:', error);
        } finally {
            setGenerating(false);
            setTopic('');
            setDifficulty('medium');
            setPattern('');
            setNumQuestions(10);
            setIsSubmitting(false);
        }
    }

    const resetQuiz = () => {
        setQuestions(null);
        setAttempted(new Set());
        setPercentage(0.0);
        setMarks(0);
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
        //             "question": "Which event is generally considered the start of World War II in Europe?",
        //             "type": "mcq",
        //             "difficulty": "medium",
        //             "marks": 1,
        //             "options": [
        //                 "The attack on Pearl Harbor",
        //                 "The invasion of Poland by Germany",
        //                 "The Battle of Britain",
        //                 "The Fall of France"
        //             ],
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //         {
        //             "id": "2",
        //             "question": "Name the battle on the Eastern Front that is often considered a major turning point in World War II, marking the furthest advance of German forces into the Soviet Union.",
        //             "type": "saq",
        //             "difficulty": "medium",
        //             "marks": 1,
        //             "userAnswer": "",
        //             "explanation": ""
        //         },
        //     ]
        // )
    }, [setPercentage, setAiModel, setSelectedModel]);

    return (
        <main className="flex flex-col h-screen">
            <Navbar isAuthenticated={isAuthenticated} aiModel={aiModel} setAIModel={setAIModel} selectedModel={selectedModel} />
            {
                questions ? <QuizForm questions={questions} handleChangeAnswer={handleChangeAnswer} isSubmitting={isSubmitting} handleSubmit={handleSubmit} percentage={percentage} attempted={attempted.size} marks={marks} resetQuiz={resetQuiz} totalMarks={totalMarks} /> : <section className="w-full h-full flex justify-center items-center px-6 md:px-16 lg:px-32 py-8">
                    <div className="max-w-lg mx-auto rounded-lg form-shadow overflow-hidden gradient-bg">
                        {/* Header Content */}
                        <div className="px-8 pt-12 pb-6 text-center text-white bg-btn">
                            <i className="fas fa-question-circle text-5xl mb-4 opacity-90"></i>
                            <h1 className="text-3xl md:text-4xl font-bold">Question Generator</h1>
                            <p className="mt-2 opacity-80">Create custom questions based on your preferences</p>
                        </div>

                        {/* Form Container */}
                        <div className="dark:bg-gray-800 px-8 pb-8">
                            <h2 className="text-2xl font-semibold text-center mb-6 pt-6">Let's get started!</h2>

                            <form className="space-y-6">
                                {/* Topic Field */}
                                <div>
                                    <Label htmlFor="topic" className="block text-sm font-medium mb-1">
                                        Topic
                                    </Label>
                                    <Input
                                        type="text"
                                        id="topic"
                                        name="topic"
                                        placeholder="Please enter a precise topic for the quiz"
                                        required
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Difficulty Level */}
                                <div>
                                    <Label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                                        Difficulty Level
                                    </Label>
                                    <Select name="difficulty" value={difficulty} onValueChange={(value) => setDifficulty(value as QuestionDifficulty)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                DIFFICULTY.map((difficulty) => (
                                                    <SelectItem key={difficulty.id} value={difficulty.id}>
                                                        {difficulty.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Question Pattern */}
                                <div>
                                    <Label htmlFor="pattern" className="block text-sm font-medium mb-1">
                                        Question Pattern
                                    </Label>
                                    <Select name="pattern" value={pattern} onValueChange={(value) => setPattern(value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pattern" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                QUESTION_PATTERNS.map((pattern) => (
                                                    <SelectItem key={pattern.id} value={pattern.id}>
                                                        {pattern.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of Questions */}
                                <div>
                                    <Label htmlFor="numQuestions" className="block text-sm font-medium mb-1">
                                        Number of Questions
                                    </Label>
                                    <Input
                                        type="number"
                                        id="numQuestions"
                                        name="numQuestions"
                                        min="1"
                                        max="50"
                                        placeholder="Enter number of questions (1-50)"
                                        required
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    {
                                        generating ? <Button className="w-full bg-btn hover:bg-btn-hover cursor-pointer" type="button" disabled>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Generating Questions...
                                        </Button> : <Button className="w-full bg-btn hover:bg-btn-hover cursor-pointer" type="submit" onClick={submitPrompt} disabled={generating || isSubmitting}>
                                            Generate Questions
                                        </Button>
                                    }
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            }
        </main>
    )
}