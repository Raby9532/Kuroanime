"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Send, Reply, Pencil, Trash2, EyeOff, Eye } from "lucide-react";
import Image from "next/image";

interface CommentUser { name: string | null; image: string | null; avatarPreset: string | null; }
interface CommentData {
  id: string; content: string; createdAt: string; editedAt: string | null;
  isSpoiler: boolean; userId: string; user: CommentUser; replies?: CommentData[];
}

function Avatar({ user }: { user: CommentUser }) {
  const src = user.avatarPreset || user.image;
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-2 shrink-0 ring-1 ring-white/10">
      {src ? (
        <Image src={src} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
          {(user.name || "?")[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

function CommentRow({
  comment, currentUserId, onReply, onEdit, onDelete,
}: {
  comment: CommentData; currentUserId?: string;
  onReply: (id: string, name: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const isOwner = currentUserId === comment.userId;
  const editable = isOwner && Date.now() - new Date(comment.createdAt).getTime() < 2 * 60 * 1000;

  return (
    <div className="glass-card p-3.5 flex gap-3">
      <Avatar user={comment.user} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-white">{comment.user.name || "Anonymous"}</span>
          <span className="text-[11px] text-gray-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
          {comment.editedAt && <span className="text-[10px] text-gray-600">(edited)</span>}
        </div>

        {editing ? (
          <div className="flex gap-2 mt-1">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
            />
            <button onClick={() => { onEdit(comment.id, editText); setEditing(false); }} className="text-xs text-brand">Save</button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-500">Cancel</button>
          </div>
        ) : comment.isSpoiler && !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg mt-1 transition-colors"
          >
            <EyeOff size={12} /> Spoiler — click to reveal
          </button>
        ) : (
          <p className="text-sm text-gray-300 break-words">
            {comment.isSpoiler && <Eye size={11} className="inline mr-1 text-brand" />}
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <button onClick={() => onReply(comment.id, comment.user.name || "Anonymous")} className="text-[11px] text-gray-500 hover:text-brand flex items-center gap-1">
            <Reply size={11} /> Reply
          </button>
          {editable && (
            <button onClick={() => setEditing(true)} className="text-[11px] text-gray-500 hover:text-brand flex items-center gap-1">
              <Pencil size={11} /> Edit
            </button>
          )}
          {isOwner && (
            <button onClick={() => onDelete(comment.id)} className="text-[11px] text-gray-500 hover:text-red-400 flex items-center gap-1">
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2.5 pl-3 border-l border-white/10">
            {comment.replies.map((r) => (
              <CommentRow key={r.id} comment={r} currentUserId={currentUserId} onReply={onReply} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ anilistId, episode }: { anilistId: number; episode: number }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  function load() {
    setLoading(true);
    fetch(`/api/comments?anilistId=${anilistId}&episode=${episode}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [anilistId, episode]);

  async function handlePost() {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anilistId, episode, content: text, parentId: replyTo?.id, isSpoiler }),
      });
      if (res.ok) {
        setText(""); setIsSpoiler(false); setReplyTo(null);
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to post comment");
      }
    } finally {
      setPosting(false);
    }
  }

  async function handleEdit(id: string, content: string) {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) load();
    else { const e = await res.json().catch(() => ({})); alert(e.error || "Edit failed"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  const totalCount = comments.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle size={18} className="text-brand" />
        <h2 className="font-display text-xl text-white tracking-wide">EPISODE {episode} COMMENTS</h2>
        <span className="text-xs text-gray-500">({totalCount})</span>
      </div>

      {session ? (
        <div className="glass-card p-3 mb-5">
          {replyTo && (
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 bg-white/5 rounded-lg px-3 py-1.5">
              <span>Replying to <b className="text-white">{replyTo.name}</b></span>
              <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
              placeholder={replyTo ? `Reply to ${replyTo.name}...` : `Say something about episode ${episode}...`}
              maxLength={500}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none px-2"
            />
            <button onClick={handlePost} disabled={posting || !text.trim()} className="btn-glow shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40">
              <Send size={15} />
            </button>
          </div>
          <label className="flex items-center gap-1.5 mt-2 px-2 text-[11px] text-gray-500 cursor-pointer">
            <input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="accent-brand" />
            Mark as spoiler
          </label>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-5">
          <a href="/auth/signin" className="text-brand hover:underline">Sign in</a> to comment.
        </p>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-600">No comments yet — be the first to say something.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentRow
              key={c.id} comment={c} currentUserId={(session?.user as any)?.id}
              onReply={(id, name) => setReplyTo({ id, name })}
              onEdit={handleEdit} onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
