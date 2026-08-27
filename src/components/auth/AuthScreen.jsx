import { useEffect, useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import nexxusLogo from '../../assets/nexxus-logo.png';
import WhoView from './WhoView';
import WelcomeView from './WelcomeView';
import LoginView from './LoginView';
import ForgotView from './ForgotView';
import ResetView from './ResetView';

export default function AuthScreen({ onEnterAsEmployee, onEnterAsAdmin }) {
  const [view, setView] = useState('who'); // who | welcome | login | forgot | reset
  const [pendingEmployee, setPendingEmployee] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(null);
  const [bookCount, setBookCount] = useState(null);

  useEffect(() => {
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('reset');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Contagem de colaboradores ativos e livros no acervo, direto do banco
  // (em vez de número fixo no código).
  async function loadCounts() {
    const [{ count: empCount }, { count: bkCount }] = await Promise.all([
      sb.from('employees').select('*', { count: 'exact', head: true }).eq('active', true),
      sb.from('books').select('*', { count: 'exact', head: true }).eq('active', true),
    ]);
    setEmployeeCount(empCount ?? 0);
    setBookCount(bkCount ?? 0);
  }

  useEffect(() => {
    loadCounts();
  }, []);

  // Realtime: se alguém cadastrar/desativar um colaborador ou um livro
  // (em qualquer navegador), o número aqui atualiza sozinho.
  useEffect(() => {
    const channel = sb
      .channel('auth-screen-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => loadCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => loadCounts())
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return (
    <div id="authScreen">
      <div className="shell">
        <div className="brand">
          <div className="brand-mark">
            <span className="dot"></span> Biblioteca Nexxus
          </div>
          <div className="brand-copy">
            <h1>Conhecimento que circula.</h1>
            <p>
              Acesse o acervo do Grupo Nexxus, acompanhe seus empréstimos e nunca perca um prazo de devolução.
            </p>
          </div>
          <div className="brand-stack">
            <div>
              <strong>{bookCount ?? '—'}</strong>livros no acervo
            </div>
            <div>
              <strong>{employeeCount ?? '—'}</strong>colaboradores
            </div>
          </div>
        </div>

        <div className="panel">
          <img src={nexxusLogo} alt="Grupo Nexxus" className="auth-logo" />

          {view === 'who' && (
            <WhoView
              onSelect={(emp) => {
                setPendingEmployee(emp);
                setView('welcome');
              }}
              onAdminToggle={() => setView('login')}
            />
          )}

          {view === 'welcome' && pendingEmployee && (
            <WelcomeView
              employee={pendingEmployee}
              onConfirm={() => onEnterAsEmployee(pendingEmployee)}
              onNotMe={() => {
                setPendingEmployee(null);
                setView('who');
              }}
            />
          )}

          {view === 'login' && (
            <LoginView
              onBackToWho={() => setView('who')}
              onForgot={() => setView('forgot')}
              onLoggedIn={onEnterAsAdmin}
            />
          )}

          {view === 'forgot' && <ForgotView onBack={() => setView('login')} />}

          {view === 'reset' && <ResetView onDone={() => setView('login')} />}
        </div>
      </div>
    </div>
  );
}