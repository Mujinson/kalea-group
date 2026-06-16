import { Navigate, useLocation, useParams } from "react-router-dom";

const supportedLangs = new Set(["it", "en", "de", "fr"]);

export default function AppLangRedirect() {
  const location = useLocation();
  const { lang } = useParams();

  if (!lang || !supportedLangs.has(lang)) {
    return <Navigate to="/" replace />;
  }

  const nextPath = location.pathname.replace(new RegExp(`^/${lang}/`), "/");
  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
}
