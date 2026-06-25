import { Show, SignInButton, UserButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';
import './globals.css';

const AuthHeader = () => {
  return (
    <section className="flex items-center gap-4">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="outline" className="cursor-pointer">
            Sign In
          </Button>
        </SignInButton>

        <SignUpButton mode="modal">
          <Button variant="outline" className="cursor-pointer">
            Sign Up
          </Button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </section>
  );
};

export default function Home() {
  return (
    <main className="flex h-[calc(100vh)] flex-col items-center justify-center">
      <section>
        <h1 className="text-8xl font-bold">Jira Teams</h1>
        <h2 className="text-center text-4xl">A Jira Clone</h2>
      </section>
      <section className="flex gap-4 p-4">
        <Button asChild className="cursor-pointer">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <AuthHeader />
      </section>
    </main>
  );
}
