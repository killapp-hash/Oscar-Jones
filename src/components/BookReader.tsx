import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sun,
  Moon,
  BookOpen,
  Volume2,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import { CHAPTERS, getChapterParagraphs, type Chapter, type StoryMode } from '../data/chapters';
import { NztaSignHeader } from './NztaSignHeader';
import { ResilientImage } from './ResilientImage';

export type PaperTheme = 'archival' | 'sepia' | 'night';
export type FontScale = 'sm' | 'md' | 'lg';

interface BookReaderProps {
  chapter: Chapter;
  readChapters: number[];
  paperTheme: PaperTheme;
  fontScale: FontScale;
  storyMode: StoryMode;
  showImages: boolean;
  onChangePaperTheme: (theme: PaperTheme) => void;
  onChangeFontScale: (scale: FontScale) => void;
  onSelectChapter: (chapterNum: number) => void;
  onToggleRead: (chapterNum: number) => void;
  onOpenContents: () => void;
}

const FONT_SIZE_CLASSES: Record<FontScale, string> = {
  sm: 'text-[16px] leading-[1.78]',
  md: 'text-[18px] leading-[1.82]',
  lg: 'text-[20px] leading-[1.85]',
};

const PAPER_SURFACE: Record<PaperTheme, string> = {
  archival: 'bg-[#FBF9F5] text-[#1C1917]',
  sepia: 'bg-[#F4ECD8] text-[#2B2218]',
  night: 'bg-[#141413] text-[#EAE6DF]',
};

