"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AvatarPicker } from "@/components/AvatarPicker";
import { Save } from "lucide-react";

export function ProfileEditor() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [avatar, setAvatar] = useState<string | null>(
    (session?.user as any)?.avatarPreset || null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarPreset: avatar }),
      });
      if (res.ok) {
        await update();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
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
