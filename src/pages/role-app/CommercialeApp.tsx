import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, Users, FileText, Calendar, User } from 'lucide-react';
import RoleAppLayout from '@/components/role-app/RoleAppLayout';
import CommercialeHome from './CommercialeHome';
import CommercialeLeads from './CommercialeLeads';
import CommercialeLeadDetail from './CommercialeLeadDetail';
import CommercialeQuotes from './CommercialeQuotes';
import CommercialeCalendario from './CommercialeCalendario';
import RoleProfile from './RoleProfile';

const nav = [
  { to: '/app/commerciale', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { to: '/app/commerciale/lead', label: 'Lead', icon: <Users className="w-5 h-5" /> },
  { to: '/app/commerciale/preventivi', label: 'Preventivi', icon: <FileText className="w-5 h-5" /> },
  { to: '/app/commerciale/calendario', label: 'Calendario', icon: <Calendar className="w-5 h-5" /> },
  { to: '/app/commerciale/profilo', label: 'Profilo', icon: <User className="w-5 h-5" /> },
];

const CommercialeApp = () => (
  <Routes>
    <Route element={<RoleAppLayout allowedRoles={['commerciale']} navItems={nav} title="Commerciale" />}>
      <Route index element={<CommercialeHome />} />
      <Route path="lead" element={<CommercialeLeads />} />
      <Route path="lead/:id" element={<CommercialeLeadDetail />} />
      <Route path="preventivi" element={<CommercialeQuotes />} />
      <Route path="calendario" element={<CommercialeCalendario />} />
      <Route path="profilo" element={<RoleProfile />} />
      <Route path="*" element={<Navigate to="/app/commerciale" replace />} />
    </Route>
  </Routes>
);

export default CommercialeApp;

