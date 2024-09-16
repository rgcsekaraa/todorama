import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; // Assuming you have an authentication module
import prisma from '@/lib/prisma'; // Prisma client

// PUT handler to update the "completed" status or text of a specific todo
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { completed, text } = await req.json();

    const data: any = {};
    if (text !== undefined) {
      data.text = text;
    }
    if (typeof completed === 'boolean') {
      data.completed = completed;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the todo if it belongs to the authenticated user
    const todo = await prisma.todo.updateMany({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure todo belongs to the authenticated user
      },
      data,
    });

    if (todo.count === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Fetch the updated todo
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

// DELETE handler to delete a specific todo
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
        userId: session.user.id, // Ensure todo belongs to the authenticated user
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
