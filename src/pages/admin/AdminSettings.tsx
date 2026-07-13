import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, Key } from 'lucide-react';
import { CrmPageHeader } from '@/components/admin/CrmShell';
import { validatePassword, checkPasswordCompromised } from '@/hooks/usePasswordCheck';
import CommercialiSection from '@/components/admin/CommercialiSection';

const AdminSettings = () => {
  const { user } = useAdminAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  
  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      toast.error('Compila tutti i campi');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Le nuove password non coincidono');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    setCheckingPassword(true);
    
    // Check if password is compromised (HIBP)
    const { compromised, count } = await checkPasswordCompromised(newPassword);
    setCheckingPassword(false);
    
    if (compromised) {
      toast.error(`Questa password è stata trovata in ${count.toLocaleString()} data breach. Scegli una password più sicura.`, {
        duration: 6000,
        icon: <AlertTriangle className="w-5 h-5 text-destructive" />
      });
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password aggiornata con successo');
      setChangePasswordOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('Errore nel cambio password: ' + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["CRM", "Impostazioni"]} title="Impostazioni" subtitle="Utenti admin e configurazioni" />

      {/* Commerciali Section */}
      <CommercialiSection />

      {/* Current User Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Account Corrente</CardTitle>
          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-2" />
                Cambia Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambia Password</DialogTitle>
                <DialogDescription>
                  Inserisci una nuova password sicura (minimo 12 caratteri, maiuscole, minuscole, numeri e caratteri speciali)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nuova Password *</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nuova password sicura"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conferma Nuova Password *</Label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Conferma la nuova password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={changingPassword || checkingPassword}>
                  {checkingPassword ? 'Verifica sicurezza...' : changingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ultimo accesso</span>
              <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('it-IT') : '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifiche di sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Il digest giornaliero parte ogni mattina alle <strong>07:30</strong> (ora italiana) e invia a ciascun utente un riepilogo di appuntamenti, lead da contattare e cantieri attivi.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              const t = toast.loading('Invio digest in corso...');
              const { data, error } = await supabase.functions.invoke('daily-digest');
              if (error) {
                toast.error('Errore invio digest', { id: t });
              } else {
                toast.success(`Digest inviato a ${data?.sent ?? 0} utenti`, { id: t });
              }
            }}
          >
            Invia digest ora (test)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
