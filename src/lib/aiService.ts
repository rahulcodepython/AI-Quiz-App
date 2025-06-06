import { GradeResult, ModelType, Quiz } from "@/types";
import { GoogleGenAI } from "@google/genai";

export class AIService {
    private config: {
        model: ModelType;
        token: string;
        endpoint: string;
    };

    constructor(model: ModelType, apikey: string, endpoint: string) {
        this.config = {
            model,
            token: apikey,
            endpoint
        };
    }

    getModelInfo() {
        return {
            id: this.config.model,
            apiKey: this.config.token,
            endpoint: this.config.endpoint
        };
    }

    private buildQuizPrompt(prompt: string): string {
        return `Suppose you are a quiz master. ${prompt}. IMPORTANT: Respond ONLY with valid JSON.Don't send any extra content along with it. The exact format which you have to follow is:
export interface Question {
id: string;
question: string;
type: QuestionType;
difficulty: QuestionDifficulty;
marks: number;
options?: string[];
correctAnswer?: string;
userAnswer?: string;
explanation?: string;
}
export type QuestionType = 'mcq' | 'saq' | 'long';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
Points to be noted:
- Each question should have a unique id which is none other than the serial number of the question.
- options should be provided only for mcq type questions.
- correctAnswer should be provided only for mcq type questions.
- userAnswer will be blank string for every question.
- explanation will be blank string for every question.
- No explanations outside JSON - ONLY return the JSON object
- For MCQ: Always provide exactly 4 options with one correct answer
- For SAQ: Provide expectedAnswer for reference
- For Long: No expected answer of correctAnswer needed. Just provide the question.
- Don't use any markdown formatting like code blocks or quotes or for any paragraphs.
`;
    }

    private buildGradingPrompt(prompt: string): string {
        return `Grade this quiz submission. The user took a quiz and provided answers. The user given answers are in "userAnswer" field of each question. If the userAnswer is blank, it means the user did not answer that question, you will marked that blank and give 0 marks. If the user answered a question, you have to grade it based on the marks of question. If the user answered correctly, give full marks, if the user answered incorrectly, give 0 marks. If the question is SAQ or Long Answer, you have to grade it based on the quality of answer and give marks accordingly. You have to provide feedback for each question in "explanation" field of each question. The grading should be done based on the following rules: 
- MCQ: 1 point for correct, 0 for incorrect
- SAQ: 0 to marks of that question points based on accuracy and completeness
- Long Answer: 0 to marks of that question points based on key points covered and quality
- Always provide constructive feedback explaining the correct answer
- For wrong answers, explain why it's incorrect and what the right answer should be
- Your response must only be a valid JSON object.
- Your response must not contain any explanations or additional text outside the JSON object.
- totalMarks should be the sum of all marks of questions.
- The score should be the total marks scored by the user.
- Don't use any markdown formatting like code blocks or quotes or for any paragraphs.
- You have to write the explaination of the correct answer for both LAQ SAQ and MCQ.
- The exact format which you have to follow is:
interface Question {
    id: string;
    question: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    marks: number;
    options?: string[];
    userAnswer?: string;
    explanation?: string;
}
export interface GradingResult {
    questions: Question[];
    score: number;
    totalMarks: number;
}
\`GradingResult\` this should be your return json format.
The user given answer is:
${prompt}
IMPORTANT: Respond ONLY with valid JSON. Don't send any extra content along with it.`;

    }

