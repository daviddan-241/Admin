import nodemailer from "nodemailer";
import { platformConfig } from "../routes/settings";

function getTransport() {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = platformConfig as any;
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 587,
    secure: Number(smtpPort) === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transport = getTransport();
  if (!transport) return;
  const from = (platformConfig as any).smtpFrom || (platformConfig as any).smtpUser;
  try {
    await transport.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
  } catch (e) {
    console.error("[mailer] send failed:", e);
  }
}

const GOLD = "#c9a84c";
const BG = "#0a0800";

function wrap(body: string) {
  return `<!DOCTYPE html><html><body style="background:${BG};font-family:Georgia,serif;margin:0;padding:32px;">
<div style="max-width:540px;margin:0 auto;background:#111;border:1px solid ${GOLD}33;border-radius:16px;overflow:hidden;">
<div style="background:linear-gradient(135deg,#c9a84c,#f0d080);padding:24px 32px;text-align:center;">
  <h1 style="margin:0;font-size:22px;font-weight:900;color:#000;letter-spacing:0.1em;">SOPHIE RAIN</h1>
  <p style="margin:4px 0 0;font-size:12px;color:#00000099;letter-spacing:0.2em;text-transform:uppercase;">Private Platform</p>
</div>
<div style="padding:32px;">${body}</div>
<div style="padding:16px 32px;border-top:1px solid #ffffff11;text-align:center;">
  <p style="margin:0;font-size:11px;color:#ffffff33;">© ${new Date().getFullYear()} Sophie Rain · All rights reserved</p>
</div>
</div></body></html>`;
}

function p(text: string) {
  return `<p style="color:#ffffffcc;font-size:15px;line-height:1.7;margin:0 0 16px;">${text}</p>`;
}
function h2(text: string) {
  return `<h2 style="color:#ffffff;font-size:18px;margin:0 0 16px;">${text}</h2>`;
}
function detail(label: string, value: string) {
  return `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #ffffff11;">
  <span style="color:#ffffff66;font-size:13px;">${label}</span>
  <span style="color:#f0d080;font-size:13px;font-weight:bold;">${value}</span>
</div>`;
}
function btn(text: string, url: string) {
  return `<div style="text-align:center;margin-top:24px;">
  <a href="${url}" style="background:linear-gradient(135deg,#c9a84c,#f0d080);color:#000;font-weight:900;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:14px;letter-spacing:0.05em;">${text}</a>
</div>`;
}

// ─── Fan-facing templates ──────────────────────────────────────────────────

export function emailFanGiftCardReceived(opts: { name: string; purpose: string }) {
  return {
    subject: "✅ Gift Card Received — Sophie will verify shortly",
    html: wrap(
      h2("Your gift card has been received! 🎉") +
      p(`Hey ${opts.name}! Sophie got your gift card and will personally verify it within a few hours.`) +
      p(`Once verified, your <strong style="color:#f0d080;">${opts.purpose}</strong> will be unlocked and you'll receive a confirmation email.`) +
      p("Thanks so much for your support — it genuinely means everything. 💕") +
      p("<em style='color:#ffffff66;'>— Sophie Rain</em>")
    ),
  };
}

export function emailFanGiftCardApproved(opts: { name: string; purpose: string; adminNote?: string }) {
  return {
    subject: "🔑 Access Unlocked — Sophie approved your gift card!",
    html: wrap(
      h2("Your access has been unlocked! 🔑") +
      p(`Hey ${opts.name}! Sophie personally reviewed your gift card and it's been approved.`) +
      p(`Your <strong style="color:#f0d080;">${opts.purpose}</strong> is now active. Head back to the platform to enjoy your access!`) +
      (opts.adminNote ? p(`<em style="color:#f0d080;">Note from Sophie: "${opts.adminNote}"</em>`) : "") +
      p("Thank you so much — you're amazing! 💕") +
      btn("Go to Platform", process.env.PLATFORM_URL || "https://sophierain.replit.app") +
      p("<em style='color:#ffffff66;'>— Sophie Rain</em>")
    ),
  };
}

