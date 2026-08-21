import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';

export default function LoginView({ onBackToWho, onForgot, onGoSignup, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setBusy(true);
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : err.message === 'Email not confirmed'
          ? 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
          : err.message
      );
      return;
    }
    setError('');
    onLoggedIn();
  }

  return (
    <div className="view active">
      <div>
        <h2>Bem-vindo de volta</h2>
        <p className="sub">Entre com seu e-mail corporativo para acessar o acervo.</p>
      </div>
      <span className="back-link" onClick={onBackToWho}>
        ← Sou colaborador
      </span>

      {error && (
        <div className="toast error show">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <label>
        E-mail
        <input type="email" placeholder="voce@fortes-sobral.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Senha
        <div className="pw-wrap">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}>
            {showPw ? 'ocultar' : 'mostrar'}
          </button>
        </div>
      </label>
      <div className="link-row">
        <span></span>
        <span className="btn-ghost" onClick={onForgot}>
          Esqueci minha senha
        </span>
      </div>
      <button className="btn btn-primary" disabled={busy} onClick={handleLogin}>
        {busy ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="sub" style={{ textAlign: 'center', marginTop: -4 }}>
        Ainda não tem conta?{' '}
        <span className="btn-ghost" style={{ display: 'inline', fontSize: 13 }} onClick={onGoSignup}>
          Criar conta
        </span>
      </p>
    </div>
  );
}
