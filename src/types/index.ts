export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ExplanationData {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface StudyPack {
  title: string;
  summary: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export interface EduCoreResult {
  explanation: ExplanationData;
  quiz: QuizQuestion[];
  fileName: string;
  totalPageCount: number;
  processedPageCount: number;
  isTruncated: boolean;
  extractedText: string;
}

export interface UserAnswerRecord {
  selectedOption: string;
  isCorrect: boolean;
  hasAnswered: boolean;
}

export type ProcessingStage = 'idle' | 'extracting' | 'generating' | 'ready' | 'error';
