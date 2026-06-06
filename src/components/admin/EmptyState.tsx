import { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

const EmptyState = ({ icon: Icon = Inbox, title, description, action, children }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
      style={{ background: 'rgba(200,169,110,0.10)', border: '1px solid rgba(200,169,110,0.25)' }}
    >
      <Icon className="w-6 h-6" style={{ color: '#C8A96E' }} />
    </div>
    <h3 className="text-[15px] font-semibold mb-1" style={{ color: '#1A1008' }}>
      {title}
    </h3>
    {description && (
      <p className="text-[13px] max-w-sm mb-5" style={{ color: '#8A7060' }}>
        {description}
      </p>
    )}
    {action && (
      <Button onClick={action.onClick} size="sm" className="bg-[#3B2314] hover:bg-[#1A1008] text-white">
        {action.label}
      </Button>
    )}
    {children}
  </div>
);

export default EmptyState;
