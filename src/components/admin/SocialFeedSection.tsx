import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, ExternalLink } from "lucide-react";

type SocialKey = "instagram" | "tiktok" | "pinterest" | "facebook" | "linkedin";

interface LatestPost {
  postUrl?: string;
  imageUrl?: string;
  caption?: string;
}

type SocialFeedData = Record<SocialKey, LatestPost>;

const SOCIALS: { key: SocialKey; label: string; hint: string }[] = [
  { key: "instagram", label: "Instagram", hint: "https://www.instagram.com/p/XXXXX/" },
  { key: "tiktok", label: "TikTok", hint: "https://www.tiktok.com/@kaleagroup/video/XXXXX" },
  { key: "pinterest", label: "Pinterest", hint: "https://www.pinterest.com/pin/XXXXX/" },
  { key: "facebook", label: "Facebook", hint: "https://www.facebook.com/kalea/posts/XXXXX" },
  { key: "linkedin", label: "LinkedIn", hint: "https://www.linkedin.com/posts/kalea-XXXXX" },
];

const EMPTY: SocialFeedData = {
  instagram: {}, tiktok: {}, pinterest: {}, facebook: {}, linkedin: {},
};

export default function SocialFeedSection() {
  const [data, setData] = useState<SocialFeedData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "social_latest_posts")
        .maybeSingle();
      if (row?.value) setData({ ...EMPTY, ...(row.value as SocialFeedData) });
      setLoading(false);
    })();
  }, []);

  const update = (k: SocialKey, field: keyof LatestPost, v: string) =>
    setData((prev) => ({ ...prev, [k]: { ...prev[k], [field]: v } }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "social_latest_posts", value: data as any }, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("Errore salvataggio: " + error.message);
    else toast.success("Ultimi post social aggiornati");
  };

  if (loading) return (
    <Card><CardContent className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></CardContent></Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ultimi post social (homepage)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Incolla per ogni social l'URL del post più recente, un'immagine di anteprima e una didascalia breve.
          Le card sulla homepage si aggiorneranno immediatamente. Lascia vuoto per usare la card default (link al profilo).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {SOCIALS.map(({ key, label, hint }) => (
          <div key={key} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{label}</h4>
              {data[key]?.postUrl && (
                <a href={data[key].postUrl} target="_blank" rel="noreferrer"
                   className="text-xs text-primary flex items-center gap-1 hover:underline">
                  Apri post <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">URL del post</Label>
                <Input
                  value={data[key]?.postUrl || ""}
                  onChange={(e) => update(key, "postUrl", e.target.value)}
                  placeholder={hint}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL immagine anteprima (thumbnail)</Label>
                <Input
                  value={data[key]?.imageUrl || ""}
                  onChange={(e) => update(key, "imageUrl", e.target.value)}
                  placeholder="https://... (jpg/png/webp)"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Didascalia (max 100 caratteri)</Label>
              <Textarea
                value={data[key]?.caption || ""}
                onChange={(e) => update(key, "caption", e.target.value.slice(0, 100))}
                placeholder="Es. Cantiere Villa Como — Hypermatt XL"
                rows={2}
              />
            </div>
            {data[key]?.imageUrl && (
              <div className="w-32 aspect-[4/5] rounded overflow-hidden border">
                <img src={data[key].imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salva tutti
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
