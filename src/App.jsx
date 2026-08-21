import { useEffect, useState, useCallback } from 'react';
import { sb, WHO_STORAGE_KEY } from './lib/supabaseClient';
import AuthScreen from './components/auth/AuthScreen';
import CatalogScreen from './components/catalog/CatalogScreen';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  const [me, setMe] = useState(null); // { name, meta, employeeId, role, profileId } | null
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const buildIdentityFromSession = useCallback(async () => {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data: profile } = await sb.from('profiles').select('id, name, role').eq('id', user.id).single();
    const roleLbl =
      profile?.role === 'admin'
        ? 'Administrador'
        : profile?.role === 'operator'
        ? 'Operador da Biblioteca'
        : 'Administrador / RH';
    return {
      name: profile?.name || user.email,
      meta: roleLbl,
      employeeId: null,
      role: profile?.role || null,
      profileId: profile?.id || user.id,
    };
  }, []);

  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem(WHO_STORAGE_KEY);
      if (saved) {
        const emp = JSON.parse(saved);
        setMe({ name: emp.name, meta: `${emp.area} · ${emp.empresa}`, employeeId: emp.id, role: null, profileId: null });
        setLoading(false);
        return;
      }
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (session) {
        const identity = await buildIdentityFromSession();
        if (identity) setMe(identity);
      }
      setLoading(false);
    })();
  }, [buildIdentityFromSession]);

  // Colaborador selecionou o nome na tela "Quem é você?"
  function enterAsEmployee(emp) {
    localStorage.setItem(WHO_STORAGE_KEY, JSON.stringify(emp));
    setMe({ name: emp.name, meta: `${emp.area} · ${emp.empresa}`, employeeId: emp.id, role: null, profileId: null });
  }

  // Admin/RH concluiu login por e-mail e senha
  async function enterAsAdmin() {
    const identity = await buildIdentityFromSession();
    if (identity) setMe(identity);
  }

  async function switchIdentity() {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (session) await sb.auth.signOut();
    localStorage.removeItem(WHO_STORAGE_KEY);
    setMe(null);
    setAdminOpen(false);
  }

  if (loading) return null;

  if (!me) {
    return <AuthScreen onEnterAsEmployee={enterAsEmployee} onEnterAsAdmin={enterAsAdmin} />;
  }

  return (
    <>
      <CatalogScreen me={me} onSwitchIdentity={switchIdentity} onOpenAdmin={() => setAdminOpen(true)} />
      {adminOpen && <AdminPanel me={me} onClose={() => setAdminOpen(false)} />}
    </>
  );
}
