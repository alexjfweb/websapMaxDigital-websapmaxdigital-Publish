// This file is no longer needed and can be deleted.
// The new logic in storage-service.ts handles uploads directly on the client.
// To prevent any potential issues, we'll leave it empty.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use client-side uploads.' },
    { status: 410 }
  );
}
