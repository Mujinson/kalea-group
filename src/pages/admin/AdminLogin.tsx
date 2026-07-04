import { useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth, routeForRole, AppRole } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import bgLogin from '@/assets/bg-manifesto.jpg';

const safeNext = (v: string | null): string | null => {
  if (!v) return null;
  // same-origin relative path only
  if (!v.startsWith('/') || v.startsWith('//')) return null;
  return v;
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, role, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextParam = safeNext(params.get('next'));

  if (!loading && user && role) {
    return <Navigate to={nextParam ?? routeForRole(role)} replace />;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Inserisci email e password');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenziali non valide');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Accesso effettuato');
        const { data: { user: u } } = await supabase.auth.getUser();
        let target = '/admin';
        if (u) {
          const { data: roles } = await supabase
            .from('user_roles').select('role').eq('user_id', u.id);
          const list = (roles || []).map((r: any) => r.role);
          const chosen: AppRole =
            list.includes('admin') ? 'admin'
            : list.includes('ibrido') ? 'ibrido'
            : list.includes('commerciale') ? 'commerciale'
            : list.includes('operaio') ? 'operaio' : null;
          target = routeForRole(chosen);
        }
        navigate(nextParam ?? target);
      }
    } catch (err) {
      toast.error("Errore durante l'accesso");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr] bg-[#0E0B08]">
      {/* LEFT — cinematic brand panel */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src={bgLogin}
          alt="Kalēa"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E0B08]/85 via-[#1A130C]/55 to-[#0E0B08]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.18),transparent_55%)]" />

        <div className="relative z-10 h-full flex flex-col justify-between p-12 xl:p-16 text-[#F4ECDD]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#C9A84C]/70 flex items-center justify-center">
              <span className="font-heading text-[#C9A84C] text-lg leading-none">K</span>
            </div>
            <span className="font-heading tracking-[0.32em] text-xs uppercase text-[#F4ECDD]/80">
              Kalēa<span className="text-[#C9A84C]">®</span> &nbsp;Suite
            </span>
          </div>

          <div className="max-w-md">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#C9A84C]/90 mb-5">
              Private workspace
            </p>
            <h1 className="font-heading font-light text-4xl xl:text-5xl leading-[1.1] text-[#F4ECDD]">
              La regia delle tue<br />superfici di pregio.
            </h1>
            <p className="mt-6 text-[#F4ECDD]/70 text-base leading-relaxed max-w-sm">
              Lead, preventivi, cantieri e operatività di campo —
              in un unico cockpit ispirato al meglio del CRM enterprise.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] tracking-[0.25em] uppercase text-[#F4ECDD]/45">
            <span>General Contractor · Luxury Supply Hub</span>
            <span>v 2026</span>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="relative flex items-center justify-center px-6 py-10 sm:px-12 bg-[#F7F1E7]">
        {/* mobile bg tease */}
        <div
          className="lg:hidden absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(${bgLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="lg:hidden absolute inset-0 bg-[#F7F1E7]/85" />

        <div className="relative w-full max-w-md">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-full border border-[#3a2a18]/30 flex items-center justify-center">
              <span className="font-heading text-[#3a2a18] text-lg leading-none">K</span>
            </div>
            <span className="font-heading tracking-[0.32em] text-xs uppercase text-[#3a2a18]/80">
              Kalēa<span className="text-[#8b6a2a]">®</span> Suite
            </span>
          </div>

          <div className="mb-9">
            <p className="text-[11px] tracking-[0.35em] uppercase text-[#8b6a2a] mb-3">
              Accesso riservato
            </p>
            <h2 className="font-heading font-light text-3xl sm:text-4xl text-[#231811] leading-tight">
              Bentornato.
            </h2>
            <p className="mt-2 text-sm text-[#231811]/60">
              Inserisci le credenziali per entrare nel pannello.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] tracking-[0.25em] uppercase text-[#231811]/70 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@azienda.com"
                autoComplete="email"
                disabled={isLoading}
                className="w-full h-12 px-4 bg-white border border-[#231811]/15 rounded-xl text-[15px] text-[#231811] placeholder:text-[#231811]/35 outline-none transition-all focus:border-[#3a2a18] focus:ring-4 focus:ring-[#3a2a18]/10 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] tracking-[0.25em] uppercase text-[#231811]/70 font-medium">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full h-12 pl-4 pr-12 bg-white border border-[#231811]/15 rounded-xl text-[15px] text-[#231811] placeholder:text-[#231811]/35 outline-none transition-all focus:border-[#3a2a18] focus:ring-4 focus:ring-[#3a2a18]/10 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#231811]/50 hover:text-[#231811] p-1.5 rounded-md transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 mt-2 rounded-xl bg-[#231811] hover:bg-[#3a2a18] active:bg-[#1a110a] text-[#F7F1E7] font-medium text-[15px] tracking-wide shadow-[0_10px_30px_-12px_rgba(35,24,17,0.55)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Accesso in corso…</span>
                </>
              ) : (
                <>
                  <span>Accedi al pannello</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#231811]/10 flex items-center justify-between text-xs text-[#231811]/55">
            <span>© Kalēa<span className="text-[#8b6a2a]">®</span> Group</span>
            <span>Serve un account? Contatta l'amministratore.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
