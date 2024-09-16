import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { completed } = await req.json();

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid completed status' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        completed,
      },
    });

    if (todo.count === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todo = await prisma.todo.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (todo.count === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
