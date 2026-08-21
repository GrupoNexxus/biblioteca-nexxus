import { useMemo, useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import ColabModal from './ColabModal';
import ColabHistoryModal from './ColabHistoryModal';

export default function Colaboradores({ employees, loans, reloadAdminData }) {
  const [term, setTerm] = useState('');
  const [statusF, setStatusF] = useState('');
  const [editing, setEditing] = useState(null); // employee object | 'new' | null
  const [historyOf, setHistoryOf] = useState(null); // employee object | null

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return employees.filter((e) => {
      const matches = !t || [e.name, e.cpf, e.email, e.area].filter(Boolean).some((v) => v.toLowerCase().includes(t));
      const matchesStatus = !statusF || (statusF === 'ativo' ? e.active : !e.active);
      return matches && matchesStatus;
    });
  }, [employees, term, statusF]);

  // Exclui o cadastro do colaborador. Se ele já tiver algum empréstimo no
  // histórico, não apaga de verdade (quebraria o histórico) — em vez disso
  // oferece desativar, que já tira a pessoa da lista "Quem é você?" sem
  // perder os registros antigos.
  async function excluirColaborador(emp) {
    const temHistorico = loans.some((l) => l.employee_id === emp.id);

    if (temHistorico) {
      const desativar = window.confirm(
        `"${emp.name}" já tem empréstimos no histórico, então não dá pra excluir o cadastro sem perder esse histórico.\n\n` +
          `Quer desativar o colaborador no lugar? Ele deixa de aparecer na lista "Quem é você?" pros colegas, mas o histórico fica salvo.`
      );
      if (!desativar) return;
      const { error } = await sb.from('employees').update({ active: false }).eq('id', emp.id);
      if (error) window.alert('Não foi possível desativar: ' + error.message);
      else await reloadAdminData();
      return;
    }

    if (!window.confirm(`Excluir o cadastro de "${emp.name}"? Essa ação não pode ser desfeita.`)) return;
    const { error } = await sb.from('employees').delete().eq('id', emp.id);
    if (error) window.alert('Não foi possível excluir: ' + error.message);
    else await reloadAdminData();
  }

  return (
    <section className="admin-page active">
      <div>
        <h2>Colaboradores</h2>
        <p className="sub">Cadastro e gerenciamento dos colaboradores.</p>
      </div>

      <div className="admin-toolbar">
        <div className="left-tools">
          <input type="text" placeholder="Nome, CPF, e-mail ou setor..." value={term} onChange={(e) => setTerm(e.target.value)} />
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          + Novo colaborador
        </button>
      </div>

      <div className="table-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Setor / Cargo</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="empty-row">
                <td colSpan={5}>Nenhum colaborador encontrado.</td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>
                  <strong>{e.name}</strong>
                </td>
                <td>
                  {e.area || '—'}
                  {e.cargo ? ' · ' + e.cargo : ''}
                </td>
                <td>{e.email || '—'}</td>
                <td>
                  <span className={`badge ${e.active ? 'disponivel' : 'indisponivel'}`}>{e.active ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td className="actions-cell">
                  <button className="role-btn btn-sm" onClick={() => setEditing(e)}>
                    Editar
                  </button>
                  <button className="role-btn btn-sm" onClick={() => setHistoryOf(e)}>
                    Histórico
                  </button>
                  <button className="role-btn btn-sm btn-danger-outline" onClick={() => excluirColaborador(e)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ColabModal
          employee={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={reloadAdminData}
        />
      )}
      {historyOf && (
        <ColabHistoryModal employee={historyOf} loans={loans.filter((l) => l.employee_id === historyOf.id)} onClose={() => setHistoryOf(null)} />
      )}
    </section>
  );
}