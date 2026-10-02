"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AvatarPicker } from "@/components/AvatarPicker";
import { Save } from "lucide-react";

export function ProfileEditor() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [avatar, setAvatar] = useState<string | null>(
    (session?.user as any)?.avatarPreset || null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarPreset: avatar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save changes");
        return;
      }
      // Sending data makes NextAuth re-read the user from the database.
      await update({ refresh: Date.now() });
      router.refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-card p-5 sm:p-6 max-w-lg">
      <h2 className="font-display text-xl text-white mb-4">EDIT PROFILE</h2>

      <label className="text-xs text-gray-500 mb-1.5 block">Display Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
        className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white mb-5 focus:outline-none focus:border-brand"
      />

      <label className="text-xs text-gray-500 mb-2 block">Choose Avatar</label>
      <AvatarPicker current={avatar} onSelect={setAvatar} />

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-glow mt-6 inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-full disabled:opacity-50"
      >
        <Save size={14} /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}
