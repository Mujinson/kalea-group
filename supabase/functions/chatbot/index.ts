import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei l'assistente Kalēa®, hub di superfici di lusso (pavimenti, ceramiche, parquet, outdoor).

REGOLA D'ORO: NON dare MAI dettagli tecnici, prezzi, dimensioni, specifiche, posa, manutenzione, tempi o consigli progettuali. Per qualsiasi domanda tecnica → fai contattare un tecnico Kalēa.

COSA PUOI DIRE (solo a grandi linee, max 1 frase):
- Abbiamo collezioni di pavimenti (Hypermatt, BIOMAG FLOOR®), parquet, ceramiche per interni ed esterni, outdoor (Externo), soffitti e profili.
- Tutto curato come selezione esclusiva Kalēa.
NON entrare mai nei dettagli di una specifica collezione o prodotto.

FLUSSO OBBLIGATORIO:
1. Saluta brevemente e chiedi cosa cerca (1 frase).
2. A QUALSIASI domanda specifica rispondi: "Per darti una risposta precisa ti faccio richiamare da un nostro tecnico Kalēa. Posso prendere i tuoi dati?"
3. Raccogli UNO ALLA VOLTA, in questo ordine:
   - Nome e cognome
   - Località (città/zona)
   - Numero di telefono
   - Email
   - Breve descrizione della richiesta
   - SOLO se ha già menzionato un prodotto specifico, chiedi conferma del prodotto di interesse.
4. Quando hai TUTTI i dati obbligatori (nome, località, telefono, email, richiesta), chiama lo strumento capture_contact con tutti i campi e rispondi:
   "Grazie! Un tecnico Kalēa ti contatterà a breve. Buona giornata."

STILE: max 2 frasi, tono cortese, mai emoji eccessive, mai inventare nulla. Se l'utente insiste per dettagli tecnici ripeti gentilmente che li darà il tecnico.`;

async function notifyTelegram(text: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const CHAT_ID = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !CHAT_ID) {
    console.warn("Telegram notify skipped: missing env vars");
    return;
  }
  try {
    const r = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    });
    if (!r.ok) console.error("Telegram error", r.status, await r.text());
  } catch (e) {
    console.error("Telegram notify failed", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, session_id, conversation_id } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let convId = conversation_id;
    if (!convId) {
      const { data: conv } = await supabase
        .from("chatbot_conversations")
        .insert({ session_id: session_id || crypto.randomUUID(), channel: "website" })
        .select("id")
        .single();
      convId = conv?.id;
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && convId) {
      await supabase.from("chatbot_messages").insert({
        conversation_id: convId,
        role: lastMsg.role,
        content: lastMsg.content,
      });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "capture_contact",
          description: "Salva i dati di contatto raccolti e notifica il team Kalēa. Chiamare SOLO quando hai raccolto nome, località, telefono, email e descrizione della richiesta.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome e cognome" },
              location: { type: "string", description: "Città o zona" },
              phone: { type: "string" },
              email: { type: "string" },
              request: { type: "string", description: "Breve descrizione della richiesta" },
              product: { type: "string", description: "Prodotto specifico se menzionato dall'utente, altrimenti vuoto" },
            },
            required: ["name", "location", "phone", "email", "request"],
          },
        },
      },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-12),
          ],
          tools,
        }),
        signal: controller.signal,
      });
    } catch (e: any) {
      clearTimeout(timeout);
      if (e.name === "AbortError") {
        return new Response(JSON.stringify({
          content: "Scusa, un attimo di lentezza. Riprova!",
          conversation_id: convId,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({
          content: "Un attimo, riprova tra qualche secondo.",
          conversation_id: convId,
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          content: "Problema tecnico temporaneo. Scrivici a info@kalea.space.",
          conversation_id: convId,
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({
        content: "Scusa, ho avuto un problema. Riprova.",
        conversation_id: convId,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    let fullContent = choice?.message?.content || "";
    const toolCalls = choice?.message?.tool_calls || [];

    for (const tc of toolCalls) {
      if (tc?.function?.name !== "capture_contact") continue;
      try {
        const args = JSON.parse(tc.function.arguments);
        const { data: lead } = await supabase.from("leads").insert({
          name: args.name || "Contatto Chatbot",
          email: args.email || "",
          phone: args.phone || "",
          city: args.location || null,
          notes: [args.request, args.product ? `Prodotto: ${args.product}` : null].filter(Boolean).join(" — "),
          source: "chatbot_website",
          status: "nuovo",
          pipeline_stage: "warm",
        }).select("id").single();

        if (lead && convId) {
          await supabase.from("chatbot_conversations")
            .update({ lead_id: lead.id })
            .eq("id", convId);
        }

        const msg =
          `🔔 <b>Nuovo lead chatbot Kalēa</b>\n\n` +
          `👤 <b>Nome:</b> ${args.name}\n` +
          `📍 <b>Località:</b> ${args.location}\n` +
          `📞 <b>Telefono:</b> ${args.phone}\n` +
          `✉️ <b>Email:</b> ${args.email}\n` +
          `📝 <b>Richiesta:</b> ${args.request}` +
          (args.product ? `\n🏷️ <b>Prodotto:</b> ${args.product}` : "");
        await notifyTelegram(msg);
      } catch (e) {
        console.error("capture_contact error:", e);
      }
    }

    if (!fullContent && toolCalls.length > 0) {
      fullContent = "Grazie! Un tecnico Kalēa ti contatterà a breve. Buona giornata.";
    }
    if (!fullContent) {
      fullContent = "Scusa, puoi ripetere?";
    }

    if (convId) {
      await supabase.from("chatbot_messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: fullContent,
      });
    }

    return new Response(JSON.stringify({
      content: fullContent,
      conversation_id: convId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chatbot error:", e);
    return new Response(JSON.stringify({
      content: "Mi scuso, problema tecnico. Riprova tra un momento.",
      conversation_id: null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
