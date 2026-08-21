import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import { todayISO } from '../../lib/helpers';

export default function DevolucaoModal({ loan, books, me, onClose, onDone }) {
  const [data, setData] = useState(todayISO());
  const [condicao, setCondicao] = useState('Bom');
  const [responsavel, setResponsavel] = useState(me?.name || '');
  const [obs, setObs] = useState('');
  const [toast, setToast] = useState(null);

  if (!loan) return null;

  async function confirmar() {
    const payload = {
      status: 'Devolvido',
      data_devolucao: data,
      condicao_devolucao: condicao,
      observacoes: obs.trim(),
    };
    const { error } = await sb.from('loans').update(payload).eq('id', loan.id);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    // devolve o exemplar ao estoque
    const book = books.find((b) => b.id === loan.book_id);
    if (book) {
      await sb
        .from('books')
        .update({ quantidade_disponivel: Math.min(book.quantidade_total, (book.quantidade_disponivel || 0) + 1), status: 'Disponível' })
        .eq('id', book.id);
    }
    setToast({ type: 'success', msg: 'Devolução registrada.' });
    await onDone();
    sb.functions.invoke('send-email', { body: { evento: 'devolucao_registrada', loan } }).catch(() => {});
    setTimeout(onClose, 500);
  }

  return (
    <div className="admin-modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3>Registrar devolução</h3>
        <div className="form-grid">
          <label>
            Data da devolução
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </label>
          <label>
            Condição do livro
            <select value={condicao} onChange={(e) => setCondicao(e.target.value)}>
              <option>Excelente</option>
              <option>Bom</option>
              <option>Com pequenas avarias</option>
              <option>Danificado</option>
              <option>Extraviado</option>
            </select>
          </label>
          <label className="full">
            Responsável pelo recebimento
            <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </label>
          <label className="full">
            Observações
            <textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
          </label>
        </div>
        {toast && <div className={`modal-toast ${toast.type} show`}>{toast.msg}</div>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={confirmar}>
            Confirmar devolução
          </button>
        </div>
      </div>
    </div>
  );
}
