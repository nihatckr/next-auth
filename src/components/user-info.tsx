import { ExtendedUser } from "../../next-auth";

interface UserInfoProps {
  user?: ExtendedUser;
  label: string;
}

export const UserInfo = ({
  user,
  label,
}: UserInfoProps) => {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{label}</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">ID:</p>
          <p className="text-sm text-muted-foreground font-mono max-w-[180px] truncate">
            {user?.id}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">İsim:</p>
          <p className="text-sm text-muted-foreground">
            {user?.name || "Belirtilmemiş"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">E-posta:</p>
          <p className="text-sm text-muted-foreground">
            {user?.email || "Belirtilmemiş"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">Rol:</p>
          <p className="text-sm text-muted-foreground">
            {user?.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">E-posta Doğrulandı:</p>
          <p className="text-sm text-muted-foreground">
            {user?.emailVerified ? "✅ Evet" : "❌ Hayır"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">İki Faktörlü Kimlik Doğrulama:</p>
          <p className="text-sm text-muted-foreground">
            {user?.isTwoFactorEnabled ? "✅ Aktif" : "❌ Pasif"}
          </p>
        </div>
      </div>
    </div>
  );
};
