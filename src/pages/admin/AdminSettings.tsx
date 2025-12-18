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
import { UserPlus, Trash2, Shield, Users } from 'lucide-react';

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
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creating, setCreating] = useState(false);

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

  // Strong password validation
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 12) {
      return { valid: false, message: 'La password deve essere di almeno 12 caratteri' };
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase) {
      return { valid: false, message: 'La password deve contenere almeno una lettera maiuscola' };
    }
    if (!hasLowercase) {
      return { valid: false, message: 'La password deve contenere almeno una lettera minuscola' };
    }
    if (!hasNumber) {
      return { valid: false, message: 'La password deve contenere almeno un numero' };
    }
    if (!hasSpecial) {
      return { valid: false, message: 'La password deve contenere almeno un carattere speciale (!@#$%^&*...)' };
    }
    
    return { valid: true, message: '' };
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('Compila tutti i campi');
      return;
    }

    const passwordValidation = validatePassword(newUserPassword);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    setCreating(true);

    try {
      // First, create the user account
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

      // Then add admin role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'admin',
      });

      if (roleError) throw roleError;

      toast.success('Admin creato con successo');
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
        <CardHeader>
          <CardTitle>Account Corrente</CardTitle>
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
