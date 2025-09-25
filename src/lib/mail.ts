import {Resend} from 'resend';
import { emailTemplates } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string, name?: string) => {
  const template = emailTemplates.passwordReset(name || 'Kullanıcı', token);

  console.log('� Sending password reset email to:', email);
  console.log('🔑 Token:', token);

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);

    // Hata durumunda linki console'da göster
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`;
    console.log('🔗 Use this reset link manually:', resetLink);

    throw error;
  }
};

// 🎉 Hoşgeldin emaili
export const sendWelcomeEmail = async (email: string, name: string) => {
  const template = emailTemplates.welcome(name);

  console.log('🎉 Sending welcome email to:', email);

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('✅ Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return null; // Hoşgeldin emaili kritik değil, hata vermemeli
  }
};

// 🔐 Şifre değiştirildi emaili
export const sendPasswordChangedEmail = async (email: string, name: string) => {
  const template = emailTemplates.passwordChanged(name);

  console.log('🔐 Sending password changed notification to:', email);

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('✅ Password changed email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Password changed email sending failed:', error);
    return null; // Bildirim emaili kritik değil
  }
};

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const template = emailTemplates.emailVerification(name || 'Kullanıcı', token);

  console.log('� Sending verification email to:', email);
  console.log('🔑 Token:', token);

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);

    // Hata durumunda linki console'da göster
    const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;
    console.log('🔗 Use this verification link manually:', confirmLink);

    // Resend test sınırlaması varsa
    if (error instanceof Error && error.message.includes('testing emails')) {
      console.log('⚠️  Resend test mode - only sends to verified email addresses');
      return { success: true, message: 'Email simulated due to Resend restrictions' };
    }

    throw error;
  }
};
