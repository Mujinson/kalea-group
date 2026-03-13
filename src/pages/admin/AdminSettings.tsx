import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2, Shield, Users, AlertTriangle, Key } from 'lucide-react';
import { validatePassword, checkPasswordCompromised } from '@/hooks/usePasswordCheck';
import CommercialiSection from '@/components/admin/CommercialiSection';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

const AdminSettings = () => {
  const { user } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  
  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('Compila tutti i campi');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newUserPassword);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    setCheckingPassword(true);
    
    // Check if password is compromised (HIBP)
    const { compromised, count } = await checkPasswordCompromised(newUserPassword);
    setCheckingPassword(false);
    
    if (compromised) {
      toast.error(`Questa password è stata trovata in ${count.toLocaleString()} data breach. Scegli una password più sicura.`, {
        duration: 6000,
        icon: <AlertTriangle className="w-5 h-5 text-destructive" />
      });
      return;
    }

    setCreating(true);

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Errore nella creazione utente');
      }

      // Add admin role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'admin',
      });

      if (roleError) throw roleError;

      toast.success('Admin creato con successo! L\'utente riceverà una email di conferma.');
      setDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      if (error.message.includes('already registered')) {
        toast.error('Questo indirizzo email è già registrato');
      } else {
        toast.error('Errore nella creazione: ' + error.message);
      }
    } finally {
      setCreating(false);
    }
  };

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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('Errore nel cambio password: ' + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, userId: string) => {
    if (userId === user?.id) {
      toast.error('Non puoi rimuovere te stesso');
      return;
    }

    if (!confirm('Sei sicuro di voler rimuovere questo admin?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast.success('Admin rimosso');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Errore nella rimozione');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Impostazioni</h2>
        <p className="text-muted-foreground">Gestisci gli utenti admin e le configurazioni</p>
      </div>

      {/* Admin Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utenti Admin
            </CardTitle>
            <CardDescription>Gestisci chi può accedere alla dashboard</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuovo Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Admin</DialogTitle>
                <DialogDescription>
                  Crea un nuovo account con accesso alla dashboard
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="nome@azienda.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creazione...' : 'Crea Admin'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Caricamento...</p>
          ) : admins.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessun admin configurato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Data Creazione</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-mono text-sm">
                      {admin.user_id.substring(0, 8)}...
                      {admin.user_id === user?.id && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Tu</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        <Shield className="w-3 h-3" />
                        {admin.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAdmin(admin.id, admin.user_id)}
                        disabled={admin.user_id === user?.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default AdminSettings;