export function emailFanGiftCardRejected(opts: { name: string; adminNote?: string }) {
  return {
    subject: "❌ Gift Card Issue — Action needed",
    html: wrap(
      h2("There was an issue with your gift card") +
      p(`Hey ${opts.name}, Sophie tried to verify your gift card but ran into a problem.`) +
      (opts.adminNote ? p(`<strong style="color:#f0d080;">Reason:</strong> ${opts.adminNote}`) : p("The card details couldn't be verified. Please double-check and try submitting again.")) +
      p("If you think this is a mistake, message Sophie directly and she'll sort it out personally.") +
      btn("Message Sophie", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/messages")
    ),
  };
}

export function emailFanCallBooked(opts: { name: string; session: string; date: string; amount: string }) {
  return {
    subject: "📞 Call Booked — Sophie will confirm shortly",
    html: wrap(
      h2("Your call is booked! 🎉") +
      p(`Hey ${opts.name}! Your call with Sophie is confirmed. Here are the details:`) +
      `<div style="background:#ffffff08;border-radius:12px;padding:16px;margin:0 0 16px;">` +
      detail("Session", opts.session) +
      detail("Preferred Date", opts.date) +
      detail("Amount Paid", `$${opts.amount}`) +
      `</div>` +
      p("Sophie will reach out via email within 2 hours to confirm the exact time and send you the call link. 📲") +
      p("Can't wait to chat! 💕") +
      btn("Message Sophie", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/messages") +
      p("<em style='color:#ffffff66;'>— Sophie Rain</em>")
    ),
  };
}

export function emailFanRequestConfirmed(opts: { name: string; requestType: string; amount: string }) {
  return {
    subject: "✨ Custom Request Confirmed — Sophie is on it!",
    html: wrap(
      h2("Your custom request is confirmed! ✨") +
      p(`Hey ${opts.name}! Sophie received your custom content request and is already planning it out.`) +
      `<div style="background:#ffffff08;border-radius:12px;padding:16px;margin:0 0 16px;">` +
      detail("Request Type", opts.requestType) +
      detail("Amount Paid", `$${opts.amount}`) +
      detail("Expected Delivery", "48–72 hours") +
      `</div>` +
      p("Sophie creates every piece personally — it'll be worth the wait! 💕") +
      btn("Check Your Messages", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/messages") +
      p("<em style='color:#ffffff66;'>— Sophie Rain</em>")
    ),
  };
}

export function emailFanTipReceived(opts: { name: string; amount: string; message?: string }) {
  return {
    subject: "💕 Sophie received your tip — thank you!",
    html: wrap(
      h2("Thank you so much! 💕") +
      p(`Hey ${opts.name}! Sophie just received your tip of <strong style="color:#f0d080;">$${opts.amount}</strong> and it genuinely made her day.`) +
      (opts.message ? p(`Your note: <em style="color:#f0d080;">"${opts.message}"</em>`) : "") +
      p("She reads every single tip personally and it means the world. She'll reply when she can! 💕") +
      btn("Send Sophie a Message", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/messages") +
      p("<em style='color:#ffffff66;'>— Sophie Rain Platform</em>")
    ),
  };
}

export function emailFanVipGranted(opts: { name: string; tier: string }) {
  return {
    subject: "👑 VIP Access Granted — Welcome to the inner circle!",
    html: wrap(
      h2("Welcome to VIP! 👑") +
      p(`Hey ${opts.name}! Your <strong style="color:#f0d080;">${opts.tier} VIP membership</strong> is now active.`) +
      p("You now have full access to the exclusive members area — uncensored content, priority DMs, and everything else Sophie prepared just for you.") +
      btn("Access VIP Members Area", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/members") +
      p("Thank you for being part of the inner circle. You're one of the real ones. 💕") +
      p("<em style='color:#ffffff66;'>— Sophie Rain</em>")
    ),
  };
}

// ─── Admin-facing templates ────────────────────────────────────────────────

export function emailAdminNewGiftCard(opts: { fanName: string; fanEmail: string; cardType: string; amount: string; purpose: string }) {
  return {
    subject: `💳 New Gift Card — ${opts.fanName} ($${opts.amount})`,
    html: wrap(
      h2("New gift card payment received 💳") +
      `<div style="background:#ffffff08;border-radius:12px;padding:16px;margin:0 0 16px;">` +
      detail("Fan", opts.fanName) +
      detail("Email", opts.fanEmail) +
      detail("Card Type", opts.cardType) +
      detail("Amount", `$${opts.amount}`) +
      detail("Purpose", opts.purpose) +
      `</div>` +
      p("Log into the admin portal to review the card photos and approve or reject.") +
      btn("Open Admin Portal", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/admin")
    ),
  };
}

export function emailAdminNewCall(opts: { fanName: string; fanEmail: string; session: string; amount: string }) {
  return {
    subject: `📞 New Call Booking — ${opts.fanName} ($${opts.amount})`,
    html: wrap(
      h2("New call booking! 📞") +
      `<div style="background:#ffffff08;border-radius:12px;padding:16px;margin:0 0 16px;">` +
      detail("Fan", opts.fanName) +
      detail("Email", opts.fanEmail) +
      detail("Session", opts.session) +
      detail("Amount", `$${opts.amount}`) +
      `</div>` +
      btn("Manage in Admin", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/admin")
    ),
  };
}

export function emailAdminNewRequest(opts: { fanName: string; fanEmail: string; requestType: string; amount: string }) {
  return {
    subject: `✨ New Custom Request — ${opts.fanName} ($${opts.amount})`,
    html: wrap(
      h2("New custom content request! ✨") +
      `<div style="background:#ffffff08;border-radius:12px;padding:16px;margin:0 0 16px;">` +
      detail("Fan", opts.fanName) +
      detail("Email", opts.fanEmail) +
      detail("Type", opts.requestType) +
      detail("Amount", `$${opts.amount}`) +
      `</div>` +
      btn("Manage in Admin", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/admin")
    ),
  };
}

export function emailAdminNewTip(opts: { fanName: string; fanEmail: string; amount: string; message?: string }) {
  return {
    subject: `💝 New Tip — ${opts.fanName} ($${opts.amount})`,
    html: wrap(
      h2("New tip received! 💝") +
      `<div style="background:#ffffff08;border-radius:12px;padding:16px;margin:0 0 16px;">` +
      detail("Fan", opts.fanName) +
      detail("Email", opts.fanEmail) +
      detail("Amount", `$${opts.amount}`) +
      (opts.message ? detail("Message", opts.message) : "") +
      `</div>` +
      btn("View in Admin", (process.env.PLATFORM_URL || "https://sophierain.replit.app") + "/admin")
    ),
  };
}
