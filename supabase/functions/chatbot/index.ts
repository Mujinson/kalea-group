import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei l'assistente Kalea®, azienda italiana di pavimenti innovativi e sostenibili.

OBIETTIVO: Qualificare il contatto e farlo prenotare una consulenza gratuita.

STILE:
- Risposte BREVI: max 2 frasi + 1 domanda
- Tono amichevole ma professionale
- Mai inventare dati tecnici
- Se chiedono prezzi: "Dipende dal progetto! Posso farti fare una consulenza gratuita?"

QUALIFICAZIONE (chiedi 1 cosa alla volta):
1. Che tipo di progetto? (casa, hotel, ufficio, negozio)
2. Quanti mq circa?
3. In che zona?
4. Quando vorresti iniziare?

Dopo 2-3 risposte → proponi subito di lasciare nome e telefono per una consulenza gratuita.

PRODOTTI: StoneCore 10 (SPC waterproof), BioCore Floor (bio-based), BioMag Floor (magnetico), Kalea Deck (esterni), Kalea Ceiling (soffitti), EdgeLine (profili).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, session_id, conversation_id } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or get conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv } = await supabase
        .from("chatbot_conversations")
        .insert({ session_id: session_id || crypto.randomUUID(), channel: "website" })
        .select("id")
        .single();
      convId = conv?.id;
    }

    // Save user message
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
          name: "qualify_lead",
          description: "Salva i dati di qualificazione del lead",
          parameters: {
            type: "object",
            properties: {
              project_type: { type: "string" },
              sqm: { type: "string" },
              city: { type: "string" },
              budget: { type: "string" },
              timeline: { type: "string" },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "book_appointment",
          description: "Prenota un appuntamento/chiamata",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              preferred_date: { type: "string" },
              preferred_time: { type: "string" },
              appointment_type: { type: "string", enum: ["chiamata", "videochiamata", "visita"] },
            },
            required: ["name", "phone"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "capture_contact",
          description: "Salva i contatti del lead",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              company: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
    ];

    // Use non-streaming for reliability
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

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
            ...messages.slice(-10), // Keep last 10 messages for context, avoid huge payloads
          ],
          tools,
        }),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === "AbortError") {
        return new Response(JSON.stringify({
          content: "Scusa, ci sto mettendo troppo! 😅 Riprova con la tua domanda.",
          conversation_id: convId,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({
          content: "Un attimo, sono un po' occupato! Riprova tra qualche secondo. 😊",
          conversation_id: convId,
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          content: "Mi scuso, ho un problema tecnico temporaneo. Puoi contattarci direttamente a info@kaleasurfaces.com!",
          conversation_id: convId,
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({
        content: "Scusa, ho avuto un problema. Riprova! 😊",
        conversation_id: convId,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    let fullContent = choice?.message?.content || "";
    const toolCalls = choice?.message?.tool_calls || [];

    // Process tool calls
    for (const tc of toolCalls) {
      if (!tc?.function?.name) continue;
      try {
        const args = JSON.parse(tc.function.arguments);

        if (tc.function.name === "qualify_lead" && convId) {
          await supabase
            .from("chatbot_conversations")
            .update({ qualification_data: args })
            .eq("id", convId);
        }

        if (tc.function.name === "capture_contact") {
          const { data: lead } = await supabase.from("leads").insert({
            name: args.name || "Contatto Chatbot",
            email: args.email || "",
            phone: args.phone || "",
            company_name: args.company || null,
            source: "chatbot_website",
            status: "nuovo",
            pipeline_stage: "warm",
          }).select("id").single();

          if (lead && convId) {
            await supabase.from("chatbot_conversations")
              .update({ lead_id: lead.id })
              .eq("id", convId);
          }
        }

        if (tc.function.name === "book_appointment") {
          const { data: lead } = await supabase.from("leads").insert({
            name: args.name || "Contatto Chatbot",
            email: args.email || "",
            phone: args.phone || "",
            source: "chatbot_website",
            status: "qualificato",
            pipeline_stage: "hot",
          }).select("id").single();

          if (lead) {
            const appointmentDate = args.preferred_date
              ? new Date(`${args.preferred_date}T${args.preferred_time || "10:00"}:00`)
              : new Date(Date.now() + 24 * 60 * 60 * 1000);

            await supabase.from("appointments").insert({
              lead_id: lead.id,
              title: `Appuntamento con ${args.name}`,
              appointment_date: appointmentDate.toISOString(),
              appointment_type: args.appointment_type || "chiamata",
              notes: "Prenotato via chatbot",
            });

            if (convId) {
              await supabase.from("chatbot_conversations")
                .update({ lead_id: lead.id })
                .eq("id", convId);
            }
          }
        }
      } catch (e) {
        console.error("Tool call error:", e);
      }
    }

    // If model returned only tool calls with no content, do a follow-up call
    if (!fullContent && toolCalls.length > 0) {
      try {
        const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.slice(-6),
              { role: "assistant", content: null, tool_calls: toolCalls.map((tc: any) => ({
                id: tc.id, type: "function", function: { name: tc.function.name, arguments: tc.function.arguments }
              }))},
              ...toolCalls.map((tc: any) => ({
                role: "tool", tool_call_id: tc.id, content: "Fatto con successo"
              })),
            ],
          }),
        });
        if (followUp.ok) {
          const followData = await followUp.json();
          fullContent = followData.choices?.[0]?.message?.content || "Perfetto, ho salvato tutto! Come posso aiutarti ancora? 😊";
        }
      } catch {
        fullContent = "Perfetto, ho preso nota! Posso aiutarti con altro? 😊";
      }
    }

    // Fallback if still empty
    if (!fullContent) {
      fullContent = "Scusa, puoi ripetere? Sono qui per aiutarti! 😊";
    }

    // Save assistant message
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
      content: "Mi scuso, c'è stato un problema tecnico. Riprova tra un momento! 😊",
      conversation_id: null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
