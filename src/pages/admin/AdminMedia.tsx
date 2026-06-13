import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Folder, Image, Film, FileText, ChevronRight } from "lucide-react";
import { CrmPageHeader } from "@/components/admin/CrmShell";
import { useNavigate } from "react-router-dom";

const AdminMedia = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: sites } = useQuery({
    queryKey: ["construction-sites-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("construction_sites")
        .select("id, title, city, tipologia, product_model")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: allMedia } = useQuery({
    queryKey: ["all-site-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_media")
        .select("site_id, file_type");
      if (error) throw error;
      return data;
    },
  });

  const getMediaCount = (siteId: string) => {
    return allMedia?.filter((m) => m.site_id === siteId).length || 0;
  };

  const getMediaBreakdown = (siteId: string) => {
    const siteMedia = allMedia?.filter((m) => m.site_id === siteId) || [];
    return {
      images: siteMedia.filter((m) => m.file_type === "image").length,
      videos: siteMedia.filter((m) => m.file_type === "video").length,
      docs: siteMedia.filter((m) => m.file_type === "document").length,
    };
  };

  const filtered = sites?.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.tipologia?.toLowerCase().includes(q) ||
      s.product_model?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["CRM", "Clienti", "Media"]} title="Media" subtitle="Cartelle media organizzate per cantiere" />


      <div className="flex items-center gap-3 justify-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca cantiere per nome, città, modello..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered?.map((site) => {
          const count = getMediaCount(site.id);
          const breakdown = getMediaBreakdown(site.id);
          return (
            <Card
              key={site.id}
              className="bg-white hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/admin/cantieri/${site.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Folder className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{site.title}</p>
                      <p className="text-xs text-muted-foreground">{site.city}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {site.tipologia && <Badge variant="outline" className="text-[10px]">{site.tipologia}</Badge>}
                  <span className="text-xs text-muted-foreground">{count} file</span>
                </div>
                {count > 0 && (
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {breakdown.images > 0 && (
                      <span className="flex items-center gap-1"><Image className="w-3 h-3" /> {breakdown.images}</span>
                    )}
                    {breakdown.videos > 0 && (
                      <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {breakdown.videos}</span>
                    )}
                    {breakdown.docs > 0 && (
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {breakdown.docs}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {(!filtered || filtered.length === 0) && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Nessun cantiere trovato. Crea prima un cantiere per organizzare i media.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMedia;
