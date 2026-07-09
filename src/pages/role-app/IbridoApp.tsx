import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, Hammer, Users, Wallet, User } from 'lucide-react';
import RoleAppLayout from '@/components/role-app/RoleAppLayout';
import CommercialeHome from './CommercialeHome';
import CommercialeLeads from './CommercialeLeads';
import CommercialeLeadDetail from './CommercialeLeadDetail';
import OperaioSites from './OperaioSites';
import OperaioCantiereDetail from './OperaioCantiereDetail';
import IbridoCommissioni from './IbridoCommissioni';
import RoleProfile from './RoleProfile';
import CreaPreventivo from '@/components/role-app/MobileQuoteWrapper';

const nav = [
  { to: '/app/ibrido', label: 'Oggi', icon: <Home className="w-5 h-5" /> },
  { to: '/app/ibrido/cantieri', label: 'Cantieri', icon: <Hammer className="w-5 h-5" /> },
  { to: '/app/ibrido/lead', label: 'Lead', icon: <Users className="w-5 h-5" /> },
  { to: '/app/ibrido/commissioni', label: 'Commissioni', icon: <Wallet className="w-5 h-5" /> },
  { to: '/app/ibrido/profilo', label: 'Profilo', icon: <User className="w-5 h-5" /> },
];

const IbridoApp = () => (
  <Routes>
    <Route element={<RoleAppLayout allowedRoles={['ibrido']} navItems={nav} title="Posatore · Commerciale" />}>
      <Route index element={<CommercialeHome />} />
      <Route path="cantieri" element={<OperaioSites />} />
      <Route path="cantieri/:id" element={<OperaioCantiereDetail />} />
      <Route path="lead" element={<CommercialeLeads />} />
      <Route path="lead/:id" element={<CommercialeLeadDetail />} />
      <Route path="commissioni" element={<IbridoCommissioni />} />
      <Route path="profilo" element={<RoleProfile />} />
      <Route path="crea-preventivo" element={<CreaPreventivo />} />
      <Route path="*" element={<Navigate to="/app/ibrido" replace />} />
    </Route>
  </Routes>
);

export default IbridoApp;
