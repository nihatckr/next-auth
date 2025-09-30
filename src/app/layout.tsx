import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "sonner";
import { NotificationProvider } from "@/contexts/notification-context";
import { ClientSessionProvider } from "@/components/providers/client-session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
// ConditionalNavbar sadece gerekli yerlerde kullanılacak

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Auth Boilerplate",
  description: "Production-ready authentication system with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  console.log(session?.user?.role);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ClientSessionProvider session={session}>
            <NotificationProvider>
              <Toaster position="top-right" richColors />
              <div className="min-h-screen bg-background">
                <main>
                  {children}
                </main>
              </div>
            </NotificationProvider>
          </ClientSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
