import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, Hammer, Users, Wallet, User } from 'lucide-react';
import RoleAppLayout from '@/components/role-app/RoleAppLayout';
import RoleStub from './RoleStub';
import CommercialeHome from './CommercialeHome';
import CommercialeLeads from './CommercialeLeads';
import OperaioSites from './OperaioSites';
import OperaioCantiereDetail from './OperaioCantiereDetail';

const nav = [
  { to: '/app/ibrido', label: 'Oggi', icon: <Home className="w-5 h-5" /> },
  { to: '/app/ibrido/cantieri', label: 'Cantieri', icon: <Hammer className="w-5 h-5" /> },
  { to: '/app/ibrido/lead', label: 'Lead', icon: <Users className="w-5 h-5" /> },
  { to: '/app/ibrido/commissioni', label: 'Commissioni', icon: <Wallet className="w-5 h-5" /> },
  { to: '/app/ibrido/profilo', label: 'Profilo', icon: <User className="w-5 h-5" /> },
];

const IbridoApp = () => (
  <Routes>
    <Route element={<RoleAppLayout allowedRoles={['ibrido']} navItems={nav} title="Operaio · Commerciale" />}>
      <Route index element={<CommercialeHome />} />
      <Route path="cantieri" element={<OperaioSites />} />
      <Route path="cantieri/:id" element={<OperaioCantiereDetail />} />
      <Route path="lead" element={<CommercialeLeads />} />
      <Route path="commissioni" element={<RoleStub title="Le mie commissioni" />} />
      <Route path="profilo" element={<RoleStub title="Profilo" />} />
      <Route path="*" element={<Navigate to="/app/ibrido" replace />} />
    </Route>
  </Routes>
);

export default IbridoApp;
