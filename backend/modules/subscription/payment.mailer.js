import nodemailer from "nodemailer";

/**
 * Creates a nodemailer transporter from environment variables.
 * Configure these in backend/.env:
 *   MAIL_HOST     — e.g. smtp.gmail.com
 *   MAIL_PORT     — e.g. 587
 *   MAIL_USER     — your email address
 *   MAIL_PASS     — app password / SMTP password
 *   MAIL_FROM     — "YoLab <noreply@yolab.in>"
 */
function createTransporter() {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null; // Not configured — silently skip
  }
  return nodemailer.createTransport({
    host:   process.env.MAIL_HOST,
    port:   Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

/**
 * Sends a payment receipt email to the user.
 * @param {object} opts
 * @param {object} opts.user      - req.user (must have .email and .name)
 * @param {string} opts.paymentId - Razorpay payment ID
 * @param {string} opts.orderId   - Razorpay order ID
 * @param {number} opts.amount    - Amount in ₹ (not paise)
 * @param {Date}   opts.expiresAt - When the Pro plan expires
 */
export async function sendPaymentReceiptEmail({ user, paymentId, orderId, amount, expiresAt }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log("[mailer] Email not configured — skipping receipt email.");
    return;
  }

  const expiryStr = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "N/A";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="margin:0;padding:0;background:#050505;font-family:system-ui,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#111111;border:1px solid #262626;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <div style="padding:28px 32px;border-bottom:1px solid #262626;">
          <span style="font-size:20px;font-weight:700;color:#f5f5f5;">Yo<span style="color:#737373;">Lab</span></span>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f5f5f5;">
            Payment Confirmed ✓
          </h1>
          <p style="margin:0 0 24px;color:#a3a3a3;font-size:14px;">
            Hi ${user.name || "there"}, your YoLab Pro plan is now active.
          </p>

          <!-- Receipt table -->
          <div style="background:#0a0a0a;border:1px solid #262626;border-radius:6px;padding:16px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr>
                <td style="padding:6px 0;color:#737373;">Plan</td>
                <td style="padding:6px 0;color:#f5f5f5;text-align:right;">YoLab Pro</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#737373;">Amount Paid</td>
                <td style="padding:6px 0;color:#f5f5f5;text-align:right;">₹${amount}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#737373;">Payment ID</td>
                <td style="padding:6px 0;color:#f5f5f5;text-align:right;font-family:monospace;font-size:11px;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#737373;">Order ID</td>
                <td style="padding:6px 0;color:#f5f5f5;text-align:right;font-family:monospace;font-size:11px;">${orderId}</td>
              </tr>
              <tr style="border-top:1px solid #262626;">
                <td style="padding:10px 0 6px;color:#737373;">Valid Until</td>
                <td style="padding:10px 0 6px;color:#f5f5f5;text-align:right;font-weight:600;">${expiryStr}</td>
              </tr>
            </table>
          </div>

          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/pricing"
            style="display:inline-block;padding:11px 24px;background:#e5e5e5;color:#050505;font-weight:600;font-size:14px;border-radius:6px;text-decoration:none;">
            View Your Plan →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;border-top:1px solid #262626;">
          <p style="margin:0;font-size:12px;color:#525252;">
            For refunds or billing issues, contact us at
            <a href="mailto:support@yolab.app" style="color:#737373;">support@yolab.app</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    process.env.MAIL_FROM || `"YoLab" <${process.env.MAIL_USER}>`,
    to:      user.email,
    subject: "YoLab Pro — Payment Receipt",
    html,
  });

  console.log(`[mailer] Receipt email sent to ${user.email}`);
}
