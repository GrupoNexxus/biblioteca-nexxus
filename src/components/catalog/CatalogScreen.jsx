import { useEffect, useMemo, useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import BookCard from './BookCard';
import BookModal from './BookModal';

export default function CatalogScreen({ me, onSwitchIdentity, onOpenAdmin }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('alpha');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    const [{ data: bks, error: booksErr }, { data: cats, error: catErr }] = await Promise.all([
      sb
        .from('books')
        .select('id, titulo, autor, quantidade_total, quantidade_disponivel, status, created_at, categories(name)')
        .eq('active', true),
      sb.from('categories').select('name').eq('active', true).order('name'),
    ]);
    if (booksErr) {
      setLoadError(booksErr.message);
      return;
    }
    setBooks((bks || []).map((b) => ({ ...b, categoria: b.categories ? b.categories.name : 'Sem categoria' })));
    if (!catErr) setCategories(cats || []);
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = books.filter((b) => {
      const matchesTerm = !term || b.titulo.toLowerCase().includes(term) || (b.autor || '').toLowerCase().includes(term);
      const matchesCat = !filterCategory || b.categoria === filterCategory;
      const matchesStatus = !filterStatus || b.status === filterStatus;
      return matchesTerm && matchesCat && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
      return a.titulo.localeCompare(b.titulo, 'pt-BR');
    });
    return list;
  }, [books, search, filterCategory, filterStatus, sortBy]);

  const isAdmin = me.role === 'admin' || me.role === 'operator';

  return (
    <div id="appScreen" style={{ display: 'block' }}>
      <header>
        <div className="header-inner">
          <div className="brand-mark">
            <span className="dot"></span> Biblioteca Nexxus
          </div>
          <div className="who-chip">
            <div className="who-avatar">{me.name.trim().charAt(0).toUpperCase()}</div>
            <div>
              <div className="who-name-lbl">{me.name}</div>
              <div className="who-meta-lbl">{me.meta}</div>
            </div>
            <span className="switch-link" onClick={onSwitchIdentity}>
              Trocar
            </span>
            {isAdmin && (
              <button className="admin-link-btn" style={{ display: 'flex' }} onClick={onOpenAdmin}>
                ⚙️ Administração da Biblioteca
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="controls">
        <h1>Acervo</h1>
        <p className="sub">Pesquise, filtre e solicite o empréstimo de um livro.</p>
        <div className="control-bar">
          <input
            id="search"
            type="text"
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="Disponível">Disponível</option>
            <option value="Reservado">Reservado</option>
            <option value="Emprestado">Emprestado</option>
            <option value="Indisponível">Indisponível</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="alpha">Ordem alfabética</option>
            <option value="recent">Mais recentes</option>
          </select>
        </div>
      </div>

      <div className="grid-wrap">
        {loadError && <div className="empty-state" style={{ color: 'var(--red)' }}>Erro ao carregar o acervo: {loadError}</div>}
        {!loadError && filtered.length === 0 && <div className="empty-state">Nenhum livro encontrado com esses filtros.</div>}
        {!loadError && filtered.length > 0 && (
          <div className="grid">
            {filtered.map((b) => (
              <BookCard key={b.id} book={b} onClick={() => setSelectedBook(b)} />
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <BookModal book={selectedBook} me={me} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}
