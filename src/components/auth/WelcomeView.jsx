export default function WelcomeView({ employee, onConfirm, onNotMe }) {
  return (
    <div className="view active">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="welcome-avatar">{employee.name.trim().charAt(0).toUpperCase()}</div>
        <div>
          <h2 style={{ marginBottom: 2 }}>{employee.name}</h2>
          <p className="sub" style={{ margin: 0 }}>
            {employee.area} · {employee.empresa}
          </p>
        </div>
      </div>
      <p className="sub">Pronto! Vamos te lembrar neste navegador — não é preciso selecionar seu nome de novo.</p>
      <button className="btn btn-primary" onClick={onConfirm}>
        Ir para o acervo
      </button>
      <span className="admin-toggle-link" onClick={onNotMe}>
        Não sou eu — trocar de pessoa
      </span>
    </div>
  );
}
