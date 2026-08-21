import { useMemo, useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import { fmtDate, shortCategory, statusClass } from '../../lib/helpers';
import LivroModal from './LivroModal';

export default function Livros({ books, categories, loans, reloadAdminData }) {
  const [term, setTerm] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editing, setEditing] = useState(null); // book | 'new' | null

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return books.filter((b) => {
      const matches = !t || [b.titulo, b.autor, b.isbn, b.codigo_patrimonio].filter(Boolean).some((v) => v.toLowerCase().includes(t));
      const matchesCat = !filterCat || b.categoria === filterCat;
      const matchesStatus = !filterStatus || b.status === filterStatus;
      return matches && matchesCat && matchesStatus;
    });
  }, [books, term, filterCat, filterStatus]);

  // Volta o livro para o acervo ativo: status "Disponível", restaura os
  // exemplares disponíveis (assume que todos os exemplares voltaram) e,
  // se o livro tinha sido desativado (soft delete), reativa também.
  async function reativarLivro(book) {
    if (!window.confirm(`Reativar "${book.titulo}" para empréstimo?`)) return;
    const { error } = await sb
      .from('books')
      .update({
        status: 'Disponível',
        quantidade_disponivel: book.quantidade_total,
        active: true,
      })
      .eq('id', book.id);
    if (error) {
      window.alert('Não foi possível reativar o livro: ' + error.message);
      return;
    }
    await reloadAdminData();
  }

  return (
    <section className="admin-page active">
      <div>
        <h2>Livros</h2>
        <p className="sub">Cadastro e gerenciamento do acervo.</p>
      </div>

      <div className="admin-toolbar">
        <div className="left-tools">
          <input type="text" placeholder="Título, autor, ISBN ou código..." value={term} onChange={(e) => setTerm(e.target.value)} />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {shortCategory(c.name)}
              </option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option>Disponível</option>
            <option>Emprestado</option>
            <option>Reservado</option>
            <option>Indisponível</option>
            <option>Manutenção</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          + Cadastrar novo livro
        </button>
      </div>

      <div className="table-wrap">
        <table className="dtable">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoria</th>
              <th>Código</th>
              <th>Status</th>
              <th>Com quem / prazo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="empty-row">
                <td colSpan={7}>Nenhum livro encontrado.</td>
              </tr>
            )}
            {filtered.map((b) => {
              const activeLoan = loans.find((l) => l.book_id === b.id && l.status === 'Emprestado');
              const withWho = activeLoan ? `${activeLoan.colaboradorNome} · até ${fmtDate(activeLoan.data_prevista_devolucao)}` : '—';
              const podeReativar = b.status === 'Indisponível' || b.status === 'Manutenção' || b.active === false;
              return (
                <tr key={b.id}>
                  <td>
                    <strong>{b.titulo}</strong>
                  </td>
                  <td>{b.autor || '—'}</td>
                  <td>{shortCategory(b.categoria)}</td>
                  <td>{b.codigo_patrimonio || '—'}</td>
                  <td>
                    <span className={`badge ${statusClass(b.status)}`}>{b.status}</span>
                  </td>
                  <td>{withWho}</td>
                  <td className="actions-cell">
                    <button className="role-btn btn-sm" onClick={() => setEditing(b)}>
                      Editar
                    </button>
                    {podeReativar && (
                      <button className="role-btn btn-sm" onClick={() => reativarLivro(b)}>
                        Reativar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <LivroModal
          book={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={reloadAdminData}
        />
      )}
    </section>
  );
}