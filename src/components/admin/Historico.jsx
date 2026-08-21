import { useState } from 'react';
import { fmtDate, solicStatusClass } from '../../lib/helpers';

export default function Historico({ loans }) {
  const [term, setTerm] = useState('');
  const [statusF, setStatusF] = useState('');

  const list = loans.filter((l) => {
    const t = term.trim().toLowerCase();
    const matches = !t || (l.colaboradorNome + ' ' + l.livroTitulo).toLowerCase().includes(t);
    const matchesStatus = !statusF || l.status === statusF;
    return matches && matchesStatus;
  });

  function exportCSV() {
    const rows = [
      ['Colaborador', 'Livro', 'Solicitação', 'Aprovação', 'Empréstimo', 'Prev. devolução', 'Devolução', 'Status', 'Observações'],
    ];
    loans.forEach((l) =>
      rows.push([
        l.colaboradorNome,
        l.livroTitulo,
        fmtDate(l.created_at),
        fmtDate(l.data_aprovacao),
        fmtDate(l.data_emprestimo),
        fmtDate(l.data_prevista_devolucao),
        fmtDate(l.data_devolucao),
        l.status,
        (l.observacoes || '').replace(/[\r\n,]/g, ' '),
      ])
    );
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'historico-biblioteca-nexxus.csv';
    a.click();
  }

  return (
    <section className="admin-page active">
      <div>
        <h2>Histórico</h2>
        <p className="sub">Histórico completo de empréstimos e devoluções.</p>
      </div>

      <div className="admin-toolbar">
        <div className="left-tools">
          <input type="text" placeholder="Colaborador ou livro..." value={term} onChange={(e) => setTerm(e.target.value)} />
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
            <option value="">Todos os status</option>
            <option>Solicitado</option>
            <option>Aprovado</option>
            <option>Recusado</option>
            <option>Aguardando retirada</option>
            <option>Emprestado</option>
            <option>Devolvido</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV}>
          ⬇ Exportar CSV
        </button>
      </div>

      <div className="table-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Livro</th>
              <th>Solicitação</th>
              <th>Empréstimo</th>
              <th>Devolução</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr className="empty-row">
                <td colSpan={6}>Nenhum registro encontrado.</td>
              </tr>
            )}
            {list.map((l) => (
              <tr key={l.id}>
                <td>{l.colaboradorNome}</td>
                <td>{l.livroTitulo}</td>
                <td>{fmtDate(l.created_at)}</td>
                <td>{fmtDate(l.data_emprestimo)}</td>
                <td>{fmtDate(l.data_devolucao)}</td>
                <td>
                  <span className={`badge ${solicStatusClass(l.status)}`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
