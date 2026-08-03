import {
  db,
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from '../../lib/firestore'

export interface BrandBookSection {
  id: string // e.g. 'cover', 'toc', 'overview', 'name', 'logo', 'palette', 'typography', 'mission', 'vision', 'story', 'voice', 'slogan', 'website', 'card', 'social', 'summary'
  title: string
  visible: boolean
  content: unknown
}

export interface BrandBook {
  brandBookId: string
  projectId: string
  ownerUid: string
  theme: 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury'
  version: string
  sections: BrandBookSection[]
  previewImage?: string
  pdfUrl?: string
  createdAt: unknown
  updatedAt: unknown
  status: 'draft' | 'published'
}

/**
 * Saves or updates a brand book draft inside Firestore.
 */
export async function createBrandBook(
  projectId: string,
  ownerUid: string,
  theme: 'Modern' | 'Minimal' | 'Corporate' | 'Creative' | 'Luxury',
  version: string,
  sections: BrandBookSection[],
  status: 'draft' | 'published' = 'draft'
): Promise<string> {
  const brandBooksRef = collection(db, 'brandBooks')
  const docRef = await addDoc(brandBooksRef, {
    projectId,
    ownerUid,
    theme,
    version,
    sections,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status,
    previewImage: '',
    pdfUrl: '',
  })
  return docRef.id
}

/**
 * Updates an existing brand book revision.
 */
export async function updateBrandBook(
  brandBookId: string,
  updates: Partial<Omit<BrandBook, 'brandBookId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'brandBooks', brandBookId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Deletes a brand book version.
 */
export async function deleteBrandBook(brandBookId: string): Promise<void> {
  const docRef = doc(db, 'brandBooks', brandBookId)
  await deleteDoc(docRef)
}

/**
 * Fetches all saved brand books versions for a project.
 */
export async function getProjectBrandBooks(projectId: string): Promise<BrandBook[]> {
  const brandBooksRef = collection(db, 'brandBooks')
  const q = query(brandBooksRef, where('projectId', '==', projectId))
  const querySnapshot = await getDocs(q)

  const list: BrandBook[] = []
  querySnapshot.forEach((d) => {
    const data = d.data()
    list.push({
      brandBookId: d.id,
      projectId: data.projectId,
      ownerUid: data.ownerUid,
      theme: data.theme || 'Modern',
      version: data.version || '1.0.0',
      sections: data.sections || [],
      previewImage: data.previewImage || '',
      pdfUrl: data.pdfUrl || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      status: data.status || 'draft',
    })
  })

  // Sort locally by creation date descending
  return list.sort((a, b) => {
    const tsA = a.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
    const tsB = b.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
    const timeA = tsA?.seconds || tsA?.toMillis?.() || 0
    const timeB = tsB?.seconds || tsB?.toMillis?.() || 0
    return timeB - timeA
  })
}
