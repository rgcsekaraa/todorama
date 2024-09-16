'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Confetti from 'react-confetti';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'complete' | 'delete';
    id: string;
  } | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    fetchTodos();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showConfetti) {
      timer = setTimeout(() => {
        let opacity = 1;
        const fadeInterval = setInterval(() => {
          opacity -= 0.1;
          setConfettiOpacity(opacity);
          if (opacity <= 0) {
            clearInterval(fadeInterval);
            setShowConfetti(false);
            setConfettiOpacity(1);
          }
        }, 200);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showConfetti]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
      }

      const text = await response.text(); // Use text() to check if response has content
      const data = text ? JSON.parse(text) : []; // Parse only if there's content
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]); // Fallback to empty array if an error occurs
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() !== '') {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newTodo }),
        });
        if (!response.ok) {
          throw new Error(`Failed to add todo: ${response.statusText}`);
        }

        const text = await response.text(); // Use text() to check if response has content
        const data = text ? JSON.parse(text) : null; // Parse only if there's content
        if (data) {
          setTodos([...todos, data]);
        }
        setNewTodo('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const openDialog = (type: 'complete' | 'delete', id: string) => {
    setCurrentAction({ type, id });
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (currentAction) {
      if (currentAction.type === 'complete') {
        const todoToUpdate = todos.find((todo) => todo.id === currentAction.id);
        if (todoToUpdate) {
          const response = await fetch(`/api/todos/${currentAction.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !todoToUpdate.completed }),
          });
          const updatedTodo = await response.json();
          setTodos(
            todos.map((todo) =>
              todo.id === updatedTodo.id ? updatedTodo : todo
            )
          );
          setShowConfetti(true);
        }
      } else if (currentAction.type === 'delete') {
        await fetch(`/api/todos/${currentAction.id}`, { method: 'DELETE' });
        setTodos(todos.filter((todo) => todo.id !== currentAction.id));
      }
    }
    setDialogOpen(false);
  };

  const handleLogout = () => {
    signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted || !session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        {showConfetti && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: confettiOpacity,
            }}
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              gravity={0.1}
            />
          </div>
        )}
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CalendarDays className="w-6 h-6" />
                Todorama
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="ml-2"
              >
                {theme === 'dark' ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={session.user?.image || ''}
                      alt={session.user?.name || ''}
                    />
                    <AvatarFallback>
                      {session.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            Organize your tasks efficiently with Todorama. Stay productive!
          </CardDescription>
          <div className="flex items-center pt-4">
            <Label>
              Hey {session.user?.name?.split(' ')[0]}, ready to be productive?
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Add your task"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={addTodo}>
              <Plus className="w-4 h-4 mr-2" />
              ADD
            </Button>
          </div>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => openDialog('complete', todo.id)}
                    id={`todo-${todo.id}`}
                  />
                  <Label
                    htmlFor={`todo-${todo.id}`}
                    className={`flex-grow ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {todo.text}
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDialog('delete', todo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                {currentAction?.type === 'complete'
                  ? 'Are you sure you want to mark this task as done?'
                  : 'Are you sure you want to delete this task?'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CardContent className="flex justify-center">
          <span className="text-xs text-gray-500">
            @2024 Todorama. All rights reserved.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
