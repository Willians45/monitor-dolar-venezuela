import { NextResponse } from 'next/server';
import { getRates } from '@/lib/api';

export const revalidate = 60; // Cache on Vercel edge for 60 seconds

export async function GET() {
  try {
    const rates = await getRates();
    if (!rates) {
      return NextResponse.json({ error: "No se pudieron obtener las tasas" }, { status: 500 });
    }
    return NextResponse.json(rates);
  } catch (err) {
    return NextResponse.json({ error: "Fallo interno" }, { status: 500 });
  }
}
