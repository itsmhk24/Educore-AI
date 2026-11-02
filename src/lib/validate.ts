import type { QuizQuestion, StudyPack } from '@/types';

export class StudyPackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudyPackValidationError';
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeKeyPoints(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isNonEmptyString).map((point) => point.trim());
}

function normalizeQuiz(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new StudyPackValidationError('The generated quiz was empty.');
  }

  return raw.map((item, index) => {
    const candidate = (item ?? {}) as Partial<QuizQuestion>;

    if (!isNonEmptyString(candidate.question)) {
      throw new StudyPackValidationError(`Question ${index + 1} is missing its text.`);
    }

    if (!Array.isArray(candidate.options) || candidate.options.length !== 4) {
      throw new StudyPackValidationError(`Question ${index + 1} does not have exactly 4 options.`);
    }

    if (!candidate.options.every(isNonEmptyString)) {
      throw new StudyPackValidationError(`Question ${index + 1} has an empty option.`);
    }

    if (!isNonEmptyString(candidate.correctAnswer)) {
      throw new StudyPackValidationError(`Question ${index + 1} is missing the correct answer.`);
    }

    const options = candidate.options.map((option) => option.trim());
    const expected = candidate.correctAnswer.trim().toLowerCase();
    const matchedAnswer = options.find((option) => option.toLowerCase() === expected);

    if (!matchedAnswer) {
      throw new StudyPackValidationError(
        `Question ${index + 1} has a correct answer that is not one of its options.`,
      );
    }

    return {
      question: candidate.question.trim(),
      options,
      correctAnswer: matchedAnswer,
      explanation: isNonEmptyString(candidate.explanation) ? candidate.explanation.trim() : '',
    };
  });
}

/**
 * Runtime guard for the model output. The response schema already constrains
 * Gemini, but this makes sure a malformed payload can never reach the UI.
 */
export function validateStudyPack(raw: unknown): StudyPack {
  if (!raw || typeof raw !== 'object') {
    throw new StudyPackValidationError('The model response was not an object.');
  }

  const candidate = raw as Partial<StudyPack>;

  if (!isNonEmptyString(candidate.summary)) {
    throw new StudyPackValidationError('The model response is missing a summary.');
  }

  return {
    title: isNonEmptyString(candidate.title) ? candidate.title.trim() : 'Study Guide & Concept Summary',
    summary: candidate.summary.trim(),
    keyPoints: normalizeKeyPoints(candidate.keyPoints),
    quiz: normalizeQuiz(candidate.quiz),
  };
}
