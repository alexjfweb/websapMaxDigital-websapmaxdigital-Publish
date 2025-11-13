
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

async function getTableLogs(tableId: string) {
    const db = getDb();
    const logsCollection = collection(db, 'tableLogs');
    const q = query(logsCollection, where('tableId', '==', tableId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString()
        }
    });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;
    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }
    const logs = await getTableLogs(tableId);
    return NextResponse.json(logs, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch table logs', details: error.message }, { status: 500 });
  }
}
