import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Process pending automations
    const now = new Date().toISOString();
    const { data: pendingAutomations } = await supabase
      .from("lead_automations")
      .select("*, leads(*)")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .limit(50);

    let processed = 0;

    for (const auto of pendingAutomations || []) {
      try {
        if (auto.automation_type === "follow_up_email") {
          // Mark as executed - actual email sending can be integrated later
          console.log(`Follow-up for lead ${auto.lead_id}: ${JSON.stringify(auto.payload)}`);
        }

        if (auto.automation_type === "stage_upgrade") {
          // Auto-upgrade pipeline stage based on interactions
          const lead = auto.leads;
          if (lead) {
            let newStage = lead.pipeline_stage;
            if (lead.pipeline_stage === "cold" && lead.qualification_score >= 20) newStage = "warm";
            if (lead.pipeline_stage === "warm" && lead.qualification_score >= 50) newStage = "hot";

            if (newStage !== lead.pipeline_stage) {
              await supabase.from("leads")
                .update({ pipeline_stage: newStage })
                .eq("id", lead.id);
            }
          }
        }

        if (auto.automation_type === "appointment_reminder") {
          const { data: appointment } = await supabase
            .from("appointments")
            .select("*, leads(*)")
            .eq("id", auto.payload?.appointment_id)
            .single();

          if (appointment && !appointment.reminder_sent) {
            console.log(`Reminder for appointment ${appointment.id} with ${appointment.leads?.name}`);
            await supabase.from("appointments")
              .update({ reminder_sent: true })
              .eq("id", appointment.id);
          }
        }

        await supabase.from("lead_automations")
          .update({ status: "executed", executed_at: now })
          .eq("id", auto.id);
        processed++;
      } catch (e) {
        console.error(`Automation ${auto.id} failed:`, e);
        await supabase.from("lead_automations")
          .update({ status: "failed" })
          .eq("id", auto.id);
      }
    }

    // 2. Create follow-up automations for new leads without any
    const { data: leadsWithoutFollowup } = await supabase
      .from("leads")
      .select("id, created_at, pipeline_stage")
      .in("status", ["nuovo", "contattato"])
      .order("created_at", { ascending: false })
      .limit(100);

    let scheduled = 0;
    for (const lead of leadsWithoutFollowup || []) {
      // Check if already has a pending automation
      const { data: existing } = await supabase
        .from("lead_automations")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("status", "pending")
        .limit(1);

      if (!existing || existing.length === 0) {
        // Schedule follow-up 24h after creation
        const followUpDate = new Date(lead.created_at);
        followUpDate.setHours(followUpDate.getHours() + 24);

        if (followUpDate > new Date()) {
          await supabase.from("lead_automations").insert({
            lead_id: lead.id,
            automation_type: "follow_up_email",
            scheduled_at: followUpDate.toISOString(),
            payload: { type: "first_followup", message: "Ricordo di contattare il lead" },
          });
          scheduled++;
        }
      }
    }

    // 3. Create appointment reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { data: upcomingAppointments } = await supabase
      .from("appointments")
      .select("id, appointment_date, lead_id")
      .eq("status", "confermato")
      .eq("reminder_sent", false)
      .lte("appointment_date", tomorrow.toISOString())
      .gte("appointment_date", now);

    for (const apt of upcomingAppointments || []) {
      const reminderTime = new Date(apt.appointment_date);
      reminderTime.setHours(reminderTime.getHours() - 1); // 1h before

      if (reminderTime > new Date()) {
        const { data: existing } = await supabase
          .from("lead_automations")
          .select("id")
          .eq("automation_type", "appointment_reminder")
          .eq("status", "pending")
          .contains("payload", { appointment_id: apt.id })
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from("lead_automations").insert({
            lead_id: apt.lead_id,
            automation_type: "appointment_reminder",
            scheduled_at: reminderTime.toISOString(),
            payload: { appointment_id: apt.id },
          });
        }
      }
    }

    return new Response(JSON.stringify({
      processed,
      scheduled,
      reminders: upcomingAppointments?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Automation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
