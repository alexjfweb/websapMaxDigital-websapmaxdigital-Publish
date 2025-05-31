
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, type DocumentData } from 'firebase/firestore';
import type { ProjectInput } from '@/types';

/**
 * Adds a new project document to the 'projects' collection in Firestore.
 * @param projectData The data for the new project, excluding id, createdAt, and updatedAt.
 * @returns The ID of the newly created project document.
 * @throws Throws an error if the project creation fails.
 */
export async function addProjectToFirestore(projectData: ProjectInput): Promise<string> {
  try {
    const projectDocument: DocumentData = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'projects'), projectDocument);
    console.log('Project added to Firestore with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding project to Firestore: ', error);
    // In a real application, you might want to throw a more specific custom error
    // or handle this error in a way that provides better feedback to the user.
    throw new Error('Failed to add project to Firestore.');
  }
}
