import { Question } from "@/types";
import { Brain, Loader2 } from "lucide-react";
import LAQ from "./LAQ";
import MCQ from "./MCQ";
import SAQ from "./SAQ";
import { Button } from "./ui/button";

const QuizForm = ({ questions, handleChangeAnswer, isSubmitting, handleSubmit, percentage, attempted, marks, resetQuiz }: {
    questions: Question[],
    handleChangeAnswer: (questionId: string, answer: string) => void
    isSubmitting: boolean
    handleSubmit: () => void
    percentage: number
    attempted: number
    marks: number
    resetQuiz: () => void
}) => {
    return (
        <section className="container mx-auto flex flex-1 min-h-0 flex-col items-center w-full max-w-3xl h-full rounded-md mb-6">
            <div className="flex flex-col w-full bg-gray-50 dark:bg-gray-800">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center w-full rounded-t-md">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Your Quiz is Ready!
                        </h1>
                        <p className="text-indigo-200">{"Test your skills with our interactive quiz"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Brain className="text-xl" />
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex gap-4 items-center">
                        <div className="h-2 bg-gray-200 rounded-full flex-1">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-sm text-gray-500">
                            {`Attempted ${attempted} out of ${questions!.length}.`}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 px-6 flex-1 min-h-0 overflow-y-scroll w-full bg-gray-50 dark:bg-gray-800">
                {
                    questions.map((question, index) => {
                        if (question.type === 'mcq') {
                            return <MCQ key={index} question={question} handleChangeAnswer={handleChangeAnswer} />
                        } else if (question.type === 'saq') {
                            return <SAQ key={index} question={question} handleChangeAnswer={handleChangeAnswer} />
                        } else if (question.type === 'long') {
                            return <LAQ key={index} question={question} handleChangeAnswer={handleChangeAnswer} />
                        }
                        return null;
                    })
                }
            </div>

            <div className="p-4 w-full dark:bg-gray-800 rounded-b-md flex items-center justify-between">
                <span className="text-sm text-gray-500 font-semibold">
                    Marks: {marks} out of {questions.length}. Total {(marks / questions.length) * 100}%
                </span>
                <div>
                    <Button className="bg-red-500 hover:bg-red-600 cursor-pointer mr-2" onClick={resetQuiz} disabled={isSubmitting}>
                        Reset Quiz
                    </Button>
                    {
                        isSubmitting ? <Button className="bg-btn hover:bg-btn-hover cursor-pointer">
                            <span>
                                <Loader2 className="animate-spin" size={16} />
                            </span>
                            <span>Loading ...</span>
                        </Button> : <Button className="bg-btn hover:bg-btn-hover cursor-pointer" onClick={handleSubmit} disabled={isSubmitting || attempted < questions.length}>
                            Submit Quiz
                        </Button>
                    }
                </div>
            </div>
        </section>
    )
}

export default QuizForm