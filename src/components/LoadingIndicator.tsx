import React from 'react';
import { Loader2, FileText, Sparkles } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
  stage?: 'extracting' | 'generating';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Reading your document...',
  subMessage = 'Extracting text and organizing key concepts',
  stage = 'extracting',
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      <div className="relative inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-indigo-50 text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          {stage === 'extracting' ? (
            <FileText className="w-4 h-4 text-indigo-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-500" />
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{message}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{subMessage}</p>

      {/* Progress pill / bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
        <div
          className={`h-full bg-indigo-600 rounded-full transition-all duration-700 ${
            stage === 'extracting' ? 'w-2/5 animate-pulse' : 'w-4/5 animate-pulse'
          }`}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <span>Processing in browser</span>
        <span aria-hidden="true">·</span>
        <span>Using Gemini AI</span>
      </div>
    </div>
  );
};
