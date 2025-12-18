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
  honeypot?: string; // Hidden field for bot detection
}

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// HTML escape function to prevent XSS in email templates
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Sanitize and validate input
function sanitizeInput(input: string | undefined, maxLength: number = 1000): string {
  if (!input) return "";
  // Trim and limit length
  const trimmed = input.trim().slice(0, maxLength);
  // Escape HTML
  return escapeHtml(trimmed);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "X-RateLimit-Remaining": "0",
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }

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
    const rawData: ContactEmailRequest = await req.json();

    // Honeypot check - if filled, it's likely a bot
    if (rawData.honeypot && rawData.honeypot.trim() !== "") {
      console.warn(`Honeypot triggered from IP: ${clientIp}`);
      // Return success to not reveal detection to bots
      return new Response(
        JSON.stringify({ success: true, message: "Form submitted" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize all user inputs
    const name = sanitizeInput(rawData.name, 100);
    const surname = sanitizeInput(rawData.surname, 100);
    const email = sanitizeInput(rawData.email, 255);
    const phone = sanitizeInput(rawData.phone, 50);
    const userType = sanitizeInput(rawData.userType, 100);
    const message = sanitizeInput(rawData.message, 5000);
    
    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Sanitize interests array
    const interests = rawData.interests?.map(i => sanitizeInput(i, 100)) || [];

    console.log(`Contact form submission from IP ${clientIp}:`, { name, surname, email: rawData.email, userType });

    // Format interests list
    const interestsList = interests.length > 0 
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
        <hr>
        <p style="color: #666; font-size: 12px;">IP: ${clientIp}</p>
      `,
    });

    console.log("Email to Kalea sent:", emailToKalea);

    // Send confirmation email to user
    const emailToUser = await resend.emails.send({
      from: "Kalea <noreply@kalea.space>",
      to: [rawData.email], // Use original email for delivery
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
        headers: { 
          "Content-Type": "application/json", 
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          ...corsHeaders 
        },
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
