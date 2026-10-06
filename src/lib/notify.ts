// Aviso de mensagem nova no WhatsApp (via CallMeBot, gratuito para mandar mensagem para si mesmo).
// Por privacidade, o aviso não leva nome, e-mail nem o texto da mensagem: só avisa e dá o link do admin.
import { env } from './env';

export async function notifyNewMessage(total: number): Promise<void> {
  const phone = env.whatsappNotifyPhone;
  const apikey = env.callmebotApiKey;
  if (!phone || !apikey) return;
  const text = `soubarbarotti.com.br: mensagem nova no formulário de contato (${total} sem ler). Leia em ${env.siteUrl}/admin/mensagens`;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) console.error(`[whatsapp] aviso não enviado (HTTP ${res.status})`);
  } catch (err) {
    console.error('[whatsapp] aviso não enviado:', err instanceof Error ? err.message : err);
  }
}
