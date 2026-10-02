// src/lib/avatar-art.ts
// Original avatar artwork (no copyrighted characters). Pure SVG strings,
// served statically from /avatar/<id> so there is zero runtime cost.

const wrap = (defs: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><defs>${defs}</defs>${body}</svg>`;

const bg = (a: string, b: string) =>
  `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const glow = (id: string, c: string, o = 0.55) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

const BG = `<rect width="256" height="256" fill="url(#bg)"/>`;

export const AVATAR_ART: Record<string, string> = {
  // 1. Full moon over a torii gate
  moon: wrap(
    bg("#1b1446", "#0a0716") + glow("gl", "#c7b8ff", 0.6),
    BG +
      `<circle cx="128" cy="104" r="110" fill="url(#gl)"/>` +
      `<circle cx="128" cy="104" r="58" fill="#f6f0e4"/>` +
      `<circle cx="112" cy="92" r="9" fill="#e4dccb"/><circle cx="144" cy="118" r="12" fill="#e4dccb"/><circle cx="138" cy="84" r="5" fill="#e4dccb"/>` +
      `<g fill="#07060f"><path d="M44 148 Q128 122 212 148 L206 164 Q128 142 50 164Z"/><rect x="66" y="172" width="124" height="10"/><rect x="82" y="160" width="14" height="80"/><rect x="160" y="160" width="14" height="80"/></g>` +
      `<g fill="#fff" opacity=".8"><circle cx="40" cy="50" r="1.8"/><circle cx="210" cy="40" r="2"/><circle cx="196" cy="86" r="1.5"/><circle cx="60" cy="96" r="1.5"/><circle cx="224" cy="120" r="1.6"/></g>`
  ),

  // 2. Blood moon and katana
  blade: wrap(
    bg("#2a0509", "#07020a") + glow("gl", "#ff3b4a", 0.65) +
      `<linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#cdd8e4"/><stop offset="1" stop-color="#7d8fa3"/></linearGradient>`,
    BG +
      `<circle cx="128" cy="118" r="112" fill="url(#gl)"/>` +
      `<circle cx="128" cy="118" r="60" fill="#e63946"/>` +
      `<g transform="rotate(-35 128 128)"><polygon points="14,126 196,118 206,127 196,136" fill="url(#sl)"/><polyline points="30,130 196,126" stroke="#8fa3b8" stroke-width="1.4" fill="none" opacity=".8"/><rect x="204" y="112" width="8" height="30" rx="3" fill="#e6b93a"/><rect x="212" y="120" width="46" height="14" rx="5" fill="#140a0e"/><g stroke="#e63946" stroke-width="2"><path d="M222 120 L226 134 M232 120 L236 134 M242 120 L246 134 M252 120 L255 134"/></g></g>` +
      `<g fill="#fff" opacity=".7"><circle cx="46" cy="52" r="1.6"/><circle cx="214" cy="204" r="1.6"/><circle cx="34" cy="188" r="1.4"/></g>`
  ),

  // 3. Kitsune (fox) mask
  kitsune: wrap(
    bg("#0b2a3a", "#050912") + glow("gl", "#36d6c8", 0.45),
    BG +
      `<circle cx="128" cy="128" r="112" fill="url(#gl)"/>` +
      `<path d="M128 214 L70 126 L68 56 L106 90 Q128 82 150 90 L188 56 L186 126Z" fill="#f4efe8"/>` +
      `<path d="M68 56 L106 90 L86 100Z M188 56 L150 90 L170 100Z" fill="#e23b4a"/>` +
      `<path d="M92 128 Q106 112 122 130 Q106 124 92 128Z M164 128 Q150 112 134 130 Q150 124 164 128Z" fill="#14101a"/>` +
      `<path d="M128 100 L136 116 L128 132 L120 116Z" fill="#e23b4a"/>` +
      `<path d="M78 146 L106 158 M76 164 L104 170 M178 146 L150 158 M180 164 L152 170" stroke="#e23b4a" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M118 178 Q128 188 138 178 Q128 170 118 178Z" fill="#14101a"/>` +
      `<path d="M128 186 L128 204" stroke="#14101a" stroke-width="4" stroke-linecap="round"/>`
  ),

  // 4. Sakura bloom
  sakura: (() => {
    const petal = `M0 0 C9 -10 24 -6 22 8 C20 18 8 22 3 30 L0 24 L-3 30 C-8 22 -20 18 -22 8 C-24 -6 -9 -10 0 0Z`;
    const p = (x: number, y: number, r: number, s: number, o = 1) =>
      `<path d="${petal}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="url(#pt)" opacity="${o}"/>`;
    const flower = [0, 72, 144, 216, 288]
      .map((r) => `<path d="${petal}" transform="translate(128 128) rotate(${r}) translate(0 -6) scale(1.9)" fill="url(#pt)"/>`)
      .join("");
    return wrap(
      bg("#2b0f2e", "#0a0510") + glow("gl", "#ff8fb8", 0.5) +
        `<linearGradient id="pt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd1e3"/><stop offset="1" stop-color="#ff6fa3"/></linearGradient>`,
      BG + `<circle cx="128" cy="128" r="112" fill="url(#gl)"/>` +
        p(46, 56, 20, 0.9, 0.85) + p(206, 70, -30, 0.7, 0.8) + p(60, 200, 150, 0.8, 0.8) +
        p(204, 196, 200, 0.95, 0.85) + p(222, 132, 70, 0.55, 0.7) + p(30, 130, -80, 0.6, 0.7) +
        flower +
        `<circle cx="128" cy="128" r="9" fill="#ffd36e"/><circle cx="128" cy="128" r="4" fill="#ff9d2e"/>`
    );
  })(),

  // 5. Oni mask
  oni: wrap(
    bg("#1a0508", "#06020a") + glow("gl", "#ff2a3a", 0.5) +
      `<linearGradient id="fc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0434f"/><stop offset="1" stop-color="#8d0f1f"/></linearGradient>`,
    BG + `<circle cx="128" cy="130" r="112" fill="url(#gl)"/>` +
      `<path d="M92 106 L76 46 L114 96Z M164 106 L180 46 L142 96Z" fill="#f1e9da"/>` +
      `<path d="M128 214 C78 208 62 152 68 110 Q128 88 188 110 C194 152 178 208 128 214Z" fill="url(#fc)"/>` +
      `<path d="M78 112 L120 132 L120 122 L82 100Z M178 112 L136 132 L136 122 L174 100Z" fill="#12060a"/>` +
      `<path d="M88 134 L118 142 L90 152Z M168 134 L138 142 L166 152Z" fill="#ffd23f"/>` +
      `<path d="M94 172 Q128 190 162 172 L158 184 Q128 204 98 184Z" fill="#12060a"/>` +
      `<path d="M108 180 L113 194 L119 184Z M148 180 L143 194 L137 184Z" fill="#f4eee2"/>` +
      `<circle cx="128" cy="152" r="4" fill="#5a0a14"/>`
  ),

  // 6. Neon eye
  neon: wrap(
    bg("#031422", "#02030a") + glow("gl", "#22d3ee", 0.55) +
      `<radialGradient id="ir"><stop offset="0" stop-color="#7cf2ff"/><stop offset="0.6" stop-color="#1aa3d9"/><stop offset="1" stop-color="#0b3a8a"/></radialGradient>`,
    BG + `<circle cx="128" cy="128" r="112" fill="url(#gl)"/>` +
      `<path d="M24 128 Q128 44 232 128 Q128 212 24 128Z" fill="#04060d" stroke="#22d3ee" stroke-width="5"/>` +
      `<circle cx="128" cy="128" r="46" fill="url(#ir)"/>` +
      `<circle cx="128" cy="128" r="34" fill="none" stroke="#bff8ff" stroke-width="1.5" opacity=".6"/>` +
      `<circle cx="128" cy="128" r="22" fill="none" stroke="#bff8ff" stroke-width="1.2" opacity=".5"/>` +
      `<ellipse cx="128" cy="128" rx="9" ry="32" fill="#02040a"/>` +
      `<circle cx="116" cy="112" r="6" fill="#fff" opacity=".9"/>` +
      `<g stroke="#22d3ee" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M40 70 L60 82 M216 70 L196 82 M40 186 L60 174 M216 186 L196 174"/></g>`
  ),

  // 7. Thunder
  thunder: wrap(
    bg("#0d1240", "#05040f") + glow("gl", "#5b8cff", 0.6) +
      `<linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#ffc83d"/></linearGradient>`,
    BG + `<circle cx="128" cy="128" r="112" fill="url(#gl)"/>` +
      `<circle cx="128" cy="128" r="86" fill="none" stroke="#6f9bff" stroke-width="3" stroke-dasharray="6 10" opacity=".8"/>` +
      `<circle cx="128" cy="128" r="70" fill="none" stroke="#6f9bff" stroke-width="1.5" opacity=".5"/>` +
      `<path d="M148 34 L88 136 L124 136 L104 224 L176 108 L138 108 L168 34Z" fill="url(#bolt)" stroke="#fff6c4" stroke-width="2" stroke-linejoin="round"/>`
  ),

  // 8. Rising sun over waves
  wave: (() => {
    const row = (y: number, off: number, fill: string) => {
      let s = "";
      for (let x = -20 + off; x < 290; x += 44)
        s += `<circle cx="${x}" cy="${y}" r="26" fill="${fill}" stroke="#7dd3fc" stroke-width="2"/><circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#7dd3fc" stroke-width="2"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#7dd3fc" stroke-width="2"/>`;
      return s;
    };
    return wrap(
      bg("#10224f", "#060a1c") + glow("gl", "#ff4d5a", 0.55),
      BG + `<circle cx="128" cy="112" r="110" fill="url(#gl)"/><circle cx="128" cy="112" r="56" fill="#e63946"/>` +
        row(168, 0, "#0e2a63") + row(188, 22, "#0b2150") + row(208, 0, "#091a3f") + row(228, 22, "#07142f")
    );
  })(),

  // 9. Ninja star
  shuriken: wrap(
    bg("#062014", "#020806") + glow("gl", "#3dff9a", 0.4) +
      `<linearGradient id="st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset="0.5" stop-color="#8d99a6"/><stop offset="1" stop-color="#3b434c"/></linearGradient>`,
    BG + `<circle cx="128" cy="128" r="112" fill="url(#gl)"/>` +
      `<circle cx="128" cy="128" r="92" fill="none" stroke="#3dff9a" stroke-width="2" opacity=".5"/>` +
      `<g transform="rotate(20 128 128)"><path d="M128 28 L150 106 L228 128 L150 150 L128 228 L106 150 L28 128 L106 106Z" fill="url(#st)" stroke="#1a2026" stroke-width="2"/><path d="M128 28 L128 128 L228 128 M128 228 L128 128 L28 128" stroke="#1a2026" stroke-width="1.5" opacity=".35" fill="none"/></g>` +
      `<circle cx="128" cy="128" r="14" fill="#04100a" stroke="#cfd6dc" stroke-width="3"/>`
  ),

  // 10. Neko (cat)
  neko: wrap(
    bg("#3a0f4a", "#0a0412") + glow("gl", "#d46bff", 0.5),
    BG + `<circle cx="128" cy="130" r="112" fill="url(#gl)"/>` +
      `<path d="M62 104 L70 50 L108 82 Q128 76 148 82 L186 50 L194 104 Q202 156 160 192 Q128 212 96 192 Q54 156 62 104Z" fill="#0b0912" stroke="#b983ff" stroke-width="3"/>` +
      `<path d="M74 66 L96 84 L78 92Z M182 66 L160 84 L178 92Z" fill="#ff7ab8" opacity=".85"/>` +
      `<path d="M84 128 Q104 108 122 130 Q104 142 84 128Z M172 128 Q152 108 134 130 Q152 142 172 128Z" fill="#b6ff4a"/>` +
      `<ellipse cx="103" cy="127" rx="3.6" ry="9" fill="#07060c"/><ellipse cx="153" cy="127" rx="3.6" ry="9" fill="#07060c"/>` +
      `<path d="M120 156 L136 156 L128 166Z" fill="#ff7ab8"/>` +
      `<path d="M128 166 Q120 178 110 174 M128 166 Q136 178 146 174" stroke="#cfa9ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M70 156 L100 160 M70 170 L100 168 M186 156 L156 160 M186 170 L156 168" stroke="#cfa9ff" stroke-width="2.5" stroke-linecap="round"/>`
  ),

  // 11. Hitodama (spirit flames)
  spirit: (() => {
    const fl = `M0 -44 C20 -20 28 -4 26 14 C24 34 8 42 0 42 C-8 42 -24 34 -26 14 C-28 -4 -20 -20 0 -44Z`;
    const f = (x: number, y: number, s: number, o = 1) =>
      `<path d="${fl}" transform="translate(${x} ${y}) scale(${s})" fill="url(#fl)" opacity="${o}"/><path d="${fl}" transform="translate(${x} ${y + 8 * s}) scale(${s * 0.5})" fill="#eaffff" opacity="${0.85 * o}"/>`;
    return wrap(
      bg("#0a1d2e", "#03060d") + glow("gl", "#4de1ff", 0.5) +
        `<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9f6ff"/><stop offset="0.55" stop-color="#3aa7ff"/><stop offset="1" stop-color="#6a3dff"/></linearGradient>`,
      BG + `<circle cx="128" cy="140" r="112" fill="url(#gl)"/>` +
        f(128, 120, 1.9) + f(60, 150, 1.0, 0.9) + f(198, 144, 1.1, 0.9) + f(92, 70, 0.55, 0.8) + f(172, 62, 0.5, 0.8) +
        `<g fill="#b9f6ff" opacity=".8"><circle cx="40" cy="70" r="2"/><circle cx="220" cy="90" r="2"/><circle cx="130" cy="38" r="1.6"/><circle cx="34" cy="206" r="1.8"/><circle cx="226" cy="204" r="1.8"/></g>`
    );
  })(),

  // 12. Golden crescent crest
  crest: wrap(
    bg("#3a0a10", "#0a0206") + glow("gl", "#ffb830", 0.45) +
      `<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset="0.5" stop-color="#f5b82e"/><stop offset="1" stop-color="#a8650d"/></linearGradient>`,
    BG + `<circle cx="128" cy="128" r="112" fill="url(#gl)"/>` +
      `<circle cx="128" cy="128" r="94" fill="none" stroke="#f5b82e" stroke-width="2.5" opacity=".6"/>` +
      `<path d="M116.7 60.0 A72 72 0 1 0 175.7 172.2 A64 64 0 0 1 116.7 60.0Z" fill="url(#gd)"/>` +
      `<path d="M178 168 L184 182 L199 184 L187 194 L191 209 L178 201 L165 209 L169 194 L157 184 L172 182Z" fill="url(#gd)"/>` +
      `<g fill="#ffe9a0" opacity=".9"><circle cx="196" cy="74" r="2.4"/><circle cx="58" cy="60" r="1.8"/><circle cx="48" cy="196" r="1.8"/></g>`
  ),
};

export const AVATAR_IDS = Object.keys(AVATAR_ART);
