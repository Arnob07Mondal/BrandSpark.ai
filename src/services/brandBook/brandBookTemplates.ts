export interface BrandBookThemeConfig {
  fontFamily: string
  backgroundClass: string
  textColorClass: string
  coverBgClass: string
  titleClass: string
  subtitleClass: string
  headingClass: string
  bodyTextClass: string
  cardClass: string
  accentBorderClass: string
}

export const THEME_CONFIGS: Record<'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury', BrandBookThemeConfig> = {
  Modern: {
    fontFamily: 'font-sans',
    backgroundClass: 'bg-slate-50 text-slate-900',
    textColorClass: 'text-slate-800 dark:text-slate-200',
    coverBgClass: 'bg-gradient-to-br from-blue-600 via-indigo-650 to-purple-650 text-white',
    titleClass: 'text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-sm font-bold uppercase tracking-widest text-slate-200',
    headingClass: 'text-lg font-bold text-slate-900 border-b border-slate-200 pb-2',
    bodyTextClass: 'text-xs text-slate-600 leading-relaxed font-medium',
    cardClass: 'bg-white border border-slate-100 shadow-sm rounded-2xl p-5',
    accentBorderClass: 'border-blue-650',
  },
  Minimal: {
    fontFamily: 'font-mono',
    backgroundClass: 'bg-white text-stone-900',
    textColorClass: 'text-stone-800 dark:text-stone-300',
    coverBgClass: 'bg-stone-100 text-stone-900 border-b border-stone-200',
    titleClass: 'text-3xl font-light tracking-wide',
    subtitleClass: 'text-xs font-semibold uppercase tracking-[0.25em] text-stone-500',
    headingClass: 'text-base font-semibold text-stone-900 border-b border-stone-300 pb-1.5 uppercase tracking-wider',
    bodyTextClass: 'text-xs text-stone-600 leading-relaxed font-normal',
    cardClass: 'bg-stone-50 border border-stone-200 p-4 rounded-lg',
    accentBorderClass: 'border-stone-800',
  },
  Corporate: {
    fontFamily: 'font-sans',
    backgroundClass: 'bg-blue-50/20 text-slate-900',
    textColorClass: 'text-slate-800 dark:text-slate-200',
    coverBgClass: 'bg-slate-900 text-white border-b-4 border-blue-650',
    titleClass: 'text-3xl font-bold tracking-tight',
    subtitleClass: 'text-xs font-semibold uppercase tracking-wider text-slate-400',
    headingClass: 'text-base font-bold text-slate-900 border-l-4 border-blue-650 pl-3 pb-0.5',
    bodyTextClass: 'text-xs text-slate-650 leading-relaxed font-semibold',
    cardClass: 'bg-white border border-slate-200/60 shadow-md p-5 rounded-none',
    accentBorderClass: 'border-blue-650',
  },
  Creative: {
    fontFamily: 'font-sans',
    backgroundClass: 'bg-purple-50/20 text-slate-900',
    textColorClass: 'text-slate-800 dark:text-slate-200',
    coverBgClass: 'bg-gradient-to-r from-rose-500 via-purple-650 to-indigo-600 text-white',
    titleClass: 'text-4xl font-black italic tracking-tighter uppercase',
    subtitleClass: 'text-xs font-extrabold uppercase tracking-widest text-rose-250',
    headingClass: 'text-lg font-extrabold text-indigo-950 border-b-2 border-dashed border-purple-200 pb-2',
    bodyTextClass: 'text-xs text-slate-650 leading-relaxed font-medium',
    cardClass: 'bg-white/80 border-2 border-indigo-50/50 shadow-lg rounded-3xl p-5',
    accentBorderClass: 'border-rose-500',
  },
  Luxury: {
    fontFamily: 'font-serif',
    backgroundClass: 'bg-stone-900 text-amber-50',
    textColorClass: 'text-amber-100/90 dark:text-amber-100',
    coverBgClass: 'bg-black text-amber-400 border border-amber-500/20',
    titleClass: 'text-3xl font-normal tracking-widest text-amber-400 font-serif',
    subtitleClass: 'text-xs font-light uppercase tracking-[0.3em] text-amber-200/60',
    headingClass: 'text-base font-medium text-amber-400 border-b border-amber-500/20 pb-2 tracking-wide font-serif',
    bodyTextClass: 'text-xs text-amber-100/75 leading-relaxed font-light',
    cardClass: 'bg-stone-950 border border-amber-500/10 p-5 rounded-none shadow-xl',
    accentBorderClass: 'border-amber-400',
  },
}
