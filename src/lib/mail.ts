import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`;
  console.log('🔗 RESET LINK:', resetLink)

  try {
    // Gerçek email gönder
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Şifre Sıfırlama Talebi</h2>
          <p>Merhaba,</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Şifremi Sıfırla
            </a>
          </div>
          <p>Eğer buton çalışmazsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
          <p style="color: #666; font-size: 12px;">Bu link 15 dakika sonra geçersiz olacaktır.</p>
        </div>
      `,
    });
    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);

  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;

  console.log('🔗 VERIFICATION LINK:', confirmLink);
  console.log('📧 For email:', email);
  console.log('🔑 Token:', token);

  try {
    // Gerçek email gönder
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Email Doğrulaması - Hesabınızı Onaylayın',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Adresinizi Doğrulayın</h2>
          <p>Merhaba,</p>
          <p>Hesabınızı oluşturduğunuz için teşekkür ederiz. Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Email Adresimi Doğrula
            </a>
          </div>
          <p>Eğer buton çalışmazsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${confirmLink}</p>
          <p style="color: #666; font-size: 12px;">Bu link 15 dakika sonra geçersiz olacaktır.</p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Hata olsa bile linki console'da göster
    console.log('🔗 Use this verification link manually:', confirmLink);

    // Resend test sınırlaması varsa, sadece console'da göster
    if (error instanceof Error && error.message.includes('testing emails')) {
      console.log('⚠️  Resend test mode - only sends to verified email addresses');
      return { success: true, message: 'Email simulated due to Resend restrictions' };
    }

    throw error;
  }
};
