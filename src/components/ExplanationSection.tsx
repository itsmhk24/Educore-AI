import React, { useState } from 'react';
import { ExplanationData } from '../types';
import { BookOpen, CheckCircle, FileText, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface ExplanationSectionProps {
  explanation: ExplanationData;
  fileName: string;
  totalPageCount: number;
  processedPageCount: number;
  isTruncated: boolean;
  extractedText?: string;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  explanation,
  fileName,
  totalPageCount,
  processedPageCount,
  isTruncated,
  extractedText,
}) => {
  const [showRawText, setShowRawText] = useState(false);

  // Split summary into natural readable paragraphs if multiple
  const summaryParagraphs = explanation.summary
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <section id="explanation-section" className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Document Context Card */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Source Document</span>
              <span aria-hidden="true">·</span>
              <span>{processedPageCount} {processedPageCount === 1 ? 'page' : 'pages'} analyzed</span>
              {totalPageCount > processedPageCount && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-600 font-medium">{totalPageCount} pages total</span>
                </>
              )}
            </div>
            <h2 className="text-sm font-semibold text-slate-900 truncate max-w-md">
              {fileName}
            </h2>
          </div>
        </div>

        {extractedText && (
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{showRawText ? 'Hide extracted text' : 'View extracted text'}</span>
            {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Truncation Notice */}
      {isTruncated && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Document truncated to first 20 pages</p>
            <p className="text-amber-800 mt-0.5">
              To keep performance snappy and within student study limits, only the first 20 of your document's {totalPageCount} pages were processed. The explanation and quiz focus on this section.
            </p>
          </div>
        </div>
      )}

      {/* Collapsible Extracted Raw Text */}
      {showRawText && extractedText && (
        <div className="mb-8 p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
            <span>Raw text extracted in-browser via PDF.js</span>
            <span>{extractedText.length.toLocaleString()} characters</span>
          </div>
          {extractedText}
        </div>
      )}

      {/* Main Explanation Presentation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        {/* Section Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Plain-Language Explanation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            {explanation.title}
          </h1>
        </div>

        {/* Core Summary Paragraphs */}
        <div className="space-y-4 mb-10 text-slate-700 text-base sm:text-lg leading-relaxed">
          {summaryParagraphs.map((paragraph, idx) => (
            <p key={idx} className="text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Key Takeaways Checklist */}
        {explanation.keyPoints && explanation.keyPoints.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Key Takeaways
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {explanation.keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5 transition-colors hover:bg-slate-50"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
