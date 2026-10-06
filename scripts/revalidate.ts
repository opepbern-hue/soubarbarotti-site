import { loadEnv } from './load-env';
import { revalidateToken } from '../src/lib/revalidate-token';

loadEnv();

async function main() {
  const token = revalidateToken(process.env.SESSION_SECRET || '');
  console.log('Enviando requisição de revalidação para http://localhost:3000/api/revalidate...');
  const res = await fetch('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: {
      'x-revalidate-token': token,
    },
  });
  const data = await res.json();
  console.log('Resultado da revalidação:', data);
}

main().catch(console.error);
