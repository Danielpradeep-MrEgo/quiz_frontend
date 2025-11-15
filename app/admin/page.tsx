"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import type { Quiz } from "@/lib/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loader from "@/components/Loader";

export default function AdminDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getQuizzes();

      // If questions aren't included, fetch question counts for each quiz
      const quizzesWithCounts = await Promise.all(
        data.map(async (quiz) => {
          // If questions array exists and has items, use it
          if (quiz.questions && quiz.questions.length > 0) {
            return quiz;
          }

          // If question_count is provided by backend, use it
          if (quiz.question_count !== undefined) {
            return quiz;
          }

          // Otherwise, fetch the full quiz to get question count
          try {
            const fullQuiz = await adminApi.getQuizById(
              quiz._id || quiz.id || ""
            );
            return {
              ...quiz,
              questions: fullQuiz.questions,
            };
          } catch (err) {
            // If fetch fails, return quiz as-is
            return quiz;
          }
        })
      );

      setQuizzes(quizzesWithCounts);
    } catch (err) {
      setError("Failed to load quizzes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      setDeletingId(id);
      await adminApi.deleteQuiz(id);
      setQuizzes(quizzes.filter((q) => (q._id || q.id) !== id));
    } catch (err) {
      alert("Failed to delete quiz");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage your quizzes</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No quizzes yet.</p>
              <Link href="/admin/create">
                <Button>Create Your First Quiz</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz._id || quiz.id}>
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {quiz.title}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        quiz.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {quiz.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {quiz.description}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Questions:{" "}
                    {quiz.question_count ?? quiz.questions?.length ?? 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/${quiz._id || quiz.id}`}
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(quiz._id || quiz.id || "")}
                    disabled={deletingId === (quiz._id || quiz.id)}
                    isLoading={deletingId === (quiz._id || quiz.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
