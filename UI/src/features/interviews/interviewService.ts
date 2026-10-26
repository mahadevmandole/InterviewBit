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

async function fetchApi(url: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not reach the InterviewBit API at ${url}. Cause: ${cause}`);
  }
}

function getFriendlyErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const candidate = payload as Record<string, unknown>;
  const detail = candidate.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (detailsArePresent(candidate.message)) return candidate.message.trim();
  if (detailsArePresent(candidate.error)) return candidate.error.trim();
  if (Array.isArray(detail) && detail.length > 0) {
    const firstError = detail[0];
    if (typeof firstError === 'string' && firstError.trim()) return firstError.trim();
    if (firstError && typeof firstError === 'object') {
      const nested = firstError as { msg?: string; message?: string };
      const nestedMessage = nested.msg ?? nested.message;
      if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
        return nestedMessage.trim();
      }
    }
  }
  return fallback;
}

function detailsArePresent(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function saveAnswerToSession(
  technologyId: string,
  questionId: number,
  question: string,
  answer: string,
): Promise<{ success: boolean; message?: string }> {
  const token = getToken();
  const response = await fetchApi(`${getApiBaseUrl()}/api/v1/interviews/sessions/${technologyId}/answers`, {
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
    return { success: false, message: getFriendlyErrorMessage(data, 'Unable to save your answer right now.') };
  }

  return { success: true, message: 'Answer saved successfully.' };
}

export type GeneratedQuestion = {
  id: number;
  title: string;
  prompt: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected_keywords?: string[];
};

export async function getGeneratedQuestions(
  technologyId: string,
  experienceLevel: string,
): Promise<GeneratedQuestion[]> {
  const token = getToken();
  const response = await fetchApi(`${getApiBaseUrl()}/api/v1/interviews/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      technology: technologyId,
      experience_level: experienceLevel,
      count: 10,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getFriendlyErrorMessage(data, 'We could not load questions for this interview.'));
  }

  const questions = Array.isArray(data?.questions) ? data.questions : [];
  return questions.map((question: Record<string, unknown>, index: number) => ({
    id: Number(question.id ?? index + 1),
    title: String(question.title ?? `Question ${index + 1}`),
    prompt: String(question.prompt ?? ''),
    topic: String(question.topic ?? String(question.title ?? `Question ${index + 1}`).split(' ')[0]),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(String(question.difficulty))
      ? (String(question.difficulty) as GeneratedQuestion['difficulty'])
      : 'Medium',
    expected_keywords: Array.isArray(question.expected_keywords)
      ? question.expected_keywords.map((keyword) => String(keyword))
      : [],
  }));
}

export async function submitInterview(
  technologyId: string,
  questions: Array<{ id: number; title: string; prompt: string; expected_keywords?: string[] }>,
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
      expected_keywords: question.expected_keywords ?? [],
    })),
  };

  const response = await fetchApi(`${getApiBaseUrl()}/api/v1/interviews/sessions/${technologyId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, message: getFriendlyErrorMessage(data, 'We could not submit this interview.') };
  }

  return {
    success: true,
    message: typeof data?.message === 'string' ? data.message : 'You successfully completed the test.',
  };
}

export async function fetchInterviewSessions(): Promise<Array<Record<string, unknown>>> {
  const token = getToken();
  const response = await fetchApi(`${getApiBaseUrl()}/api/v1/interviews/sessions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getFriendlyErrorMessage(data, 'We could not load your interview history.'));
  }

  return Array.isArray(data?.sessions) ? data.sessions : [];
}

export async function fetchInterviewSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const token = getToken();
  const response = await fetchApi(`${getApiBaseUrl()}/api/v1/interviews/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getFriendlyErrorMessage(data, 'We could not load this interview result.'));
  }

  return data?.session ?? null;
}
