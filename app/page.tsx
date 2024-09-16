'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sun, Moon, CalendarDays } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc'; // Google Icon from react-icons

export default function LandingPage() {
  const { data: session } = useSession();

  // Initialize the theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default to 'light' theme

  useEffect(() => {
    // Get saved theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme change
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  if (session) {
    window.location.href = '/dashboard';
    return null;
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
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
          </div>
          <CardDescription>
            Organize your tasks efficiently with Todorama.
            <br /> Stay productive!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            className="w-full max-w-sm"
            variant="outline"
            onClick={() => signIn('google')}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardContent className="flex justify-center">
          <span className="text-xs text-gray-500">
            @2024 Todorama. All rights reserved.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
