import type { Chapter } from '../data/chapters';

interface NztaSignHeaderProps {
  chapter: Chapter;
}

export function NztaSignHeader({ chapter }: NztaSignHeaderProps) {
  return (
    <div className="bg-[#00583A] text-white rounded-lg p-1.5 shadow-sm">
      <div className="border border-white/80 rounded-[5px] px-5 py-4 sm:px-7 sm:py-5">
        <p className="font-display text-xs font-semibold tracking-[0.14em] uppercase text-white/85 tabular-nums mb-2">
          Chapter {String(chapter.number).padStart(2, '0')} · {chapter.location}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.15rem] font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
          {chapter.title}
        </h1>
      </div>
    </div>
  );
}
