const nodemailer = require('nodemailer');

// ==============================
// CONFIGURE EMAIL TRANSPORTER
// ==============================

// We ALWAYS use Gmail when EMAIL_USER + EMAIL_PASS exist
let transporter;

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  // Demo / No credentials mode
  transporter = {
    sendMail: async (options) => {
      console.log("📧 [DEMO MODE] Email would be sent:");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      return { messageId: "demo-" + Date.now() };
    },
    verify: () => Promise.resolve(true)
  };
} else {
  // ✔ REAL GMAIL MODE
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Verify connection
transporter.verify((err) => {
  if (err) console.error("❌ Email config error:", err);
  else console.log("📧 Gmail Email Service READY");
});


// ============================
// SEND VERIFICATION EMAIL
// ============================

const sendVerificationEmail = async (email, firstName, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your School Forum Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(to right, #10b981, #059669); width: 60px; height: 60px; border-radius: 12px; line-height: 60px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">SF</span>
            </div>
            <h1 style="color: #111827; margin-top: 15px; font-size: 24px;">School Forum</h1>
          </div>
          
          <h2 style="color: #111827; margin-bottom: 20px;">Hello ${firstName},</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with School Forum! Please verify your email address to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Or copy and paste this link into your browser:<br>
            <a href="${url}" style="color: #10b981; word-break: break-all;">${url}</a>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
              <strong>Next Steps:</strong>
            </p>
            <ol style="color: #6b7280; font-size: 14px; line-height: 1.8; margin-left: 20px;">
              <li>Verify your email address (click the button above)</li>
              <li>Log in to your account</li>
              <li>Upload your School ID number for verification</li>
              <li>Wait for admin approval to access all features</li>
            </ol>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
            This verification link will expire in 24 hours.<br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Verification email SENT → ${email}`);
};


// ============================
// SEND PASSWORD RESET EMAIL
// ============================

const sendResetPasswordEmail = async (email, firstName, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Hello ${firstName},</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Password reset email SENT → ${email}`);
};


// ============================
// SEND APPROVAL EMAIL
// ============================

const sendApprovalEmail = async (email, firstName, yearLevel) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Account Has Been Approved!",
    html: `
      <h2>Congratulations, ${firstName}!</h2>
      <p>Your account has been approved as a ${yearLevel} student.</p>
      <a href="${loginUrl}">Login Now</a>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Approval email SENT → ${email}`);
};


// ============================
// SEND REJECTION EMAIL
// ============================

const sendRejectionEmail = async (email, firstName, reason) => {
  const supportUrl = `${process.env.FRONTEND_URL}/contact`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Account Verification Result",
    html: `
      <h2>Hello ${firstName},</h2>
      <p>We could not approve your registration.</p>
      <p><b>Reason:</b> ${reason}</p>
      <a href="${supportUrl}">Contact Support</a>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Rejection email SENT → ${email}`);
};

// ============================
// SEND PASSWORD CHANGE CODE
// ============================

const sendPasswordChangeCode = async (email, firstName, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Change Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px solid #10b981; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Change Request</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>You requested to change your password. Use the verification code below:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            
            <div class="footer">
              <p>School Forum - Secure Account Management</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// ============================
// SEND EMAIL CHANGE CODE
// ============================

const sendEmailChangeCode = async (email, firstName, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your New Email Address",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 3px solid #10b981; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
          .code { font-size: 48px; font-weight: bold; color: #10b981; letter-spacing: 15px; font-family: 'Courier New', monospace; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Email Change Verification</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>You requested to change your email address. Please enter this verification code to confirm:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This code will expire in 10 minutes. If you didn't request this change, please ignore this email and your email address will remain unchanged.
            </div>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>Never share this code with anyone</li>
              <li>School Forum staff will never ask for this code</li>
              <li>Make sure you're on the official School Forum website</li>
            </ul>
            
            <div class="footer">
              <p>School Forum - Secure Account Management</p>
              <p style="font-size: 12px; color: #9ca3af;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email change code SENT → ${email}`);
};

// ============================
// SEND EMAIL CHANGE CONFIRMATION (to OLD email)
// ============================

module.exports = {
  sendVerificationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendResetPasswordEmail,
  sendPasswordChangeCode,
  sendEmailChangeCode
};
