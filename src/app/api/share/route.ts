// This file is intentionally left blank. 
// The logic has been moved to /app/landing/[...path]/page.tsx
// to correctly use Next.js metadata generation.
// Deleting this file caused build issues, so we are keeping it empty.
import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('This endpoint is deprecated. Use /landing/restaurant/...', { status: 410 });
}
