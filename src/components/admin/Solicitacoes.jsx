import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import { fmtDate, solicStatusClass } from '../../lib/helpers';

export default function Solicitacoes({ loans, reloadAdminData, onViewDetail, onDevolucao, onTermo }) {
  const [statusF, setStatusF] = useState('');
  const list = loans.filter((l) => !statusF || l.status === statusF);

  async function aprovar(id) {
    const { error } = await sb.from('loans').update({ status: 'Aprovado', data_aprovacao: new Date().toISOString() }).eq('id', id);
    if (error) {
      window.alert(error.message);
      return;
    }
    await reloadAdminData();
    notify('solicitacao_aprovada', id);
  }
  async function recusar(id) {
    if (!window.confirm('Recusar esta solicitação?')) return;
    const { error } = await sb.from('loans').update({ status: 'Recusado' }).eq('id', id);
    if (error) {
      window.alert(error.message);
      return;
    }
    await reloadAdminData();
    notify('solicitacao_recusada', id);
  }
  async function registrarEmprestimo(id) {
    const dias = window.prompt('Prazo do empréstimo em dias (padrão 14):', '14');
    if (dias === null) return;
    const prazo = new Date();
    prazo.setDate(prazo.getDate() + (parseInt(dias) || 14));

    const { error } = await sb
      .from('loans')
      .update({
        status: 'Emprestado',
        data_emprestimo: new Date().toISOString(),
        data_prevista_devolucao: prazo.toISOString().slice(0, 10),
      })
      .eq('id', id);
    if (error) {
      window.alert(error.message);
      return;
    }

    // Atualiza a disponibilidade do livro no acervo: busca o book_id
    // desta solicitação direto no banco (não depende do formato da
    // lista `loans` recebida por props) e diminui 1 exemplar disponível.
    // Se não sobrar nenhum exemplar, o status do livro vira "Emprestado".
    const { data: loanRow, error: loanErr } = await sb.from('loans').select('book_id').eq('id', id).single();
    if (!loanErr && loanRow?.book_id) {
      const { data: book, error: bookErr } = await sb
        .from('books')
        .select('quantidade_disponivel')
        .eq('id', loanRow.book_id)
        .single();
      if (!bookErr && book) {
        const novaQtd = Math.max(0, (book.quantidade_disponivel ?? 1) - 1);
        await sb
          .from('books')
          .update({
            quantidade_disponivel: novaQtd,
            status: novaQtd === 0 ? 'Emprestado' : 'Disponível',
          })
          .eq('id', loanRow.book_id);
      }
    }

    await reloadAdminData();
    notify('emprestimo_registrado', id);
  }
  function notify(evento, loanId) {
    const loan = loans.find((l) => l.id === loanId);
    sb.functions.invoke('send-email', { body: { evento, loan } }).catch(() => {});
  }

  return (
    <section className="admin-page active">
      <div>
        <h2>Solicitações</h2>
        <p className="sub">Solicitações de empréstimo feitas pelos colaboradores.</p>
      </div>

      <div className="admin-toolbar">
        <div className="left-tools">
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
      </div>

      <div className="table-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Colaborador</th>
              <th>Livro</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr className="empty-row">
                <td colSpan={6}>Nenhuma solicitação encontrada.</td>
              </tr>
            )}
            {list.map((l) => (
              <tr key={l.id}>
                <td>#{l.numero || l.id}</td>
                <td>{l.colaboradorNome}</td>
                <td>{l.livroTitulo}</td>
                <td>{fmtDate(l.created_at)}</td>
                <td>
                  <span className={`badge ${solicStatusClass(l.status)}`}>{l.status}</span>
                </td>
                <td className="actions-cell">
                  <button className="role-btn btn-sm" onClick={() => onViewDetail(l.id)}>
                    Ver
                  </button>
                  {l.status === 'Solicitado' && (
                    <>
                      <button className="role-btn btn-sm" onClick={() => aprovar(l.id)}>
                        Aprovar
                      </button>
                      <button className="role-btn btn-sm" onClick={() => recusar(l.id)}>
                        Recusar
                      </button>
                    </>
                  )}
                  {(l.status === 'Aprovado' || l.status === 'Aguardando retirada') && (
                    <button className="role-btn btn-sm" onClick={() => registrarEmprestimo(l.id)}>
                      Registrar empréstimo
                    </button>
                  )}
                  {l.status === 'Emprestado' && (
                    <button className="role-btn btn-sm" onClick={() => onDevolucao(l.id)}>
                      Registrar devolução
                    </button>
                  )}
                  {['Emprestado', 'Aprovado', 'Aguardando retirada'].includes(l.status) && (
                    <button className="role-btn btn-sm" onClick={() => onTermo(l.id)}>
                      Emitir termo
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}