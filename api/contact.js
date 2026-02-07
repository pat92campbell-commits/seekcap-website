const { Resend } = require("resend");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { name, mobile, email, service, budget, notes } = req.body || {};

    await resend.emails.send({
      // IMPORTANT:
      // Use this for now unless you've verified seekautocars.com.au in Resend:
      from: "Seek Auto <onboarding@resend.dev>",
      to: ["hello@seekautocars.com.au"],
      subject: `New Seek Auto Lead — ${name || "Unknown"}`,
      reply_to: email || undefined,
      html: `
        <h2>New Lead Submitted</h2>
        <p><b>Name:</b> ${name || ""}</p>
        <p><b>Mobile:</b> ${mobile || ""}</p>
        <p><b>Email:</b> ${email || ""}</p>
        <p><b>Service:</b> ${service || ""}</p>
        <p><b>Budget:</b> ${budget || ""}</p>
        <p><b>Notes:</b> ${notes || ""}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email failed to send" });
  }
};
 
