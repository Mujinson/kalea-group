import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Send,
  Clock,
  LogOut,
  HardHat,
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  Package,
  Image,
} from "lucide-react";
import { toast } from "sonner";

const COMMON_MATERIALS = [
  "Cemento", "Sabbia", "Ghiaia", "Mattoni", "Ferro",
  "Legno", "Piastrelle", "Colla", "Stucco", "Guaina",
  "Calcestruzzo", "Intonaco", "Vernice", "Silicone", "Isolante",
];

const WorkerApp = () => {
  const { user, loading, signOut, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch sites
  const { data: sites } = useQuery({
    queryKey: ["worker-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("construction_sites")
        .select("id, title, city, address, status")
        .eq("status", "attivo")
        .order("title");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Today's logs
  const { data: todayLogs } = useQuery({
    queryKey: ["worker-today-logs", user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("site_work_logs")
        .select("*, construction_sites(title)")
        .eq("worker_user_id", user!.id)
        .eq("work_date", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await signIn(email, password);
    setAuthLoading(false);
    if (error) toast.error("Credenziali non valide");
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPhotoPreviewUrls((prev) => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMaterial = (m: string) => {
    setMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSite || !hours || !user) {
      toast.error("Seleziona un cantiere e inserisci le ore");
      return;
    }

    setSubmitting(true);
    try {
      // Create work log
      const { data: log, error: logError } = await supabase
        .from("site_work_logs")
        .insert({
          site_id: selectedSite,
          worker_user_id: user.id,
          hours_worked: parseFloat(hours),
          notes: notes || null,
          materials_used: materials,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Upload photos
      for (const photo of photos) {
        const ext = photo.name.split(".").pop();
        const path = `${selectedSite}/${log.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("work-photos")
          .upload(path, photo);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("work-photos")
          .getPublicUrl(path);

        await supabase.from("site_work_photos").insert({
          work_log_id: log.id,
          file_url: urlData.publicUrl,
          file_name: photo.name,
          file_size: photo.size,
        });
      }

      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["worker-today-logs"] });

      // Reset after 2s
      setTimeout(() => {
        setSelectedSite(null);
        setHours("");
        setNotes("");
        setMaterials([]);
        setPhotos([]);
        setPhotoPreviewUrls([]);
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Errore nell'invio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Cleanup URLs
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#25D366]" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
        <div className="bg-[#075E54] text-white px-5 pt-12 pb-8 text-center">
          <HardHat className="w-14 h-14 mx-auto mb-3 text-[#25D366]" />
          <h1 className="text-2xl font-bold">Kalēa Cantieri</h1>
          <p className="text-white/70 text-sm mt-1">Accedi per iniziare</p>
        </div>
        <div className="flex-1 flex items-start justify-center px-5 pt-8">
          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base rounded-2xl bg-white border-0 shadow-sm px-5"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 text-base rounded-2xl bg-white border-0 shadow-sm px-5"
              required
            />
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full h-14 text-base rounded-2xl bg-[#25D366] hover:bg-[#1da851] text-white font-medium shadow-lg"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Accedi"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-5">
        <div className="text-center">
          <CheckCircle2 className="w-20 h-20 text-[#25D366] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Inviato!</h2>
          <p className="text-[#667781] mt-2">Attività registrata con successo</p>
        </div>
      </div>
    );
  }

  // SITE SELECTION
  if (!selectedSite) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-4 pt-10 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Cantieri</h1>
            <p className="text-xs text-white/60">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Today's summary */}
        {todayLogs && todayLogs.length > 0 && (
          <div className="px-4 pt-3">
            <p className="text-xs font-medium text-[#667781] mb-2">OGGI HAI REGISTRATO</p>
            <div className="space-y-2">
              {todayLogs.map((log: any) => (
                <div key={log.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {(log as any).construction_sites?.title}
                    </p>
                    <p className="text-xs text-[#667781]">{log.hours_worked}h</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site list */}
        <div className="flex-1 px-4 pt-4 pb-6">
          <p className="text-xs font-medium text-[#667781] mb-2">SELEZIONA CANTIERE</p>
          <div className="space-y-2">
            {sites?.map((site) => (
              <button
                key={site.id}
                onClick={() => setSelectedSite(site.id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#075E54]/10 flex items-center justify-center shrink-0">
                    <HardHat className="w-6 h-6 text-[#075E54]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1a1a1a] truncate">{site.title}</p>
                    {site.city && (
                      <p className="text-sm text-[#667781] truncate">{site.city}{site.address ? ` · ${site.address}` : ""}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {(!sites || sites.length === 0) && (
              <div className="text-center py-12">
                <HardHat className="w-12 h-12 text-[#667781]/30 mx-auto mb-3" />
                <p className="text-[#667781]">Nessun cantiere attivo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVITY ENTRY
  const selectedSiteData = sites?.find((s) => s.id === selectedSite);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#075E54] text-white px-4 pt-10 pb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedSite(null)}
          className="text-white/80 hover:text-white hover:bg-white/10 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{selectedSiteData?.title}</h1>
          <p className="text-xs text-white/60">Nuova attività</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 pt-4 pb-32 space-y-4 overflow-y-auto">
        {/* Hours - BIG input */}
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <label className="text-xs font-medium text-[#667781] flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" /> ORE LAVORATE
          </label>
          <div className="flex items-center gap-3">
            {[2, 4, 6, 8].map((h) => (
              <button
                key={h}
                onClick={() => setHours(String(h))}
                className={`flex-1 h-14 rounded-xl text-lg font-bold transition-all ${
                  hours === String(h)
                    ? "bg-[#25D366] text-white shadow-md"
                    : "bg-[#f0f2f5] text-[#1a1a1a] active:bg-[#e0e3e7]"
                }`}
              >
                {h}h
              </button>
            ))}
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              max="24"
              placeholder="Altro"
              value={![2, 4, 6, 8].map(String).includes(hours) ? hours : ""}
              onChange={(e) => setHours(e.target.value)}
              className="flex-1 h-14 text-center text-lg font-bold rounded-xl border-0 bg-[#f0f2f5]"
            />
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <label className="text-xs font-medium text-[#667781] flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4" /> FOTO
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handlePhotoCapture}
          />

          {photoPreviewUrls.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {photoPreviewUrls.map((url, i) => (
                <div key={i} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-14 rounded-xl border-2 border-dashed border-[#25D366]/40 flex items-center justify-center gap-2 text-[#25D366] font-medium active:bg-[#25D366]/5 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Scatta o carica foto
          </button>
        </Card>

        {/* Materials */}
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <label className="text-xs font-medium text-[#667781] flex items-center gap-2 mb-3">
            <Package className="w-4 h-4" /> MATERIALI UTILIZZATI
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_MATERIALS.map((m) => (
              <button
                key={m}
                onClick={() => toggleMaterial(m)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  materials.includes(m)
                    ? "bg-[#25D366] text-white"
                    : "bg-[#f0f2f5] text-[#1a1a1a] active:bg-[#e0e3e7]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <Textarea
            placeholder="Note (opzionale)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border-0 bg-[#f0f2f5] rounded-xl min-h-[80px] text-base resize-none focus-visible:ring-0"
          />
        </Card>
      </div>

      {/* Fixed bottom send button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !hours}
          className="w-full h-16 rounded-2xl text-lg font-bold bg-[#25D366] hover:bg-[#1da851] text-white shadow-xl disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-6 h-6 mr-3" />
              Invia Attività
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WorkerApp;
