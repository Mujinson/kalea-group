import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Send, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TelegramSection = () => {
  const qc = useQueryClient();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['telegram-chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_allowed_chats')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const toggle = async (id: string, approved: boolean) => {
    const { error } = await supabase.from('telegram_allowed_chats').update({ approved }).eq('id', id);
    if (error) return toast.error('Errore aggiornamento');
    toast.success(approved ? 'Chat autorizzata' : 'Autorizzazione revocata');
    qc.invalidateQueries({ queryKey: ['telegram-chats'] });
  };

  const setupWebhook = async () => {
    const t = toast.loading('Collego il bot Telegram…');
    const { data, error } = await supabase.functions.invoke('telegram-bot', {
      body: { action: 'setup' },
    });
    if (error || !data?.ok) {
      toast.error('Collegamento non riuscito', { id: t, description: data?.description || error?.message });
      return;
    }
    toast.success(`Bot collegato${data.bot ? `: @${data.bot}` : ''}`, { id: t });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Assistente Telegram</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ['telegram-chats'] })}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={setupWebhook}>
            <Send className="w-4 h-4 mr-2" /> Collega bot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Aggiungi il bot Kalēa al gruppo (o scrivigli in privato) e invia <code>/start</code>: la chat comparirà
            qui e potrai autorizzarla.
          </p>
          <p>Nelle chat autorizzate puoi:</p>
          <ul className="list-disc pl-5">
            <li>caricare un <strong>preventivo</strong> in PDF o foto → viene creato in bozza nel CRM;</li>
            <li>caricare una <strong>fattura fornitore</strong> scrivendo "fattura" nella didascalia → va nei costi con PDF allegato e stato Da pagare / Pagata;</li>
            <li>dettare un preventivo <strong>a voce o per iscritto</strong>;</li>
            <li>fare domande sul CRM (vendite, cantieri, scadenze).</li>
          </ul>
        </div>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Caricamento…</p>}
          {!isLoading && (chats?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessuna chat ancora. Scrivi <code>/start</code> al bot per farla comparire.
            </p>
          )}
          {chats?.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{c.title || c.chat_id}</p>
                  <Badge variant="outline" className="text-[10px]">{c.chat_type || '—'}</Badge>
                  {c.approved ? (
                    <Badge className="bg-green-100 text-green-700 text-[10px]">Autorizzata</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 text-[10px]">In attesa</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ID {c.chat_id}
                  {c.last_message_at
                    ? ` • ultimo messaggio ${format(new Date(c.last_message_at), 'dd MMM HH:mm', { locale: it })}`
                    : ''}
                </p>
              </div>
              <Switch checked={!!c.approved} onCheckedChange={(v) => toggle(c.id, v)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramSection;
