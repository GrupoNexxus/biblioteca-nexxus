// supabase/functions/send-email/index.ts
//
// Edge Function que envia e-mails via SMTP do Hostweb.
// As credenciais NUNCA ficam no frontend — elas são lidas de
// variáveis de ambiente configuradas no painel do Supabase
// (Project Settings > Edge Functions > Secrets):
//
//   supabase secrets set HOSTWEB_SMTP_HOST=mail.seudominio.com.br
//   supabase secrets set HOSTWEB_SMTP_PORT=465
//   supabase secrets set HOSTWEB_SMTP_USER=notificacoes@grupof5.com.br
//   supabase secrets set HOSTWEB_SMTP_PASS=********
//   supabase secrets set HOSTWEB_FROM_EMAIL=notificacoes@grupof5.com.br
//   supabase secrets set HOSTWEB_FROM_NAME="Biblioteca Nexxus"
//
// Deploy:
//   supabase functions deploy send-email
//
// Chamada a partir do app (já autenticado via Supabase Auth):
//   await sb.functions.invoke('send-email', {
//     body: { to, subject, html }
//   });
//
// Este arquivo não pode ser criado nem publicado por mim diretamente —
// eu não tenho acesso à sua conta/projeto Supabase nem às credenciais
// reais do Hostweb. Copie este arquivo para o seu projeto local do
// Supabase e rode o deploy.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const HOSTWEB_SMTP_HOST = Deno.env.get("HOSTWEB_SMTP_HOST")!;
const HOSTWEB_SMTP_PORT = Number(Deno.env.get("HOSTWEB_SMTP_PORT") ?? "465");
const HOSTWEB_SMTP_USER = Deno.env.get("HOSTWEB_SMTP_USER")!;
const HOSTWEB_SMTP_PASS = Deno.env.get("HOSTWEB_SMTP_PASS")!;
const HOSTWEB_FROM_EMAIL = Deno.env.get("HOSTWEB_FROM_EMAIL")!;
const HOSTWEB_FROM_NAME = Deno.env.get("HOSTWEB_FROM_NAME") ?? "Biblioteca Nexxus";

serve(async (req) => {
  try {
    // Verifica que quem chamou está autenticado (colaborador ou admin)
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), { status: 401 });
    }

    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Campos 'to', 'subject' e 'html' são obrigatórios." }), { status: 400 });
    }

    const client = new SMTPClient({
      connection: {
        hostname: HOSTWEB_SMTP_HOST,
        port: HOSTWEB_SMTP_PORT,
        tls: true,
        auth: { username: HOSTWEB_SMTP_USER, password: HOSTWEB_SMTP_PASS },
      },
    });

    await client.send({
      from: `${HOSTWEB_FROM_NAME} <${HOSTWEB_FROM_EMAIL}>`,
      to,
      subject,
      content: "text/html",
      html,
    });

    await client.close();

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
