import { useState } from 'react';
import { fmtDate, isAtrasado, isVencendo, solicStatusClass } from '../../lib/helpers';

export default function Emprestimos({ loans, onViewDetail, onDevolucao, onTermo }) {
  const [filter, setFilter] = useState('todos');

  let list = loans.filter((l) => ['Emprestado', 'Devolvido'].includes(l.status));
  if (filter === 'andamento') list = list.filter((l) => l.status === 'Emprestado');
  if (filter === 'vencendo') list = list.filter(isVencendo);
  if (filter === 'atrasados') list = list.filter(isAtrasado);
  if (filter === 'devolvidos') list = list.filter((l) => l.status === 'Devolvido');

  return (
    <section className="admin-page active">
      <div>
        <h2>Empréstimos</h2>
        <p className="sub">Livros atualmente emprestados.</p>
      </div>

      <div className="admin-toolbar">
        <div className="left-tools">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="andamento">Em andamento</option>
            <option value="vencendo">Próximos do vencimento</option>
            <option value="atrasados">Atrasados</option>
            <option value="devolvidos">Devolvidos</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Livro</th>
              <th>Empréstimo</th>
              <th>Prev. devolução</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr className="empty-row">
                <td colSpan={6}>Nenhum empréstimo encontrado.</td>
              </tr>
            )}
            {list.map((l) => (
              <tr key={l.id} className={isAtrasado(l) ? 'atrasado' : ''}>
                <td>{l.colaboradorNome}</td>
                <td>{l.livroTitulo}</td>
                <td>{fmtDate(l.data_emprestimo)}</td>
                <td>{fmtDate(l.data_prevista_devolucao)}</td>
                <td>
                  <span className={`badge ${solicStatusClass(l.status)}`}>{isAtrasado(l) ? 'Atrasado' : l.status}</span>
                </td>
                <td className="actions-cell">
                  <button className="role-btn btn-sm" onClick={() => onViewDetail(l.id)}>
                    Ver
                  </button>
                  {l.status === 'Emprestado' && (
                    <button className="role-btn btn-sm" onClick={() => onDevolucao(l.id)}>
                      Devolução
                    </button>
                  )}
                  <button className="role-btn btn-sm" onClick={() => onTermo(l.id)}>
                    Termo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
