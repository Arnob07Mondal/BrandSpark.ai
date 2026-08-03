import {
  db,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '../lib/firestore'
import type { Project } from '../types/project'

const PROJECTS_COLLECTION = 'projects'

/**
 * Fetch the latest 5 projects belonging to the specified user.
 * @param ownerUid User's unique identifier
 */
export async function getRecentProjects(ownerUid: string): Promise<Project[]> {
  const projectsRef = collection(db, PROJECTS_COLLECTION)
  const q = query(
    projectsRef,
    where('ownerUid', '==', ownerUid),
    orderBy('updatedAt', 'desc'),
    limit(5)
  )
  const querySnapshot = await getDocs(q)
  const projects: Project[] = []
  querySnapshot.forEach((docSnap) => {
    projects.push({
      projectId: docSnap.id,
      ...docSnap.data(),
    } as Project)
  })
  return projects
}

/**
 * Fetch a single project document from Firestore.
 * @param projectId The unique project identifier
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return {
      projectId: docSnap.id,
      ...docSnap.data(),
    } as Project
  }
  return null
}

/**
 * Create a new brand project document in Firestore.
 * @param projectData The fields filled out in the creation wizard
 */
export async function createProject(
  projectData: Omit<Project, 'projectId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const projectsRef = collection(db, PROJECTS_COLLECTION)
  const newProjectData = {
    ...projectData,
    status: 'draft' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const cleanedData = Object.fromEntries(
    Object.entries(newProjectData).filter(([, v]) => v !== undefined)
  )
  const docRef = await addDoc(projectsRef, cleanedData)
  return {
    projectId: docRef.id,
    ...newProjectData,
  } as Project
}

/**
 * Update project field values in Firestore.
 * @param projectId Target document ID
 * @param updates Subset of fields to update
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'projectId' | 'ownerUid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const projectDocRef = doc(db, PROJECTS_COLLECTION, projectId)
  await updateDoc(projectDocRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a project document from Firestore.
 * @param projectId Target document ID
 */
export async function deleteProject(projectId: string): Promise<void> {
  const projectDocRef = doc(db, PROJECTS_COLLECTION, projectId)
  await deleteDoc(projectDocRef)
}
