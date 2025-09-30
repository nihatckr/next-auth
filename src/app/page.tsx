import { Badge } from "@/components/ui/badge";
import { ConditionalNavbar } from "@/components/navigation/conditional-navbar";

export default async function Home() {
  return (
    <>
      <ConditionalNavbar />
      <div className="p-6 max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <Badge variant="outline" className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white px-4 py-2">
              🚀 Ready-to-Use Boilerplate
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white">
              Next.js Auth Boilerplate
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tamamlanmış authentication sistemi. E-posta doğrulama, 2FA, şifre sıfırlama,
              role-based erişim ve modern UI ile hazır production boilerplate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı? Navbar&apos;dan giriş yapın.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-12">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Özellikler
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Modern web uygulamaları için gerekli tüm authentication özellikleri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Güvenli Giriş
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                NextAuth.js ile güvenli authentication sistemi
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                E-posta Doğrulama
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Otomatik e-posta doğrulama sistemi
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Role-Based Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kullanıcı rolleri ile erişim kontrolü
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Modern UI
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                shadcn/ui ile modern ve responsive tasarım
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Hızlı Geliştirme
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                TypeScript ve modern React özellikleri
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-2xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Production Ready
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hemen deploy edilebilir production kodu
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Hemen Başlayın
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Bu boilerplate ile authentication sisteminizi hızlıca kurabilirsiniz.
            </p>
          </div>
        </section>

        {/* Footer */}
        <section className="py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Made with ❤️ for developers
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
