import { Navigate, useLocation, useParams } from "react-router-dom";

const supportedLangs = new Set(["it", "en", "de", "fr"]);

export default function AdminLangRedirect() {
  const location = useLocation();
  const { lang } = useParams();

  // Only handle known language prefixes
  if (!lang || !supportedLangs.has(lang)) {
    return <Navigate to="/admin" replace />;
  }

  const nextPath = location.pathname.replace(new RegExp(`^/${lang}/admin`), "/admin");
  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
}
