/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";
import { login } from "@/routes";
import { LogOut } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface PageProps {
  auth?: {
    user?: User | null;
  };
  flash?: {
    error?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export default function Welcome() {
  const { props } = usePage<PageProps>();
  const user = props.auth?.user;
  const flashError = props.flash?.error;

  const handleLogout = () => {
    router.post("/logout");
  };

  return (
    <AuthLayout
      title={user ? `Welcome back, ${user.name}!` : "Welcome to your CRM"}
      description={
        user
          ? "Everything you do daily, organized in one living dashboard."
          : "Everything you do daily, organized in one living dashboard."
      }
    >
      <Head title="Welcome" />

      <div className="flex flex-col items-center justify-center gap-6">
        {flashError && (
          <p className="text-red-600 font-semibold text-center">{flashError}</p>
        )}

        {user ? (
          <>
            <p className="text-center text-muted-foreground">
              You're already logged in.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className='text-black' asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              <Button variant="outline" onClick={handleLogout}>
                <LogOut />
                Logout
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="default">
                <Link href={login()}>Log in</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
