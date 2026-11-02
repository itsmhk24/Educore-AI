'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { UploadSection } from './UploadSection';
import { ExplanationSection } from './ExplanationSection';
import { QuizSection } from './QuizSection';
import { LoadingIndicator } from './LoadingIndicator';
import { extractTextFromPdf } from '@/lib/pdf';
import type { ExtractedPdfResult } from '@/lib/pdf';
import type { EduCoreResult, ProcessingStage, QuizQuestion, StudyPack } from '@/types';
import type { SampleNote } from '@/data/sampleNotes';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * Light client-side guard so a malformed payload can never break the quiz UI.
 * Mirrors the stricter validation done in the API route.
 */
function isValidQuiz(quiz: unknown): quiz is QuizQuestion[] {
  if (!Array.isArray(quiz) || quiz.length === 0) return false;

  return quiz.every((question) => {
    if (!question || typeof question !== 'object') return false;

    const item = question as QuizQuestion;
    const expected = typeof item.correctAnswer === 'string' ? item.correctAnswer.trim().toLowerCase() : '';

    return (
      typeof item.question === 'string' &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every((option) => typeof option === 'string') &&
      expected.length > 0 &&
      item.options.some((option) => option.trim().toLowerCase() === expected) &&
      typeof item.explanation === 'string'
    );
  });
}

export function StudyWorkspace() {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [lastExtracted, setLastExtracted] = useState<ExtractedPdfResult | null>(null);
  const [result, setResult] = useState<EduCoreResult | null>(null);

  /**
   * Sends extracted text to the server-side Gemini API
   */
  const requestExplanationAndQuiz = async (extracted: ExtractedPdfResult): Promise<void> => {
    setStage('generating');
    setErrorMessage(null);
    setCanRetry(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: extracted.text,
          fileName: extracted.fileName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || GENERIC_ERROR);
      }

      const resData = await response.json();
      const generatedData = resData?.data as Partial<StudyPack> | undefined;

      if (!resData?.success || !generatedData) {
        throw new Error(GENERIC_ERROR);
      }

      if (typeof generatedData.summary !== 'string' || !isValidQuiz(generatedData.quiz)) {
        throw new Error(GENERIC_ERROR);
      }

      setResult({
        explanation: {
          title: generatedData.title || 'Study Guide & Concept Summary',
          summary: generatedData.summary,
          keyPoints: Array.isArray(generatedData.keyPoints) ? generatedData.keyPoints : [],
        },
        quiz: generatedData.quiz,
        fileName: extracted.fileName,
        totalPageCount: extracted.totalPageCount,
        processedPageCount: extracted.processedPageCount,
        isTruncated: extracted.isTruncated,
        extractedText: extracted.text,
      });

      setStage('ready');
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(err?.message || GENERIC_ERROR);
      setCanRetry(true);
      setStage('error');
    }
  };

  /**
   * Handles user uploading a PDF file
   */
  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setCanRetry(false);
    setResult(null);
    setStage('extracting');

    try {
      const extracted = await extractTextFromPdf(file);
      setLastExtracted(extracted);
      await requestExplanationAndQuiz(extracted);
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      const msg = err?.message || "We couldn't read this file.";
      setErrorMessage(msg);
      // If it's a PDF reading error, allow user to pick another file; not AI retry
      setCanRetry(false);
      setStage('error');
    }
  };

  /**
   * Handles 1-click sample note selection by fetching the actual PDF binary
   * and extracting text in browser through the exact same PDF extraction pipeline
   */
  const handleSampleSelect = async (sample: SampleNote) => {
    setErrorMessage(null);
    setCanRetry(false);
    setResult(null);
    setStage('extracting');

    try {
      const response = await fetch(sample.pdfPath);
      if (!response.ok) {
        throw new Error("We couldn't read this file.");
      }
      const blob = await response.blob();
      const file = new File([blob], sample.fileName, { type: 'application/pdf' });
      const extracted = await extractTextFromPdf(file);
      setLastExtracted(extracted);
      await requestExplanationAndQuiz(extracted);
    } catch (err: any) {
      console.error('Sample PDF processing failed:', err);
      const msg = err?.message || "We couldn't read this file.";
      setErrorMessage(msg);
      setCanRetry(false);
      setStage('error');
    }
  };

  /**
   * Retries AI generation with the last successfully extracted text
   */
  const handleRetry = () => {
    if (lastExtracted) {
      requestExplanationAndQuiz(lastExtracted);
    }
  };

  /**
   * Completely resets app to clean initial upload state
   */
  const handleResetApp = () => {
    setStage('idle');
    setErrorMessage(null);
    setCanRetry(false);
    setLastExtracted(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Top Bar */}
      <Navbar
        showReset={stage === 'ready' || stage === 'generating' || stage === 'extracting'}
        onReset={handleResetApp}
        activeSection={result ? 'explanation' : 'upload'}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* State: Idle or Error on initial upload */}
        {(stage === 'idle' || (stage === 'error' && !result)) && (
          <UploadSection
            onFileSelect={handleFileSelect}
            onSampleSelect={handleSampleSelect}
            isLoading={false}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            canRetry={canRetry}
          />
        )}

        {/* State: Extracting text from PDF */}
        {stage === 'extracting' && (
          <LoadingIndicator
            stage="extracting"
            message="Reading your document..."
            subMessage="Extracting text layers and analyzing page structure"
          />
        )}

        {/* State: Generating with Gemini API */}
        {stage === 'generating' && (
          <LoadingIndicator
            stage="generating"
            message="Generating plain-language explanation..."
            subMessage="Synthesizing key points and preparing comprehension quiz"
          />
        )}

        {/* State: Ready (Showing Results) */}
        {stage === 'ready' && result && (
          <div className="space-y-4">
            {/* Section 2: Explanation */}
            <ExplanationSection
              explanation={result.explanation}
              fileName={result.fileName}
              totalPageCount={result.totalPageCount}
              processedPageCount={result.processedPageCount}
              isTruncated={result.isTruncated}
              extractedText={result.extractedText}
            />

            {/* Section 3: Quiz */}
            <QuizSection quiz={result.quiz} onResetApp={handleResetApp} />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">EduCore AI</span>
            <span aria-hidden="true">·</span>
            <span>AI Learning Assistant for Students</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Client-side PDF Extraction</span>
            <span aria-hidden="true">·</span>
            <span>Grounded in Uploaded Content Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
