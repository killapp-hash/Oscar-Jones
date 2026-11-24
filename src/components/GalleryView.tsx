import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, Maximize2, Image as ImageIcon } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';
import { ResilientImage } from './ResilientImage';

interface GalleryViewProps {
  showImages: boolean;
  onOpenSettings: () => void;
  onSelectChapter: (chapterNum: number) => void;
}

export function GalleryView({ showImages, onOpenSettings, onSelectChapter }: GalleryViewProps) {
  const illustratedChapters = CHAPTERS.filter((ch) => Boolean(ch.illustration));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % illustratedChapters.length,
        );
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + illustratedChapters.length) % illustratedChapters.length,
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, illustratedChapters.length]);

  const activeItem = activeIndex !== null ? illustratedChapters[activeIndex] : null;

  if (!showImages) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg p-10">
          <ImageIcon className="w-8 h-8 mx-auto mb-3 text-[#00583A] dark:text-emerald-400" strokeWidth={1.5} />
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Illustrations Are Hidden
          </h2>
          <p className="font-serif text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-6">
            You currently have <strong>No Images</strong> enabled. Unlock Settings to turn illustrations back on.
          </p>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-5 py-2.5 rounded-md bg-[#00583A] hover:bg-[#00442D] text-white font-display text-xs font-semibold transition-colors"
          >
            Open Settings
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-8 mb-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-3">
          Illustrated Plates · Archival Catalogue
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 [text-wrap:balance]">
            Storybook Illustrations Gallery
          </h2>
          <p className="font-serif text-sm text-stone-600 dark:text-stone-400 max-w-md">
            Eight storybook scenes and photographs accompanying Oscar’s journey. Click any plate to inspect it at full scale or open its chapter.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {illustratedChapters.map((ch, idx) => {
          const ill = ch.illustration!;
          return (
            <article
              key={ch.number}
              className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 sm:p-5 bg-[#F1EDE5] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 relative group">
                <button
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00583A] rounded overflow-hidden relative"
                  aria-label={`Inspect ${ill.figureNumber}: ${ch.title}`}
                >
                  <ResilientImage
                    src={ill.src}
                    alt={ill.alt}
                    fallbackTitle={ch.title}
                    className="w-full h-72 object-cover rounded transition-transform duration-300 group-hover:scale-[1.015]"
                  />
                  <span className="absolute bottom-3 right-3 bg-stone-900/80 text-white p-2 rounded opacity-90 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </button>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400 tabular-nums mb-2">
                    <span className="text-[#00583A] dark:text-emerald-400">{ill.figureNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Chapter {String(ch.number).padStart(2, '0')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ch.location}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
                    {ch.title}
                  </h3>
                  <p className="font-serif italic text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {ill.caption}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className="font-display text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    Inspect Plate
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectChapter(ch.number)}
                    className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-[#00583A] dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    Read Chapter {ch.number}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeItem && activeItem.illustration && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/88 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.illustration.caption}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="bg-[#FBF9F5] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-stone-800">
              <div className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-stone-600 dark:text-stone-300 tabular-nums">
                {activeItem.illustration.figureNumber} · Chapter {activeItem.number}: {activeItem.title}
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
                aria-label="Close plate viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#EBE6DF] dark:bg-stone-950 p-4 sm:p-6 flex items-center justify-center max-h-[68vh]">
              <ResilientImage
                src={activeItem.illustration.src}
                alt={activeItem.illustration.alt}
                fallbackTitle={activeItem.title}
                className="max-h-[60vh] w-auto object-contain rounded shadow-sm"
              />
            </div>

            <div className="px-5 py-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
              <p className="font-serif italic text-sm text-stone-600 dark:text-stone-300 max-w-xl">
                {activeItem.illustration.caption}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === null
                        ? 0
                        : (prev - 1 + illustratedChapters.length) % illustratedChapters.length,
                    )
                  }
                  className="px-3 py-2 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-display text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === null ? 0 : (prev + 1) % illustratedChapters.length,
                    )
                  }
                  className="px-3 py-2 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-display text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const chNum = activeItem.number;
                    setActiveIndex(null);
                    onSelectChapter(chNum);
                  }}
                  className="px-4 py-2 rounded bg-[#00583A] hover:bg-[#00442D] text-white font-display text-xs font-semibold whitespace-nowrap"
                >
                  Open Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
