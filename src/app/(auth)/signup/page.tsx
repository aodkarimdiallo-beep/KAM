import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Inscription" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Créer votre Twin"
      subtitle="Une intelligence personnelle qui apprend votre parcours, vos projets et votre façon de travailler."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/login" className="text-copper underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
