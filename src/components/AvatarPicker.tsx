"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { AVATAR_PRESETS } from "@/lib/avatars";

export function AvatarPicker({
  current,
  onSelect,
}: {
  current: string | null;
  onSelect: (url: string) => void;
}) {
  const [selected, setSelected] = useState(current);

  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_PRESETS.map((url) => (
        <button
          key={url}
          onClick={() => {
            setSelected(url);
            onSelect(url);
          }}
          className={`relative aspect-square rounded-full overflow-hidden ring-2 transition-all ${
            selected === url ? "ring-brand scale-105" : "ring-white/10 hover:ring-white/30"
          }`}
        >
          <Image src={url} alt="" fill className="object-cover" unoptimized />
          {selected === url && (
            <div className="absolute inset-0 bg-brand/30 flex items-center justify-center">
              <Check size={18} className="text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
