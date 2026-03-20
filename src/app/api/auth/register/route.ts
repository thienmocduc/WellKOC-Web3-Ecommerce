export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type UserRole = 'admin' | 'vendor' | 'koc' | 'user';
const VALID_ROLES: UserRole[] = ['user', 'vendor', 'koc'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const userRole: UserRole = VALID_ROLES.includes(role as UserRole)
      ? (role as UserRole)
      : 'user';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration error: missing env vars' },
        { status: 500 }
      );
    }

    // Use raw fetch to Supabase Auth Admin API (avoids SDK fetch issues on Netlify)
    const createUserRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: userRole },
      }),
    });

    const createUserData = await createUserRes.json();

    if (!createUserRes.ok) {
      const errMsg = createUserData?.msg || createUserData?.message || createUserData?.error || 'Failed to create user';
      if (typeof errMsg === 'string' && (errMsg.includes('already') || errMsg.includes('exists'))) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: errMsg },
        { status: createUserRes.status }
      );
    }

    const userId = createUserData?.id;

    // Insert into public.users table via REST API (service role bypasses RLS)
    if (userId) {
      await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: userId,
          email,
          role: userRole,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. You can now log in.',
      userId,
    });
  } catch (err) {
    console.error('Register error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
