import { useEffect, useState } from 'react';
import { sb } from '../../lib/supabaseClient';
import WhoView from './WhoView';
import WelcomeView from './WelcomeView';
import LoginView from './LoginView';
import SignupView from './SignupView';
import ForgotView from './ForgotView';
import ResetView from './ResetView';

export default function AuthScreen({ onEnterAsEmployee, onEnterAsAdmin }) {
  const [view, setView] = useState('who'); // who | welcome | login | signup | forgot | reset
  const [showTabs, setShowTabs] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState(null);

  useEffect(() => {
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('reset');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function goAdminTab(target) {
    setShowTabs(true);
    setView(target);
  }

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
              <strong>25</strong>livros no acervo
            </div>
            <div>
              <strong>62</strong>colaboradores
            </div>
          </div>
        </div>

        <div className="panel">
          {showTabs && (
            <div className="tabs">
              <button className={`tab ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>
                Entrar
              </button>
              <button className={`tab ${view === 'signup' ? 'active' : ''}`} onClick={() => setView('signup')}>
                Criar conta
              </button>
            </div>
          )}

          {view === 'who' && (
            <WhoView
              onSelect={(emp) => {
                setPendingEmployee(emp);
                setView('welcome');
              }}
              onAdminToggle={() => goAdminTab('login')}
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
              onBackToWho={() => {
                setShowTabs(false);
                setView('who');
              }}
              onForgot={() => setView('forgot')}
              onGoSignup={() => setView('signup')}
              onLoggedIn={onEnterAsAdmin}
            />
          )}

          {view === 'signup' && <SignupView />}

          {view === 'forgot' && <ForgotView onBack={() => setView('login')} />}

          {view === 'reset' && <ResetView onDone={() => setView('login')} />}
        </div>
      </div>
    </div>
  );
}
