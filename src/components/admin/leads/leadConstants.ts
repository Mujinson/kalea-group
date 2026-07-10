export const LEAD_STATUSES = [
  { value: 'nuovo', label: 'Nuovo', dot: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { value: 'contattato', label: 'Contattato', dot: '#F97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { value: 'qualificato', label: 'Qualificato', dot: '#22C55E', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  { value: 'proposta', label: 'Proposta', dot: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { value: 'negoziazione', label: 'Negoziazione', dot: '#8B5CF6', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { value: 'vinto', label: 'Chiuso · Vinto', dot: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { value: 'perso', label: 'Chiuso · Perso', dot: '#EF4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
];

export const LEAD_SOURCES = [
  { value: 'telefono', label: 'Telefono' },
  { value: 'email', label: 'Email' },
  { value: 'sito_web', label: 'Sito web' },
  { value: 'area_tecnica', label: 'Area Tecnica' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'referral', label: 'Referral / Passaparola' },
  { value: 'fiera', label: 'Fiera' },
  { value: 'landing_page', label: 'Landing page' },
  { value: 'ads_campaign', label: 'Campagna Ads' },
  { value: 'chatbot_website', label: 'Chatbot sito' },
  { value: 'chatbot_whatsapp', label: 'Chatbot WhatsApp' },
  { value: 'chatbot_instagram', label: 'Chatbot Instagram' },
  { value: 'chatbot_facebook', label: 'Chatbot Facebook' },
  { value: 'altro', label: 'Altro' },
];

export const LEAD_LANGUAGES = [
  { value: 'it', label: 'Italiano' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

export const LEAD_PROFESSIONS = [
  'Architetto', 'Geometra', 'Ingegnere', 'Interior Designer', 'Impresa Edile',
  'General Contractor', 'Rivenditore', 'Showroom', 'Posatore', 'Costruttore',
  'Studio Design', 'Project Manager', 'Privato', 'Altro',
];

export const LEAD_COMPANY_TYPES = [
  'SRL', 'SPA', 'SAS', 'SNC', 'Ditta Individuale', 'Studio Professionale',
  'Impresa Artigiana', 'Cooperativa', 'Ente Pubblico', 'Altro',
];

export const COUNTRIES = ['Italia', 'Svizzera', 'Francia', 'Germania', 'Austria', 'Slovenia', 'San Marino', 'Altro'];

export const statusMeta = (value: string) =>
  LEAD_STATUSES.find((s) => s.value === value) || LEAD_STATUSES[0];

export const sourceLabel = (value: string | null | undefined) =>
  LEAD_SOURCES.find((s) => s.value === value)?.label || value || '—';
