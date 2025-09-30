import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 });
    }

    const categories = await db.category.findMany({
      where: {
        isActive: true
      },
      include: {
        brand: {
          select: { id: true, name: true }
        },
        _count: {
          select: { subCategories: true }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });

    // Mark leaf categories
    const categoriesWithLeaf = categories.map(category => ({
      ...category,
      isLeaf: category._count.subCategories === 0
    }));

    return NextResponse.json({
      success: categoriesWithLeaf
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Categories could not be loaded'
    }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
