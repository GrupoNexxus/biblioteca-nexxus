export default function Relatorios({ loans }) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), count: 0 });
  }
  loans.forEach((l) => {
    const d = new Date(l.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.count++;
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  const counts = {};
  loans.forEach((l) => {
    counts[l.livroTitulo] = (counts[l.livroTitulo] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxBook = top.length ? top[0][1] : 1;

  return (
    <section className="admin-page active">
      <div>
        <h2>Relatórios</h2>
        <p className="sub">Indicadores gerenciais da biblioteca.</p>
      </div>

      <div className="panel-box">
        <h3>Empréstimos por mês (últimos 6 meses)</h3>
        {months.map((m) => (
          <div className="bar-row" key={m.key}>
            <span className="bar-label">{m.label}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(m.count / maxMonth) * 100}%` }}></div>
            </div>
            <span className="bar-count">{m.count}</span>
          </div>
        ))}
      </div>

      <div className="panel-box">
        <h3>Livros mais emprestados</h3>
        {top.length === 0 && <div className="admin-empty">Sem dados ainda.</div>}
        {top.map(([titulo, n]) => (
          <div className="bar-row" key={titulo}>
            <span className="bar-label">{titulo}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(n / maxBook) * 100}%` }}></div>
            </div>
            <span className="bar-count">{n}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
