import { useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import { shortCategory } from '../../lib/helpers';

export default function LivroModal({ book, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    titulo: book?.titulo || '',
    autor: book?.autor || '',
    editora: book?.editora || '',
    ano_publicacao: book?.ano_publicacao || '',
    isbn: book?.isbn || '',
    category_id: book?.category_id || categories[0]?.id || '',
    paginas: book?.paginas || '',
    codigo_patrimonio: book?.codigo_patrimonio || '',
    localizacao: book?.localizacao || '',
    quantidade_total: book?.quantidade_total ?? 1,
    quantidade_disponivel: book?.quantidade_disponivel ?? 1,
    status: book?.status || 'Disponível',
    capa_url: book?.capa_url || '',
    descricao: book?.descricao || '',
  });
  const [toast, setToast] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    if (!form.titulo.trim()) {
      setToast({ type: 'error', msg: 'Informe o título.' });
      return;
    }
    const payload = {
      ...form,
      ano_publicacao: parseInt(form.ano_publicacao) || null,
      paginas: parseInt(form.paginas) || null,
      quantidade_total: parseInt(form.quantidade_total) || 1,
      quantidade_disponivel: parseInt(form.quantidade_disponivel) || 0,
      active: true,
    };
    const { error } = book ? await sb.from('books').update(payload).eq('id', book.id) : await sb.from('books').insert(payload);
    if (error) {
      setToast({ type: 'error', msg: error.message });
      return;
    }
    setToast({ type: 'success', msg: 'Salvo com sucesso.' });
    await onSaved();
    setTimeout(onClose, 500);
  }

  async function inativar() {
    if (!book || !window.confirm('Inativar este livro? Ele deixará de aparecer no acervo.')) return;
    const { error } = await sb.from('books').update({ active: false, status: 'Indisponível' }).eq('id', book.id);
    if (error) {
      window.alert(error.message);
      return;
    }
    await onSaved();
    onClose();
  }

  return (
    <div className="admin-modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal wide">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3>{book ? 'Editar livro' : 'Cadastrar novo livro'}</h3>
        <div className="form-grid">
          <label className="full">
            Título
            <input type="text" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </label>
          <label>
            Autor
            <input type="text" value={form.autor} onChange={(e) => set('autor', e.target.value)} />
          </label>
          <label>
            Editora
            <input type="text" value={form.editora} onChange={(e) => set('editora', e.target.value)} />
          </label>
          <label>
            Ano de publicação
            <input type="text" value={form.ano_publicacao} onChange={(e) => set('ano_publicacao', e.target.value)} />
          </label>
          <label>
            ISBN
            <input type="text" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
          </label>
          <label>
            Categoria
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {shortCategory(c.name)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Número de páginas
            <input type="text" value={form.paginas} onChange={(e) => set('paginas', e.target.value)} />
          </label>
          <label>
            Código interno/patrimônio
            <input type="text" value={form.codigo_patrimonio} onChange={(e) => set('codigo_patrimonio', e.target.value)} />
          </label>
          <label>
            Localização física
            <input type="text" value={form.localizacao} onChange={(e) => set('localizacao', e.target.value)} />
          </label>
          <label>
            Quantidade total
            <input type="text" value={form.quantidade_total} onChange={(e) => set('quantidade_total', e.target.value)} />
          </label>
          <label>
            Quantidade disponível
            <input type="text" value={form.quantidade_disponivel} onChange={(e) => set('quantidade_disponivel', e.target.value)} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option>Disponível</option>
              <option>Emprestado</option>
              <option>Reservado</option>
              <option>Indisponível</option>
              <option>Manutenção</option>
            </select>
          </label>
          <label className="full">
            URL da capa (opcional)
            <input type="text" value={form.capa_url} onChange={(e) => set('capa_url', e.target.value)} />
          </label>
          <label className="full">
            Descrição
            <textarea rows={3} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
          </label>
        </div>
        {toast && <div className={`modal-toast ${toast.type} show`}>{toast.msg}</div>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>
            Salvar
          </button>
          {book && (
            <button className="btn btn-danger-outline" onClick={inativar}>
              Inativar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
