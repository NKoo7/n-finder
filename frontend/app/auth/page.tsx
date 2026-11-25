import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your N-Finder account.",
};

export default function AuthPage() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-ink-950/40" />
      <Container className="relative flex min-h-[calc(100dvh-4.25rem)] items-center justify-center py-14">
        <AuthForm />
      </Container>
    </div>
  );
}