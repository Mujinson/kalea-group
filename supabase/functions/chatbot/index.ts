import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sei Kalea Assistant, l'assistente virtuale di Kalea Surfaces — azienda italiana specializzata in pavimenti innovativi e sostenibili.

Il tuo obiettivo è QUALIFICARE il lead e portarlo a:
1. Prenotare un appuntamento/chiamata
2. Lasciare i propri contatti (nome, email, telefono)

REGOLE:
- Rispondi SEMPRE in italiano, in modo cordiale e professionale
- Fai domande per qualificare il lead:
  • Tipo di progetto (residenziale, commerciale, hotel, ufficio, retail)
  • Metratura approssimativa (mq)
  • Zona/città del progetto
  • Budget indicativo
  • Tempistiche
- NON inventare informazioni tecniche che non conosci
- Se il lead è qualificato (ha risposto ad almeno 2-3 domande), proponi di:
  • Fissare una chiamata con un consulente
  • Lasciare email e telefono per essere ricontattato
- Sii conciso, max 2-3 frasi per risposta
- Se ti chiedono prezzi specifici, rispondi che dipende dal progetto e proponi una consulenza gratuita

PRODOTTI KALEA:
- StoneCore 10: Pavimento SPC con nucleo in pietra, resistente e waterproof
- BioCore Floor: Pavimento bio-based, eco-sostenibile
- BioMag Floor: Pavimento magnetico, installazione rapida senza colla
- Kalea Deck: Pavimento per esterni
- Kalea Ceiling: Pannelli per soffitto
- EdgeLine: Profili e battiscopa coordinati

Quando il lead fornisce informazioni di qualificazione, rispondi con un JSON tool call usando la funzione "qualify_lead".
Quando il lead vuole prenotare un appuntamento, usa la funzione "book_appointment".
Quando il lead fornisce i propri contatti, usa la funzione "capture_contact".`;

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "qualify_lead",
              description: "Salva i dati di qualificazione del lead",
              parameters: {
                type: "object",
                properties: {
                  project_type: { type: "string", description: "Tipo di progetto" },
                  sqm: { type: "string", description: "Metratura" },
                  city: { type: "string", description: "Città/zona" },
                  budget: { type: "string", description: "Budget indicativo" },
                  timeline: { type: "string", description: "Tempistiche" },
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
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore AI gateway" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // We need to process tool calls, so we can't just stream through.
    // Collect the full response first to handle tool calls
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let toolCalls: any[] = [];
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) fullContent += delta.content;
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.index !== undefined) {
                if (!toolCalls[tc.index]) toolCalls[tc.index] = { id: tc.id, function: { name: "", arguments: "" } };
                if (tc.id) toolCalls[tc.index].id = tc.id;
                if (tc.function?.name) toolCalls[tc.index].function.name = tc.function.name;
                if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
              }
            }
          }
        } catch { /* partial */ }
      }
    }

    // Process tool calls
    const toolResults: any[] = [];
    for (const tc of toolCalls) {
      if (!tc?.function?.name) continue;
      try {
        const args = JSON.parse(tc.function.arguments);
        
        if (tc.function.name === "qualify_lead" && convId) {
          await supabase
            .from("chatbot_conversations")
            .update({ qualification_data: args })
            .eq("id", convId);
          toolResults.push({ tool_call_id: tc.id, result: "Dati salvati" });
        }
        
        if (tc.function.name === "capture_contact") {
          // Create lead in CRM
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
          toolResults.push({ tool_call_id: tc.id, result: "Contatto salvato nel CRM" });
        }
        
        if (tc.function.name === "book_appointment") {
          // Create lead + appointment
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
              : new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow

            await supabase.from("appointments").insert({
              lead_id: lead.id,
              title: `Appuntamento con ${args.name}`,
              appointment_date: appointmentDate.toISOString(),
              appointment_type: args.appointment_type || "chiamata",
              notes: `Prenotato via chatbot`,
            });

            if (convId) {
              await supabase.from("chatbot_conversations")
                .update({ lead_id: lead.id })
                .eq("id", convId);
            }
          }
          toolResults.push({ tool_call_id: tc.id, result: "Appuntamento prenotato" });
        }
      } catch (e) {
        console.error("Tool call error:", e);
      }
    }

    // Save assistant message
    if (fullContent && convId) {
      await supabase.from("chatbot_messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: fullContent,
      });
    }

    return new Response(JSON.stringify({
      content: fullContent,
      conversation_id: convId,
      tool_results: toolResults,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
