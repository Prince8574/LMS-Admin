const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((err) => {
  if (err) console.error("❌ Email service error:", err.message);
  else console.log("✅ Email service ready");
});

// ── Templates ────────────────────────────────────────────────────────────────

function otpTemplate({ otp, name = "User", purpose = "verification" }) {
  const purposeText = {
    verification: "verify your email",
    "forgot-password": "reset your password",
    login: "complete your login",
  }[purpose] || "verify your identity";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">LearnVerse</h1>
              <p style="margin:6px 0 0;color:#c4b5fd;font-size:13px;">Learning Reimagined</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the OTP below to ${purposeText}. It expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:10px;
                          padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;text-transform:uppercase;
                           letter-spacing:2px;font-weight:600;">Your OTP Code</p>
                <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:12px;color:#4f46e5;">
                  ${otp}
                </p>
              </div>

              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                ⏱ This code expires in 10 minutes.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                🔒 Never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">
                If you didn't request this, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} LearnVerse. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Send Functions ────────────────────────────────────────────────────────────

async function sendOTPEmail(to, otp, { name, purpose } = {}) {
  const subjectMap = {
    verification:      "Verify your email - LearnVerse",
    "forgot-password": "Password reset OTP - LearnVerse",
    login:             "Login OTP - LearnVerse",
  };

  await transporter.sendMail({
    from: `"LearnVerse" <${process.env.BREVO_SMTP_LOGIN}>`,
    to,
    subject: subjectMap[purpose] || "Your OTP Code - LearnVerse",
    html: otpTemplate({ otp, name, purpose }),
  });
}

module.exports = { sendOTPEmail };
