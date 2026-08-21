import { createClient } from '@supabase/supabase-js';

// As chaves vêm de variáveis de ambiente (arquivo .env na raiz do projeto),
// nunca hardcoded no código-fonte. Veja .env.example.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    'Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Copie .env.example para .env e preencha os valores.'
  );
}

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ALLOWED_DOMAINS = ['fortes-sobral.com.br', 'grupof5.com.br'];
export const WHO_STORAGE_KEY = 'biblioteca_nexxus_colaborador';
