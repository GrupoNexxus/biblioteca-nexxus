import { fmtDate, shortCategory } from '../../lib/helpers';
import nexxusLogo from '../../assets/nexxus-logo.png';

export default function TermoOverlay({ loan, onClose }) {
  if (!loan) return null;
  const emp = loan.employees || {};
  const book = loan.books || {};
  const dias =
    loan.data_emprestimo && loan.data_prevista_devolucao
      ? Math.round((new Date(loan.data_prevista_devolucao) - new Date(loan.data_emprestimo)) / 86400000) + ' dias'
      : '—';

  return (
    <div id="termoOverlay" className="show">
      <div style={{ width: '210mm', maxWidth: '100%', margin: '0 auto' }}>
        <div className="termo-toolbar">
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Fechar
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            🖨️ Imprimir / Gerar PDF
          </button>
        </div>
        <div id="termoPage">
          <img src={nexxusLogo} alt="Grupo Nexxus" className="termo-logo" />
          <h1>BIBLIOTECA NEXXUS</h1>
          <h2>TERMO DE EMPRÉSTIMO DE LIVRO</h2>

          <div className="termo-section">
            <h3>Dados do colaborador</h3>
            <div className="termo-grid">
              <div>
                <span>Nome completo</span>
                <strong>{loan.colaboradorNome || '—'}</strong>
              </div>
              <div>
                <span>Matrícula/CPF</span>
                <strong>{emp.cpf || '—'}</strong>
              </div>
              <div>
                <span>Cargo</span>
                <strong>{emp.cargo || '—'}</strong>
              </div>
              <div>
                <span>Departamento</span>
                <strong>{emp.area || '—'}</strong>
              </div>
              <div>
                <span>E-mail corporativo</span>
                <strong>{emp.email || '—'}</strong>
              </div>
            </div>
          </div>

          <div className="termo-section">
            <h3>Dados do livro</h3>
            <div className="termo-grid">
              <div>
                <span>Título</span>
                <strong>{loan.livroTitulo || '—'}</strong>
              </div>
              <div>
                <span>Autor</span>
                <strong>{loan.livroAutor || '—'}</strong>
              </div>
              <div>
                <span>Editora</span>
                <strong>{book.editora || '—'}</strong>
              </div>
              <div>
                <span>ISBN</span>
                <strong>{book.isbn || '—'}</strong>
              </div>
              <div>
                <span>Código do patrimônio</span>
                <strong>{book.codigo_patrimonio || '—'}</strong>
              </div>
              <div>
                <span>Categoria</span>
                <strong>{book.categories ? shortCategory(book.categories.name) : '—'}</strong>
              </div>
            </div>
          </div>

          <div className="termo-section">
            <h3>Dados do empréstimo</h3>
            <div className="termo-grid">
              <div>
                <span>Número do empréstimo</span>
                <strong>#{loan.numero || loan.id}</strong>
              </div>
              <div>
                <span>Data do empréstimo</span>
                <strong>{fmtDate(loan.data_emprestimo || loan.created_at)}</strong>
              </div>
              <div>
                <span>Data prevista para devolução</span>
                <strong>{fmtDate(loan.data_prevista_devolucao)}</strong>
              </div>
              <div>
                <span>Prazo do empréstimo</span>
                <strong>{dias}</strong>
              </div>
            </div>
          </div>

          <p className="termo-declaracao">
            Pelo presente termo, o(a) colaborador(a) acima identificado(a) declara ter recebido, em empréstimo, o livro
            identificado neste documento, comprometendo-se a zelar pela sua conservação e a devolvê-lo à Biblioteca Nexxus
            dentro do prazo estabelecido, sob pena das medidas cabíveis em caso de dano, extravio ou atraso não justificado,
            conforme as normas internas da Biblioteca Nexxus.
          </p>

          <div className="termo-section">
            <h3>Observações</h3>
            <div className="termo-obs">{loan.observacoes || ''}</div>
          </div>

          <div className="termo-sign">
            <div>Assinatura do colaborador</div>
            <div>Assinatura do responsável pela biblioteca</div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, marginTop: 18 }}>Data: {fmtDate(new Date())}</p>

          <p className="termo-footer">Biblioteca Nexxus — Grupo F5</p>
        </div>
      </div>
    </div>
  );
}