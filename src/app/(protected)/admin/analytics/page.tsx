export default function AdminAnalyticsPage() {

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold">Sistem Analitikleri</h1>
              <p className="text-muted-foreground">
                Sistem performansı ve kullanım istatistikleri
              </p>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Toplam Kullanıcı</h3>
                <p className="text-2xl font-semibold">1,234</p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Aktif Oturumlar</h3>
                <p className="text-2xl font-semibold">456</p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Sistem Durumu</h3>
                <p className="text-2xl font-semibold text-green-600">Çevrimiçi</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium">Detaylı Raporlar</h2>
              <p className="text-muted-foreground">
                Analitik raporlama sistemi yakında eklenecek...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
