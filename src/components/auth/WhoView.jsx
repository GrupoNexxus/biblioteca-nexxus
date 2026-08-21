import { useEffect, useState } from 'react';
import { sb } from '../../lib/supabaseClient';

export default function WhoView({ onSelect, onAdminToggle }) {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await sb
        .from('employees')
        .select('id, name, area, empresa')
        .eq('active', true)
        .order('name');
      if (error) setError(error.message);
      else setEmployees(data || []);
      setLoaded(true);
    })();
  }, []);

  const filtered = term
    ? employees.filter((e) => e.name.toLowerCase().includes(term.trim().toLowerCase()))
    : employees;

  return (
    <div className="view active">
      <div>
        <h2>Quem é você?</h2>
        <p className="sub">Selecione seu nome para acessar o acervo e registrar seus empréstimos.</p>
      </div>
      <label>
        Buscar
        <input type="text" placeholder="Digite seu nome..." value={term} onChange={(e) => setTerm(e.target.value)} />
      </label>

      <div className="who-list">
        {error && <div className="who-empty" style={{ color: 'var(--red)' }}>Erro ao carregar colaboradores: {error}</div>}
        {!error && loaded && filtered.length === 0 && <div className="who-empty">Nenhum colaborador encontrado.</div>}
        {!error && !loaded && <div className="who-empty">Carregando colaboradores...</div>}
        {filtered.map((emp) => (
          <button key={emp.id} type="button" className="who-item" onClick={() => onSelect(emp)}>
            <div>
              <strong>{emp.name}</strong>
              <span>{emp.area}</span>
            </div>
            <span className="empresa-tag">{emp.empresa === 'Fortes Tecnologia' ? 'Fortes' : 'F5'}</span>
          </button>
        ))}
      </div>

      <span className="admin-toggle-link" onClick={onAdminToggle}>
        Sou administrador / RH →
      </span>
    </div>
  );
}
