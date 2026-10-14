import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbOk = false;
  let projectCount = 0;
  let mediaCount = 0;
  let dbError: string | null = null;

  try {
    const [p, m] = await Promise.all([
      prisma.project.count(),
      prisma.media.count(),
    ]);
    dbOk = true;
    projectCount = p;
    mediaCount = m;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    status: dbOk ? 'ok' : 'degraded',
    version: 'v2-supabase',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbOk,
      projects: projectCount,
      media: mediaCount,
      error: dbError,
    },
  });
}