    async generateQuiz(prompt: string): Promise<Quiz> {
        const finalPrompt = this.buildQuizPrompt(prompt);

        try {
            const response = await this.callAI(finalPrompt);
            //             const response = `
            //             [
            //   {
            //     "id": "1",
            //     "question": "What does 'IP' stand for in 'IP address'?",
            //     "type": "mcq",
            //     "difficulty": "easy",
            //     "marks": 1,
            //     "options": [
            //       "Internet Protocol",
            //       "Internal Program",
            //       "Interconnected Process",
            //       "Information Packet"
            //     ],
            //     "correctAnswer": "Internet Protocol",
            //     "userAnswer": "",
            //     "explanation": ""
            //   },
            //   {
            //     "id": "2",
            //     "question": "Which protocol is used to translate domain names (like www.google.com) into IP addresses?",
            //     "type": "mcq",
            //     "difficulty": "easy",
            //     "marks": 1,
            //     "options": [
            //       "HTTP",
            //       "FTP",
            //       "DNS",
            //       "SMTP"
            //     ],
            //     "correctAnswer": "DNS",
            //     "userAnswer": "",
            //     "explanation": ""
            //   },
            //   {
            //     "id": "3",
            //     "question": "What is the primary function of an IP address in a computer network?",
            //     "type": "mcq",
            //     "difficulty": "easy",
            //     "marks": 1,
            //     "options": [
            //       "To display web pages",
            //       "To uniquely identify a device on a network",
            //       "To send email messages",
            //       "To secure network connections"
            //     ],
            //     "correctAnswer": "To uniquely identify a device on a network",
            //     "userAnswer": "",
            //     "explanation": ""
            //   }
            // ]`
            console.log('AI Quiz Response:', response);
            return this.parseQuizResponse(response);
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error('Failed to generate quiz');
        }
    }

    async gradeQuiz(prompt: string): Promise<GradeResult> {
        const finalPrompt = this.buildGradingPrompt(prompt);

        try {
            const response = await this.callAI(finalPrompt);
            //             const response = `{
            //     "questions": [
            //         {
            //             "id": "1",
            //             "question": "What does 'IP' stand for in 'IP address'?",
            //             "type": "mcq",
            //             "difficulty": "easy",
            //             "marks": 1,
            //             "options": [
            //                 "Internet Protocol",
            //                 "Internal Program",
            //                 "Interconnected Process",
            //                 "Information Packet"
            //             ],
            //             "userAnswer": "Internet Protocol",
            //             "explanation": "Your answer is correct. 'IP' in 'IP address' indeed stands for Internet Protocol, which is the set of rules governing the format of data sent over the internet or a local network."
            //         },
            //         {
            //             "id": "2",
            //             "question": "Which protocol is used to translate domain names (like www.google.com) into IP addresses?",
            //             "type": "mcq",
            //             "difficulty": "easy",
            //             "marks": 1,
            //             "options": [
            //                 "HTTP",
            //                 "FTP",
            //                 "DNS",
            //                 "SMTP"
            //             ],
            //             "userAnswer": "HTTP",
            //             "explanation": "Your answer is incorrect. HTTP (Hypertext Transfer Protocol) is primarily used for transferring hypertext, like web pages, over the internet. The correct protocol for translating human-readable domain names into numerical IP addresses is DNS (Domain Name System). DNS acts like a phonebook for the internet."
            //         },
            //         {
            //             "id": "3",
            //             "question": "What is the primary function of an IP address in a computer network?",
            //             "type": "mcq",
            //             "difficulty": "easy",
            //             "marks": 1,
            //             "options": [
            //                 "To display web pages",
            //                 "To uniquely identify a device on a network",
            //                 "To send email messages",
            //                 "To secure network connections"
            //             ],
            //             "userAnswer": "To display web pages",
            //             "explanation": "Your answer is incorrect. While devices with IP addresses do display web pages, the primary function of an IP address itself is not to display web pages. Its main purpose is to uniquely identify and locate a specific device (like a computer, server, or router) on a network, enabling data to be sent to and received from that device."
            //         }
            //     ],
            //     "score": 1,
            //     "totalMarks": 3
            // }`;
            console.log('AI Grading Response:', response);
            return this.parseGradeResponse(response);
        } catch (error) {
            console.error('AI Grading Error:', error);
            throw new Error('Failed to grade quiz');
        }
    }

