// Anime-style avatars — mixing DiceBear's "micah" and "notionists" styles
// for a more mature, less childish look than "adventurer". Still 100%
// procedurally generated (no copyrighted character art), so no IP risk.
const STYLES = ["micah", "notionists", "adventurer-neutral"];

export const AVATAR_PRESETS = Array.from({ length: 20 }, (_, i) => {
  const style = STYLES[i % STYLES.length];
  const seed = `kuroanime-user-${i + 1}`;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=1a1a28,2a1a3e,1e2a3e`;
});
