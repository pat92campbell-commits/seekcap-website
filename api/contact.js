import { Resend } from "resend";

function parseBody(req) {
  // Vercel functions sometimes give string body for forms
  const body = req.body;

  // If already an object, use it
  if (body && typeof body === "object") return body;

  // If it's a string, it might be JSON OR urlencoded
  if (typeof body === "string") {
    // Try JSON first
    try {
      return JSON.parse(body);
    } catch (e) {
      // Fallback: parse urlencoded (name=...&email=...)
      const params = new URLSearchParams(body);
      return Object.fromEntries(params.entries());
    }
  }

  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });
  }

  const data = parseBody(req);
  const { name, mobile, email, service, budget, notes } = data || {};

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: "Seek Auto <onboarding@resend.dev>",
      to: ["hello@seekautocars.com.au"],
      reply_to: email || undefined,
      subject: `New Seek Auto lead: ${name || "Unknown"}`,
      text: `
Name: ${name || ""}
Mobile: ${mobile || ""}
Email: ${email || ""}
Service: ${service || ""}
Budget: ${budget || ""}
Message: ${notes || ""}
      `.trim(),
    });

    if (result.error) {
      return res.status(500).json({ ok: false, error: result.error });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}


 
