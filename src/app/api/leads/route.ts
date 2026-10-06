import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const etapa = searchParams.get('etapa');
    const prioridade = searchParams.get('prioridade');
    const q = searchParams.get('q');

    const where: Record<string, unknown> = {};
    if (etapa && etapa !== 'todos') {
      where.etapa = etapa;
    }
    if (prioridade && prioridade !== 'todas') {
      where.prioridade = parseInt(prioridade, 10);
    }
    if (q) {
      where.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { bairro: { contains: q, mode: 'insensitive' } },
        { nomeSocio: { contains: q, mode: 'insensitive' } },
        { cnpj: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { cidade: { contains: q, mode: 'insensitive' } },
        { estado: { contains: q, mode: 'insensitive' } },
        { nicho: { contains: q, mode: 'insensitive' } },
        { instagram: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [leads, statusCounts] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.groupBy({
        by: ['etapa'],
        _count: { _all: true },
      }),
    ]);

    const countsMap: Record<string, number> = {
      novo: 0,
      chamado: 0,
      respondeu: 0,
      call: 0,
      proposta: 0,
      fechado: 0,
      perdido: 0,
      total: leads.length,
    };

    for (const c of statusCounts) {
      countsMap[c.etapa] = c._count._all;
    }

    return NextResponse.json({
      leads,
      counts: countsMap,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Não autorizado';
    return NextResponse.json({ error: errorMsg }, { status: 401 });
  }
}
