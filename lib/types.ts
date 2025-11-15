export type QuestionType = 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'TEXT';

export interface Choice {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  _id?: string;
  id?: string;
  quizId: string;
  type: QuestionType;
  text: string;
  choices?: Choice[];
  correctAnswer?: string | string[];
  points: number;
}

export interface Quiz {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  slug: string;
  published: boolean;
  questions?: Question[];
  question_count?: number; // Backend might provide this in list responses
  createdAt?: string;
  updatedAt?: string;
}

export interface AttemptAnswer {
  question_id: string;
  selected_choice_ids?: string[];
  text_answer?: string;
}

export interface QuizAttempt {
  _id?: string;
  id?: string;
  quizId: string;
  answers: AttemptAnswer[];
  score?: number;
  totalPoints?: number;
  createdAt?: string;
}

export interface AttemptResult {
  attemptId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  answers: {
    questionId: string;
    question: Question;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    pointsEarned: number;
    isCorrect: boolean;
  }[];
}

