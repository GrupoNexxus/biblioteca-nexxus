import { fmtDate, isAtrasado } from '../../lib/helpers';

export default function Dashboard({ books, employees, loans }) {
  const totalLivros = books.length;
  const disponiveis = books.reduce((n, b) => n + (b.status === 'Disponível' ? 1 : 0), 0);
  const emprestados = loans.filter((l) => l.status === 'Emprestado').length;
  const colaboradores = employees.length;
  const atrasados = loans.filter(isAtrasado).length;
  const pendentes = loans.filter((l) => l.status === 'Solicitado').length;

  const kpis = [
    ['Livros no acervo', totalLivros, false],
    ['Livros disponíveis', disponiveis, false],
    ['Livros emprestados', emprestados, false],
    ['Colaboradores cadastrados', colaboradores, false],
    ['Solicitações pendentes', pendentes, pendentes > 0],
    ['Empréstimos atrasados', atrasados, atrasados > 0],
  ];

  const counts = {};
  loans.forEach((l) => {
    counts[l.livroTitulo] = (counts[l.livroTitulo] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top.length ? top[0][1] : 1;

  // Só entram aqui empréstimos que de fato aconteceram (têm data_emprestimo
  // preenchida) — solicitações ainda pendentes/aprovadas/recusadas ficam de fora.
  const recent = loans
    .filter((l) => l.data_emprestimo)
    .sort((a, b) => new Date(b.data_emprestimo) - new Date(a.data_emprestimo))
    .slice(0, 6);

  return (
    <section className="admin-page active">
      <div>
        <h2>Dashboard</h2>
        <p className="sub">Visão geral da Biblioteca Nexxus.</p>
      </div>

      <div className="kpi-grid">
        {kpis.map(([label, val, warn]) => (
          <div key={label} className={`kpi-card ${warn ? 'warn' : ''}`}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{val}</div>
          </div>
        ))}
      </div>

      <div className="admin-panels-2">
        <div className="panel-box">
          <h3>Livros mais emprestados</h3>
          {top.length === 0 && <div className="admin-empty">Sem empréstimos ainda.</div>}
          {top.map(([titulo, n]) => (
            <div className="bar-row" key={titulo}>
              <span className="bar-label">{titulo}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(n / max) * 100}%` }}></div>
              </div>
              <span className="bar-count">{n}</span>
            </div>
          ))}
        </div>
        <div className="panel-box">
          <h3>Últimos empréstimos</h3>
          {recent.length === 0 && <div className="admin-empty">Nenhum empréstimo registrado.</div>}
          {recent.map((l) => (
            <div className="mini-loan" key={l.id}>
              <div>
                <strong>{l.livroTitulo}</strong>
                <span>{l.colaboradorNome}</span>
              </div>
              <span>{fmtDate(l.data_emprestimo)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}