    private async callAI(prompt: string): Promise<Quiz | string> {
        const { model, token, endpoint } = this.config;

        // // OpenAI API call
        // if (model === 'openai') {
        //     const response = await fetch(endpoint, {
        //         method: 'POST',
        //         headers: {
        //             'Authorization': `Bearer ${token}`,
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             model: 'gpt-4',
        //             messages: [{ role: 'user', content: prompt }],
        //             temperature: 0.7,
        //             max_tokens: 2000,
        //         }),
        //     });

        //     const data = await response.json();
        //     return data.choices[0].message.content as string;
        // }

        // // Anthropic Claude API call
        // if (model === 'anthropic') {
        //     const response = await fetch(endpoint, {
        //         method: 'POST',
        //         headers: {
        //             'x-api-key': token,
        //             'Content-Type': 'application/json',
        //             'anthropic-version': '2023-06-01'
        //         },
        //         body: JSON.stringify({
        //             model: 'claude-3-sonnet-20240229',
        //             max_tokens: 2000,
        //             messages: [{ role: 'user', content: prompt }]
        //         }),
        //     });

        //     const data = await response.json();
        //     return data.content[0].text as string;
        // }

        // Gemini API call
        if (model === 'google') {
            const ai = new GoogleGenAI({ apiKey: token });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-05-20",
                contents: prompt,
            });

            const data = response.text;
            //             const data = `
            //             \`\`\`json
            //             [
            //     {
            //         "id": "1",
            //         "question": "On what date did D-Day, the Allied invasion of Normandy, take place?",
            //         "type": "mcq",
            //         "difficulty": "medium",
            //         "marks": 1,
            //         "options": [
            //             "June 6, 1944",
            //             "May 8, 1945",
            //             "September 1, 1939",
            //             "December 7, 1941"
            //         ],
            //         "userAnswer": "June 6, 1944",
            //         "explanation": ""
            //     },
            //     {
            //         "id": "2",
            //         "question": "Briefly explain what is meant by the term 'Phony War' during the early stages of World War II.",
            //         "type": "saq",
            //         "difficulty": "medium",
            //         "marks": 2,
            //         "userAnswer": "",
            //         "explanation": ""
            //     },
            //     {
            //         "id": "3",
            //         "question": "Discuss the strategic significance and outcome of the Battle of Britain.",
            //         "type": "long",
            //         "difficulty": "medium",
            //         "marks": 3,
            //         "userAnswer": "",
            //         "explanation": ""
            //     }
            // ]
            //             \`\`\`
            //             `;
            return data as string;
        }

        // Add more AI providers as needed
        throw new Error(`Unsupported AI model: ${model}`);
    }

    private parseQuizResponse(rawResponse: string | unknown): Quiz {
        try {
            // Step 1: If it's already an object, just return it as-is
            if (typeof rawResponse !== 'string') {
                return rawResponse as Quiz;
            }

            // Step 2: Extract JSON from markdown-style code block ```json ... ```
            const codeBlockMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            const jsonString = codeBlockMatch ? codeBlockMatch[1] : rawResponse.trim();

            // Step 3: Parse the JSON
            const parsed = JSON.parse(jsonString);

            // Step 4: Basic validation (optional but recommended)
            if (!Array.isArray(parsed)) {
                throw new Error("Parsed response is not an array");
            }

            return parsed as Quiz;
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            throw new Error("Invalid AI response format");
        }
    }

    private parseGradeResponse(rawResponse: string | unknown): GradeResult {
        try {
            // Step 1: If it's already an object, just return it as-is
            if (typeof rawResponse !== 'string') {
                return rawResponse as GradeResult;
            }

            // Step 2: Extract JSON from markdown-style code block ```json ... ```
            const codeBlockMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            const jsonString = codeBlockMatch ? codeBlockMatch[1] : rawResponse.trim();

            // Step 3: Parse the JSON
            const parsed: GradeResult = JSON.parse(jsonString);

            return parsed as GradeResult;
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            throw new Error("Invalid AI response format");
        }
    }
}