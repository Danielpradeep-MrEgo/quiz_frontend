'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import type { Quiz, Question } from '@/lib/types';
import Form from '@/components/Form';
import Input from '@/components/Input';
import Checkbox from '@/components/Checkbox';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Loader from '@/components/Loader';

interface EditQuizPageProps {
  params: {
    id: string;
  };
}

export default function EditQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    published: false,
  });

  const params: { id: string } = useParams();
  const id = params.id;

  useEffect(() => {
    loadQuiz();
  }, [params.id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getQuizById(params.id);
      setQuiz(data);
      setFormData({
        title: data.title,
        description: data.description,
        published: data.published,
      });
    } catch (err) {
      setError('Failed to load quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setSaving(true);
      await adminApi.updateQuiz(params.id, {
        title: formData.title,
        description: formData.description,
        published: formData.published,
      });
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update quiz');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600">Quiz not found</p>
          <Link href="/admin">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Quiz</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <Checkbox
                  label="Published (visible to public)"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />

                <div className="flex gap-4 pt-4">
                  <Link href="/admin" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" isLoading={saving} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
              <p className="text-sm text-gray-600 mb-4">
                {quiz.questions?.length || 0} question(s)
              </p>
              <Link href={`/admin/${params.id}/add-question`}>
                <Button className="w-full mb-4">Add Question</Button>
              </Link>

              {quiz.questions && quiz.questions.length > 0 && (
                <div className="space-y-2">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={question._id || question.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Q{index + 1}: {question.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {question.type} • {question.points} pts
                          </p>
                        </div>
                        <Link href={`/admin/question/${question._id || question.id}`}>
                          <Button variant="secondary" className="text-xs px-2 py-1">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

