import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { blogPosts } from "@/data/blogPosts";

const fmt = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

const Blog = () => (
  <div className="bg-background pt-32 pb-24">
    <SEOHead
      title="Blog Kalēa® — Guide su pavimenti SPC, parquet, laminati ed esterni"
      description="Guide pratiche per scegliere e posare il pavimento giusto: SPC, parquet prefinito, laminato, vinilico, pavimenti per esterni e levigatura parquet."
      canonicalPath="/it/blog"
      italianOnly
    />
    <div className="container-custom max-w-6xl">
      <p className="text-xs tracking-[0.3em] uppercase text-foreground/50 font-medium mb-3">Blog</p>
      <h1 className="font-heading text-3xl md:text-5xl font-semibold text-foreground mb-4">Guide ai pavimenti</h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
        Ogni articolo parte da un problema reale e ti spiega come risolverlo, con i consigli dei nostri posatori.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((p) => (
          <Link key={p.slug} to={`/it/blog/${p.slug}`} className="group block rounded-2xl border border-border bg-card overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={p.cover} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <p className="text-xs text-muted-foreground mb-2">{fmt(p.date)} · {p.readMin} min</p>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3 leading-snug">{p.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-3">{p.problem}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Blog;
