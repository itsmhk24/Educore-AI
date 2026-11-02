import React, { useRef, useState, DragEvent } from 'react';
import { UploadCloud, FileText, AlertCircle, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: SampleNote) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
  canRetry?: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileSelect,
  onSampleSelect,
  isLoading,
  errorMessage,
  onRetry,
  canRetry = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      onFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      onFileSelect(selectedFile);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3 text-balance">
          Turn any study PDF into plain explanations & quizzes
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          Upload your lecture notes, textbook chapters, or reading assignments. EduCore AI distills the material into clear language and tests your recall.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{errorMessage}</p>
              {errorMessage === "We couldn't read this file." && (
                <p className="text-xs text-rose-700 mt-0.5">
                  The document appears empty or is a scanned image without a readable text layer. Try a document with selectable text.
                </p>
              )}
            </div>
          </div>

          {canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Direct Sample Testing PDF Box */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider mb-0.5">
              <span>Ready-To-Test PDF</span>
              <span aria-hidden="true">·</span>
              <span>3 Pages</span>
              <span aria-hidden="true">·</span>
              <span>5.1 KB</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Biology 101: Photosynthesis & Plant Energy
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              A standard 3-page study guide ready for immediate testing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Action 1: Test directly */}
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              try {
                const res = await fetch('/sample_biology_study_guide.pdf');
                const blob = await res.blob();
                const file = new File([blob], 'sample_biology_study_guide.pdf', {
                  type: 'application/pdf',
                });
                onFileSelect(file);
              } catch (e) {
                console.error('Failed to load sample PDF directly:', e);
              }
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <span>Test This PDF Directly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Action 2: Download file */}
          <a
            href="/sample_biology_study_guide.pdf"
            download="sample_biology_study_guide.pdf"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-100/60 border border-indigo-200 rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          {isDragging ? 'Drop your PDF here' : 'Choose a PDF file or drag & drop'}
        </h2>
        <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
          Upload any lecture slides, syllabus, or study guide in PDF format
        </p>

        <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors shadow-xs">
          <FileText className="w-4 h-4 text-indigo-300" />
          <span>Browse PDF File</span>
        </div>

        {/* Requirements footnote */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Max file size: 10 MB</span>
          <span aria-hidden="true">·</span>
          <span>Processes up to first 20 pages</span>
          <span aria-hidden="true">·</span>
          <span>100% in-browser extraction</span>
        </div>
      </div>

      {/* Quick Sample Documents for instant testing */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Or test with a sample study guide
          </span>
          <span className="text-xs text-slate-500">Instant test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelect(sample)}
              disabled={isLoading}
              className="group text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-medium text-indigo-600">{sample.subject}</span>
                  <span>{sample.pageCount} pages</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {sample.title}
                </h3>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-indigo-600">
                <span>Load sample</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Academic Integrity / Privacy reassurance */}
      <div className="mt-8 p-4 rounded-xl bg-slate-100/70 text-slate-600 text-xs flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          EduCore AI extracts knowledge strictly from your uploaded document. It never hallucinates outside facts, does not store your files on external databases, and leaves zero footprint.
        </p>
      </div>
    </section>
  );
};
