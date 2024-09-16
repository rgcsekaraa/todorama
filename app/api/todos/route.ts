import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; // Assuming you have an authentication module
import prisma from '@/lib/prisma'; // Prisma client

// GET handler to fetch all todos for the authenticated user
export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc', // Optional: order todos by creation date
      },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST handler to create a new todo for the authenticated user
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text } = await req.json();

    // Validate todo text input
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid todo text' }, { status: 400 });
    }

    // Create new todo associated with the authenticated user
    const todo = await prisma.todo.create({
      data: {
        text,
        completed: false,
        userId: session.user.id, // Correct association with user
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error adding todo:', error);
    return NextResponse.json({ error: 'Failed to add todo' }, { status: 500 });
  }
}
