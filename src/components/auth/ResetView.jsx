import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';

export default function ResetView({ onDone }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    if (!p1 || p1.length < 8 || p1 !== p2) {
      setError(p1 !== p2 ? 'As senhas não coincidem.' : 'A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    setError('');
    setBusy(true);
    const { error: err } = await sb.auth.updateUser({ password: p1 });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    onDone();
  }

  return (
    <div className="view active">
      <div>
        <h2>Nova senha</h2>
        <p className="sub">Você chegou aqui pelo link enviado por e-mail. Defina sua nova senha de acesso.</p>
      </div>
      <label>
        Nova senha
        <div className="pw-wrap">
          <input
            type={showPw1 ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw1((s) => !s)}>
            {showPw1 ? 'ocultar' : 'mostrar'}
          </button>
        </div>
      </label>
      <label>
        Confirmar nova senha
        <div className="pw-wrap">
          <input
            type={showPw2 ? 'text' : 'password'}
            placeholder="Repita a senha"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw2((s) => !s)}>
            {showPw2 ? 'ocultar' : 'mostrar'}
          </button>
        </div>
      </label>
      {error && <div className="field-msg error show">{error}</div>}
      <button className="btn btn-primary" disabled={busy} onClick={handleReset}>
        {busy ? 'Salvando...' : 'Salvar nova senha'}
      </button>
    </div>
  );
}
