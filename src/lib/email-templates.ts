// Basit ve kullanışlı email template sistemi
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Hoş geldin ${name}! 🎉`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0;">🎉 Hoş Geldin!</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 10px;">Aramıza katıldığın için teşekkürler</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #334155; font-size: 16px;">
              Merhaba <strong style="color: #2563eb;">${name}</strong>,
            </p>
            <p style="color: #64748b; margin: 15px 0 0 0;">
              Hesabın başarıyla oluşturuldu! Artık tüm özelliklerimizi kullanabilirsin.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/auth/login"
               style="background: #2563eb; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; font-weight: 500;
                      display: inline-block; transition: background-color 0.2s;">
              🚀 Hemen Başla
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              Bu e-posta otomatik olarak gönderilmiştir.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Hoş geldin ${name}! Hesabın başarıyla oluşturuldu. ${process.env.NEXTAUTH_URL} adresinden giriş yapabilirsin.`
  }),

  passwordChanged: (name: string) => ({
    subject: '🔐 Şifren Değiştirildi',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #dc2626; font-size: 20px;">🔐 Güvenlik Bildirimi</h2>
          </div>

          <p style="color: #334155; font-size: 16px; margin: 20px 0;">
            Merhaba <strong style="color: #2563eb;">${name}</strong>,
          </p>

          <p style="color: #64748b; font-size: 16px; margin: 15px 0;">
            Hesabının şifresi <strong>${new Date().toLocaleDateString('tr-TR')}</strong> tarihinde başarıyla değiştirildi.
          </p>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">⚠️ Bu değişikliği sen yapmadıysan:</p>
            <ul style="margin: 10px 0 0 20px; color: #92400e;">
              <li>Derhal bizimle iletişime geç</li>
              <li>Diğer hesaplarının şifrelerini kontrol et</li>
              <li>Güvenlik ayarlarını gözden geçir</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/settings"
               style="background: #dc2626; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; font-weight: 500;
                      display: inline-block;">
              🛡️ Güvenlik Ayarları
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              Güvenliğin bizim için çok önemli. Herhangi bir sorun yaşarsan bize ulaş.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Şifren ${new Date().toLocaleDateString('tr-TR')} tarihinde değiştirildi. Bu sen değilsen derhal iletişime geç.`
  }),

  emailVerification: (name: string, token: string) => ({
    subject: '📧 E-posta Adresini Doğrula',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 24px; margin: 0;">📧 E-posta Doğrulama</h1>
          </div>

          <p style="color: #334155; font-size: 16px;">
            Merhaba <strong style="color: #2563eb;">${name}</strong>,
          </p>

          <p style="color: #64748b; font-size: 16px; margin: 15px 0;">
            E-posta adresini doğrulamak için aşağıdaki butona tıkla:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}"
               style="background: #16a34a; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; font-weight: 500;
                      display: inline-block;">
              ✅ E-postamı Doğrula
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              <strong>Link çalışmıyor mu?</strong><br>
              Bu linki tarayıcına kopyala: <br>
              <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 3px; font-size: 12px;">
                ${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}
              </code>
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              Bu link 1 saat içinde geçerliliğini kaybedecek.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `E-posta doğrulama linki: ${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`
  }),

  passwordReset: (name: string, token: string) => ({
    subject: '🔑 Şifre Sıfırlama',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; font-size: 24px; margin: 0;">🔑 Şifre Sıfırlama</h1>
          </div>

          <p style="color: #334155; font-size: 16px;">
            Merhaba <strong style="color: #2563eb;">${name}</strong>,
          </p>

          <p style="color: #64748b; font-size: 16px; margin: 15px 0;">
            Şifre sıfırlama talebinde bulundun. Yeni şifre oluşturmak için aşağıdaki butona tıkla:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}"
               style="background: #f59e0b; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; font-weight: 500;
                      display: inline-block;">
              🔄 Yeni Şifre Oluştur
            </a>
          </div>

          <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626; font-size: 14px;">
              <strong>⚠️ Bu talebi sen yapmadıysan:</strong><br>
              Bu e-postayı görmezden gel ve şifreni değiştirme. Hesabın güvende.
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              Bu link 1 saat içinde geçerliliğini kaybedecek.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Şifre sıfırlama linki: ${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`
  })
}
