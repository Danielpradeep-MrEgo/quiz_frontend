import axios from "axios";
import type { Quiz, Question, QuizAttempt, AttemptResult } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-dfa0f.up.railway.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public API endpoints
export const publicApi = {
  // Get all published quizzes
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get<Quiz[]>("/quizzes");
    return response.data;
  },

  // Get quiz by ID
  getQuizById: async (id: string): Promise<Quiz> => {
    const response = await api.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  },

  // Submit quiz attempt - returns full result data
  submitAttempt: async (
    id: string,
    answers: QuizAttempt["answers"]
  ): Promise<AttemptResult> => {
    // Backend returns full result in snake_case
    interface BackendAttemptResponse {
      attempt_id: string;
      quiz_id: string;
      score: number;
      max_score: number;
      answers: Array<{
        question_id: string;
        type: string;
        is_correct: boolean;
        max_points: number;
        points_awarded: number;
        correct_choice_ids: string[];
        correct_choice_texts: string[];
        selected_choice_ids?: string[];
        text_answer?: string;
      }>;
    }

    const response = await api.post<BackendAttemptResponse>(
      `/quizzes/${id}/attempt`,
      { answers }
    );
    const backendData = response.data;

    // Transform backend response to frontend format
    return {
      attemptId: backendData.attempt_id,
      quizId: backendData.quiz_id,
      score: backendData.score,
      totalPoints: backendData.max_score,
      answers: backendData.answers.map((ans) => ({
        questionId: ans.question_id,
        question: {
          _id: ans.question_id,
          id: ans.question_id,
          quizId: backendData.quiz_id,
          type: ans.type as any,
          text: "", // Will need to be populated from quiz data if needed
          points: ans.max_points,
        },
        userAnswer: ans.selected_choice_ids || ans.text_answer || "",
        correctAnswer:
          ans.correct_choice_texts.length > 0
            ? ans.correct_choice_texts
            : ans.correct_choice_ids,
        pointsEarned: ans.points_awarded,
        isCorrect: ans.is_correct,
      })),
    };
  },
};

// Admin API endpoints
export const adminApi = {
  // Get all quizzes (admin)
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get<Quiz[]>("/admin/quizzes");
    return response.data;
  },

  // Create quiz
  createQuiz: async (
    quiz: Omit<Quiz, "_id" | "id" | "questions" | "createdAt" | "updatedAt">
  ): Promise<Quiz> => {
    const response = await api.post<Quiz>("/admin/quizzes", quiz);
    return response.data;
  },

  // Get quiz by ID
  getQuizById: async (id: string): Promise<Quiz> => {
    const response = await api.get<Quiz>(`/admin/quizzes/${id}`);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (id: string, quiz: Partial<Quiz>): Promise<Quiz> => {
    const response = await api.put<Quiz>(`/admin/quizzes/${id}`, quiz);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: string): Promise<void> => {
    await api.delete(`/admin/quizzes/${id}`);
  },

  // Create question
  createQuestion: async (
    quizId: string,
    question: Omit<Question, "_id" | "id" | "quizId">
  ): Promise<Question> => {
    const response = await api.post<Question>(
      `/admin/quizzes/${quizId}/questions`,
      question
    );
    return response.data;
  },

  // Update question
  updateQuestion: async (
    questionId: string,
    question: Partial<Question>
  ): Promise<Question> => {
    const response = await api.put<Question>(
      `/admin/questions/${questionId}`,
      question
    );
    return response.data;
  },

  // Delete question
  deleteQuestion: async (questionId: string): Promise<void> => {
    await api.delete(`/admin/questions/${questionId}`);
  },
};
