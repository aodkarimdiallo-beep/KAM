import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Bon retour"
      subtitle="Connectez-vous pour retrouver votre Digital Twin."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-copper underline-offset-4 hover:underline">
            Créer mon Digital Twin
          </Link>
        </>
      }
    >
      <Suspense fallback={<Skeleton className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
