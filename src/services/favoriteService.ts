import {
  db,
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from '../lib/firestore'

export interface Favorite {
  favoriteId: string
  projectId: string
  ownerUid: string
  generationType: string
  name: string
  meaning?: string
  whyItFits?: string
  score?: number
  response?: unknown
  createdAt: unknown
}

/**
 * Saves any generated branding asset as a favorite inside Firestore.
 */
export async function addFavorite(
  projectId: string,
  ownerUid: string,
  generationType: string,
  name: string,
  response: unknown,
  meaning?: string,
  whyItFits?: string,
  score?: number
): Promise<string> {
  const favoritesRef = collection(db, 'favorites')
  const docRef = await addDoc(favoritesRef, {
    projectId,
    ownerUid,
    generationType,
    name,
    response: response || null,
    meaning: meaning || '',
    whyItFits: whyItFits || '',
    score: score || 0,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Deletes a saved favorite by its document ID.
 */
export async function removeFavorite(favoriteId: string): Promise<void> {
  const favoriteDocRef = doc(db, 'favorites', favoriteId)
  await deleteDoc(favoriteDocRef)
}

/**
 * Retrieves all saved favorites for a specific project.
 */
export async function getProjectFavorites(projectId: string): Promise<Favorite[]> {
  const favoritesRef = collection(db, 'favorites')
  const q = query(favoritesRef, where('projectId', '==', projectId))
  const querySnapshot = await getDocs(q)

  const list: Favorite[] = []
  querySnapshot.forEach((d) => {
    const data = d.data()
    list.push({
      favoriteId: d.id,
      projectId: data.projectId,
      ownerUid: data.ownerUid,
      generationType: data.generationType || 'Brand Name',
      name: data.name,
      response: data.response,
      meaning: data.meaning,
      whyItFits: data.whyItFits,
      score: data.score,
      createdAt: data.createdAt,
    })
  })

  // Sort by creation date locally or name
  return list.sort((a, b) => a.name.localeCompare(b.name))
}
