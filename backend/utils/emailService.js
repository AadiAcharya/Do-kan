const nodemailer = require("nodemailer");

// ─── TRANSPORTER ──────────────────────────────────────────────────────────────
// Supports Gmail (with App Password) or any SMTP provider
// Set EMAIL_SERVICE=gmail or leave blank for raw SMTP
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
      },
    });
  }

  // Generic SMTP (Mailtrap sandbox, SendGrid, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });
};

// ─── BASE TEMPLATE ────────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DOKAN</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1E3A8A;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:1px;">DOKAN</h1>
              <p style="margin:4px 0 0;color:#93C5FD;font-size:13px;">Your trusted marketplace</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:20px 40px;border-top:1px solid #E2E8F0;text-align:center;">
              <p style="margin:0;color:#94A3B8;font-size:12px;">
                © ${new Date().getFullYear()} DOKAN Marketplace. All rights reserved.<br/>
                If you didn't create an account, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── SEND HELPER ──────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  // Skip if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email] Skipped (not configured): "${subject}" → ${to}`);
    return;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"DOKAN Marketplace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent: "${subject}" → ${to} (${info.messageId})`);
  } catch (err) {
    // Log but never crash the server for email failures
    console.error(`[Email] Failed to send "${subject}" → ${to}:`, err.message);
  }
};

// ─── EMAIL FUNCTIONS ──────────────────────────────────────────────────────────

/**
 * Welcome email after registration
 */
exports.sendWelcomeEmail = async ({ name, email, role }) => {
  const roleMsg =
    role === "vendor"
      ? "Your vendor application is under review. We will notify you once it is approved."
      : "Start exploring thousands of products from trusted vendors across Nepal.";

  const html = baseTemplate(`
    <h2 style="color:#1E3A8A;margin:0 0 16px;">Welcome to DOKAN, ${name}! 🎉</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Thank you for joining DOKAN. Your account has been created successfully.
    </p>
    <div style="background:#EFF6FF;border-left:4px solid #2563EB;padding:16px 20px;border-radius:6px;margin:0 0 24px;">
      <p style="margin:0;color:#1E40AF;font-size:14px;">${roleMsg}</p>
    </div>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#1E3A8A;border-radius:8px;padding:12px 28px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login"
             style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
            Login to Your Account →
          </a>
        </td>
      </tr>
    </table>
  `);

  await sendEmail({ to: email, subject: "Welcome to DOKAN! 🎉", html });
};

/**
 * Order confirmation email to customer
 */
exports.sendOrderConfirmationEmail = async ({ name, email, order }) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:14px;color:#374151;font-weight:600;">${item.productName}</span><br/>
        <span style="font-size:12px;color:#94A3B8;">Qty: ${item.quantity} × Rs. ${item.unitPrice?.toLocaleString()}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;text-align:right;">
        <span style="font-size:14px;color:#1E3A8A;font-weight:bold;">Rs. ${item.totalPrice?.toLocaleString()}</span>
      </td>
    </tr>
  `,
    )
    .join("");

  const paymentLabel =
    order.paymentMethod === "cash_on_delivery"
      ? "Cash on Delivery"
      : order.paymentMethod === "esewa"
        ? "eSewa"
        : "Khalti";

  const html = baseTemplate(`
    <h2 style="color:#166534;margin:0 0 8px;">✅ Order Confirmed!</h2>
    <p style="color:#374151;font-size:15px;margin:0 0 24px;">
      Hi ${name}, your order has been placed successfully.
    </p>

    <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;color:#166534;font-size:13px;font-weight:bold;">Order Number</p>
      <p style="margin:4px 0 0;color:#15803D;font-size:20px;font-weight:bold;font-family:monospace;">${order.orderNumber}</p>
    </div>

    <h3 style="color:#1E3A8A;font-size:15px;margin:0 0 12px;">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${itemsHtml}
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:13px;">Delivery</td>
        <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;text-align:right;color:#64748B;font-size:13px;">Rs. ${order.shippingCharge?.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:14px 0 0;font-size:16px;font-weight:bold;color:#1E3A8A;">Total</td>
        <td style="padding:14px 0 0;text-align:right;font-size:18px;font-weight:bold;color:#1E3A8A;">Rs. ${order.total?.toLocaleString()}</td>
      </tr>
    </table>

    <div style="background:#F8FAFC;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#374151;">Shipping Address</p>
      <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;">
        ${order.shippingAddress.fullName}<br/>
        ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
        ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
      </p>
    </div>

    <p style="color:#64748B;font-size:13px;margin:0 0 20px;">
      <strong>Payment Method:</strong> ${paymentLabel}
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#1E3A8A;border-radius:8px;padding:12px 28px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/orders"
             style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
            View My Orders →
          </a>
        </td>
      </tr>
    </table>
  `);

  await sendEmail({
    to: email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
  });
};

/**
 * Order status update email to customer
 */
exports.sendOrderStatusEmail = async ({
  name,
  email,
  orderNumber,
  status,
  orderId,
}) => {
  const statusMessages = {
    confirmed: {
      emoji: "✅",
      msg: "Your order has been confirmed and is being prepared.",
      color: "#166534",
      bg: "#F0FDF4",
      border: "#86EFAC",
    },
    processing: {
      emoji: "⚙️",
      msg: "Your order is currently being processed by the vendor.",
      color: "#5B21B6",
      bg: "#F5F3FF",
      border: "#C4B5FD",
    },
    shipped: {
      emoji: "🚚",
      msg: "Great news! Your order is on its way to you.",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#93C5FD",
    },
    delivered: {
      emoji: "📦",
      msg: "Your order has been delivered. We hope you enjoy your purchase!",
      color: "#166534",
      bg: "#F0FDF4",
      border: "#86EFAC",
    },
    cancelled: {
      emoji: "❌",
      msg: "Your order has been cancelled. If you have questions, please contact support.",
      color: "#991B1B",
      bg: "#FEF2F2",
      border: "#FCA5A5",
    },
  };

  const s = statusMessages[status] || {
    emoji: "📋",
    msg: `Your order status has been updated to: ${status}.`,
    color: "#374151",
    bg: "#F8FAFC",
    border: "#E2E8F0",
  };

  const html = baseTemplate(`
    <h2 style="color:#1E3A8A;margin:0 0 16px;">${s.emoji} Order Update</h2>
    <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi ${name}, here's an update on your order.</p>

    <div style="background:${s.bg};border:1px solid ${s.border};border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 4px;font-size:13px;color:#64748B;">Order Number</p>
      <p style="margin:0 0 12px;font-size:17px;font-weight:bold;font-family:monospace;color:#1E3A8A;">${orderNumber}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#64748B;">New Status</p>
      <p style="margin:0;font-size:17px;font-weight:bold;color:${s.color};text-transform:capitalize;">${status}</p>
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">${s.msg}</p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#1E3A8A;border-radius:8px;padding:12px 28px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/orders/${orderId}"
             style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
            View Order Details →
          </a>
        </td>
      </tr>
    </table>
  `);

  await sendEmail({
    to: email,
    subject: `Order ${orderNumber} — Status Updated to ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html,
  });
};

