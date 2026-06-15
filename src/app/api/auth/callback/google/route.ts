import { NextResponse } from 'next/server';

export function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  const nextUrl = new URL('/auth/callback/google', url.origin);
  if (code) nextUrl.searchParams.set('code', code);
  if (state) nextUrl.searchParams.set('state', state);
  if (error) nextUrl.searchParams.set('error', error);
  if (errorDescription) nextUrl.searchParams.set('error_description', errorDescription);

  return NextResponse.redirect(nextUrl);
}

