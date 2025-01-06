import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message, error } = await request.json();
  console.error('Client-side error:', message, error);
  return NextResponse.json({ status: 'logged' });
}

