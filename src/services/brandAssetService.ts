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

export interface BrandAsset {
  assetId: string
  projectId: string
  ownerUid: string
  assetType: 'logo' | 'logo-variation' | 'business-card' | 'social-preview' | 'website-preview'
  prompt: string
  imageUrl: string
  thumbnail: string
  model: string
  createdAt: unknown
  status: 'success' | 'failed'
}

/**
 * Creates a brand asset record in Firestore.
 */
export async function addBrandAsset(
  projectId: string,
  ownerUid: string,
  assetType: 'logo' | 'logo-variation' | 'business-card' | 'social-preview' | 'website-preview',
  prompt: string,
  imageUrl: string,
  model: string
): Promise<string> {
  const assetsRef = collection(db, 'brandAssets')
  const docRef = await addDoc(assetsRef, {
    projectId,
    ownerUid,
    assetType,
    prompt,
    imageUrl,
    thumbnail: imageUrl, // Same for mock
    model,
    createdAt: serverTimestamp(),
    status: 'success',
  })
  return docRef.id
}

/**
 * Deletes a brand asset record from Firestore.
 */
export async function deleteBrandAsset(assetId: string): Promise<void> {
  const assetDocRef = doc(db, 'brandAssets', assetId)
  await deleteDoc(assetDocRef)
}

/**
 * Fetches all brand assets for a project.
 */
export async function getProjectBrandAssets(projectId: string): Promise<BrandAsset[]> {
  const assetsRef = collection(db, 'brandAssets')
  const q = query(assetsRef, where('projectId', '==', projectId))
  const querySnapshot = await getDocs(q)

  const list: BrandAsset[] = []
  querySnapshot.forEach((d) => {
    const data = d.data()
    list.push({
      assetId: d.id,
      projectId: data.projectId,
      ownerUid: data.ownerUid,
      assetType: data.assetType,
      prompt: data.prompt || '',
      imageUrl: data.imageUrl || '',
      thumbnail: data.thumbnail || '',
      model: data.model || 'flux',
      createdAt: data.createdAt,
      status: data.status || 'success',
    })
  })

  // Sort by createdAt descending locally
  return list.sort((a, b) => {
    const tsA = a.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
    const tsB = b.createdAt as { seconds?: number; toMillis?: () => number } | null | undefined
    const timeA = tsA?.seconds || tsA?.toMillis?.() || 0
    const timeB = tsB?.seconds || tsB?.toMillis?.() || 0
    return timeB - timeA
  })
}
