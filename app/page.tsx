import Link from "next/link";
import { publicApi } from "@/lib/api";
import type { Quiz } from "@/lib/types";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loader from "@/components/Loader";

export default async function HomePage() {
  let quizzes: Quiz[] = [];
  let error: string | null = null;

  try {
    quizzes = await publicApi.getQuizzes();
  } catch (err) {
    error = "Failed to load quizzes";
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quiz Management System
          </h1>
          <p className="text-gray-600">Choose a quiz to test your knowledge</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No quizzes available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz._id || quiz.id}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {quiz.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {quiz.description}
                    </p>
                    <Link href={`/quiz/${quiz._id || quiz.id}`}>
                      <Button className="w-full">Take Quiz</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
