import { useCallback, useEffect, useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Colaboradores from './Colaboradores';
import Livros from './Livros';
import Solicitacoes from './Solicitacoes';
import Emprestimos from './Emprestimos';
import Historico from './Historico';
import Relatorios from './Relatorios';
import Configuracoes from './Configuracoes';
import LoanDetailModal from './LoanDetailModal';
import DevolucaoModal from './DevolucaoModal';
import TermoOverlay from './TermoOverlay';

export default function AdminPanel({ me, onClose }) {
  const [page, setPage] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loans, setLoans] = useState([]);

  const [detailLoanId, setDetailLoanId] = useState(null);
  const [devolucaoLoanId, setDevolucaoLoanId] = useState(null);
  const [termoLoanId, setTermoLoanId] = useState(null);

  const reloadAdminData = useCallback(async () => {
    const [{ data: emp }, { data: bks }, { data: cats }, { data: lns }] = await Promise.all([
      sb.from('employees').select('*').order('name'),
      sb.from('books').select('*, categories(name)'),
      sb.from('categories').select('*').eq('active', true).order('name'),
      sb
        .from('loans')
        .select(
          '*, employees(name, area, empresa, cpf, email, cargo), books(titulo, autor, editora, isbn, codigo_patrimonio, categories(name))'
        )
        .order('created_at', { ascending: false }),
    ]);
    setEmployees(emp || []);
    setBooks((bks || []).map((b) => ({ ...b, categoria: b.categories ? b.categories.name : 'Sem categoria' })));
    setCategories(cats || []);
    setLoans(
      (lns || []).map((l) => ({
        ...l,
        colaboradorNome: l.employees?.name || '—',
        colaboradorArea: l.employees?.area || '',
        livroTitulo: l.books?.titulo || '—',
        livroAutor: l.books?.autor || '',
      }))
    );
  }, []);

  useEffect(() => {
    reloadAdminData();
  }, [reloadAdminData]);

  const shared = { employees, books, categories, loans, reloadAdminData, me };

  const pages = {
    dashboard: <Dashboard {...shared} />,
    colaboradores: <Colaboradores {...shared} />,
    livros: <Livros {...shared} />,
    solicitacoes: (
      <Solicitacoes
        {...shared}
        onViewDetail={setDetailLoanId}
        onDevolucao={setDevolucaoLoanId}
        onTermo={setTermoLoanId}
      />
    ),
    emprestimos: (
      <Emprestimos
        {...shared}
        onViewDetail={setDetailLoanId}
        onDevolucao={setDevolucaoLoanId}
        onTermo={setTermoLoanId}
      />
    ),
    historico: <Historico {...shared} />,
    relatorios: <Relatorios {...shared} />,
    configuracoes: <Configuracoes {...shared} />,
  };

  return (
    <div id="adminPanel" className="show">
      <div className="admin-shell">
        <Sidebar page={page} onSelect={setPage} onClose={onClose} />
        <main className="admin-main">{pages[page]}</main>
      </div>

      {detailLoanId && (
        <LoanDetailModal loan={loans.find((l) => l.id === detailLoanId)} onClose={() => setDetailLoanId(null)} />
      )}
      {devolucaoLoanId && (
        <DevolucaoModal
          loan={loans.find((l) => l.id === devolucaoLoanId)}
          books={books}
          me={me}
          onClose={() => setDevolucaoLoanId(null)}
          onDone={reloadAdminData}
        />
      )}
      {termoLoanId && (
        <TermoOverlay loan={loans.find((l) => l.id === termoLoanId)} onClose={() => setTermoLoanId(null)} />
      )}
    </div>
  );
}
