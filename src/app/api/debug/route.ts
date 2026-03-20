export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Test basic fetch to Supabase health endpoint
  let fetchResult = 'not tested';
  try {
    const testUrl = `${supabaseUrl}/rest/v1/`;
    const res = await fetch(testUrl, {
      headers: { 'apikey': anonKey },
    });
    fetchResult = `status=${res.status}`;
  } catch (err) {
    fetchResult = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : 'NOT SET',
    serviceKeySet: serviceKey.length > 0 ? `yes (${serviceKey.length} chars)` : 'NOT SET',
    anonKeySet: anonKey.length > 0 ? `yes (${anonKey.length} chars)` : 'NOT SET',
    fetchResult,
    nodeVersion: process.version,
  });
}