export function BookReader({
  chapter,
  readChapters,
  paperTheme,
  fontScale,
  storyMode,
  showImages,
  onChangePaperTheme,
  onChangeFontScale,
  onSelectChapter,
  onToggleRead,
  onOpenContents,
}: BookReaderProps) {
  const isRead = readChapters.includes(chapter.number);
  const prevChapter = CHAPTERS.find((c) => c.number === chapter.number - 1);
  const nextChapter = CHAPTERS.find((c) => c.number === chapter.number + 1);
  const partChapters = CHAPTERS.filter((c) => c.part === chapter.part);
  const progressPct = Math.round((chapter.number / CHAPTERS.length) * 100);
  const activeParagraphs = getChapterParagraphs(chapter, storyMode);

  const speechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [spokenIndex, setSpokenIndex] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [, setVoicesLoaded] = useState<number>(0);
  const sessionRef = useRef<number>(0);

  useEffect(() => {
    if (!speechSupported) return;
    const handleVoicesChanged = () => setVoicesLoaded((n) => n + 1);
    window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
    };
  }, [speechSupported]);

  const pickBritishVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!speechSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const britishVoices = voices.filter((v) => {
      const lang = v.lang.replace('_', '-').toLowerCase();
      return lang.startsWith('en-gb') || /uk english|british/i.test(v.name);
    });

    if (britishVoices.length > 0) {
      return (
        britishVoices.find((v) => /natural|google|daniel|libby|sonia|ryan|kate|oliver|george|hazel|serena/i.test(v.name)) ??
        britishVoices[0]
      );
    }

    const fallbackLangs = ['en-nz', 'en-au', 'en'];
    for (const lang of fallbackLangs) {
      const match = voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
      if (match) return match;
    }
    return null;
  }, [speechSupported]);

  const stopSpeech = useCallback(() => {
    sessionRef.current += 1;
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeechStatus('idle');
    setSpokenIndex(null);
  }, [speechSupported]);

  const speakQueueFrom = useCallback(
    (startIndex: number, rate: number) => {
      if (!speechSupported) return;
      const items = [
        `Chapter ${chapter.number}. ${chapter.title}.`,
        ...activeParagraphs,
      ];
      // Map item 0 -> spokenIndex -1 (heading), item i+1 -> spokenIndex i
      const safeStart = Math.max(0, Math.min(startIndex, items.length - 1));
      const sessionId = ++sessionRef.current;

      window.speechSynthesis.cancel();
      setSpeechStatus('playing');

      const voice = pickBritishVoice();

      const speakItem = (queueIdx: number) => {
        if (sessionRef.current !== sessionId) return;
        if (queueIdx >= items.length) {
          setSpeechStatus('idle');
          setSpokenIndex(null);
          return;
        }

        setSpokenIndex(queueIdx - 1);
        const utterance = new SpeechSynthesisUtterance(items[queueIdx]);
        utterance.rate = rate;
        utterance.lang = voice?.lang || 'en-GB';
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          if (sessionRef.current !== sessionId) return;
          speakItem(queueIdx + 1);
        };

        utterance.onerror = () => {
          if (sessionRef.current !== sessionId) return;
          setSpeechStatus('idle');
          setSpokenIndex(null);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakItem(safeStart);
    },
    [speechSupported, chapter.number, chapter.title, activeParagraphs, pickBritishVoice],
  );

  const handleTogglePlayPause = () => {
    if (!speechSupported) return;
    if (speechStatus === 'playing') {
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
      setSpeechStatus('paused');
    } else if (speechStatus === 'paused') {
      const resumeQueueIndex = spokenIndex !== null ? spokenIndex + 1 : 0;
      speakQueueFrom(resumeQueueIndex, speechRate);
    } else {
      speakQueueFrom(0, speechRate);
    }
  };

  const handleChangeRate = (nextRate: number) => {
    setSpeechRate(nextRate);
    if (speechStatus === 'playing') {
      const currentQueueIndex = spokenIndex !== null ? spokenIndex + 1 : 0;
      speakQueueFrom(currentQueueIndex, nextRate);
    }
  };

  // Stop audio when changing chapters, story mode, or leaving the reader
  useEffect(() => {
    stopSpeech();
    return () => {
      sessionRef.current += 1;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [chapter.number, storyMode, stopSpeech]);

  return (
    <div className={`${PAPER_SURFACE[paperTheme]} transition-colors duration-200 min-h-[calc(100vh-4.5rem)]`}>
      {/* Thin editorial reading progress hairline */}
      <div className="w-full h-0.5 bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full bg-[#00583A] dark:bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Reader Utility Ribbon (below top bar, never cluttering the header) */}
      <div className="border-b border-stone-200/80 dark:border-stone-800 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <label htmlFor="chapter-select" className="sr-only">
              Select Chapter
            </label>
            <select
              id="chapter-select"
              value={chapter.number}
              onChange={(e) => onSelectChapter(Number(e.target.value))}
              className="font-display text-xs sm:text-sm font-semibold bg-white/80 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-md px-3 py-2 text-stone-900 dark:text-stone-100 max-w-[260px] sm:max-w-xs truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00583A]"
            >
              {CHAPTERS.map((ch) => (
                <option key={ch.number} value={ch.number}>
                  Ch. {String(ch.number).padStart(2, '0')} — {ch.title}
                </option>
              ))}
            </select>

            <span className="hidden md:inline font-display text-xs text-stone-500 dark:text-stone-400 tabular-nums whitespace-nowrap">
              {chapter.readingTimeMinutes} min read · {chapter.part}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {speechSupported && (
              <div
                className="flex items-center gap-1 p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-md"
                role="group"
                aria-label="Chapter read aloud"
              >
                <button
                  type="button"
                  onClick={handleTogglePlayPause}
                  aria-label={
                    speechStatus === 'playing'
                      ? 'Pause reading chapter aloud'
                      : speechStatus === 'paused'
                        ? 'Resume reading chapter aloud'
                        : 'Read chapter aloud'
                  }
                  className={`px-2.5 py-1.5 text-xs font-display font-semibold rounded inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    speechStatus === 'playing'
                      ? 'bg-[#00583A] text-white shadow-xs'
                      : speechStatus === 'paused'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs hover:bg-stone-50 dark:hover:bg-stone-600'
                  }`}
                >
                  {speechStatus === 'playing' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : speechStatus === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#00583A] dark:text-emerald-400" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>

                <select
                  aria-label="Reading speed"
                  value={speechRate}
                  onChange={(e) => handleChangeRate(Number(e.target.value))}
                  className="px-2 py-1.5 text-xs font-display font-semibold rounded bg-transparent text-stone-700 dark:text-stone-200 hover:bg-white/70 dark:hover:bg-stone-700 transition-colors tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00583A] cursor-pointer"
                >
                  {[1.15, 1, 0.9, 0.75, 0.5].map((rate) => (
                    <option
                      key={rate}
                      value={rate}
                      className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    >
                      {rate}x
                    </option>
                  ))}
                </select>

                {speechStatus !== 'idle' && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    aria-label="Stop reading aloud"
                    title="Stop"
                    className="p-1.5 rounded text-stone-700 dark:text-stone-200 hover:bg-white/70 dark:hover:bg-stone-700 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>
            )}

            {/* Segmented Text Size */}
            <div
              className="flex items-center gap-0.5 p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-md"
              role="group"
              aria-label="Text size"
            >
              {(['sm', 'md', 'lg'] as FontScale[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangeFontScale(size)}
                  className={`px-2.5 py-1.5 text-xs font-display font-semibold rounded transition-colors whitespace-nowrap ${
                    fontScale === size
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {size === 'sm' ? 'A-' : size === 'md' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            {/* Segmented Paper Mode */}
            <div
              className="flex items-center gap-0.5 p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-md"
              role="group"
              aria-label="Reading paper theme"
            >
              <button
                type="button"
                onClick={() => onChangePaperTheme('archival')}
                className={`px-2.5 py-1.5 text-xs font-display font-semibold rounded inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
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
                className={`px-2.5 py-1.5 text-xs font-display font-semibold rounded inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
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
                className={`px-2.5 py-1.5 text-xs font-display font-semibold rounded inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
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

      {/* Asymmetric 70 / 30 Editorial Reading Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Main Prose Column (70%) */}
          <article className="lg:col-span-8 max-w-2xl w-full mx-auto lg:mx-0">
            <NztaSignHeader chapter={chapter} />

            {/* Chapter Illustration */}
            {showImages && chapter.illustration && (
              <figure className="my-8">
                <div className="bg-[#EBE6DF] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 sm:p-3">
                  <ResilientImage
                    src={chapter.illustration.src}
                    alt={chapter.illustration.alt}
                    fallbackTitle={chapter.title}
                    className={`w-full rounded object-cover ${
                      chapter.illustration.aspect === '3:4'
                        ? 'max-h-[520px] object-top'
                        : 'max-h-[420px]'
                    }`}
                  />
                </div>
                <figcaption className="mt-2.5 text-xs font-serif italic text-stone-500 dark:text-stone-400">
                  {chapter.illustration.caption}
                </figcaption>
              </figure>
            )}

            {/* Chapter Prose in Classic Serif */}
            <div className={`mt-7 space-y-5 font-serif ${FONT_SIZE_CLASSES[fontScale]}`}>
              {activeParagraphs.map((paragraph, idx) => {
                const isFirst = idx === 0;
                const isMidPullQuote =
                  activeParagraphs.length >= 6 && idx === Math.floor(activeParagraphs.length / 2);
                const isBeingSpoken = speechStatus !== 'idle' && spokenIndex === idx;

                return (
                  <div key={`${chapter.number}-p-${idx}`}>
                    <p
                      className={`${isFirst ? 'chapter-drop-cap' : ''} ${
                        isBeingSpoken
                          ? 'bg-[#00583A]/10 dark:bg-emerald-400/10 rounded-md px-3 py-1.5 -mx-3 transition-colors'
                          : ''
                      } text-pretty`}
                    >
                      {paragraph}
                    </p>

                    {isMidPullQuote && (
                      <blockquote className="my-8 py-5 border-y border-stone-300/80 dark:border-stone-700/80 text-center px-4">
                        <p className="font-serif italic text-xl sm:text-2xl leading-snug text-stone-800 dark:text-stone-200">
                          “{chapter.pullQuote.replace(/^[“"]|[”"]$/g, '')}”
                        </p>
                      </blockquote>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chapter Completion & Prev / Next Controls */}
            <div className="mt-12 pt-8 border-t border-stone-300/80 dark:border-stone-800">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => onToggleRead(chapter.number)}
                  className={`px-4 py-2 rounded-md border font-display text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
                    isRead
                      ? 'bg-[#00583A] border-[#00583A] text-white'
                      : 'border-stone-300 dark:border-stone-700 hover:border-stone-500 text-stone-700 dark:text-stone-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isRead ? 'Chapter Completed' : 'Mark Chapter Read'}
                </button>

                <button
                  type="button"
                  onClick={onOpenContents}
                  className="font-display text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline-offset-4 hover:underline whitespace-nowrap"
                >
                  All 20 Chapters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevChapter ? (
                  <button
                    type="button"
                    onClick={() => onSelectChapter(prevChapter.number)}
                    className="text-left p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-[#00583A] dark:hover:border-emerald-500 transition-colors group"
                  >
                    <span className="font-display text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 inline-flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Previous · Ch. {prevChapter.number}
                    </span>
                    <p className="font-display text-base font-bold mt-1 text-stone-900 dark:text-stone-100 group-hover:text-[#00583A] dark:group-hover:text-emerald-400 truncate">
                      {prevChapter.title}
                    </p>
                  </button>
                ) : (
                  <div />
                )}

                {nextChapter ? (
                  <button
                    type="button"
                    onClick={() => onSelectChapter(nextChapter.number)}
                    className="text-left sm:text-right p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-[#00583A] dark:hover:border-emerald-500 transition-colors group"
                  >
                    <span className="font-display text-xs font-semibold uppercase tracking-wider text-[#00583A] dark:text-emerald-400 inline-flex items-center gap-1">
                      Next · Ch. {nextChapter.number}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <p className="font-display text-base font-bold mt-1 text-stone-900 dark:text-stone-100 group-hover:text-[#00583A] dark:group-hover:text-emerald-400 truncate">
                      {nextChapter.title}
                    </p>
                  </button>
                ) : (
                  <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 sm:text-right">
                    <span className="font-display text-xs font-semibold uppercase tracking-wider text-[#00583A] dark:text-emerald-400">
                      The End
                    </span>
                    <p className="font-display text-base font-bold mt-1">
                      Back Safely in Ellery
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Right Margin Notes & Part Directory (30%) */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div className="border-t border-stone-300/80 dark:border-stone-800 pt-5">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 mb-4">
                Reader’s Margin Notes
              </p>
              <dl className="space-y-5">
                {chapter.marginNotes.map((note) => (
                  <div key={note.label} className="pb-4 border-b border-stone-200/80 dark:border-stone-800/80 last:border-b-0 last:pb-0">
                    <dt className="font-display text-xs font-bold uppercase tracking-wider text-[#00583A] dark:text-emerald-400 mb-1">
                      {note.label}
                    </dt>
                    <dd className="font-serif text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                      {note.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border-t border-stone-300/80 dark:border-stone-800 pt-5">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 mb-3">
                {chapter.part}
              </p>
              <ul className="space-y-1.5">
                {partChapters.map((item) => {
                  const active = item.number === chapter.number;
                  const done = readChapters.includes(item.number);
                  return (
                    <li key={item.number}>
                      <button
                        type="button"
                        onClick={() => onSelectChapter(item.number)}
                        className={`w-full text-left px-3 py-2 rounded-md font-display text-sm transition-colors flex items-center justify-between gap-2 ${
                          active
                            ? 'bg-[#00583A] text-white font-semibold'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="truncate">
                          <span className="tabular-nums opacity-75 mr-2">
                            {String(item.number).padStart(2, '0')}.
                          </span>
                          {item.title}
                        </span>
                        {done && !active && (
                          <Check className="w-3.5 h-3.5 text-[#00583A] dark:text-emerald-400 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
