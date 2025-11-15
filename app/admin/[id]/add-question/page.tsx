"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import type { QuestionType, Choice } from "@/lib/types";
import Form from "@/components/Form";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Checkbox from "@/components/Checkbox";

interface AddQuestionPageProps {
  params: {
    id: string;
  };
}

export default function AddQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "MCQ_SINGLE" as QuestionType,
    text: "",
    points: 1,
    choices: [] as Choice[],
    correctAnswer: "",
  });
  const params: { id: string } = useParams();
  const id = params.id;

  const questionTypeOptions = [
    { value: "MCQ_SINGLE", label: "Multiple Choice (Single)" },
    { value: "MCQ_MULTI", label: "Multiple Choice (Multiple)" },
    { value: "TRUE_FALSE", label: "True/False" },
    { value: "TEXT", label: "Text Response" },
  ];

  const handleTypeChange = (type: QuestionType) => {
    if (type === "TRUE_FALSE") {
      // Initialize TRUE_FALSE with default choices
      setFormData({
        ...formData,
        type,
        choices: [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: false },
        ],
        correctAnswer: "",
      });
    } else {
      setFormData({
        ...formData,
        type,
        choices:
          type === "MCQ_SINGLE" || type === "MCQ_MULTI" ? formData.choices : [],
        correctAnswer: "",
      });
    }
  };

  const handleAddChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, { text: "", isCorrect: false }],
    });
  };

  const handleChoiceChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
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
      return "Question text is required";
    }

    if (formData.points < 1) {
      return "Points must be at least 1";
    }

    if (formData.type === "MCQ_SINGLE" || formData.type === "MCQ_MULTI") {
      if (formData.choices.length < 2) {
        return "At least 2 choices are required for MCQ questions";
      }

      const hasCorrect = formData.choices.some((c) => c.isCorrect);
      if (!hasCorrect) {
        return "At least one choice must be marked as correct";
      }
    }

    if (formData.type === "TRUE_FALSE") {
      if (formData.choices.length !== 2) {
        return "True/False questions must have exactly 2 choices";
      }
      const hasCorrect = formData.choices.some((c) => c.isCorrect);
      if (!hasCorrect) {
        return "Please select the correct answer";
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

    try {
      setLoading(true);
      const questionData: any = {
        type: formData.type,
        text: formData.text,
        points: formData.points,
      };

      if (formData.type === "MCQ_SINGLE" || formData.type === "MCQ_MULTI") {
        questionData.choices = formData.choices;
        const correctChoices = formData.choices
          .map((c, idx) => (c.isCorrect ? String(idx) : null))
          .filter((c) => c !== null);
        questionData.correctAnswer =
          formData.type === "MCQ_SINGLE" ? correctChoices[0] : correctChoices;
      } else if (formData.type === "TRUE_FALSE") {
        // Convert isCorrect to is_correct for backend
        questionData.choices = formData.choices.map((choice) => ({
          text: choice.text,
          is_correct: choice.isCorrect,
        }));
      }

      await adminApi.createQuestion(params.id, questionData);
      router.push(`/admin/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link href={`/admin/${params.id}`}>
            <Button variant="outline" className="mb-4">
              ← Back to Quiz
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Question
          </h1>
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
                className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  points: parseInt(e.target.value) || 1,
                })
              }
              required
            />

            {(formData.type === "MCQ_SINGLE" ||
              formData.type === "MCQ_MULTI") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Choices
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddChoice}
                  >
                    Add Choice
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.choices.map((choice, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          value={choice.text}
                          onChange={(e) =>
                            handleChoiceChange(index, "text", e.target.value)
                          }
                          placeholder={`Choice ${index + 1}`}
                        />
                      </div>
                      <Checkbox
                        checked={choice.isCorrect || false}
                        onChange={(e) =>
                          handleChoiceChange(
                            index,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                        label="Correct"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleRemoveChoice(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.type === "TRUE_FALSE" && (
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
              <Link href={`/admin/${params.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={loading} className="flex-1">
                Create Question
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
