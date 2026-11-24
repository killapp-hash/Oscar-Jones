import { BookOpen, Feather, List, SlidersHorizontal } from 'lucide-react';

export interface AuthorBio {
  name: string;
  subtitle: string;
  body: string;
}

interface AboutAuthorViewProps {
  authorBio: AuthorBio;
  onOpenReader: () => void;
  onOpenContents: () => void;
  onOpenSettings: () => void;
}

export function AboutAuthorView({
  authorBio,
  onOpenReader,
  onOpenContents,
  onOpenSettings,
}: AboutAuthorViewProps) {
  const hasContent =
    authorBio.name.trim().length > 0 ||
    authorBio.subtitle.trim().length > 0 ||
    authorBio.body.trim().length > 0;

  const paragraphs = authorBio.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-8 py-12 lg:py-16">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-8 mb-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-3">
          Author Profile · Oscar Jones
        </p>
        <div className="bg-[#00583A] text-white rounded-lg p-1.5 max-w-2xl">
          <div className="border border-white/80 rounded-[5px] px-5 py-4 sm:px-6 sm:py-5">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.1]">
              {authorBio.name.trim() || 'About the Author'}
            </h1>
            {authorBio.subtitle.trim() && (
              <p className="font-display text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-white/85 mt-2">
                {authorBio.subtitle.trim()}
              </p>
            )}
          </div>
        </div>
      </div>

      {hasContent ? (
        <article className="max-w-2xl">
          {paragraphs.length > 0 ? (
            <div className="space-y-5 font-serif text-[18px] leading-[1.82] text-stone-800 dark:text-stone-200">
              {paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className={`${idx === 0 ? 'chapter-drop-cap' : ''} whitespace-pre-line text-pretty`}
                >
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="font-serif italic text-base text-stone-600 dark:text-stone-400">
              No biography text has been added yet. You can write it inside Settings.
            </p>
          )}
        </article>
      ) : (
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg p-8 sm:p-10 max-w-2xl">
          <Feather className="w-7 h-7 text-[#00583A] dark:text-emerald-400 mb-3" strokeWidth={1.5} />
          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
            Author Page Ready to Write
          </h2>
          <p className="font-serif text-base leading-relaxed text-stone-600 dark:text-stone-400 mb-6">
            The About the Author page hasn’t been written yet. Unlock Settings to compose the author’s name, subtitle, and biography.
          </p>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-5 py-2.5 rounded-md bg-[#00583A] hover:bg-[#00442D] text-white font-display text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Write in Settings
          </button>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenReader}
            className="px-5 py-2.5 rounded-md bg-[#00583A] hover:bg-[#00442D] text-white font-display text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            Open Reader
          </button>
          <button
            type="button"
            onClick={onOpenContents}
            className="px-4 py-2.5 rounded-md border border-stone-300 dark:border-stone-700 hover:border-stone-500 font-display text-xs font-semibold text-stone-700 dark:text-stone-300 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <List className="w-4 h-4" />
            Table of Contents
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-[#00583A] dark:hover:text-emerald-400 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Edit in Settings
        </button>
      </div>
    </section>
  );
}
