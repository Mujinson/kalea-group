import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { blogPosts, getBlogPost } from "@/data/blogPosts";

const BASE = "https://www.kalea.space";
const fmt = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);
  if (!post) return <Navigate to="/it/blog" replace />;
  const path = `/it/blog/${post.slug}`;
  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      inLanguage: "it-IT",
      mainEntityOfPage: `${BASE}${path}`,
      author: { "@type": "Organization", name: "Kalēa Group S.r.l." },
      publisher: { "@type": "Organization", name: "Kalēa Group S.r.l.", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/it` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/it/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: `${BASE}${path}` },
      ],
    },
  ];

  return (
    <article className="bg-background pt-32 pb-24">
      <SEOHead title={post.seoTitle} description={post.description} canonicalPath={path} ogType="article" italianOnly structuredData={structuredData} />
      <div className="container-custom max-w-3xl">
        <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/it" className="hover:text-foreground">Home</Link> / <Link to="/it/blog" className="hover:text-foreground">Blog</Link>
        </nav>
        <h1 className="font-heading text-3xl md:text-5xl font-semibold text-foreground leading-tight mb-4">{post.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{fmt(post.date)} · {post.readMin} min di lettura · Kalēa®</p>
      </div>
      <div className="container-custom max-w-5xl mb-12">
        <img src={post.cover} alt={post.title} className="w-full aspect-[16/8] object-cover rounded-2xl" />
      </div>
      <div className="container-custom max-w-3xl">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-12 space-y-4">
          <p className="text-foreground"><strong>Il problema:</strong> <span className="text-muted-foreground">{post.problem}</span></p>
          <p className="text-foreground"><strong>La soluzione:</strong> <span className="text-muted-foreground">{post.solution}</span></p>
        </div>

        {post.sections.map((s) => (
          <section key={s.h2} className="mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-4">{s.h2}</h2>
            {s.p.map((t) => (
              <p key={t} className="text-lg text-muted-foreground leading-relaxed mb-4">{t}</p>
            ))}
            {s.list && (
              <ul className="space-y-3 my-4">
                {s.list.map((l) => (
                  <li key={l} className="flex items-start gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.image && <img src={s.image} alt={s.h2} loading="lazy" className="w-full aspect-[16/9] object-cover rounded-2xl mt-6" />}
          </section>
        ))}

        <div className="rounded-2xl bg-card border border-border p-8 text-center my-12">
          <p className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-5">Hai lo stesso problema?</p>
          <Link to={post.cta.link}><Button size="lg" className="gap-2">{post.cta.text} <ArrowRight className="w-4 h-4" /></Button></Link>
          <p className="text-sm text-muted-foreground mt-4">Oppure chiamaci: <a href="tel:+393520351738" className="underline">+39 352 035 1738</a></p>
        </div>

        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Approfondisci</h2>
        <ul className="space-y-2 mb-14">
          {post.related.map((r) => (
            <li key={r.link}><Link to={r.link} className="text-muted-foreground hover:text-foreground underline underline-offset-4">{r.text}</Link></li>
          ))}
        </ul>

        <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Altri articoli</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {others.map((o) => (
            <Link key={o.slug} to={`/it/blog/${o.slug}`} className="group block">
              <img src={o.cover} alt={o.title} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-xl mb-3" />
              <p className="text-sm font-semibold text-foreground group-hover:underline">{o.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogPostPage;
