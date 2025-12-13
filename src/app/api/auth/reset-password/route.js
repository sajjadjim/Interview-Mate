
// import { NextResponse } from "next/server";
// import admin from "@/app/lib/firebaseAdmin";
// import nodemailer from "nodemailer";

// export async function POST(request) {
//   try {
//     const { email } = await request.json();

//     // DEBUGGING: Check if variables exist on Vercel
//     if (!process.env.FIREBASE_PRIVATE_KEY) {
//        console.error("FIREBASE_PRIVATE_KEY is missing in Vercel!");
//        return NextResponse.json({ error: "Server Error: Private Key Missing" }, { status: 500 });
//     }

//     // 1. Check if user exists
//     let userRecord;
//     try {
//       userRecord = await admin.auth().getUserByEmail(email);
//     } catch (err) {
//       console.error("Firebase Auth Error:", err);
      
//       // If the error is about Credentials, tell the developer!
//       if (err.code === 'app/invalid-credential' || err.message.includes("credential")) {
//         return NextResponse.json({ error: "Server Configuration Error: Invalid Firebase Credentials" }, { status: 500 });
//       }

//       // Otherwise, it's truly a missing user
//       return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
//     }

//     // ... (The rest of your code: Provider check, Email sending) ... 
//     // ... Copy the rest from the previous working code ...
    
//     // (Shortened here for clarity, keep your existing logic for Google/Phone check)
//     const link = await admin.auth().generatePasswordResetLink(email);
    
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.GMAIL_USER, 
//         pass: process.env.GMAIL_APP_PASSWORD, 
//       },
//     });

//     const htmlContent = `
//       <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
//         <h2 style="color: #2563EB;">Reset Password</h2>
//         <a href="${link}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Click here</a>
//       </div>
//     `;

//     await transporter.sendMail({
//       from: '"InterviewMate Security" <noreply@interviewmate.com>',
//       to: email,
//       subject: "Reset Your Password",
//       html: htmlContent,
//     });

//     return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });

//   } catch (error) {
//     console.error("Reset Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin"; // Ensure this path matches your file structure
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.error("FIREBASE_PRIVATE_KEY is missing in Vercel!");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    // 1. Check if user exists & verify credentials
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      if (err.code === 'app/invalid-credential') {
        return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
      }
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    // 2. Check Provider (Google/Phone check logic - Optional if you want to keep strict checks)
    const providers = userRecord.providerData.map((p) => p.providerId);
    if (!providers.includes("password")) {
       if (providers.includes("google.com")) {
         return NextResponse.json({ error: "This account uses Google Sign-In. Please log in with Google." }, { status: 400 });
       }
    }

    // 3. Generate Secure Link
    const link = await admin.auth().generatePasswordResetLink(email);

    // 4. Setup Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 5. Beautiful & Professional HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; color: #333333; }
          .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 40px; margin-bottom: 40px; }
          .header { background-color: #2563EB; padding: 30px 0; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
          .content { padding: 40px 30px; text-align: left; }
          .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111827; }
          .message { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; }
          .btn-container { text-align: center; margin: 35px 0; }
          .btn { background-color: #2563EB; color: #ffffff !important; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
          .btn:hover { background-color: #1d4ed8; }
          .divider { border-top: 1px solid #e5e7eb; margin: 30px 0; }
          .fallback-text { font-size: 14px; color: #6b7280; margin-bottom: 10px; word-break: break-all; }
          .fallback-link { color: #2563EB; text-decoration: none; font-size: 13px; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>InterviewMate</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hello,</div>
            <p class="message">
              We received a request to reset the password for your <strong>InterviewMate</strong> account associated with this email address.
              <br><br>
              To choose a new secure password, simply click the button below. This link is valid for 1 hour.
            </p>

            <div class="btn-container">
              <a href="${link}" class="btn">Reset Password</a>
            </div>

            <p class="message">
              If you didn't ask to reset your password, you can safely ignore this email. Your account remains secure.
            </p>

            <div class="divider"></div>

            <p style="font-size: 13px; color: #6b7280; margin-bottom: 5px;">Button not working? Copy and paste this link into your browser:</p>
            <a href="${link}" class="fallback-link">${link}</a>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} InterviewMate. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 6. Send Email
    await transporter.sendMail({
      from: '"InterviewMate Security" <noreply@interviewmate.com>',
      to: email,
      subject: "Action Required: Reset Your Password",
      html: htmlContent,
    });

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}