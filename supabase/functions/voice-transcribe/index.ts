const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY non configurata");

    const inForm = await req.formData();
    const file = inForm.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "File audio mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = new FormData();
    form.append("file", file, file.name || "audio.webm");
    form.append("model", "openai/gpt-4o-mini-transcribe");
    form.append("language", "it");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error("Transcription error", res.status, raw);
      const msg =
        res.status === 429
          ? "Troppe richieste, riprova tra poco."
          : res.status === 402
            ? "Crediti AI esauriti."
            : "Trascrizione non riuscita.";
      return new Response(JSON.stringify({ error: msg }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let text = "";
    try {
      text = JSON.parse(raw)?.text ?? "";
    } catch {
      text = raw;
    }

    return new Response(JSON.stringify({ text: (text || "").trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-transcribe", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
