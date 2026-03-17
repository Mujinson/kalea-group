import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle webhook verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("Meta webhook received:", JSON.stringify(body));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Process entries
    for (const entry of body.entry || []) {
      // Instagram messaging
      if (entry.messaging) {
        for (const event of entry.messaging) {
          if (event.message?.text) {
            await processIncomingMessage(supabase, {
              channel: detectChannel(body.object),
              sender_id: event.sender?.id,
              message: event.message.text,
              timestamp: event.timestamp,
            }, LOVABLE_API_KEY);
          }
        }
      }

      // WhatsApp changes
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === "messages" && change.value?.messages) {
            for (const msg of change.value.messages) {
              if (msg.type === "text") {
                const contact = change.value.contacts?.find((c: any) => c.wa_id === msg.from);
                await processIncomingMessage(supabase, {
                  channel: "whatsapp",
                  sender_id: msg.from,
                  sender_name: contact?.profile?.name,
                  message: msg.text.body,
                  timestamp: msg.timestamp,
                  phone_number_id: change.value.metadata?.phone_number_id,
                }, LOVABLE_API_KEY);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function detectChannel(object: string): string {
  if (object === "instagram") return "instagram";
  if (object === "whatsapp_business_account") return "whatsapp";
  return "facebook";
}

async function processIncomingMessage(
  supabase: any,
  data: {
    channel: string;
    sender_id: string;
    sender_name?: string;
    message: string;
    timestamp: any;
    phone_number_id?: string;
  },
  lovableApiKey: string | undefined
) {
  const sessionId = `${data.channel}_${data.sender_id}`;

  // Find or create conversation
  let { data: conv } = await supabase
    .from("chatbot_conversations")
    .select("id, qualification_data")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!conv) {
    const { data: newConv } = await supabase
      .from("chatbot_conversations")
      .insert({ session_id: sessionId, channel: data.channel })
      .select("id")
      .single();
    conv = newConv;
  }

  if (!conv) return;

  // Save incoming message
  await supabase.from("chatbot_messages").insert({
    conversation_id: conv.id,
    role: "user",
    content: data.message,
    metadata: { sender_id: data.sender_id, sender_name: data.sender_name },
  });

  // Get conversation history
  const { data: history } = await supabase
    .from("chatbot_messages")
    .select("role, content")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true })
    .limit(20);

  const messages = (history || []).map((m: any) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  // Generate AI response
  if (!lovableApiKey) {
    console.error("No LOVABLE_API_KEY for AI response");
    return;
  }

  try {
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sei Kalea Assistant per ${data.channel}. Rispondi in italiano, in modo cordiale e breve (max 200 caratteri per messaggio social). Qualifica il lead chiedendo: tipo progetto, mq, zona, budget. Quando hai i dati, proponi un appuntamento o una chiamata. Se il lead dà nome/email/telefono, salva il contatto.`,
          },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "capture_contact",
              description: "Salva i contatti del lead nel CRM",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  project_type: { type: "string" },
                  sqm: { type: "string" },
                  city: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", aiResponse.status);
      return;
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];
    let replyText = choice?.message?.content || "";

    // Handle tool calls
    if (choice?.message?.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        if (tc.function?.name === "capture_contact") {
          const args = JSON.parse(tc.function.arguments);
          const { data: lead } = await supabase.from("leads").insert({
            name: args.name || data.sender_name || "Social Lead",
            email: args.email || "",
            phone: args.phone || "",
            source: `chatbot_${data.channel}`,
            status: "nuovo",
            pipeline_stage: args.sqm || args.city ? "warm" : "cold",
            project_type: args.project_type || null,
            project_sqm: args.sqm || null,
            city: args.city || null,
          }).select("id").single();

          if (lead) {
            await supabase.from("chatbot_conversations")
              .update({ lead_id: lead.id })
              .eq("id", conv.id);
          }
        }
      }
    }

    // Save AI response
    if (replyText) {
      await supabase.from("chatbot_messages").insert({
        conversation_id: conv.id,
        role: "assistant",
        content: replyText,
      });

      // Send reply back via Meta API
      await sendReply(data, replyText);
    }
  } catch (e) {
    console.error("AI processing error:", e);
  }
}

async function sendReply(
  data: { channel: string; sender_id: string; phone_number_id?: string },
  text: string
) {
  const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
  if (!META_ACCESS_TOKEN) {
    console.error("No META_ACCESS_TOKEN configured");
    return;
  }

  try {
    if (data.channel === "whatsapp" && data.phone_number_id) {
      // WhatsApp Business API
      await fetch(`https://graph.facebook.com/v21.0/${data.phone_number_id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: data.sender_id,
          type: "text",
          text: { body: text },
        }),
      });
    } else if (data.channel === "instagram") {
      // Instagram Send API
      await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: data.sender_id },
          message: { text },
        }),
      });
    } else {
      // Facebook Messenger
      await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: data.sender_id },
          message: { text },
        }),
      });
    }
  } catch (e) {
    console.error("Send reply error:", e);
  }
}
