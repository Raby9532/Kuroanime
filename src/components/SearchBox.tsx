"use client";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mb-8">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        name="q"
        type="text"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search anime..."
        className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand transition-all"
      />
    </form>
  );
}
