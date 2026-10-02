"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface Notif {
  id: string; fromName: string; anilistId: number; episode: number;
  read: boolean; createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/notifications").then((r) => r.json()).then(setNotifs);
    const interval = setInterval(() => {
      fetch("/api/notifications").then((r) => r.json()).then(setNotifs);
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleOpen() {
    setOpen(!open);
    if (!open && notifs.some((n) => !n.read)) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  if (!session) return null;
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand rounded-full text-[9px] flex items-center justify-center text-white font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 dropdown-solid shadow-2xl max-h-80 overflow-y-auto z-50">
          {notifs.length === 0 ? (
            <p className="text-xs text-gray-500 p-4 text-center">No notifications yet.</p>
          ) : (
            notifs.map((n) => (
              <Link
                key={n.id}
                href={`/anime/${n.anilistId}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <p className="text-gray-300">
                  <b className="text-white">{n.fromName}</b> replied to your comment on episode {n.episode}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
