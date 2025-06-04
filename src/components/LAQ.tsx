import { Question } from '@/types'
import { Textarea } from './ui/textarea'

const LAQ = ({ question, handleChangeAnswer }: { question: Question, handleChangeAnswer: (questionId: string, answer: string) => void }) => {
    return (
        <div className={`bg-violet-50 dark:bg-gray-900 p-6 rounded-lg border-l-4 border-violet-500 flex flex-col gap-4`}>
            <div className="flex items-center gap-4 w-full justify-start">
                <span className="text-xs bg-btn text-white rounded-full w-6 h-6 flex items-center justify-center text-center">
                    {question.id}
                </span>
                <h3 className="text-lg font-semibold flex-1">{question.question}</h3>
            </div>
            <div className="flex items-center gap-4 w-full justify-end">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>
                        Difficulty:
                    </span>
                    <span className={`${question.difficulty === 'easy' ? 'text-green-500' : question.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                        {question.difficulty.toUpperCase()}
                    </span>
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>
                        Marks:
                    </span>
                    <span className="text-blue-500">
                        {question.marks}
                    </span>
                </span>
            </div>

            <div className="space-y-3 ml-8">
                {
                    <Textarea placeholder="Type your answer here..." className="w-full resize-none h-32" defaultValue={question.userAnswer} onChange={(e) => handleChangeAnswer(question.id, e.target.value)} />
                }
            </div>
        </div>
    )
}

export default LAQ