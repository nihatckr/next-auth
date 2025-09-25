import { memo } from "react";
import { ExtendedUser } from "../../next-auth";
import { OptimizedAvatar } from "./ui/optimized-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Shield, Mail, User, Calendar } from "lucide-react";

interface UserInfoProps {
  user?: ExtendedUser;
  label: string;
}

const UserInfoComponent = ({
  user,
  label,
}: UserInfoProps) => {
  if (!user) {
    return (
      <Card className="w-full max-w-[600px] shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Kullanıcı bilgisi yüklenemedi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[600px] shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <User className="w-5 h-5 mr-2" />
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Avatar & Basic Info */}
        <div className="flex items-center space-x-4">
          <OptimizedAvatar
            src={user.image}
            alt={user.name || 'User'}
            size="lg"
            fallback={user.name?.charAt(0)}
          />
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{user.name || "İsimsiz Kullanıcı"}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {user.role === "ADMIN" ? "🛡️ Yönetici" : "👤 Kullanıcı"}
            </Badge>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Kullanıcı ID</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono max-w-[180px] truncate">
              {user.id}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">E-posta Durumu</span>
            </div>
            <Badge variant={user.emailVerified ? "default" : "destructive"}>
              {user.emailVerified ? "✅ Doğrulanmış" : "❌ Doğrulanmamış"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">İki Faktörlü Doğrulama</span>
            </div>
            <Badge variant={user.isTwoFactorEnabled ? "default" : "secondary"}>
              {user.isTwoFactorEnabled ? "✅ Aktif" : "❌ Pasif"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Hesap Oluşturma</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {user.emailVerified ? new Date(user.emailVerified).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoized component export
export const UserInfo = memo(UserInfoComponent);
