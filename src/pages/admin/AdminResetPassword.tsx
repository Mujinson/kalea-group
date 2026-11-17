import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AdminResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('La password deve avere almeno 8 caratteri');
    if (password !== confirm) return toast.error('Le password non coincidono');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Password impostata');
    navigate('/admin');
  };

  const field = 'w-full h-12 px-4 bg-white border border-[#231811]/15 rounded-xl text-[15px] text-[#231811] outline-none focus:border-[#3a2a18]';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F7F1E7]">
      <div className="w-full max-w-md">
        <p className="text-[11px] tracking-[0.35em] uppercase text-[#8b6a2a] mb-3">Kalēa® Suite</p>
        <h1 className="font-heading font-light text-3xl text-[#231811] mb-6">Imposta la tua password</h1>
        {!ready ? (
          <p className="text-sm text-[#231811]/60">Apri questa pagina dal link ricevuto via email. Se il link è scaduto, chiedi all'amministratore di inviarne uno nuovo.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="password" placeholder="Nuova password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
            <input type="password" placeholder="Ripeti password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
            <button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-[#231811] text-[#F7F1E7] font-medium flex items-center justify-center gap-2 disabled:opacity-70">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salva password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminResetPassword;
