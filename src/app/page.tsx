
import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Users,
  Zap,
  Lock,
  CheckCircle,
  Star,
  ArrowRight,
  Github,
  Globe,
  Smartphone,
  Download,
  BookOpen,
  Code,
  Rocket
} from "lucide-react";

export default async function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LoginButton mode="modal" asChild>
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-8 py-4 text-lg"
              >
                Demo'yu Test Et
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </LoginButton>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white px-8 py-4 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Boilerplate İndir
            </Button>
          </div>
        </div>

        {/* Features Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-center">
            <CardContent className="p-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-2xl font-bold text-black dark:text-white">100%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanmış</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 mx-auto mb-3 text-black dark:text-white" />
              <h3 className="text-2xl font-bold text-black dark:text-white">Enterprise</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Güvenlik</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-center">
            <CardContent className="p-6">
              <Rocket className="h-12 w-12 mx-auto mb-3 text-black dark:text-white" />
              <h3 className="text-2xl font-bold text-black dark:text-white">Production</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ready</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-center">
            <CardContent className="p-6">
              <Code className="h-12 w-12 mx-auto mb-3 text-black dark:text-white" />
              <h3 className="text-2xl font-bold text-black dark:text-white">TypeScript</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Type Safe</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Completed Features */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white text-2xl">
                  <Star className="h-6 w-6" />
                  Tamamlanmış Özellikler
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Bu boilerplate'te bulunan hazır özellikler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Kullanıcı Kayıt/Giriş</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ E-posta Doğrulama</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ 2FA Kimlik Doğrulama</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Şifre Sıfırlama</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Role-Based Access Control</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Admin Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Profile Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Billing System</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Dark/Light Theme</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-black dark:text-white">✅ Responsive Design</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub Repository
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Zap className="h-5 w-5" />
                  Production Stack
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Modern teknolojiler ile hazırlanmış boilerplate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">Next.js 15</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">React Framework</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">NextAuth v5</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Authentication</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">Prisma ORM</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Database</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">Shadcn/UI</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">UI Components</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">TypeScript</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Type Safety</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">Tailwind CSS</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Styling</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">Zod</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Validation</div>
                  </div>
                  <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-semibold text-black dark:text-white">React Hook Form</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Forms</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Start & Download */}
          <div className="space-y-6">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Rocket className="h-5 w-5" />
                  Hızlı Başlangıç
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div>
                      <p className="text-black dark:text-white font-medium">1. Boilerplate'i İndir</p>
                      <p className="text-gray-600 dark:text-gray-400">Git clone veya zip download</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div>
                      <p className="text-black dark:text-white font-medium">2. Environment Setup</p>
                      <p className="text-gray-600 dark:text-gray-400">.env.local dosyasını yapılandır</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div>
                      <p className="text-black dark:text-white font-medium">3. Database Migration</p>
                      <p className="text-gray-600 dark:text-gray-400">Prisma ile veritabanı oluştur</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2"></div>
                    <div>
                      <p className="text-black dark:text-white font-medium">4. Production Ready</p>
                      <p className="text-gray-600 dark:text-gray-400">npm run build && deploy</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <Button className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black">
                  <Download className="mr-2 h-4 w-4" />
                  Boilerplate İndir
                </Button>
              </CardContent>
            </Card>

            {/* Demo Login Card */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Lock className="h-5 w-5" />
                  Demo Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tüm özellikleri test etmek için demo hesabı ile giriş yapabilirsiniz.
                </p>

                <div className="space-y-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <div><strong>Demo Admin:</strong> admin@demo.com</div>
                  <div><strong>Demo User:</strong> user@demo.com</div>
                  <div><strong>Password:</strong> 123456</div>
                </div>

                <LoginButton mode="modal" asChild>
                  <Button className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black">
                    <Shield className="mr-2 h-4 w-4" />
                    Demo'yu Test Et
                  </Button>
                </LoginButton>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Globe className="h-5 w-5" />
                  Boilerplate Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white">Authentication</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Complete
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white">Admin Panel</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Complete
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white">UI/UX Design</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Complete
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white">Documentation</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Complete
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Production'a Hazır Boilerplate
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Aylar süren geliştirme sürecini atlayın. Tüm authentication özellikleri,
              modern UI/UX ve production optimizasyonları ile hazırlanmış boilerplate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-8 py-4"
              >
                <Download className="mr-2 h-5 w-5" />
                Şimdi İndir - Ücretsiz
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white px-8 py-4"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub'da Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t-2 border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 Next.js Auth Boilerplate. Production-ready authentication system.
          </p>
        </div>

      </div>
    </div>
  );
}
