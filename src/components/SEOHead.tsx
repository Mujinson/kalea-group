import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = "https://kalea.space";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEOHead = ({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonicalPath,
  structuredData,
}: SEOHeadProps) => {
  const location = useLocation();
  
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    
    // Basic meta tags
    setMetaTag("description", description);
    if (keywords) {
      setMetaTag("keywords", keywords);
    }
    
    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:url", `${BASE_URL}${location.pathname}`, true);
    setMetaTag("og:site_name", "Kalēa®", true);
    setMetaTag("og:locale", location.pathname.startsWith("/it") ? "it_IT" : 
                            location.pathname.startsWith("/de") ? "de_DE" :
                            location.pathname.startsWith("/fr") ? "fr_FR" : "en_US", true);
    
    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);
    
    // Canonical URL
    const canonical = canonicalPath || location.pathname;
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute("href", `${BASE_URL}${canonical}`);
    
    // Hreflang tags
    const languages = ["it", "en", "de", "fr"];
    const pathWithoutLang = location.pathname.replace(/^\/(it|en|de|fr)/, "");
    
    // Remove existing hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    
    // Add hreflang for each language
    languages.forEach(lang => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = `${BASE_URL}/${lang}${pathWithoutLang}`;
      document.head.appendChild(link);
    });
    
    // Add x-default
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = `${BASE_URL}/en${pathWithoutLang}`;
    document.head.appendChild(xDefault);
    
  }, [title, description, keywords, ogImage, ogType, canonicalPath, location.pathname]);
  
  return null;
};

export default SEOHead;