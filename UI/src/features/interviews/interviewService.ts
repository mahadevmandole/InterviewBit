const TOKEN_KEY = 'roundzero.auth.token';

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
}

function getToken(): string {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    ''
  );
}

function getFriendlyErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Unable to save your answer right now.';
  }

  const candidate = payload as Record<string, unknown>;
  const detail = candidate.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (typeof candidate.message === 'string' && candidate.message.trim()) return candidate.message.trim();
  return 'Unable to save your answer right now.';
}

export async function saveAnswerToSession(
  technologyId: string,
  questionId: number,
  question: string,
  answer: string,
): Promise<{ success: boolean; message?: string }> {
  const token = getToken();
  const response = await fetch(`${getApiBaseUrl()}/api/v1/interviews/sessions/${technologyId}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      question_id: questionId,
      question,
      answer,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, message: getFriendlyErrorMessage(data) };
  }

  return { success: true, message: 'Answer saved successfully.' };
}

export async function submitInterview(
  technologyId: string,
  questions: Array<{ id: number; title: string; prompt: string }>,
  answers: Record<number, string>,
): Promise<{ success: boolean; message: string }> {
  const token = getToken();
  const payload = {
    answers: Object.entries(answers)
      .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
      .map(([questionId, answer]) => ({
        question_id: Number(questionId),
        question: questions.find((question) => question.id === Number(questionId))?.title ?? '',
        answer,
      })),
    questions: questions.map((question) => ({
      id: question.id,
      title: question.title,
      prompt: question.prompt,
    })),
  };

  const response = await fetch(`${getApiBaseUrl()}/api/v1/interviews/sessions/${technologyId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, message: getFriendlyErrorMessage(data) };
  }

  return {
    success: true,
    message: typeof data?.message === 'string' ? data.message : 'You successfully completed the test.',
  };
}
