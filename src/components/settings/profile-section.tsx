import { getMyProfile } from "@/server/profile/queries";
import { getCurrentUser } from "@/server/auth/session";
import { ProfileForm } from "./profile-form";

export async function ProfileSection() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <p className="text-sm text-muted">
        Le profil sera disponible une fois Supabase configuré et votre compte créé.
      </p>
    );
  }
  const profile = await getMyProfile();
  if (!profile) return <p className="text-sm text-danger">Profil introuvable. Contactez le support.</p>;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-[13px] text-muted">
        Connecté en tant que <span className="text-fg-soft">{user.email}</span>
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