/**
 * Vendor approved email
 */
exports.sendVendorApprovedEmail = async ({ name, email, storeName }) => {
  const html = baseTemplate(`
    <h2 style="color:#166534;margin:0 0 16px;">🎉 Your Vendor Application is Approved!</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Congratulations, ${name}! Your store <strong>${storeName}</strong> has been approved on DOKAN.
      You can now start listing products and accepting orders.
    </p>

    <div style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px 20px;border-radius:6px;margin:0 0 24px;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:bold;">What's next?</p>
      <ul style="margin:8px 0 0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8;">
        <li>Log in to your Vendor Dashboard</li>
        <li>Add your first products</li>
        <li>Set up your store details and branding</li>
        <li>Start receiving orders!</li>
      </ul>
    </div>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#166534;border-radius:8px;padding:12px 28px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/vendor/dashboard"
             style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
            Go to Vendor Dashboard →
          </a>
        </td>
      </tr>
    </table>
  `);

  await sendEmail({
    to: email,
    subject: "🎉 Your DOKAN Vendor Application is Approved!",
    html,
  });
};

/**
 * Vendor rejected email
 */
exports.sendVendorRejectedEmail = async ({
  name,
  email,
  storeName,
  reason,
}) => {
  const html = baseTemplate(`
    <h2 style="color:#991B1B;margin:0 0 16px;">Vendor Application Update</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${name}, thank you for applying to sell on DOKAN with your store <strong>${storeName}</strong>.
      After review, we are unable to approve your application at this time.
    </p>

    <div style="background:#FEF2F2;border-left:4px solid #EF4444;padding:16px 20px;border-radius:6px;margin:0 0 24px;">
      <p style="margin:0 0 6px;color:#991B1B;font-size:14px;font-weight:bold;">Reason for rejection:</p>
      <p style="margin:0;color:#7F1D1D;font-size:14px;line-height:1.6;">${reason}</p>
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
      You are welcome to address the issues above and reapply. If you have any questions,
      please contact our support team at <a href="mailto:support@dokan.com" style="color:#2563EB;">support@dokan.com</a>.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: "DOKAN Vendor Application — Update",
    html,
  });
};

/**
 * Password reset email (for future use)
 */
exports.sendPasswordResetEmail = async ({ name, email, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const html = baseTemplate(`
    <h2 style="color:#1E3A8A;margin:0 0 16px;">🔒 Password Reset Request</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${name}, we received a request to reset your DOKAN account password.
      Click the button below to set a new password. This link expires in 1 hour.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#1E3A8A;border-radius:8px;padding:12px 28px;">
          <a href="${resetUrl}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
            Reset My Password →
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#94A3B8;font-size:13px;margin:0;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not change.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: "DOKAN — Password Reset Request",
    html,
  });
};
