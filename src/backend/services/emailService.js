const https = require("https");

function otpTemplate({ otp, name = "User", purpose = "verification" }) {
  const purposeText = {
    verification: "verify your email",
    "forgot-password": "reset your password",
    login: "complete your login",
  }[purpose] || "verify your identity";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;">LearnVerse</h1>
          <p style="margin:6px 0 0;color:#c4b5fd;font-size:13px;">Learning Reimagined</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 8px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 28px;color:#6b7280;font-size:14px;">Use the OTP below to ${purposeText}. Expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your OTP Code</p>
            <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:12px;color:#4f46e5;">${otp}</p>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;">🔒 Never share this code with anyone.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">
            If you didn't request this, ignore this email.<br/>
            &copy; ${new Date().getFullYear()} LearnVerse. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendOTPEmail(to, otp, { name, purpose } = {}) {
  const subjectMap = {
    verification:      "Verify your email - LearnVerse",
    "forgot-password": "Password reset OTP - LearnVerse",
    login:             "Login OTP - LearnVerse",
  };

  const payload = JSON.stringify({
    sender: { name: "LearnVerse", email: process.env.EMAIL_USER || "mrprincekumarsingh143@gmail.com" },
    to: [{ email: to }],
    subject: subjectMap[purpose] || "Your OTP Code - LearnVerse",
    htmlContent: otpTemplate({ otp, name, purpose }),
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Email service ready");
          resolve(data);
        } else {
          reject(new Error(`Brevo API error: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { sendOTPEmail };
