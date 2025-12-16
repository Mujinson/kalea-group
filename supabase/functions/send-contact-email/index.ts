import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  userType?: string;
  interests?: string[];
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    const { name, surname, email, phone, userType, interests, message }: ContactEmailRequest = await req.json();

    console.log("Received contact form submission:", { name, surname, email, userType });

    // Format interests list
    const interestsList = interests && interests.length > 0 
      ? interests.join(", ") 
      : "Nessuno specificato";

    // Send email to Kalea
    const emailToKalea = await resend.emails.send({
      from: "Kalea Website <noreply@kalea.space>",
      to: ["info@kalea.space"],
      subject: `Nuova richiesta da ${name} ${surname}`,
      html: `
        <h2>Nuova richiesta di contatto</h2>
        <p><strong>Nome:</strong> ${name} ${surname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefono:</strong> ${phone || "Non specificato"}</p>
        <p><strong>Tipo utente:</strong> ${userType || "Non specificato"}</p>
        <p><strong>Interessi:</strong> ${interestsList}</p>
        <h3>Messaggio:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("Email to Kalea sent:", emailToKalea);

    // Send confirmation email to user
    const emailToUser = await resend.emails.send({
      from: "Kalea <noreply@kalea.space>",
      to: [email],
      subject: "Abbiamo ricevuto la tua richiesta - Kalea",
      html: `
        <h2>Grazie per averci contattato, ${name}!</h2>
        <p>Abbiamo ricevuto la tua richiesta e ti risponderemo il prima possibile.</p>
        <p>Nel frattempo, puoi visitare il nostro sito per scoprire di più sui nostri prodotti.</p>
        <br>
        <p>Cordiali saluti,<br>Il Team Kalea</p>
      `,
    });

    console.log("Confirmation email to user sent:", emailToUser);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
