import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

const QuickNewLeadSheet = ({ open, onClose, onCreated }: Props) => {
  const { user, salespersonId } = useAdminAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    project_type: '',
    notes: '',
  });

  if (!open) return null;

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('Nome, telefono ed email sono obbligatori');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: form.city.trim() || null,
        project_type: form.project_type.trim() || null,
        notes: form.notes.trim() || null,
        source: 'mobile_app',
        status: 'nuovo',
        pipeline_stage: 'cold',
        assigned_salesperson_id: salespersonId || null,
        created_by_user_id: user?.id || null,
      })
      .select('id')
      .maybeSingle();
    setSaving(false);

    if (error) {
      toast.error(`Errore: ${error.message}`);
      return;
    }
    toast.success('Lead creato');
    setForm({ name: '', phone: '', email: '', city: '', project_type: '', notes: '' });
    onCreated?.(data?.id || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#E5E2DD] sticky top-0 bg-white">
          <h2 className="text-[18px] font-semibold text-[#1E1B4B]">Nuovo Lead</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-[#8C7B6B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <Field label="Nome *" value={form.name} onChange={(v) => update('name', v)} />
          <Field label="Telefono *" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />
          <Field label="Email *" type="email" value={form.email} onChange={(v) => update('email', v)} />
          <Field label="Città" value={form.city} onChange={(v) => update('city', v)} />
          <Field label="Tipo progetto" value={form.project_type} onChange={(v) => update('project_type', v)} placeholder="es. Villa privata, Hotel…" />
          <div>
            <label className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">Note</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#E5E2DD] bg-white px-3 py-2 text-[15px] text-[#1E1B4B] focus:outline-none focus:border-[#1E1B4B]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#E5E2DD] sticky bottom-0 bg-white">
          <button
            onClick={submit}
            disabled={saving}
            className="w-full h-[52px] rounded-lg bg-[#1E1B4B] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saving ? 'Salvataggio…' : 'Crea lead'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label, value, onChange, type = 'text', placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div>
    <label className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full h-[44px] rounded-lg border border-[#E5E2DD] bg-white px-3 text-[15px] text-[#1E1B4B] focus:outline-none focus:border-[#1E1B4B]"
    />
  </div>
);

export default QuickNewLeadSheet;
