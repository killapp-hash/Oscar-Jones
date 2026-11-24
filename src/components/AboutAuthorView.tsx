import { BookOpen, List } from 'lucide-react';

interface AboutAuthorViewProps {
  onOpenReader: () => void;
  onOpenContents: () => void;
}

export function AboutAuthorView({
  onOpenReader,
  onOpenContents,
}: AboutAuthorViewProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-8 py-12 lg:py-16">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-8 mb-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-3">
          About the Author · Oscar Jones Series
        </p>
        <div className="bg-[#00583A] text-white rounded-lg p-1.5 max-w-2xl">
          <div className="border border-white/80 rounded-[5px] px-5 py-4 sm:px-6 sm:py-5">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.1]">
              Aaron
            </h1>
            <p className="font-display text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-white/85 mt-2">
              Author of the Oscar Jones Series · Tauranga, New Zealand
            </p>
          </div>
        </div>
      </div>

      <article className="max-w-2xl">
        <div className="space-y-5 font-serif text-[18px] leading-[1.82] text-stone-800 dark:text-stone-200">
          <p className="chapter-drop-cap text-pretty">
            Aaron is an author of the “Oscar Jones” series. He currently lives in Tauranga, New Zealand.
          </p>
          <p className="text-pretty">
            He has made the Oscar Jones series based on the book “Harry Potter.” Right now he is planning to continue the Oscar Jones series and make book 2.
          </p>
        </div>
      </article>

      <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-3">
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
    </section>
  );
}
