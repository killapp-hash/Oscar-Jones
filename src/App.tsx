import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Loader2,
  Map as MapIcon,
  Image as ImageIcon,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { CHAPTERS, COVER_ILLUSTRATION, type StoryMode } from './data/chapters';
import { BookReader, type FontScale, type PaperTheme } from './components/BookReader';
import { RouteMapView } from './components/RouteMapView';
import { GalleryView } from './components/GalleryView';
import { SettingsView } from './components/SettingsView';
import { AboutAuthorView } from './components/AboutAuthorView';
import { ResilientImage } from './components/ResilientImage';
import { generateBookPdf } from './utils/pdfGenerator';

type ActiveView = 'cover' | 'contents' | 'reader' | 'map' | 'gallery' | 'author' | 'settings';

const PARTS = [
  'All Parts',
  'Part I · Ellery & Auckland',
  'Part II · The Lost Bus to Moonspire',
  'Part III · Copperville & Nightbramble',
  'Part IV · The Seven-Day Return',
] as const;

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('cover');
  const [currentChapterNum, setCurrentChapterNum] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ellery_current_chapter');
      const parsed = saved ? Number(saved) : 1;
      return parsed >= 1 && parsed <= 20 ? parsed : 1;
    } catch {
      return 1;
    }
  });

  const [readChapters, setReadChapters] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('ellery_read_chapters');
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });

  const [paperTheme, setPaperTheme] = useState<PaperTheme>(() => {
    try {
      const saved = localStorage.getItem('ellery_paper_theme');
      return saved === 'sepia' || saved === 'night' ? saved : 'archival';
    } catch {
      return 'archival';
    }
  });

  const [fontScale, setFontScale] = useState<FontScale>(() => {
    try {
      const saved = localStorage.getItem('ellery_font_scale');
      return saved === 'sm' || saved === 'lg' ? saved : 'md';
    } catch {
      return 'md';
    }
  });

  const [showImages, setShowImages] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ellery_show_images');
      return saved === 'false' ? false : true;
    } catch {
      return true;
    }
  });

  const [storyMode, setStoryMode] = useState<StoryMode>(() => {
    try {
      const saved = localStorage.getItem('ellery_story_mode');
      return saved === 'edited' ? 'edited' : 'original';
    } catch {
      return 'original';
    }
  });

  const [settingsUnlocked, setSettingsUnlocked] = useState<boolean>(false);
  const [partFilter, setPartFilter] = useState<(typeof PARTS)[number]>('All Parts');
  const [pdfState, setPdfState] = useState<{
    generating: boolean;
    status: string;
    error: string | null;
  }>({ generating: false, status: '', error: null });

  useEffect(() => {
    if (paperTheme === 'night') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('ellery_paper_theme', paperTheme);
    } catch {
      // Ignore storage errors
    }
  }, [paperTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('ellery_current_chapter', String(currentChapterNum));
    } catch {
      // Ignore storage errors
    }
  }, [currentChapterNum]);

  useEffect(() => {
    try {
      localStorage.setItem('ellery_read_chapters', JSON.stringify(readChapters));
    } catch {
      // Ignore storage errors
    }
  }, [readChapters]);

  useEffect(() => {
    try {
      localStorage.setItem('ellery_font_scale', fontScale);
    } catch {
      // Ignore storage errors
    }
  }, [fontScale]);

  useEffect(() => {
    try {
      localStorage.setItem('ellery_show_images', String(showImages));
    } catch {
      // Ignore storage errors
    }
  }, [showImages]);

  useEffect(() => {
    try {
      localStorage.setItem('ellery_story_mode', storyMode);
    } catch {
      // Ignore storage errors
    }
  }, [storyMode]);

  const openChapter = (num: number) => {
    setCurrentChapterNum(num);
    setActiveView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateView = (view: ActiveView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleReadChapter = (num: number) => {
    setReadChapters((prev) =>
      prev.includes(num) ? prev.filter((item) => item !== num) : [...prev, num],
    );
  };

  const resetToDefaults = () => {
    setShowImages(true);
    setStoryMode('original');
    setPaperTheme('archival');
    setFontScale('md');
  };

  const handleDownloadPdf = async () => {
    if (pdfState.generating) return;
    setPdfState({ generating: true, status: 'Preparing PDF…', error: null });
    try {
      await generateBookPdf(
        (_step, _total, status) => {
          setPdfState({ generating: true, status, error: null });
        },
        { showImages, storyMode },
      );
      setPdfState({ generating: false, status: '', error: null });
    } catch {
      setPdfState({
        generating: false,
        status: '',
        error: 'Could not generate the PDF. Please try again.',
      });
    }
  };

  const activeChapter =
    CHAPTERS.find((c) => c.number === currentChapterNum) ?? CHAPTERS[0];

  const totalReadMinutes = CHAPTERS.reduce((sum, ch) => sum + ch.readingTimeMinutes, 0);
  const filteredChapters =
    partFilter === 'All Parts'
      ? CHAPTERS
      : CHAPTERS.filter((ch) => ch.part === partFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#141413] text-[#1C1917] dark:text-[#EAE6DF] transition-colors duration-200">
      {/* Top Navigation Bar: Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 dark:bg-[#141413]/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateView('cover')}
            className="font-display text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00583A] rounded"
          >
            Oscar Jones
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 font-display text-sm font-medium text-stone-600 dark:text-stone-400"
          >
            {(
              [
                ['cover', 'Cover'],
                ['contents', 'Contents'],
                ['gallery', 'Gallery'],
                ['author', 'About the Author'],
                ['settings', 'Settings'],
              ] as [ActiveView, string][]
            ).map(([view, label]) => {
              const isActive = activeView === view;
              return (
                <button
                  key={view}
                  type="button"
                  onClick={() => navigateView(view)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#00583A] dark:border-emerald-400 text-stone-900 dark:text-white font-semibold'
                      : 'border-transparent hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfState.generating}
              className="px-4 py-2 rounded-md bg-[#00583A] hover:bg-[#00442D] disabled:opacity-70 text-white font-display text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00583A]"
            >
              {pdfState.generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Building PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compact Mobile View Switcher (keeps sticky header compact <= 15% vh) */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-stone-200 dark:border-stone-800 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto font-display text-xs"
        >
          {(
            [
              ['cover', 'Cover'],
              ['contents', 'Contents'],
              ['gallery', 'Gallery'],
              ['author', 'About the Author'],
              ['settings', 'Settings'],
            ] as [ActiveView, string][]
          ).map(([view, label]) => (
            <button
              key={view}
              type="button"
              onClick={() => navigateView(view)}
              className={`px-2.5 py-1.5 rounded font-semibold whitespace-nowrap shrink-0 ${
                activeView === view
                  ? 'bg-[#00583A] text-white'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Non-intrusive PDF Progress / Error Notice when active */}
      {(pdfState.generating || pdfState.error) && (
        <div className="bg-[#00583A] text-white text-xs font-display py-2 px-4 text-center">
          {pdfState.error ? pdfState.error : pdfState.status}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {activeView === 'cover' && (
          <>
            {/* Editorial Frontispiece Hero Split */}
            <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Column */}
                <div className={`${showImages ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl'} flex flex-col justify-between py-2`}>
                  <div>
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-4">
                      {showImages ? 'Illustrated Edition' : 'Text-Only Edition'} · {storyMode === 'original' ? 'Original Story' : 'Edited Story'} · Chapters 1–20
                    </p>

                    <div className="bg-[#00583A] text-white rounded-lg p-1.5 mb-6 max-w-xl">
                      <div className="border border-white/80 rounded-[5px] px-5 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center justify-between gap-2 text-xs font-display font-semibold tracking-[0.14em] uppercase text-white/80 mb-1.5 tabular-nums">
                          <span>ELLERY TO NIGHTBRAMBLE</span>
                          <span>20 CHAPTERS</span>
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
                          Oscar Jones
                        </h1>
                      </div>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-stone-800 dark:text-stone-200 mb-5 [text-wrap:balance]">
                      Oscar’s Seven-Day Journey from Quiet Broadway to Moonspire, Copperville &amp; Nightbramble
                    </h2>

                    <p className="font-serif text-base sm:text-lg leading-relaxed text-stone-700 dark:text-stone-300 max-w-prose mb-6">
                      It starts as an ordinary Saturday road trip from little Ellery to Horizon by SkyCity in Auckland—complete with a three-hour roadworks traffic jam and a Southern Line loudspeaker running three stations ahead. Yet one agonising $60 LEGO dilemma at Westfield Newmarket sends eleven-year-old Oscar onto an unscheduled wizard bus, aboard a purple train bound for Moonspire, and all the way to the haunted cobblestones of Nightbramble before a friendly InterCity driver brings him home.
                    </p>

                    <p className="font-serif italic text-sm text-stone-500 dark:text-stone-400 mb-8">
                      Complete 20-chapter edition with switchable Original Story and Edited New Zealand English text, {showImages ? 'eight story illustrations, ' : 'text-only mode active, '}and instant Raleway-titled PDF download.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => openChapter(currentChapterNum)}
                      className="px-6 py-3 rounded-md bg-[#00583A] hover:bg-[#00442D] text-white font-display text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <BookOpen className="w-4 h-4" />
                      {currentChapterNum > 1
                        ? `Resume Chapter ${currentChapterNum}`
                        : 'Start Reading Chapter 1'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateView('contents')}
                      className="px-5 py-3 rounded-md border border-stone-300 dark:border-stone-700 hover:border-stone-500 font-display text-sm font-semibold text-stone-800 dark:text-stone-200 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <List className="w-4 h-4" />
                      Browse All 20 Chapters
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateView('settings')}
                      className="px-4 py-3 rounded-md border border-stone-300 dark:border-stone-700 hover:border-stone-500 font-display text-sm font-semibold text-stone-700 dark:text-stone-300 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                </div>

                {/* Right Column: Full-Height Frontispiece Plate */}
                {showImages && (
                  <div className="lg:col-span-5 flex flex-col">
                    <div className="flex-1 bg-[#EBE6DF] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-3 flex flex-col">
                      <div className="flex-1 overflow-hidden rounded">
                        <ResilientImage
                          src={COVER_ILLUSTRATION.src}
                          alt={COVER_ILLUSTRATION.alt}
                          fallbackTitle="Oscar Jones"
                          className="w-full h-full min-h-[360px] object-cover rounded"
                        />
                      </div>
                    </div>
                    <p className="mt-2.5 font-serif italic text-xs text-stone-500 dark:text-stone-400">
                      {COVER_ILLUSTRATION.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* 4-Column Book Metadata Strip (below hero split) */}
              <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 border-y border-stone-200 dark:border-stone-800">
                <div className="py-5 pr-4 lg:pr-6">
                  <p className="font-display text-xs uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                    Complete Story
                  </p>
                  <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
                    20 Chapters
                  </p>
                </div>

                <div className="py-5 pl-4 lg:px-6 border-l border-stone-200 dark:border-stone-800">
                  <p className="font-display text-xs uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                    Illustrations
                  </p>
                  <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
                    8 Plates
                  </p>
                </div>

                <div className="py-5 pr-4 lg:px-6 border-t border-stone-200 dark:border-stone-800 lg:border-t-0 lg:border-l">
                  <p className="font-display text-xs uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                    Reading Time
                  </p>
                  <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
                    ~{totalReadMinutes} Mins
                  </p>
                  <p className="font-serif text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {readChapters.length} of 20 chapters completed
                  </p>
                </div>

                <div className="py-5 pl-4 lg:pl-6 border-t border-l border-stone-200 dark:border-stone-800 lg:border-t-0">
                  <p className="font-display text-xs uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                    Typography &amp; Export
                  </p>
                  <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                    Raleway + Serif
                  </p>
                  <p className="font-serif text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Illustrated A4 PDF ready to save
                  </p>
                </div>
              </div>
            </section>

            {/* Four-Part Story Arc Overview */}
            <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-2">
                    Four-Part Structure
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    Explore the Journey
                  </h2>
                </div>
                <div className="flex items-center gap-4 font-display text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => navigateView('map')}
                    className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-[#00583A] dark:hover:text-emerald-400 transition-colors"
                  >
                    <MapIcon className="w-4 h-4" />
                    Route Map
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateView('gallery')}
                    className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-[#00583A] dark:hover:text-emerald-400 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Plate Gallery
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PARTS.slice(1).map((partName) => {
                  const partList = CHAPTERS.filter((c) => c.part === partName);
                  const firstCh = partList[0];
                  const lastCh = partList[partList.length - 1];
                  return (
                    <div
                      key={partName}
                      className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-lg p-6 flex flex-col justify-between"
                    >
                      <div>
                        <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-[#00583A] dark:text-emerald-400 mb-2 tabular-nums">
                          Chapters {firstCh.number}–{lastCh.number}
                        </p>
                        <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-4">
                          {partName.replace(/^Part [IV]+ · /, '')}
                        </h3>
                        <ul className="space-y-2.5 border-t border-stone-200/80 dark:border-stone-800 pt-4">
                          {partList.map((ch) => (
                            <li key={ch.number}>
                              <button
                                type="button"
                                onClick={() => openChapter(ch.number)}
                                className="w-full text-left flex items-baseline justify-between gap-3 group"
                              >
                                <span className="font-serif text-sm text-stone-800 dark:text-stone-200 group-hover:text-[#00583A] dark:group-hover:text-emerald-400 transition-colors">
                                  <span className="font-display font-semibold text-xs text-stone-400 tabular-nums mr-2">
                                    {String(ch.number).padStart(2, '0')}
                                  </span>
                                  {ch.title}
                                </span>
                                <span className="font-display text-xs text-stone-400 shrink-0 tabular-nums">
                                  {readChapters.includes(ch.number) ? 'Read' : `${ch.readingTimeMinutes}m`}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => openChapter(firstCh.number)}
                          className="font-display text-xs font-semibold text-[#00583A] dark:text-emerald-400 inline-flex items-center gap-1 hover:underline"
                        >
                          Begin {partName.split(' · ')[0]}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeView === 'contents' && (
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
            <div className="border-b border-stone-200 dark:border-stone-800 pb-8 mb-8">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-3">
                Table of Contents · Chapters 1–20
              </p>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  Complete Chapter Directory
                </h2>

                {/* Interactive Part Filter Tabs */}
                <div
                  className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg overflow-x-auto max-w-full"
                  role="tablist"
                  aria-label="Filter chapters by part"
                >
                  {PARTS.map((part) => {
                    const shortLabel =
                      part === 'All Parts' ? 'All (20)' : part.split(' · ')[0];
                    const active = partFilter === part;
                    return (
                      <button
                        key={part}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setPartFilter(part)}
                        className={`px-3 py-1.5 text-xs font-display font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800 border-b border-stone-200 dark:border-stone-800">
              {filteredChapters.map((ch) => {
                const isRead = readChapters.includes(ch.number);
                const isCurrent = currentChapterNum === ch.number;

                return (
                  <button
                    key={ch.number}
                    type="button"
                    onClick={() => openChapter(ch.number)}
                    className="w-full text-left py-6 px-3 sm:px-5 hover:bg-stone-100/80 dark:hover:bg-stone-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 font-display text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                        <span className="font-bold text-[#00583A] dark:text-emerald-400">
                          CHAPTER {String(ch.number).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ch.location}</span>
                        {ch.illustration && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{ch.illustration.figureNumber}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-[#00583A] dark:group-hover:text-emerald-400 transition-colors">
                        {ch.title}
                      </h3>

                      <p className="font-serif text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                        {ch.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-display text-xs font-semibold tabular-nums">
                      <span className="text-stone-500 dark:text-stone-400">
                        {ch.readingTimeMinutes} min read
                      </span>

                      {isRead ? (
                        <span className="inline-flex items-center gap-1 text-[#00583A] dark:text-emerald-400">
                          <Check className="w-4 h-4" />
                          Read
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[#00583A] dark:text-emerald-400">
                          Continue →
                        </span>
                      ) : (
                        <span className="text-stone-700 dark:text-stone-300 group-hover:text-[#00583A] dark:group-hover:text-emerald-400">
                          Read →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'reader' && (
          <BookReader
            chapter={activeChapter}
            readChapters={readChapters}
            paperTheme={paperTheme}
            fontScale={fontScale}
            storyMode={storyMode}
            showImages={showImages}
            onChangePaperTheme={setPaperTheme}
            onChangeFontScale={setFontScale}
            onSelectChapter={openChapter}
            onToggleRead={toggleReadChapter}
            onOpenContents={() => navigateView('contents')}
          />
        )}

        {activeView === 'map' && (
          <RouteMapView
            currentChapter={currentChapterNum}
            readChapters={readChapters}
            onSelectChapter={openChapter}
          />
        )}

        {activeView === 'gallery' && (
          <GalleryView
            showImages={showImages}
            onOpenSettings={() => navigateView('settings')}
            onSelectChapter={openChapter}
          />
        )}

        {activeView === 'author' && (
          <AboutAuthorView
            onOpenReader={() => navigateView('reader')}
            onOpenContents={() => navigateView('contents')}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            isUnlocked={settingsUnlocked}
            showImages={showImages}
            storyMode={storyMode}
            paperTheme={paperTheme}
            fontScale={fontScale}
            onUnlock={() => setSettingsUnlocked(true)}
            onLock={() => setSettingsUnlocked(false)}
            onChangeShowImages={setShowImages}
            onChangeStoryMode={setStoryMode}
            onChangePaperTheme={setPaperTheme}
            onChangeFontScale={setFontScale}
            onResetDefaults={resetToDefaults}
            onOpenReader={() => navigateView('reader')}
            onOpenRouteMap={() => navigateView('map')}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-[#F1EDE5]/60 dark:bg-stone-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-display text-xs text-stone-600 dark:text-stone-400">
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-200">Oscar Jones</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{storyMode === 'original' ? 'Original Story' : 'Edited Edition'} · {showImages ? 'Images On' : 'No Images'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => navigateView('contents')}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Contents
            </button>
            <button
              type="button"
              onClick={() => navigateView('reader')}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Reader
            </button>
            <button
              type="button"
              onClick={() => navigateView('map')}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Route Map
            </button>
            <button
              type="button"
              onClick={() => navigateView('author')}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              About the Author
            </button>
            <button
              type="button"
              onClick={() => navigateView('settings')}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="text-[#00583A] dark:text-emerald-400 font-semibold hover:underline"
            >
              Download PDF
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
