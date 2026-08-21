import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';

export default function ColabModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: employee?.name || '',
    cpf: employee?.cpf || '',
    email: employee?.email || '',
    telefone: employee?.telefone || '',
    empresa: employee?.empresa || 'Fortes Tecnologia',
    area: employee?.area || '',
    cargo: employee?.cargo || '',
    active: employee ? !!employee.active : true,
  });
  const [toast, setToast] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    if (!form.name.trim()) {
      setToast({ type: 'error', msg: 'Informe o nome completo.' });
      return;
    }
    const { error } = employee
      ? await sb.from('employees').update(form).eq('id', employee.id)
      : await sb.from('employees').insert(form);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({ type: 'success', msg: 'Salvo com sucesso.' });
    await onSaved();
    setTimeout(onClose, 500);
  }

  return (
    <div className="admin-modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3>{employee ? 'Editar colaborador' : 'Novo colaborador'}</h3>
        <div className="form-grid">
          <label className="full">
            Nome completo
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label>
            CPF ou matrícula
            <input type="text" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} />
          </label>
          <label>
            E-mail corporativo
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label>
            Telefone
            <input type="text" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
          </label>
          <label>
            Empresa
            <select value={form.empresa} onChange={(e) => set('empresa', e.target.value)}>
              <option>Fortes Tecnologia</option>
              <option>F5 Automação</option>
            </select>
          </label>
          <label>
            Departamento/Setor
            <input type="text" value={form.area} onChange={(e) => set('area', e.target.value)} />
          </label>
          <label>
            Cargo
            <input type="text" value={form.cargo} onChange={(e) => set('cargo', e.target.value)} />
          </label>
          <label>
            Status
            <select value={String(form.active)} onChange={(e) => set('active', e.target.value === 'true')}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
        </div>
        {toast && <div className={`modal-toast ${toast.type} show`}>{toast.msg}</div>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
