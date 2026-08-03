import { motion } from 'framer-motion'
import type { BrandBookSection as SectionType } from '../../services/brandBook/brandBookService'
import { BrandBookSection } from './BrandBookSection'
import { THEME_CONFIGS } from '../../services/brandBook/brandBookTemplates'

interface BrandBookPreviewProps {
  sections: SectionType[]
  theme: 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury'
}

export function BrandBookPreview({ sections, theme }: BrandBookPreviewProps) {
  const visible = sections.filter((s) => s.visible)
  const config = THEME_CONFIGS[theme]

  return (
    <div className="flex-1 flex flex-col items-center gap-6 overflow-y-auto max-h-[85vh] p-4 bg-slate-100/50 dark:bg-slate-950/40 rounded-3xl border border-slate-200/40 dark:border-slate-850">
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-6 text-slate-400">
          <p className="text-xs font-semibold">No visible brand book sections selected.</p>
          <p className="text-[10px] mt-1">Enable pages in the left sidebar configurator to populate this book.</p>
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-8 py-4">
          {visible.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className={`relative bg-white shadow-lg border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 p-8 min-h-[480px] flex flex-col justify-between rounded-[1.5rem] ${config.backgroundClass}`}
            >
              {/* Top border header */}
              <div className="flex items-center justify-between border-b border-slate-200/10 pb-2 text-[8px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500">
                <span>{section.title}</span>
                <span>Page {idx + 1} of {visible.length}</span>
              </div>

              {/* Page Content Body */}
              <div className="flex-1 flex flex-col justify-center py-6">
                <BrandBookSection
                  section={section}
                  theme={theme}
                  visibleSections={visible}
                />
              </div>

              {/* Bottom footer pagination */}
              <div className="flex items-center justify-between border-t border-slate-200/10 pt-2 text-[8px] font-extrabold uppercase tracking-widest text-slate-400">
                <span>Brand Guidelines</span>
                <span>CONFIDENTIAL</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
