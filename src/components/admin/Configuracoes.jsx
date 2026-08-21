import { useEffect, useState } from 'react';
import { sb } from '../../lib/supabaseClient';

export default function Configuracoes() {
  const [profiles, setProfiles] = useState(null); // null = loading
  const [profilesError, setProfilesError] = useState('');
  const [cfg, setCfg] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    security: 'SSL',
    from_email: '',
    from_name: '',
    to_email: 'rh@grupof5.com.br',
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProfiles();
    loadEmailSettings();
  }, []);

  async function loadProfiles() {
    const { data, error } = await sb.from('profiles').select('id, name, email, role').order('name');
    if (error) setProfilesError(error.message);
    else setProfiles(data || []);
  }

  async function loadEmailSettings() {
    const { data } = await sb.from('email_settings').select('*').eq('id', 1).maybeSingle();
    if (data) {
      setCfg({
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || '',
        smtp_user: data.smtp_user || '',
        security: data.security || 'SSL',
        from_email: data.from_email || '',
        from_name: data.from_name || '',
        to_email: data.to_email || 'rh@grupof5.com.br',
      });
    }
  }

  async function updateRole(id, newRole) {
    const { error } = await sb.from('profiles').update({ role: newRole }).eq('id', id);
    if (error) window.alert('Não foi possível alterar a permissão: ' + error.message);
    else setProfiles((ps) => ps.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
    await sb.from('activity_logs').insert({ acao: 'alterar_permissao', detalhes: { profileId: id, newRole } }).select().maybeSingle().catch(() => {});
  }

  function set(field, value) {
    setCfg((c) => ({ ...c, [field]: value }));
  }

  async function saveEmailSettings() {
    const payload = { id: 1, ...cfg, smtp_port: parseInt(cfg.smtp_port) || null, updated_at: new Date().toISOString() };
    const { error } = await sb.from('email_settings').upsert(payload);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({
      type: 'success',
      msg: 'Configuração salva. Lembre-se: a senha SMTP é definida separadamente, como variável de ambiente da Edge Function que envia os e-mails.',
    });
  }

  // ---- Envio de e-mail de teste ----
  // Antes, o catch não capturava o erro real (catch { ... } sem variável),
  // então SEMPRE mostrava a mesma mensagem genérica de "função não publicada",
  // não importa qual fosse o problema de verdade. Agora capturamos o erro
  // (catch (err)) e mostramos o motivo real na tela e no Console (F12).
  async function sendTestEmail() {
    setToast({ type: 'success', msg: 'Enviando e-mail de teste...' });
    try {
      const { data, error } = await sb.functions.invoke('send-email', {
        body: {
          to: cfg.to_email,
          subject: 'Teste de integração — Biblioteca Nexxus',
          html: '<p>Este é um e-mail de teste da integração Hostweb da Biblioteca Nexxus.</p>',
        },
      });

      // Log completo no Console (F12 > Console) para diagnóstico
      console.log('[send-email] data:', data, 'error:', error);

      if (error) throw error;

      setToast({ type: 'success', msg: 'E-mail de teste enviado com sucesso.' });
    } catch (err) {
      console.error('[send-email] erro real:', err);

      // Monta a mensagem mais específica possível a partir do erro real
      let detalhe = err?.message || 'Erro desconhecido.';
      if (err?.context) {
        try {
          const body = await err.context.json?.();
          if (body?.error) detalhe = body.error;
        } catch {
          // se não der pra ler o corpo da resposta, mantém err.message mesmo
        }
      }

      setToast({
        type: 'error',
        msg: 'Erro ao enviar e-mail de teste: ' + detalhe,
      });
    }
  }

  return (
    <section className="admin-page active">
      <div>
        <h2>Configurações</h2>
        <p className="sub">Integração de e-mail (Hostweb) e permissões.</p>
      </div>

      <div className="panel-box">
        <h3>Permissões de acesso</h3>
        <p className="sub" style={{ margin: '-4px 0 12px' }}>
          Defina quem é Administrador, Operador da Biblioteca ou Colaborador.
        </p>
        <div className="admin-table">
          {profilesError && <div className="admin-row"><span style={{ color: 'var(--red)' }}>Erro ao carregar: {profilesError}</span></div>}
          {!profilesError && profiles === null && <div className="admin-row"><span>Carregando colaboradores...</span></div>}
          {profiles &&
            profiles.map((u) => (
              <div className="admin-row" key={u.id}>
                <div className="admin-user">
                  <strong>{u.name || u.email}</strong>
                  <span>{u.email}</span>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'admin' : 'collab'}`}>
                  {u.role === 'admin' ? 'Administrador' : u.role === 'operator' ? 'Operador' : 'Colaborador'}
                </span>
                <select className="role-btn" value={u.role || 'collaborator'} onChange={(e) => updateRole(u.id, e.target.value)}>
                  <option value="collaborator">Colaborador</option>
                  <option value="operator">Operador da Biblioteca</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            ))}
        </div>
      </div>

      <div className="panel-box">
        <h3>E-mail corporativo (Hostweb)</h3>
        <p className="sub" style={{ margin: '-4px 0 12px' }}>
          Estes campos ficam salvos no banco só para referência na tela. A senha SMTP nunca é salva nem lida aqui — ela deve ser
          configurada como variável de ambiente de uma Edge Function no Supabase, que é quem efetivamente envia os e-mails.
        </p>
        <div className="form-grid">
          <label>
            Servidor SMTP
            <input type="text" placeholder="mail.seudominio.com.br" value={cfg.smtp_host} onChange={(e) => set('smtp_host', e.target.value)} />
          </label>
          <label>
            Porta
            <input type="text" placeholder="465" value={cfg.smtp_port} onChange={(e) => set('smtp_port', e.target.value)} />
          </label>
          <label>
            Usuário / e-mail
            <input type="text" placeholder="notificacoes@grupof5.com.br" value={cfg.smtp_user} onChange={(e) => set('smtp_user', e.target.value)} />
          </label>
          <label>
            Segurança
            <select value={cfg.security} onChange={(e) => set('security', e.target.value)}>
              <option value="SSL">SSL</option>
              <option value="TLS">TLS</option>
            </select>
          </label>
          <label>
            E-mail remetente
            <input type="text" placeholder="notificacoes@grupof5.com.br" value={cfg.from_email} onChange={(e) => set('from_email', e.target.value)} />
          </label>
          <label>
            Nome do remetente
            <input type="text" placeholder="Biblioteca Nexxus" value={cfg.from_name} onChange={(e) => set('from_name', e.target.value)} />
          </label>
          <label className="full">
            E-mail de destino das notificações
            <input type="text" placeholder="rh@grupof5.com.br" value={cfg.to_email} onChange={(e) => set('to_email', e.target.value)} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={saveEmailSettings}>
            Salvar configuração
          </button>
          <button className="btn btn-outline btn-sm" onClick={sendTestEmail}>
            Enviar e-mail de teste
          </button>
        </div>
        {toast && <div className={`modal-toast ${toast.type} show`} style={{ marginTop: 12 }}>{toast.msg}</div>}
      </div>
    </section>
  );
}