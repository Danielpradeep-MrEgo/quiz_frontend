"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import type { AttemptResult, Quiz } from "@/lib/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loader from "@/components/Loader";

interface ResultPageProps {
  params: {
    id: string;
  };
}

function ResultPageContent() {
  const router = useRouter();
  const params: { id: string } = useParams();

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      setLoading(true);
      // Get result from sessionStorage (stored after quiz submission)
      const storedResult = sessionStorage.getItem("quizResult");
      if (!storedResult) {
        setError("No quiz results found. Please take the quiz first.");
        setLoading(false);
        return;
      }

      const parsedResult = JSON.parse(storedResult) as AttemptResult;

      // Fetch quiz data to get question texts
      try {
        const quizData = await publicApi.getQuizById(params.id);
        setQuiz(quizData);

        // Merge quiz question data with result answers
        const enrichedAnswers = parsedResult.answers.map((answer) => {
          const question = quizData.questions?.find(
            (q) => (q._id || q.id) === answer.questionId
          );
          return {
            ...answer,
            question: question || answer.question,
          };
        });

        setResult({
          ...parsedResult,
          answers: enrichedAnswers,
        });
      } catch (quizErr) {
        // If quiz fetch fails, use result as-is
        setResult(parsedResult);
      }

      // Clear from sessionStorage after reading
      sessionStorage.removeItem("quizResult");
    } catch (err) {
      setError("Failed to load results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600">{error || "Results not found"}</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalPoints) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quiz Results
            </h1>
            <div className="mb-4">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {percentage}%
              </div>
              <p className="text-gray-600">
                Score: {result.score} / {result.totalPoints} points
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {result.answers.map((answerItem, index) => {
            const isCorrect = answerItem.isCorrect;
            const question = answerItem.question;

            return (
              <Card
                key={answerItem.questionId}
                className={isCorrect ? "border-green-500" : "border-red-500"}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}: {question.text}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Points: {answerItem.pointsEarned} / {question.points}
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Your Answer:
                    </p>
                    <p className="text-gray-900 mt-1">
                      {Array.isArray(answerItem.userAnswer)
                        ? answerItem.userAnswer.join(", ")
                        : answerItem.userAnswer || "No answer provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Correct Answer:
                    </p>
                    <p className="text-gray-900 mt-1">
                      {Array.isArray(answerItem.correctAnswer)
                        ? answerItem.correctAnswer.join(", ")
                        : answerItem.correctAnswer}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={() => router.push(`/quiz/${params.id}`)}
            variant="outline"
          >
            Retake Quiz
          </Button>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage({ params }: ResultPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}
