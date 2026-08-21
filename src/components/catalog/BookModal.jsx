import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import { coverColorClass, shortCategory } from '../../lib/helpers';
import BookIcon from './BookIcon';

export default function BookModal({ book, me, onClose }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null); // { type, msg }
  const [done, setDone] = useState(false);

  const canRequest = book.status === 'Disponível' && book.quantidade_disponivel > 0;

  async function requestLoan() {
    if (!me.employeeId) {
      setToast({ type: 'error', msg: 'Login de administrador não solicita empréstimo — selecione um colaborador para isso.' });
      return;
    }
    setBusy(true);
    const { error } = await sb.from('loans').insert({
      employee_id: me.employeeId,
      book_id: book.id,
      status: 'Solicitado',
    });
    setBusy(false);
    if (error) {
      setToast({ type: 'error', msg: 'Não foi possível enviar sua solicitação: ' + error.message });
      return;
    }
    setToast({ type: 'success', msg: 'Solicitação enviada! O RH vai aprovar e você recebe um aviso por aqui.' });
    setDone(true);

    // Notifica a Edge Function de e-mail (se publicada); falha silenciosamente se não estiver.
    sb.functions
      .invoke('send-email', { body: { evento: 'nova_solicitacao', colaborador: me.name, livro: book.titulo } })
      .catch(() => {});
  }

  return (
    <div className="overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className={`cover-fallback ${coverColorClass(book.categoria)}`}>
          <BookIcon />
        </div>
        <span className="cat">{shortCategory(book.categoria)}</span>
        <h2>{book.titulo}</h2>
        <p className="author">{book.autor || 'Autor não identificado'}</p>
        <div className="modal-meta">
          <div>
            <span>Status</span>
            <strong>{book.status}</strong>
          </div>
          <div>
            <span>Exemplares</span>
            <strong>
              {book.quantidade_disponivel} de {book.quantidade_total} disponível(is)
            </strong>
          </div>
        </div>
        <button className="btn btn-primary" disabled={busy || done} onClick={requestLoan}>
          {done ? 'Solicitação enviada' : busy ? 'Enviando...' : canRequest ? 'Solicitar empréstimo' : 'Entrar na fila de espera'}
        </button>
        {toast && (
          <div className={`modal-toast ${toast.type} show`}>{toast.msg}</div>
        )}
      </div>
    </div>
  );
}
