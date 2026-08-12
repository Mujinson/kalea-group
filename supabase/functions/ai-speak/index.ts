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

    const { text, voice } = await req.json();
    const input = (text ?? "").toString().trim();
    if (!input) {
      return new Response(JSON.stringify({ error: "Testo mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input,
        voice: voice || "alloy",
        stream_format: "sse",
        response_format: "pcm",
        instructions:
          "Parla in italiano con tono naturale, professionale e scorrevole. Leggi i numeri e gli importi in modo discorsivo, con frasi brevi, senza elencare simboli o punti elenco.",
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      console.error("TTS error", res.status, detail);
      const msg =
        res.status === 429
          ? "Troppe richieste, riprova tra poco."
          : res.status === 402
            ? "Crediti AI esauriti."
            : "Sintesi vocale non riuscita.";
      return new Response(JSON.stringify({ error: msg }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-speak", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
