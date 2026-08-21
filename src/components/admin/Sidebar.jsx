const ITEMS = [
  ['dashboard', '📊 Dashboard'],
  ['colaboradores', '👥 Colaboradores'],
  ['livros', '📚 Livros'],
  ['solicitacoes', '📨 Solicitações'],
  ['emprestimos', '🔄 Empréstimos'],
  ['historico', '🕘 Histórico'],
  ['relatorios', '📈 Relatórios'],
  ['configuracoes', '⚙️ Configurações'],
];

export default function Sidebar({ page, onSelect, onClose }) {
  return (
    <aside className="admin-sidebar">
      <div className="brand-mark">
        <span className="dot" style={{ background: 'var(--purple)' }}></span> Nexxus Admin
      </div>
      {ITEMS.map(([id, label]) => (
        <button
          key={id}
          className={`admin-nav-item ${page === id ? 'active' : ''}`}
          onClick={() => onSelect(id)}
        >
          {label}
        </button>
      ))}
      <span className="admin-nav-close" onClick={onClose}>
        ← Voltar ao acervo
      </span>
    </aside>
  );
}
