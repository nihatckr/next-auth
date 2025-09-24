

import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full">


        <LoginButton mode="modal" asChild>
          <Button className="w-full" size="lg">
            Giriş Yap
          </Button>
        </LoginButton>

      </div>
    </main>
  );
}
