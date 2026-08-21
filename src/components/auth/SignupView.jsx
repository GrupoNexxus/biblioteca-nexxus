import { useState } from 'react';
import { sb, ALLOWED_DOMAINS } from '../../lib/supabaseClient';
import { emailDomainOk } from '../../lib/helpers';

export default function SignupView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [dept, setDept] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const emailInvalid = email.length > 0 && !emailDomainOk(email, ALLOWED_DOMAINS);

  function strengthScore(val) {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }
  const score = strengthScore(password);
  const colors = ['var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)'];

  async function handleSignup() {
    if (!name || !email || !company || !dept || !password) {
      setToast({ type: 'error', msg: 'Preencha todos os campos para continuar.' });
      return;
    }
    if (!emailDomainOk(email, ALLOWED_DOMAINS)) {
      setToast({ type: 'error', msg: 'Cadastro permitido apenas com e-mail @fortes-sobral.com.br ou @grupof5.com.br.' });
      return;
    }
    if (password.length < 8) {
      setToast({ type: 'error', msg: 'A senha precisa ter pelo menos 8 caracteres.' });
      return;
    }
    setBusy(true);
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name, company, department: dept } },
    });
    setBusy(false);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({ type: 'success', msg: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.' });
  }

  return (
    <div className="view active">
      <div>
        <h2>Criar sua conta</h2>
        <p className="sub">Use seu e-mail corporativo (@fortes-sobral.com.br ou @grupof5.com.br).</p>
      </div>
      <label>
        Nome completo
        <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        E-mail corporativo
        <input
          type="email"
          placeholder="voce@fortes-sobral.com.br"
          className={emailInvalid ? 'error' : ''}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {emailInvalid && (
        <div className="field-msg error show">Use um e-mail @fortes-sobral.com.br ou @grupof5.com.br.</div>
      )}
      <div className="row-2">
        <label>
          Empresa
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 14,
              padding: '11px 13px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
          >
            <option value="">Selecione</option>
            <option>Fortes Tecnologia</option>
            <option>F5 Automação</option>
          </select>
        </label>
        <label>
          Setor
          <input type="text" placeholder="Ex: Suporte" value={dept} onChange={(e) => setDept(e.target.value)} />
        </label>
      </div>
      <label>
        Senha
        <div className="pw-wrap">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}>
            {showPw ? 'ocultar' : 'mostrar'}
          </button>
        </div>
      </label>
      <div className="strength">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ background: i < score ? colors[score - 1] : 'var(--border)' }}></span>
        ))}
      </div>
      {toast && (
        <div className={`toast ${toast.type} show`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
      <button className="btn btn-primary" disabled={busy} onClick={handleSignup}>
        {busy ? 'Criando conta...' : 'Criar conta'}
      </button>
      <p className="sub" style={{ textAlign: 'center', marginTop: -4 }}>
        Ao continuar, você concorda em receber e-mails sobre seus empréstimos.
      </p>
    </div>
  );
}
