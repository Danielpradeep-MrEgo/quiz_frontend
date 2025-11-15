'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import type { Question, QuestionType, Choice } from '@/lib/types';
import Form from '@/components/Form';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Checkbox from '@/components/Checkbox';
import Loader from '@/components/Loader';

interface EditQuestionPageProps {
  params: {
    questionId: string;
  };
}

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'MCQ_SINGLE' as QuestionType,
    text: '',
    points: 1,
    choices: [] as Choice[],
    correctAnswer: '',
  });

  useEffect(() => {
    loadQuestion();
  }, [params.questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      // Fetch all quizzes to find the question
      // In a production app, you'd have a GET /admin/questions/:id endpoint
      const quizzes = await adminApi.getQuizzes();
      let foundQuestion: Question | null = null;
      
      for (const quiz of quizzes) {
        const q = quiz.questions?.find(
          (q) => (q._id || q.id) === params.questionId
        );
        if (q) {
          foundQuestion = { ...q, quizId: quiz._id || quiz.id || '' };
          break;
        }
      }

      if (!foundQuestion) {
        setError('Question not found');
        setLoading(false);
        return;
      }

      setQuestion(foundQuestion);

      // Populate form data
      let choices: Choice[] = [];
      const correctAnswer = foundQuestion.correctAnswer;

      if (foundQuestion.type === 'TRUE_FALSE') {
        // For TRUE_FALSE, use choices from backend or create default
        if (foundQuestion.choices && foundQuestion.choices.length > 0) {
          choices = foundQuestion.choices.map((choice: any) => ({
            text: choice.text,
            isCorrect: choice.is_correct || choice.isCorrect || false,
          }));
        } else {
          // Default TRUE_FALSE choices
          const isTrueCorrect = correctAnswer === 'true' || correctAnswer === '0';
          choices = [
            { text: 'True', isCorrect: isTrueCorrect },
            { text: 'False', isCorrect: !isTrueCorrect },
          ];
        }
      } else if (foundQuestion.type === 'MCQ_SINGLE' || foundQuestion.type === 'MCQ_MULTI') {
        choices = foundQuestion.choices || [];
        // Mark correct choices
        const correctIndices = Array.isArray(correctAnswer)
          ? correctAnswer.map((a) => parseInt(a))
          : [parseInt(correctAnswer as string)];
        
        choices.forEach((choice, idx) => {
          choice.isCorrect = correctIndices.includes(idx);
        });
      }

      setFormData({
        type: foundQuestion.type,
        text: foundQuestion.text,
        points: foundQuestion.points,
        choices: choices,
        correctAnswer: typeof correctAnswer === 'string' ? correctAnswer : '',
      });
    } catch (err) {
      setError('Failed to load question');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const questionTypeOptions = [
    { value: 'MCQ_SINGLE', label: 'Multiple Choice (Single)' },
    { value: 'MCQ_MULTI', label: 'Multiple Choice (Multiple)' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'TEXT', label: 'Text Response' },
  ];

  const handleTypeChange = (type: QuestionType) => {
    if (type === 'TRUE_FALSE') {
      // Initialize TRUE_FALSE with default choices
      setFormData({
        ...formData,
        type,
        choices: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: false },
        ],
        correctAnswer: '',
      });
    } else {
      setFormData({
        ...formData,
        type,
        choices: type === 'MCQ_SINGLE' || type === 'MCQ_MULTI' ? formData.choices : [],
        correctAnswer: '',
      });
    }
  };

  const handleAddChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, { text: '', isCorrect: false }],
    });
  };

  const handleChoiceChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newChoices = [...formData.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setFormData({ ...formData, choices: newChoices });
  };

  const handleRemoveChoice = (index: number) => {
    setFormData({
      ...formData,
      choices: formData.choices.filter((_, i) => i !== index),
    });
  };

  const validateForm = (): string | null => {
    if (!formData.text.trim()) {
      return 'Question text is required';
    }

    if (formData.points < 1) {
      return 'Points must be at least 1';
    }

    if (formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTI') {
      if (formData.choices.length < 2) {
        return 'At least 2 choices are required for MCQ questions';
      }

      const hasCorrect = formData.choices.some((c) => c.isCorrect);
      if (!hasCorrect) {
        return 'At least one choice must be marked as correct';
      }
    }

    if (formData.type === 'TRUE_FALSE') {
      if (formData.choices.length !== 2) {
        return 'True/False questions must have exactly 2 choices';
      }
      const hasCorrect = formData.choices.some((c) => c.isCorrect);
      if (!hasCorrect) {
        return 'Please select the correct answer';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!question) return;

    try {
      setSaving(true);
      const questionData: any = {
        type: formData.type,
        text: formData.text,
        points: formData.points,
      };

      if (formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTI') {
        questionData.choices = formData.choices;
        const correctChoices = formData.choices
          .map((c, idx) => (c.isCorrect ? String(idx) : null))
          .filter((c) => c !== null);
        questionData.correctAnswer = formData.type === 'MCQ_SINGLE' ? correctChoices[0] : correctChoices;
      } else if (formData.type === 'TRUE_FALSE') {
        // Convert isCorrect to is_correct for backend
        questionData.choices = formData.choices.map((choice) => ({
          text: choice.text,
          is_correct: choice.isCorrect,
        }));
      }

      await adminApi.updateQuestion(params.questionId, questionData);
      router.push(`/admin/${question.quizId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update question');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    if (!question) return;

    try {
      await adminApi.deleteQuestion(params.questionId);
      router.push(`/admin/${question.quizId}`);
    } catch (err) {
      alert('Failed to delete question');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link href={`/admin/${question.quizId}`}>
            <Button variant="outline" className="mb-4">← Back to Quiz</Button>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Question</h1>
            {question && (
              <Button variant="danger" onClick={handleDelete}>
                Delete Question
              </Button>
            )}
          </div>
        </div>

        <Card>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Select
              label="Question Type"
              options={questionTypeOptions}
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                required
                rows={3}
                placeholder="Enter your question"
              />
            </div>

            <Input
              label="Points"
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
              required
            />

            {(formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTI') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Choices</label>
                  <Button type="button" variant="secondary" onClick={handleAddChoice}>
                    Add Choice
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.choices.map((choice, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          value={choice.text}
                          onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                          placeholder={`Choice ${index + 1}`}
                        />
                      </div>
                      <div className="flex items-center pt-2">
                        <Checkbox
                          checked={choice.isCorrect || false}
                          onChange={(e) => handleChoiceChange(index, 'isCorrect', e.target.checked)}
                          label="Correct"
                        />
                      </div>
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveChoice(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.type === 'TRUE_FALSE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <div className="space-y-2">
                  {formData.choices.map((choice, index) => (
                    <label
                      key={index}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={choice.isCorrect}
                        onChange={() => {
                          const newChoices = formData.choices.map((c, idx) => ({
                            ...c,
                            isCorrect: idx === index,
                          }));
                          setFormData({ ...formData, choices: newChoices });
                        }}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-3 text-gray-700">{choice.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href={`/admin/${question.quizId}`} className="flex-1">
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
    </div>
  );
}

