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

    // Grava a mensagem no banco
    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    const unreadCount = await prisma.contactMessage.count({ where: { readAt: null, archived: false } });
    notifyNewMessage(unreadCount).catch(() => {});

    return NextResponse.json({ success: true, id: created.id });
  } catch (err) {
    console.error('[contato] Erro ao salvar mensagem:', err);
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }
}
