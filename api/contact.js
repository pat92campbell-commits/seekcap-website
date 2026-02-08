import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY env var" });
  }

  try {
    // If you're submitting as form-encoded, handle that too:
    const data =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { name, mobile, email, service, budget, notes } = data || {};

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: "Seek Auto <onboarding@resend.dev>", // change later to your domain once verified
      to: ["hello@seekautocars.com.au"],
      reply_to: email,
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

    // If Resend returns an error, surface it:
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}

 
