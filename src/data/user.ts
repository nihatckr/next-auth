
import db from "@/lib/db";


export const getUserByEmail = async (email: string) => {
 try {
  const user = await db.user.findUnique({
   where: { email },
  });
  return user;
 } catch (error) {
  console.error("Error fetching user by email:", error);
  return null;
 }
}

// Optimized user fetch with selective fields (exclude password)
export const getUserById = async (id: string) => {
 try {
  const user = await db.user.findUnique({
   where: { id },
   select: {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    role: true,
    // password alanını exclude et (güvenlik)
    createdAt: true,
    updatedAt: true,
   }
  });
  return user;
 } catch (error) {
  console.error("Error fetching user by id:", error);
  return null;
 }
}

// Batch user loading for admin dashboard
export const getUsersWithPagination = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      db.user.count()
    ])

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch {
    return null
  }
}

// Get user profile with safe fields
export const getUserProfile = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    return user
  } catch {
    return null
  }
}
