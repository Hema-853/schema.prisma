import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'alice-id';

  try {
    const ownedDocuments = await prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        shares: {
          include: {
            user: true,
          },
        },
      },
    });

    const sharedDocuments = await prisma.document.findMany({
      where: {
        shares: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: true,
        shares: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({ ownedDocuments, sharedDocuments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'alice-id';
  const { title, content } = await request.json();

  try {
    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled Document',
        content: content || '<p>Start writing...</p>',
        ownerId: userId,
      },
    });
    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}