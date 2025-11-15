'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import Form from '@/components/Form';
import Input from '@/components/Input';
import Checkbox from '@/components/Checkbox';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function CreateQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    published: false,
  });

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

    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      setLoading(true);
      const quiz = await adminApi.createQuiz({
        title: formData.title,
        description: formData.description,
        slug,
        published: formData.published,
      });
      router.push(`/admin/${quiz._id || quiz.id}/add-question`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
          <p className="text-gray-600">Fill in the details to create a new quiz</p>
        </div>

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
              placeholder="Enter quiz title"
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
                placeholder="Enter quiz description"
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
              <Button type="submit" isLoading={loading} className="flex-1">
                Create Quiz
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}

