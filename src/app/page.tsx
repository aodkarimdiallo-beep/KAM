import { redirect } from "next/navigation";

/** Point d'entrée : redirige vers le dashboard (une page d'accueil publique viendra avec l'onboarding SaaS). */
export default function Home() {
  redirect("/dashboard");
}
