import { useState, type FormEvent } from 'react';
import {
  Image as ImageIcon,
  FileText,
  RotateCcw,
  BookOpen,
  Sun,
  Moon,
  Map as MapIcon,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { StoryMode } from '../data/chapters';
import type { FontScale, PaperTheme } from './BookReader';

const SETTINGS_PASSWORD = '255555';

interface SettingsViewProps {
  isUnlocked: boolean;
  showImages: boolean;
  storyMode: StoryMode;
  paperTheme: PaperTheme;
  fontScale: FontScale;
  onUnlock: () => void;
  onLock: () => void;
  onChangeShowImages: (show: boolean) => void;
  onChangeStoryMode: (mode: StoryMode) => void;
  onChangePaperTheme: (theme: PaperTheme) => void;
  onChangeFontScale: (scale: FontScale) => void;
  onResetDefaults: () => void;
  onOpenReader: () => void;
  onOpenRouteMap: () => void;
}

export function SettingsView({
  isUnlocked,
  showImages,
  storyMode,
  paperTheme,
  fontScale,
  onUnlock,
  onLock,
  onChangeShowImages,
  onChangeStoryMode,
  onChangePaperTheme,
  onChangeFontScale,
  onResetDefaults,
  onOpenReader,
  onOpenRouteMap,
}: SettingsViewProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isDefault = showImages === true && storyMode === 'original';

  const handleUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === SETTINGS_PASSWORD) {
      setErrorMsg(null);
      setPasswordInput('');
      onUnlock();
    } else {
      setErrorMsg('Incorrect password. Please try again.');
    }
  };

  if (!isUnlocked) {
    return (
      <section className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="bg-white dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-lg p-7 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 text-[#00583A] dark:text-emerald-400 mb-3">
            <Lock className="w-4 h-4 shrink-0" />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.16em]">
              Protected Preferences
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
            Settings Locked
          </h2>
          <p className="font-serif text-sm leading-relaxed text-stone-600 dark:text-stone-400 mb-6">
            Enter the password to access Book Settings, story edition controls, and illustration preferences.
          </p>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="settings-password"
                className="block font-display text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="settings-password"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-[#FBF9F5] dark:bg-stone-950 px-3.5 py-2.5 pr-10 font-display text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00583A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <p role="alert" className="mt-2 font-display text-xs font-semibold text-red-600 dark:text-red-400">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-5 py-2.5 rounded-md bg-[#00583A] hover:bg-[#00442D] text-white font-display text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Unlock Settings
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 text-center">
            <button
              type="button"
              onClick={onOpenReader}
              className="font-display text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-[#00583A] dark:hover:text-emerald-400 transition-colors"
            >
              Return to Reader
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-8 mb-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-3">
          Reading Preferences &amp; PDF Options
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Book Settings
          </h2>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 dark:border-stone-700 hover:border-stone-500 font-display text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Settings
            </button>
            <button
              type="button"
              onClick={onResetDefaults}
              disabled={isDefault}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-stone-300 dark:border-stone-700 hover:border-stone-500 disabled:opacity-45 font-display text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Setting 1: Story Version (Original Story / Edited Story) */}
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg p-6 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-[#00583A] dark:text-emerald-400">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em]">
                  Story Edition
                </span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Original Story or Edited Story
              </h3>
              <p className="font-serif text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Choose between the <strong>Original Story</strong> (default, preserving Chapters 1–12 word-for-word as written) or the <strong>Edited Story</strong> (revised New Zealand English grammar and punctuation). Both editions include Chapters 13–20 and apply to the PDF export.
              </p>
            </div>

            <div
              className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg shrink-0 self-start"
              role="group"
              aria-label="Story edition"
            >
              <button
                type="button"
                onClick={() => onChangeStoryMode('original')}
                className={`px-4 py-2 text-xs font-display font-semibold rounded-md transition-colors whitespace-nowrap ${
                  storyMode === 'original'
                    ? 'bg-[#00583A] text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Original Story
              </button>
              <button
                type="button"
                onClick={() => onChangeStoryMode('edited')}
                className={`px-4 py-2 text-xs font-display font-semibold rounded-md transition-colors whitespace-nowrap ${
                  storyMode === 'edited'
                    ? 'bg-[#00583A] text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Edited Story
              </button>
            </div>
          </div>
        </div>

        {/* Setting 2: Illustrations (Images / No Images) */}
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg p-6 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-[#00583A] dark:text-emerald-400">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em]">
                  Illustrations
                </span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Images or No Images
              </h3>
              <p className="font-serif text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Show all eight chapter illustrations (default) across the Cover, Reader, Plate Gallery, and generated PDF—or switch to <strong>No Images</strong> for a clean, text-only novel layout.
              </p>
            </div>

            <div
              className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg shrink-0 self-start"
              role="group"
              aria-label="Illustrations display"
            >
              <button
                type="button"
                onClick={() => onChangeShowImages(true)}
                className={`px-4 py-2 text-xs font-display font-semibold rounded-md transition-colors whitespace-nowrap ${
                  showImages
                    ? 'bg-[#00583A] text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => onChangeShowImages(false)}
                className={`px-4 py-2 text-xs font-display font-semibold rounded-md transition-colors whitespace-nowrap ${
                  !showImages
                    ? 'bg-[#00583A] text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                No Images
              </button>
            </div>
          </div>
        </div>

        {/* Setting 3: Typography & Paper Appearance */}
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg p-6 sm:p-7 space-y-6">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 mb-1">
              Reader Comfort
            </p>
            <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Text Size &amp; Paper Surface
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-200/80 dark:border-stone-800">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                Prose Size (Classic Serif)
              </p>
              <div className="inline-flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg">
                {(
                  [
                    ['sm', 'Small'],
                    ['md', 'Medium'],
                    ['lg', 'Large'],
                  ] as [FontScale, string][]
                ).map(([scale, label]) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => onChangeFontScale(scale)}
                    className={`px-3.5 py-2 text-xs font-display font-semibold rounded-md transition-colors whitespace-nowrap ${
                      fontScale === scale
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                Paper Theme
              </p>
              <div className="inline-flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => onChangePaperTheme('archival')}
                  className={`px-3 py-2 text-xs font-display font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    paperTheme === 'archival'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Paper
                </button>
                <button
                  type="button"
                  onClick={() => onChangePaperTheme('sepia')}
                  className={`px-3 py-2 text-xs font-display font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    paperTheme === 'sepia'
                      ? 'bg-[#F4ECD8] text-stone-900 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Warm
                </button>
                <button
                  type="button"
                  onClick={() => onChangePaperTheme('night')}
                  className={`px-3 py-2 text-xs font-display font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    paperTheme === 'night'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Night
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onOpenRouteMap}
          className="inline-flex items-center gap-2 font-display text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[#00583A] dark:hover:text-emerald-400 transition-colors"
        >
          <MapIcon className="w-4 h-4" />
          Open Journey Route Map
        </button>

        <button
          type="button"
          onClick={onOpenReader}
          className="px-5 py-2.5 rounded-md bg-[#00583A] hover:bg-[#00442D] text-white font-display text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4" />
          Return to Reader
        </button>
      </div>
    </section>
  );
}
