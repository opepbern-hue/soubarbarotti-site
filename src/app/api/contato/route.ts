import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyNewMessage } from '@/lib/notify';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    // Grava a mensagem no banco local
    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    // Grava também no Supabase (pedidos_orcamento) com redundância
    const SUPABASE_URL = 'https://xvabghgvrhpnyywpmodb.supabase.co';
    const ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWJnaGd2cmhwbnl5d3Btb2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NTgwNTEsImV4cCI6MjEwNzMzNDA1MX0.d0CNiaTYEnpsCY4N9qS6HNIxa3u7DYtzAOErvZHzC0w';

    fetch(`${SUPABASE_URL}/rest/v1/pedidos_orcamento`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        numero: String(Date.now()).slice(-4),
        cliente_nome: name,
        cliente_email: email,
        mensagem: message,
        origem: 'site_portfolio',
        status: 'novo',
      }),
    }).catch((e) => console.warn('[contato] Aviso: sync com Supabase:', e));

    const unreadCount = await prisma.contactMessage.count({ where: { readAt: null, archived: false } });
    notifyNewMessage(unreadCount).catch(() => {});

    return NextResponse.json({ success: true, id: created.id });
  } catch (err) {
    console.error('[contato] Erro ao salvar mensagem:', err);
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }
}
