export default function AdminUsersPage() {

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold">Kullanıcı Yönetimi</h1>
              <p className="text-muted-foreground">
                Sistem kullanıcılarını ve rollerini yönetin
              </p>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium">Kullanıcı Listesi</h2>
              <p className="text-muted-foreground">
                Kullanıcı yönetimi özelliği yakında eklenecek...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
