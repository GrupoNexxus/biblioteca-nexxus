import { fmtDate } from '../../lib/helpers';

export default function LoanDetailModal({ loan, onClose }) {
  if (!loan) return null;
  return (
    <div className="admin-modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3>Detalhes</h3>
        <div className="detail-block">
          <h4>Colaborador</h4>
          <div className="detail-row">
            <span>Nome</span>
            <span>{loan.colaboradorNome}</span>
          </div>
          <div className="detail-row">
            <span>E-mail</span>
            <span>{loan.employees?.email || '—'}</span>
          </div>
        </div>
        <div className="detail-block">
          <h4>Livro</h4>
          <div className="detail-row">
            <span>Título</span>
            <span>{loan.livroTitulo}</span>
          </div>
          <div className="detail-row">
            <span>Autor</span>
            <span>{loan.livroAutor}</span>
          </div>
        </div>
        <div className="detail-block">
          <h4>Movimentação</h4>
          <div className="detail-row">
            <span>Solicitação</span>
            <span>{fmtDate(loan.created_at)}</span>
          </div>
          <div className="detail-row">
            <span>Aprovação</span>
            <span>{fmtDate(loan.data_aprovacao)}</span>
          </div>
          <div className="detail-row">
            <span>Empréstimo</span>
            <span>{fmtDate(loan.data_emprestimo)}</span>
          </div>
          <div className="detail-row">
            <span>Prev. devolução</span>
            <span>{fmtDate(loan.data_prevista_devolucao)}</span>
          </div>
          <div className="detail-row">
            <span>Devolução efetiva</span>
            <span>{fmtDate(loan.data_devolucao)}</span>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <span>{loan.status}</span>
          </div>
          <div className="detail-row">
            <span>Observações</span>
            <span>{loan.observacoes || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
