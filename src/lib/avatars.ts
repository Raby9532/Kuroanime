// Avatar picker list. Artwork lives in src/lib/avatar-art.ts and is served
// statically from /avatar/<id>. Keep these ids in sync with that file.
const AVATAR_IDS = [
  "moon", "blade", "kitsune", "sakura",
  "oni", "neon", "thunder", "wave",
  "shuriken", "neko", "spirit", "crest",
];

export const AVATAR_PRESETS = AVATAR_IDS.map((id) => `/avatar/${id}`);
