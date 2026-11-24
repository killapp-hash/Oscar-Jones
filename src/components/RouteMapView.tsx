import { ArrowRight, MapPin, Train, Bus, Plane, Home } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';

interface RouteMapViewProps {
  currentChapter: number;
  readChapters: number[];
  onSelectChapter: (chapterNum: number) => void;
}

interface RouteStop {
  id: string;
  name: string;
  realm: 'Real World · NZ' | 'Magical Realm';
  transport: string;
  chapterNum: number;
  detail: string;
  icon: 'home' | 'car' | 'train' | 'bus' | 'air';
}

const ROUTE_STOPS: RouteStop[] = [
  {
    id: 'ellery',
    name: 'Ellery (Broadway)',
    realm: 'Real World · NZ',
    transport: 'Walking · Buried Tracks',
    chapterNum: 1,
    detail: 'Pop. ~18,000. Basilic, The Grange Cafe, Ander’s Books, Ellery Art Gallery, and Terracoat.',
    icon: 'home',
  },
  {
    id: 'roadworks',
    name: 'Rural Roadworks',
    realm: 'Real World · NZ',
    transport: 'Family Car · 3-Hour Delay',
    chapterNum: 3,
    detail: 'Portable traffic lights go dark at one-way roadworks, delaying the morning drive until 12:04 p.m.',
    icon: 'car',
  },
  {
    id: 'horizon',
    name: 'Horizon by SkyCity (Room 713)',
    realm: 'Real World · NZ',
    transport: 'Hobson St · 1:34 p.m.',
    chapterNum: 4,
    detail: 'Up Through Tainui artwork on the wall, Timezone visit, and plans for lunch in Newmarket.',
    icon: 'car',
  },
  {
    id: 'newmarket',
    name: 'Westfield Newmarket',
    realm: 'Real World · NZ',
    transport: 'AT Southern Line',
    chapterNum: 6,
    detail: 'The $60 LEGO City Tour Bus dilemma separates Oscar from his family in the crowded mall.',
    icon: 'train',
  },
  {
    id: 'scs-out',
    name: 'Strange Countryside Stop',
    realm: 'Magical Realm',
    transport: 'Unscheduled Wizard Bus',
    chapterNum: 7,
    detail: 'Not Route 30 to Civic after all—Oscar steps off at a lonely country platform and catches a purple train.',
    icon: 'bus',
  },
  {
    id: 'moonspire',
    name: 'Moonspire (32 Platforms)',
    realm: 'Magical Realm',
    transport: 'Purple Line · Shadowfen',
    chapterNum: 9,
    detail: 'Free transport since 1 August 2026, Caledor Place & Ravenspire St exits, and a 7-day wait.',
    icon: 'train',
  },
  {
    id: 'copperville',
    name: 'City Centre & Copperville',
    realm: 'Magical Realm',
    transport: 'Copper Line B',
    chapterNum: 11,
    detail: 'Friendly orange copper witches handing out lollies, a |5 mini copper bus, and the |500 golem limit.',
    icon: 'train',
  },
  {
    id: 'silvertide',
    name: 'Silvertide Harbour',
    realm: 'Magical Realm',
    transport: 'CBD Hotel · |295 Woods',
    chapterNum: 12,
    detail: 'Under moonlight the sea turns liquid silver, sending Oscar briskly indoors for the night.',
    icon: 'bus',
  },
  {
    id: 'nightbramble',
    name: 'Nightbramble Village',
    realm: 'Magical Realm',
    transport: 'Flying Triple-Decker (NB-134)',
    chapterNum: 13,
    detail: 'The Shadowfen film happened here 134 years ago—and lingering ghosts still party at midnight.',
    icon: 'air',
  },
  {
    id: 'wikkidary',
    name: 'Wikkidary Prison',
    realm: 'Magical Realm',
    transport: 'Nightbramble Police Dept',
    chapterNum: 15,
    detail: 'Oscar and Inspector Bramwell capture the noisy party-crashers and lock them inside cold-iron gates.',
    icon: 'bus',
  },
  {
    id: 'intercity',
    name: 'Hitchhike via Honsonby',
    realm: 'Real World · NZ',
    transport: 'InterCity Coach',
    chapterNum: 19,
    detail: 'Seven days complete: Copper Line, Purple Line, then a cheerful InterCity driver lifts Oscar past Newmarket and Honsonby.',
    icon: 'bus',
  },
  {
    id: 'home',
    name: 'Ellery · Saturday 7:00 a.m.',
    realm: 'Real World · NZ',
    transport: 'Time Restored',
    chapterNum: 20,
    detail: 'Time snaps back to Saturday morning—and Oscar keeps his tiny copper double-decker bus as proof.',
    icon: 'home',
  },
];

