import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Trash2, Play, Image, Film, FileText, Search, Download } from "lucide-react";
import { toast } from "sonner";

const AdminCantiereDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");

  const { data: site } = useQuery({
    queryKey: ["construction-site", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("construction_sites")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ["site-media", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_media")
        .select("*")
        .eq("site_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    setUploading(true);
    let uploaded = 0;

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-media")
        .upload(path, file);

      if (uploadError) {
        toast.error(`Errore upload: ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("site-media").getPublicUrl(path);

      const fileType = file.type.startsWith("video") ? "video" :
        file.type.startsWith("image") ? "image" : "document";

      await supabase.from("site_media").insert({
        site_id: id,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
      });

      uploaded++;
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    queryClient.invalidateQueries({ queryKey: ["site-media", id] });
    toast.success(`${uploaded} file caricati`);
  };

  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    // Extract path from URL
    const urlParts = fileUrl.split("/site-media/");
    if (urlParts[1]) {
      await supabase.storage.from("site-media").remove([urlParts[1]]);
    }
    await supabase.from("site_media").delete().eq("id", mediaId);
    queryClient.invalidateQueries({ queryKey: ["site-media", id] });
    toast.success("File eliminato");
  };

  const filteredMedia = media?.filter((m) => {
    if (!mediaSearch) return true;
    return m.file_name.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      m.file_type.toLowerCase().includes(mediaSearch.toLowerCase());
  });

  const images = filteredMedia?.filter((m) => m.file_type === "image") || [];
  const videos = filteredMedia?.filter((m) => m.file_type === "video") || [];
  const docs = filteredMedia?.filter((m) => m.file_type === "document") || [];

  if (!site) return <div className="p-8 text-center text-muted-foreground">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/cantieri")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Cantieri › {site.title}</p>
          <h1 className="text-2xl font-bold text-foreground">{site.title}</h1>
          {site.project_name && <p className="text-sm text-muted-foreground">{site.project_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          {site.tipologia && <Badge variant="outline">{site.tipologia}</Badge>}
          <Badge variant={site.status === "attivo" ? "default" : "secondary"}>{site.status}</Badge>
        </div>
      </div>

      {/* Site info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Indirizzo</p>
            <p className="text-sm font-medium">
              {[site.address, site.city, site.province, site.postal_code].filter(Boolean).join(", ") || "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Modello posato</p>
            <p className="text-sm font-medium">{site.product_model || "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Contatto</p>
            <p className="text-sm font-medium">
              {[site.contact_name, site.contact_surname].filter(Boolean).join(" ") || "—"}
            </p>
            {site.contact_phone && <p className="text-xs text-muted-foreground">{site.contact_phone}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Media section */}
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Media ({media?.length || 0})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca file..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Caricamento..." : "Carica file"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Images */}
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" /> Foto ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="group relative rounded-lg overflow-hidden border border-border aspect-square">
                    <img
                      src={img.file_url}
                      alt={img.file_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-8 h-8"
                          onClick={() => window.open(img.file_url, "_blank")}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="w-8 h-8"
                          onClick={() => handleDeleteMedia(img.id, img.file_url)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                      {img.file_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Film className="w-4 h-4" /> Video ({videos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.map((vid) => (
                  <div key={vid.id} className="rounded-lg overflow-hidden border border-border">
                    <video
                      src={vid.file_url}
                      controls
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-2 flex items-center justify-between">
                      <p className="text-xs truncate flex-1">{vid.file_name}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => handleDeleteMedia(vid.id, vid.file_url)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {docs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Documenti ({docs.length})
              </h3>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.file_name}</p>
                        {doc.file_size && <p className="text-xs text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(1)} MB</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => window.open(doc.file_url, "_blank")}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleDeleteMedia(doc.id, doc.file_url)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!filteredMedia || filteredMedia.length === 0) && !mediaLoading && (
            <div className="py-12 text-center">
              <Image className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nessun file caricato</p>
              <p className="text-xs text-muted-foreground mt-1">
                Carica foto, video o documenti del cantiere
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCantiereDetail;
