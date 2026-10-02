// Basic profanity filter — censors common abusive words. Not exhaustive,
// but blocks the most common cases automatically.
const BLOCKED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "pussy",
  "cunt", "whore", "slut", "nigger", "faggot", "chutiya", "madarchod",
  "bhenchod", "randi", "gandu", "harami",
];

export function censorProfanity(text: string): string {
  let result = text;
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    result = result.replace(regex, (match) => "*".repeat(match.length));
  }
  return result;
}
