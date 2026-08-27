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

// ---- "Lembrar de mim" (admin/RH) ----
// A preferência em si (marcou ou não a caixinha) fica sempre salva no
// localStorage, com essa chave — é ela que decide, a cada carregamento
// da página, em qual dos dois "cofres" do navegador procurar a sessão:
//   - localStorage  -> sessão sobrevive a fechar/abrir o navegador de novo
//   - sessionStorage -> sessão morre quando a aba/janela é fechada
export const REMEMBER_ADMIN_KEY = 'biblioteca_nexxus_lembrar_admin';

export function setRememberAdmin(remember) {
  localStorage.setItem(REMEMBER_ADMIN_KEY, remember ? 'true' : 'false');
}

function isRememberAdminOn() {
  // Se a pessoa nunca escolheu, o padrão é "lembrar" (mesmo comportamento
  // de antes, quando não existia essa opção).
  const saved = localStorage.getItem(REMEMBER_ADMIN_KEY);
  return saved === null ? true : saved === 'true';
}

// Adaptador de storage "dinâmico": todo pedido de leitura/escrita da sessão
// do Supabase passa por aqui, e a gente decide na hora se vai pro
// localStorage ou pro sessionStorage, de acordo com a preferência atual.
const dynamicAuthStorage = {
  getItem: (key) => (isRememberAdminOn() ? window.localStorage : window.sessionStorage).getItem(key),
  setItem: (key, value) => (isRememberAdminOn() ? window.localStorage : window.sessionStorage).setItem(key, value),
  removeItem: (key) => (isRememberAdminOn() ? window.localStorage : window.sessionStorage).removeItem(key),
};

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: dynamicAuthStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const ALLOWED_DOMAINS = ['fortes-sobral.com.br', 'grupof5.com.br'];
export const WHO_STORAGE_KEY = 'biblioteca_nexxus_colaborador';