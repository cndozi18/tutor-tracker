import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/settings/SignOutButton';
import type { Profile } from '@/lib/types/database.types';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  const profile = profileData as Profile | null;

  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-text mb-6">Settings</h1>

      <div className="bg-surface rounded-2xl shadow-card divide-y divide-border">
        <div className="px-5 py-4">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-3">Account</p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Display name</p>
              <p className="text-base text-text font-medium">{profile?.display_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Email</p>
              <p className="text-base text-text">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
