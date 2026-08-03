import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { getProject } from '../../services/projectService'
import {
  getProjectBrandBooks,
  createBrandBook,
  deleteBrandBook,
} from '../../services/brandBook/brandBookService'
import type { BrandBook, BrandBookSection } from '../../services/brandBook/brandBookService'
import { compileBrandBook } from '../../services/brandBook/brandBookBuilder'
import type { BrandCompleteness } from '../../services/brandBook/brandBookBuilder'
import { BrandBookToolbar } from './BrandBookToolbar'
import { BrandBookSidebar } from './BrandBookSidebar'
import { BrandBookPreview } from './BrandBookPreview'
import {
  exportToTXT,
  exportToMD,
  exportToHTML,
  exportToPDF,
  exportToDOCX,
  exportToPPTX,
} from '../../services/brandBook/brandBookExporter'
import { Skeleton } from '../ui/skeleton'

interface BrandBookWorkspaceProps {
  projectId: string
}

export function BrandBookWorkspace({ projectId }: BrandBookWorkspaceProps) {
  const { showToast } = useToast()
  const { user } = useAuth()

  // State definitions
  const [savedBooks, setSavedBooks] = useState<BrandBook[]>([])
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  
  const [sections, setSections] = useState<BrandBookSection[]>([])
  const [theme, setTheme] = useState<'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury'>('Modern')
  const [completeness, setCompleteness] = useState<BrandCompleteness>({ score: 0, missing: [] })
  const [companyName, setCompanyName] = useState('Brand Project')

  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Initial compile and retrieve saved versions
  useEffect(() => {
    let active = true
    const initWorkspace = async () => {
      try {
        setLoading(true)
        const proj = await getProject(projectId)
        if (proj && active) {
          setCompanyName(proj.companyName)
        }

        // Get saved books
        const books = await getProjectBrandBooks(projectId)
        if (active) {
          setSavedBooks(books)
        }

        // Compile default guidelines draft
        const compiled = await compileBrandBook(projectId)
        if (active) {
          setSections(compiled.sections)
          setCompleteness(compiled.completeness)
        }
      } catch (err) {
        console.error(err)
        showToast('Failed to compile project guidelines draft.', 'error')
      } finally {
        if (active) setLoading(false)
      }
    }

    initWorkspace()

    return () => {
      active = false
    }
  }, [projectId, showToast])

  // 2. Select version handler
  const handleSelectBook = (id: string | null) => {
    setActiveBookId(id)
    if (!id) {
      // Re-trigger compile for active draft
      compileBrandBook(projectId)
        .then((compiled) => {
          setSections(compiled.sections)
          setTheme('Modern')
        })
        .catch(() => showToast('Failed to reload active draft.', 'error'))
      return
    }

    const selected = savedBooks.find((b) => b.brandBookId === id)
    if (selected) {
      setSections(selected.sections)
      setTheme(selected.theme)
    }
  }

  // 3. Save new version
  const handleSaveNewVersion = async (versionStr: string) => {
    if (!user) return
    setIsProcessing(true)
    try {
      const docId = await createBrandBook(
        projectId,
        user.uid,
        theme,
        versionStr,
        sections,
        'published'
      )
      
      const newBook: BrandBook = {
        brandBookId: docId,
        projectId,
        ownerUid: user.uid,
        theme,
        version: versionStr,
        sections,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
      }

      setSavedBooks((prev) => [newBook, ...prev])
      setActiveBookId(docId)
      showToast(`Revision guidelines saved as version v${versionStr}!`, 'success')
    } catch {
      showToast('Failed to log version history.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // 4. Restore selected version back to draft
  const handleRestoreVersion = () => {
    if (!activeBookId) return
    const selected = savedBooks.find((b) => b.brandBookId === activeBookId)
    if (selected) {
      setSections(selected.sections)
      setTheme(selected.theme)
      setActiveBookId(null) // Restores back as active draft
      showToast(`Restored version v${selected.version} data to active editor.`, 'info')
    }
  }

  // 5. Duplicate version
  const handleDuplicateVersion = async () => {
    if (!user || !activeBookId) return
    setIsProcessing(true)
    try {
      const selected = savedBooks.find((b) => b.brandBookId === activeBookId)
      if (!selected) return

      const doubleVersion = `${selected.version}-copy`
      const docId = await createBrandBook(
        projectId,
        user.uid,
        selected.theme,
        doubleVersion,
        selected.sections,
        'published'
      )

      const newBook: BrandBook = {
        ...selected,
        brandBookId: docId,
        version: doubleVersion,
        createdAt: new Date(),
      }

      setSavedBooks((prev) => [newBook, ...prev])
      setActiveBookId(docId)
      showToast(`Duplicated version guidelines as v${doubleVersion}`, 'success')
    } catch {
      showToast('Failed to duplicate version.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // 6. Delete version
  const handleDeleteVersion = async () => {
    if (!activeBookId) return
    if (!window.confirm('Delete this saved brand book version?')) return
    setIsProcessing(true)
    try {
      await deleteBrandBook(activeBookId)
      setSavedBooks((prev) => prev.filter((b) => b.brandBookId !== activeBookId))
      setActiveBookId(null)
      showToast('Version deleted.', 'info')
    } catch {
      showToast('Failed to delete version.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // 7. Trigger export files download
  const handleExport = (format: 'txt' | 'md' | 'pdf' | 'html' | 'docx' | 'pptx') => {
    if (sections.length === 0) return

    showToast(`Compiling and formatting ${format.toUpperCase()} export...`, 'info')

    try {
      switch (format) {
        case 'txt':
          exportToTXT(companyName, sections)
          break
        case 'md':
          exportToMD(companyName, sections)
          break
        case 'html':
          exportToHTML(companyName, sections, theme)
          break
        case 'pdf':
          exportToPDF(companyName, sections, theme)
          break
        case 'docx':
          exportToDOCX(companyName, sections, theme)
          break
        case 'pptx':
          exportToPPTX(companyName, sections, theme)
          break
      }
    } catch {
      showToast('Failed to download exported guidelines.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="h-[400px] w-full lg:w-80 rounded-[2rem] animate-pulse shrink-0" />
          <Skeleton className="h-[400px] flex-1 rounded-[2rem] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar controls */}
      <BrandBookToolbar
        companyName={companyName}
        savedBooks={savedBooks}
        activeBookId={activeBookId}
        onSelectBook={handleSelectBook}
        onSaveNewVersion={handleSaveNewVersion}
        onRestoreVersion={handleRestoreVersion}
        onDuplicateVersion={handleDuplicateVersion}
        onDeleteVersion={handleDeleteVersion}
        onExport={handleExport}
        isProcessing={isProcessing}
      />

      {/* 2. Interactive custom workspaces */}
      <div className="flex flex-col lg:flex-row gap-6">
        <BrandBookSidebar
          sections={sections}
          setSections={setSections}
          theme={theme}
          setTheme={setTheme}
          completeness={completeness}
        />

        <BrandBookPreview
          sections={sections}
          theme={theme}
        />
      </div>
    </div>
  )
}
export default BrandBookWorkspace
