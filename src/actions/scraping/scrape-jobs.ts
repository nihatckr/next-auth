"use server"

import { auth } from "@/auth"
import { UserRole } from "@prisma/client"

export async function getScrapeJobs() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden")
  }

  try {
    // Gerçek veritabanından scrape job'ları çek
    // Şimdilik boş döndür - veritabanı boş olduğu için
    return []
  } catch (error) {
    console.error("Error fetching scrape jobs:", error)
    throw new Error("Failed to fetch scrape jobs")
  }
}
