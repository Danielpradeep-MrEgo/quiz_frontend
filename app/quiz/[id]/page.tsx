"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import type { Quiz, Question, AttemptAnswer } from "@/lib/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import RadioGroup from "@/components/RadioGroup";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import Form from "@/components/Form";

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default function QuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const params: { id: string } = useParams();

  useEffect(() => {
    loadQuiz();
  }, [params.id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await publicApi.getQuizById(params.id);
      setQuiz(data);
      // Initialize answers
      const initialAnswers: Record<string, string | string[]> = {};
      data.questions?.forEach((q) => {
        if (q.type === "MCQ_MULTI") {
          initialAnswers[q._id || q.id || ""] = [];
        } else {
          initialAnswers[q._id || q.id || ""] = "";
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError("Failed to load quiz");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (
    questionId: string,
    choiceId: string,
    checked: boolean
  ) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, choiceId] };
      } else {
        return {
          ...prev,
          [questionId]: current.filter((id) => id !== choiceId),
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quiz) return;

    // Validate answers and format for backend
    const attemptAnswers: AttemptAnswer[] = [];
    for (const question of quiz.questions || []) {
      const questionId = question._id || question.id || "";
      const answer = answers[questionId];

      if (question.type === "TEXT" && !answer) {
        setError(`Please answer: ${question.text}`);
        return;
      }

      if (
        (question.type === "MCQ_SINGLE" || question.type === "TRUE_FALSE") &&
        !answer
      ) {
        setError(`Please select an answer for: ${question.text}`);
        return;
      }

      if (
        question.type === "MCQ_MULTI" &&
        (!answer || (Array.isArray(answer) && answer.length === 0))
      ) {
        setError(`Please select at least one answer for: ${question.text}`);
        return;
      }

      // Format answer based on question type
      if (question.type === "TEXT") {
        attemptAnswers.push({
          question_id: questionId,
          text_answer: answer as string,
        });
      } else {
        // For MCQ_SINGLE, MCQ_MULTI, and TRUE_FALSE
        // answer is either a string (choice index/ID) or array of strings
        const selectedChoiceIds = Array.isArray(answer) ? answer : [answer];

        // Map choice indices to actual choice IDs if needed
        const choiceIds: string[] = [];
        selectedChoiceIds.forEach((choiceIdOrIndex) => {
          // If it's a numeric string (index), get the actual choice ID
          const index = parseInt(choiceIdOrIndex);
          if (!isNaN(index) && question.choices && question.choices[index]) {
            const choice = question.choices[index];
            choiceIds.push(choice.id || choiceIdOrIndex);
          } else {
            // It's already a choice ID
            choiceIds.push(choiceIdOrIndex);
          }
        });

        attemptAnswers.push({
          question_id: questionId,
          selected_choice_ids: choiceIds,
        });
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      const result = await publicApi.submitAttempt(params.id, attemptAnswers);
      // Store result in sessionStorage and redirect
      sessionStorage.setItem('quizResult', JSON.stringify(result));
      router.push(`/quiz/${params.id}/result`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit quiz");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {quiz.title}
          </h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {quiz.questions?.map((question, index) => (
            <Card key={question._id || question.id} className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Question {index + 1}: {question.text}
                </h3>
                <p className="text-sm text-gray-500">
                  Points: {question.points}
                </p>
              </div>

              {question.type === "MCQ_SINGLE" && question.choices && (
                <RadioGroup
                  name={`question-${question._id || question.id}`}
                  options={question.choices.map((choice, idx) => ({
                    value: choice.id || String(idx),
                    label: choice.text,
                  }))}
                  value={answers[question._id || question.id || ""] as string}
                  onChange={(value) =>
                    handleAnswerChange(question._id || question.id || "", value)
                  }
                />
              )}

              {question.type === "MCQ_MULTI" && question.choices && (
                <div className="space-y-2">
                  {question.choices.map((choice, idx) => {
                    const choiceId = choice.id || String(idx);
                    const currentAnswers =
                      (answers[
                        question._id || question.id || ""
                      ] as string[]) || [];
                    return (
                      <Checkbox
                        key={choiceId}
                        label={choice.text}
                        checked={currentAnswers.includes(choiceId)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            question._id || question.id || "",
                            choiceId,
                            e.target.checked
                          )
                        }
                      />
                    );
                  })}
                </div>
              )}

              {question.type === "TRUE_FALSE" && question.choices && (
                <RadioGroup
                  name={`question-${question._id || question.id}`}
                  options={question.choices.map((choice, idx) => ({
                    value: choice.id || String(idx),
                    label: choice.text,
                  }))}
                  value={answers[question._id || question.id || ""] as string}
                  onChange={(value) =>
                    handleAnswerChange(question._id || question.id || "", value)
                  }
                />
              )}

              {question.type === "TEXT" && (
                <Input
                  type="text"
                  value={answers[question._id || question.id || ""] as string}
                  onChange={(e) =>
                    handleAnswerChange(
                      question._id || question.id || "",
                      e.target.value
                    )
                  }
                  placeholder="Enter your answer"
                />
              )}
            </Card>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <Button type="submit" isLoading={submitting} disabled={submitting}>
              Submit Quiz
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
