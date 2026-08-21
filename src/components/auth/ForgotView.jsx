import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';

export default function ForgotView({ onBack }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleForgot() {
    if (!email) return;
    setBusy(true);
    await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
    setBusy(false);
    setSent(true);
  }

  return (
    <div className="view active">
      <span className="back-link" onClick={onBack}>
        ← Voltar para o login
      </span>
      <div>
        <h2>Redefinir senha</h2>
        <p className="sub">Informe seu e-mail. Enviaremos um link para você criar uma nova senha.</p>
      </div>
      <label>
        E-mail
        <input type="email" placeholder="voce@fortes-sobral.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button className="btn btn-primary" disabled={busy} onClick={handleForgot}>
        {busy ? 'Enviando...' : 'Enviar link de redefinição'}
      </button>
      {sent && (
        <div className="toast success show">
          <span>✓</span>
          <span>Se esse e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.</span>
        </div>
      )}
    </div>
  );
}
