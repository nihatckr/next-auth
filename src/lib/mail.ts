import {Resend} from 'resend';
import { emailTemplates } from './email-templates';
import { devLog, devError, isDevelopment } from './env';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string, name?: string) => {
  const template = emailTemplates.passwordReset(name || 'Kullanıcı', token);

  devLog(`📧 Sending password reset email to: ${email}`, { token })

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    devLog('✅ Password reset email sent successfully', result)
    return result;
  } catch (error) {
    devError('❌ Password reset email sending failed', error);

    // Hata durumunda linki console'da göster (sadece development'da)
    if (isDevelopment) {
      const resetLink = `${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`;
      devLog('🔗 Use this reset link manually:', resetLink);
    }

    throw error;
  }
};

// 🎉 Hoşgeldin emaili
export const sendWelcomeEmail = async (email: string, name: string) => {
  const template = emailTemplates.welcome(name);

  devLog(`🎉 Sending welcome email to: ${email}`)

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    devLog('✅ Welcome email sent successfully', result)
    return result;
  } catch (error) {
    devError('❌ Welcome email sending failed', error);
    return null; // Hoşgeldin emaili kritik değil, hata vermemeli
  }
};

// 🔐 Şifre değiştirildi emaili
export const sendPasswordChangedEmail = async (email: string, name: string) => {
  const template = emailTemplates.passwordChanged(name);

  devLog(`🔐 Sending password changed notification to: ${email}`)

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    devLog('✅ Password changed email sent successfully', result)
    return result;
  } catch (error) {
    devError('❌ Password changed email sending failed', error);
    return null; // Bildirim emaili kritik değil
  }
};

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const template = emailTemplates.emailVerification(name || 'Kullanıcı', token);

  devLog(`📧 Sending verification email to: ${email}`, { token })

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    devLog('✅ Verification email sent successfully', result)
    return result;
  } catch (error) {
    devError('❌ Verification email sending failed', error);

    // Hata durumunda linki console'da göster (sadece development'da)
    if (isDevelopment) {
      const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;
      devLog('🔗 Use this verification link manually:', confirmLink);
    }

    // Resend test sınırlaması varsa
    if (error instanceof Error && error.message.includes('testing emails')) {
      devLog('⚠️ Resend test mode - only sends to verified email addresses');
      return { success: true, message: 'Email simulated due to Resend restrictions' };
    }

    throw error;
  }
};
