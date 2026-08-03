import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Save,
  Trash2,
  Copy,
  ChevronDown,
  History,
  Sparkles,
} from 'lucide-react'
import type { BrandBook } from '../../services/brandBook/brandBookService'
import { Button } from '../ui/button'

interface BrandBookToolbarProps {
  companyName: string
  savedBooks: BrandBook[]
  activeBookId: string | null
  onSelectBook: (id: string | null) => void
  onSaveNewVersion: (version: string) => Promise<void>
  onRestoreVersion: () => void
  onDuplicateVersion: () => void
  onDeleteVersion: () => void
  onExport: (format: 'txt' | 'md' | 'pdf' | 'html' | 'docx' | 'pptx') => void
  isProcessing: boolean
}

export function BrandBookToolbar({
  companyName,
  savedBooks,
  activeBookId,
  onSelectBook,
  onSaveNewVersion,
  onRestoreVersion,
  onDuplicateVersion,
  onDeleteVersion,
  onExport,
  isProcessing,
}: BrandBookToolbarProps) {
  const [showExport, setShowExport] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newVersion, setNewVersion] = useState('1.0.0')

  const handleSaveClick = () => {
    // Generate next minor increment suggestion
    if (savedBooks.length > 0) {
      const latest = savedBooks[0].version
      const parts = latest.split('.').map(Number)
      if (parts.length === 3 && !parts.some(isNaN)) {
        parts[2] += 1
        setNewVersion(parts.join('.'))
      } else {
        setNewVersion(latest + '-copy')
      }
    } else {
      setNewVersion('1.0.0')
    }
    setShowSaveModal(true)
  }

  const handleConfirmSave = async () => {
    if (!newVersion.trim()) return
    await onSaveNewVersion(newVersion.trim())
    setShowSaveModal(false)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 dark:border-slate-800/50">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          Brand Book Builder
        </h3>
        <p className="text-xs text-slate-500">
          Compile digital brand guidelines reports for {companyName}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Version History drop-down selection */}
        {savedBooks.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-2 py-1 h-9">
            <History className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={activeBookId || 'draft'}
              onChange={(e) => onSelectBook(e.target.value === 'draft' ? null : e.target.value)}
              className="text-[10px] font-extrabold bg-transparent outline-none cursor-pointer max-w-[110px]"
            >
              <option value="draft">Active Draft</option>
              {savedBooks.map((book) => (
                <option key={book.brandBookId} value={book.brandBookId}>
                  v{book.version} ({book.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Saved book revision actions */}
        {activeBookId ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onRestoreVersion}
              className="h-9 rounded-xl text-[10px] font-bold"
            >
              Restore Version
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicateVersion}
              className="h-9 rounded-xl text-[10px] font-bold"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteVersion}
              className="h-9 rounded-xl text-[10px] font-bold text-rose-600 border-rose-100 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </>
        ) : (
          <Button
            onClick={handleSaveClick}
            disabled={isProcessing}
            className="h-9 rounded-xl text-[10px] font-bold"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Version
          </Button>
        )}

        {/* Exporter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowExport(!showExport)}
            className="h-9 rounded-xl text-[10px] font-bold gap-1"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Export Document
            <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
          </Button>
          <AnimatePresence>
            {showExport && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowExport(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-1.5 z-30 w-36 rounded-xl border border-slate-200/60 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <button
                    onClick={() => { onExport('pdf'); setShowExport(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => { onExport('docx'); setShowExport(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Export DOCX
                  </button>
                  <button
                    onClick={() => { onExport('pptx'); setShowExport(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Export PPTX Slides
                  </button>
                  <button
                    onClick={() => { onExport('html'); setShowExport(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Export HTML
                  </button>
                  <button
                    onClick={() => { onExport('md'); setShowExport(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Export Markdown
                  </button>
                  <button
                    onClick={() => { onExport('txt'); setShowExport(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Export Text Log
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Version Save Modal Dialog */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-blue-500" /> Save Version
                </h4>
                <p className="text-[10px] text-slate-455">Record this configuration draft as a permanent log copy.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Version Identifier</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="E.g. 1.0.0"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                  className="rounded-full text-[10px] font-bold px-4 h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSave}
                  className="rounded-full text-[10px] font-bold px-4 h-9"
                >
                  Save Revision
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
