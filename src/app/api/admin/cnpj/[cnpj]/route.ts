import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { consultarCnpjGratuito } from '@/lib/cnpj';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    await requireAdmin();
    const { cnpj } = await params;
    if (!cnpj) {
      return NextResponse.json({ error: 'CNPJ obrigatório' }, { status: 400 });
    }

    const data = await consultarCnpjGratuito(cnpj);
    if (!data) {
      return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao consultar CNPJ' }, { status: 500 });
  }
}
