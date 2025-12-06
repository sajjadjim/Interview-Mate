import { NextResponse } from "next/server";
import admin from "@/app/lib/firebaseAdmin";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Check if user exists and how they signed up
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (err) {
      // User does not exist in Firebase
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    // 2. Check the Provider (Google, Phone, or Password)
    const providers = userRecord.providerData.map((p) => p.providerId);

    // If they ONLY have Google or Phone, they don't have a password to reset
    const hasPassword = providers.includes("password");
    
    if (!hasPassword) {
      if (providers.includes("google.com")) {
        return NextResponse.json({ 
          error: "You signed up with Google. Please click 'Sign in with Google' instead." 
        }, { status: 400 });
      }
      if (providers.includes("phone")) {
         return NextResponse.json({ 
          error: "You account uses Phone Login. Please sign in with OTP." 
        }, { status: 400 });
      }
    }

    // 3. If they HAVE a password, Generate the Reset Link
    const link = await admin.auth().generatePasswordResetLink(email);

    // 4. Send Email (Same Nodemailer setup as before)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #2563EB;">InterviewMate Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${link}" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="font-size: 12px; color: grey; margin-top: 20px;">If you didn't ask for this, ignore it.</p>
      </div>
    `;

    await transporter.sendMail({
      from: '"InterviewMate Security" <noreply@interviewmate.com>',
      to: email,
      subject: "Reset Your Password",
      html: htmlContent,
    });

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}