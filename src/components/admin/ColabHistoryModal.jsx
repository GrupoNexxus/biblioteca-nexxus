import { fmtDate, isAtrasado } from '../../lib/helpers';

export default function ColabHistoryModal({ employee, loans, onClose }) {
  const atrasos = loans.filter(isAtrasado).length;
  const emAndamento = loans.filter((l) => l.status === 'Emprestado');

  return (
    <div className="admin-modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal wide">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3>Histórico — {employee.name}</h3>
        <div className="detail-block">
          <div className="detail-row">
            <span>Total de empréstimos</span>
            <span>{loans.length}</span>
          </div>
          <div className="detail-row">
            <span>Livros com o colaborador agora</span>
            <span>{emAndamento.length}</span>
          </div>
          <div className="detail-row">
            <span>Atrasos</span>
            <span>{atrasos}</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="dtable">
            <thead>
              <tr>
                <th>Livro</th>
                <th>Solicitação</th>
                <th>Empréstimo</th>
                <th>Devolução</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={5}>Sem histórico.</td>
                </tr>
              )}
              {loans.map((l) => (
                <tr key={l.id} className={isAtrasado(l) ? 'atrasado' : ''}>
                  <td>{l.livroTitulo}</td>
                  <td>{fmtDate(l.created_at)}</td>
                  <td>{fmtDate(l.data_emprestimo)}</td>
                  <td>{fmtDate(l.data_devolucao)}</td>
                  <td>
                    <span className="badge indisponivel">{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
