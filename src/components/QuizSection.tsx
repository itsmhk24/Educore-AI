import React, { useState } from 'react';
import { QuizQuestion, UserAnswerRecord } from '../types';
import { HelpCircle, Check, X, RotateCcw, Award, ArrowUp, RefreshCw } from 'lucide-react';

interface QuizSectionProps {
  quiz: QuizQuestion[];
  onResetApp: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onResetApp }) => {
  // Store user answers keyed by question index
  const [answers, setAnswers] = useState<Record<number, UserAnswerRecord>>({});

  const handleSelectOption = (questionIndex: number, optionText: string) => {
    // Prevent changing answer if already answered
    if (answers[questionIndex]?.hasAnswered) return;

    const question = quiz[questionIndex];
    // Trim and normalize comparison
    const isCorrect = optionText.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        selectedOption: optionText,
        isCorrect,
        hasAnswered: true,
      },
    }));
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    const quizEl = document.getElementById('quiz-section');
    if (quizEl) {
      quizEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.length;
  const isComplete = answeredCount === totalQuestions && totalQuestions > 0;

  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const optionLetters = ['A', 'B', 'C', 'D'];

  const getScoreMessage = (percent: number) => {
    if (percent === 100) {
      return {
        title: 'Perfect score! Outstanding mastery.',
        desc: 'You demonstrated complete understanding of the core concepts in this document.',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }
    if (percent >= 70) {
      return {
        title: 'Great job! Strong comprehension.',
        desc: 'You grasped the vast majority of the key ideas. Review the explanations above to refine your knowledge.',
        color: 'text-indigo-900 bg-indigo-50 border-indigo-200',
      };
    }
    return {
      title: 'Good effort! Learning takes practice.',
      desc: 'Review the plain-language explanation and key takeaways above, then give the quiz another go.',
      color: 'text-amber-900 bg-amber-50 border-amber-200',
    };
  };

  const scoreMessage = getScoreMessage(scorePercent);

  return (
    <section id="quiz-section" className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Comprehension Check</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Practice Quiz
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Test your understanding with {totalQuestions} questions generated exclusively from your notes.
          </p>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right text-xs text-slate-500">
            <span className="block font-medium text-slate-900 text-sm tabular-nums">
              {answeredCount} / {totalQuestions} answered
            </span>
            <span>{totalQuestions - answeredCount} remaining</span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {quiz.map((q, qIndex) => {
          const answerState = answers[qIndex];
          const hasAnswered = Boolean(answerState?.hasAnswered);

          return (
            <div
              key={qIndex}
              className={`bg-white rounded-2xl border transition-all p-6 sm:p-8 shadow-xs ${
                hasAnswered
                  ? answerState?.isCorrect
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Question Meta */}
              <div className="flex items-center justify-between gap-4 mb-3 text-xs text-slate-500">
                <span className="font-semibold text-indigo-600 uppercase tracking-wider">
                  Question {qIndex + 1} of {totalQuestions}
                </span>

                {hasAnswered && (
                  <span
                    className={`inline-flex items-center gap-1 font-semibold text-xs ${
                      answerState?.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {answerState?.isCorrect ? (
                      <>
                        <Check className="w-4 h-4" /> Correct
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" /> Incorrect
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-5 leading-snug">
                {q.question}
              </h3>

              {/* 4 Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {q.options.map((option, optIndex) => {
                  const isSelected = answerState?.selectedOption === option;
                  const isCorrectChoice =
                    option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  let buttonStyles =
                    'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300';
                  let letterStyles = 'bg-slate-100 text-slate-600';

                  if (hasAnswered) {
                    if (isSelected) {
                      if (answerState?.isCorrect) {
                        buttonStyles = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-400';
                        letterStyles = 'bg-emerald-600 text-white';
                      } else {
                        buttonStyles = 'border-rose-500 bg-rose-50/80 text-rose-950 font-medium ring-1 ring-rose-400';
                        letterStyles = 'bg-rose-600 text-white';
                      }
                    } else if (isCorrectChoice) {
                      // Highlight the true answer if user was wrong
                      buttonStyles = 'border-emerald-300 bg-emerald-50/50 text-emerald-900';
                      letterStyles = 'bg-emerald-200 text-emerald-800';
                    } else {
                      buttonStyles = 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-60';
                      letterStyles = 'bg-slate-100 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(qIndex, option)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${buttonStyles} ${
                        !hasAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 ${letterStyles}`}
                        >
                          {optionLetters[optIndex] || optIndex + 1}
                        </span>
                        <span className="text-sm sm:text-base leading-snug">{option}</span>
                      </div>

                      {hasAnswered && isSelected && (
                        <div className="shrink-0 ml-2">
                          {answerState?.isCorrect ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                              <X className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* One-Line Explanation (Shown upon answering) */}
              {hasAnswered && (
                <div
                  className={`mt-4 p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                    answerState?.isCorrect
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="font-semibold block mb-0.5 text-slate-900">
                    {answerState?.isCorrect ? 'Why this is right:' : 'Explanation:'}
                  </span>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Score Card (Shown when all questions answered) */}
      {isComplete && (
        <div className={`mt-8 p-6 sm:p-8 rounded-2xl border ${scoreMessage.color} shadow-xs`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 text-amber-500">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                    {correctCount} / {totalQuestions}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    ({scorePercent}% Score)
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{scoreMessage.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
                  {scoreMessage.desc}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleRetakeQuiz}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={onResetApp}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating back to top helper when deep in quiz */}
      {totalQuestions > 2 && (
        <div className="mt-8 text-center">
          <a
            href="#explanation-section"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Explanation</span>
          </a>
        </div>
      )}
    </section>
  );
};