function StopIcon({ kind }: { kind: RouteStop['icon'] }) {
  switch (kind) {
    case 'home':
      return <Home className="w-4 h-4" strokeWidth={1.75} />;
    case 'train':
      return <Train className="w-4 h-4" strokeWidth={1.75} />;
    case 'bus':
      return <Bus className="w-4 h-4" strokeWidth={1.75} />;
    case 'air':
      return <Plane className="w-4 h-4" strokeWidth={1.75} />;
    default:
      return <MapPin className="w-4 h-4" strokeWidth={1.75} />;
  }
}

export function RouteMapView({
  currentChapter,
  readChapters,
  onSelectChapter,
}: RouteMapViewProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-8 mb-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#00583A] dark:text-emerald-400 mb-3">
          Transit Atlas · 12 Key Waypoints
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 [text-wrap:balance]">
            From Ellery to Nightbramble &amp; Back Again
          </h2>
          <p className="font-serif text-sm text-stone-600 dark:text-stone-400 max-w-md">
            Follow every highway delay, missed bus, railway transfer, and flying coach across all twenty chapters. Select any stop to jump straight into its chapter.
          </p>
        </div>
      </div>

      {/* NZTA style highway summary bar */}
      <div className="bg-[#00583A] text-white rounded-lg p-1.5 mb-10">
        <div className="border border-white/75 rounded-[5px] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="font-display">
            <p className="text-xs uppercase tracking-[0.14em] text-white/80 font-semibold">
              Full Loop Itinerary
            </p>
            <p className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
              Ellery → Auckland → Moonspire → Copperville → Nightbramble → Honsonby → Ellery
            </p>
          </div>
          <div className="flex items-center gap-6 font-display text-xs uppercase tracking-wider text-white/90 tabular-nums">
            <span>20 Chapters</span>
            <span aria-hidden="true">·</span>
            <span>7 Magical Days</span>
            <span aria-hidden="true">·</span>
            <span>{readChapters.length}/20 Read</span>
          </div>
        </div>
      </div>

      {/* Waypoint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROUTE_STOPS.map((stop, idx) => {
          const chapter = CHAPTERS.find((c) => c.number === stop.chapterNum);
          const isActive = currentChapter === stop.chapterNum;
          const isRead = readChapters.includes(stop.chapterNum);

          return (
            <button
              key={stop.id}
              type="button"
              onClick={() => onSelectChapter(stop.chapterNum)}
              className={`group text-left p-6 rounded-lg border transition-colors duration-200 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00583A] ${
                isActive
                  ? 'bg-[#F1EDE5] dark:bg-stone-800/80 border-[#00583A] dark:border-emerald-500'
                  : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-display text-stone-500 dark:text-stone-400 mb-3 tabular-nums">
                  <span className="font-semibold tracking-wider uppercase text-[#00583A] dark:text-emerald-400">
                    Stop {String(idx + 1).padStart(2, '0')} · Ch. {stop.chapterNum}
                  </span>
                  <span>{stop.realm}</span>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <span className="p-2 rounded bg-[#F1EDE5] dark:bg-stone-800 text-[#00583A] dark:text-emerald-400 shrink-0">
                    <StopIcon kind={stop.icon} />
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {stop.name}
                  </h3>
                </div>

                <p className="font-display text-xs font-medium text-stone-500 dark:text-stone-400 mb-3">
                  {stop.transport}
                </p>

                <p className="font-serif text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {stop.detail}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-display font-semibold">
                <span className="text-stone-500 dark:text-stone-400 truncate max-w-[70%]">
                  {chapter?.title}
                </span>
                <span className="inline-flex items-center gap-1 text-[#00583A] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0">
                  {isRead ? 'Re-read' : 'Read'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
