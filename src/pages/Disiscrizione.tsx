import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function Disiscrizione() {
  const [params] = useSearchParams();
  const token = params.get('t') || '';
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const confirm = async () => {
    setState('loading');
    const { error } = await supabase.functions.invoke('campaign-unsubscribe', { body: { token } });
    setState(error ? 'error' : 'done');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-5">
        <h1 className="text-2xl font-semibold text-foreground">Kalēa<span className="whitespace-nowrap">®</span></h1>
        {state === 'done' ? (
          <p className="text-muted-foreground">Fatto. Non riceverai più email da Kalēa. Ci scusiamo per il disturbo.</p>
        ) : state === 'error' || !token ? (
          <p className="text-muted-foreground">Il link non è valido o è scaduto. Scrivi a info@kalea.space e ti togliamo noi dalla lista.</p>
        ) : (
          <>
            <p className="text-muted-foreground">Vuoi smettere di ricevere email da Kalēa?</p>
            <Button onClick={confirm} disabled={state === 'loading'}>Non voglio più ricevere email da Kalēa</Button>
          </>
        )}
      </div>
    </main>
  );
}
