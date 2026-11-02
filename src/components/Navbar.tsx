import React from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onReset?: () => void;
  showReset?: boolean;
  activeSection?: 'upload' | 'explanation' | 'quiz';
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  showReset = false,
  activeSection = 'upload',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              EduCore AI
            </span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
              Student Learning Assistant
            </span>
          </div>
        </div>

        {/* Section Navigation indicator (when document is active) */}
        {showReset && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#explanation-section"
              className={`transition-colors hover:text-slate-900 ${
                activeSection === 'explanation' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Explanation
            </a>
            <a
              href="#quiz-section"
              className={`transition-colors hover:text-slate-900 ${
                activeSection === 'quiz' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Quiz Check
            </a>
          </nav>
        )}

        {/* Action Zone */}
        <div className="flex items-center gap-3">
          {showReset ? (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload another PDF</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              <span>PDF Study Companion</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
