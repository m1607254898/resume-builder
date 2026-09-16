import { esc } from "../../core/ui.js";

/* ---------- 图标（内联 SVG，避免依赖字体/emoji） ---------- */
const G = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const ICONS = {
  check: G('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'),
  pen: G('<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M14 6l3 3"/>'),
  user: G('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>'),
  cap: G('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>'),
  trophy: G('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M12 14v3"/><path d="M8 21h8"/>'),
  heart: G('<path d="M12 20s-7-4.5-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.5 12 20 12 20z"/>'),
  cake: G('<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M12 4v4"/>'),
  phone: G('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'),
  mail: G('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 8l9 6 9-6"/>'),
  pin: G('<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  swim: G('<path d="M3 17c2 0 2.5-1.5 5-1.5S10.5 17 12.5 17 15 15.5 17.5 15.5 21 17 21 17"/><circle cx="16" cy="8" r="2"/><path d="M6 12l5-3"/>'),
  ball: G('<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>'),
  film: G('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14"/>'),
  camera: G('<path d="M3 8h4l2-2h6l2 2h4v11H3z"/><circle cx="12" cy="13" r="3.5"/>'),
  run: G('<circle cx="14" cy="5" r="2"/><path d="M13 9l-3 4 4 2-1 6"/><path d="M10 13l-4 1"/>'),
  music: G('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  book: G('<path d="M4 5v14h7V5z"/><path d="M13 5v14h7V5z"/>'),
  game: G('<rect x="2" y="8" width="20" height="9" rx="4.5"/><path d="M8 12h3M9.5 10.5v3"/><circle cx="16" cy="12" r="1"/>'),
  star: G('<path d="M12 4l2.4 5 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8z"/>'),
};

const HOBBY_MAP = [
  [/游泳|潜水|水上|帆船/, "swim"],
  [/球|足球|篮球|排球|乒乓|羽毛/, "ball"],
  [/电影|影视|追剧|观影/, "film"],
  [/摄影|拍照|相机/, "camera"],
  [/跑步|健身|运动|徒步|登山|骑行/, "run"],
  [/音乐|唱歌|乐器|吉他|钢琴/, "music"],
  [/阅读|读书|看书|文学/, "book"],
  [/游戏|电竞/, "game"],
  [/写作|书法|绘画|设计|手工/, "pen"],
];
const hobbyIcon = (name) =>
  (HOBBY_MAP.find(([re]) => re.test(name || "")) || [null, "star"])[1];

/* ---------- 主题：每套色板对应一组模块强调色 ---------- */
export const MOD_COLORS = {
  rose: { work: "#34B37E", skill: "#F0574B", info: "#4A90D9", edu: "#4A90D9", award: "#35B9D6", hobby: "#F5A623" },
  blue: { work: "#2E7FD1", skill: "#4FA8E0", info: "#3D7EDB", edu: "#3D7EDB", award: "#35A7C4", hobby: "#5B8DEF" },
  green: { work: "#34B37E", skill: "#7FB93C", info: "#2E9E8F", edu: "#2E9E8F", award: "#3FA98F", hobby: "#9DC02F" },
  gray: { work: "#6E7278", skill: "#8A8F96", info: "#5F6368", edu: "#5F6368", award: "#9AA0A6", hobby: "#7A7F86" },
};
export const modColor = (theme, id) =>
  (MOD_COLORS[theme] || MOD_COLORS.rose)[id] || "#4A90D9";

/* ---------- 模块 ---------- */
export const MODULES = {
  info: { label: "个人信息", icon: "user", side: "right" },
  edu: { label: "教育背景", icon: "cap", side: "right" },
  award: { label: "奖项荣誉", icon: "trophy", side: "right" },
  hobby: { label: "兴趣爱好", icon: "heart", side: "right" },
  work: { label: "工作经验", icon: "check", side: "left" },
  skill: { label: "掌握技能", icon: "pen", side: "left" },
};

const abbrOf = (s) =>
  (s.abbr || "").trim() ||
  (s.name || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() ||
  "·";

const BODIES = {
  info: (s, c) => {
    const b = s.basic || {};
    const rows = [
      ["cake", b.age ? `${b.age} 岁` : ""],
      ["phone", b.phone],
      ["mail", b.email],
      ["pin", b.city],
    ].filter(([, v]) => v);
    return `<div class="i-info">${rows
      .map(([ic, v]) => `<div class="i-info-r">${ICONS[ic]}<span>${esc(v)}</span></div>`)
      .join("")}</div>`;
  },

  edu: (s, c) =>
    `<div class="i-tl">${(s.eduList || [])
      .filter((i) => i.school || i.major)
      .map(
        (i) => `<div class="i-tl-i">
          <div class="i-period">${esc(i.period)}</div>
          <div class="i-org" style="--org:${c}">${esc(i.school)}</div>
          <div class="i-sub">${esc([i.major, i.degree].filter(Boolean).join("　"))}</div>
        </div>`
      )
      .join("")}</div>`,

  award: (s) =>
    `<div class="i-tl">${(s.awards || [])
      .filter((a) => a.text)
      .map(
        (a) => `<div class="i-tl-i">
          <div class="i-award"><span class="i-award-d">${esc(a.period)}</span>${esc(a.text)}</div>
        </div>`
      )
      .join("")}</div>`,

  hobby: (s) =>
    `<div class="i-hobbies">${(s.hobbies || [])
      .filter(Boolean)
      .map(
        (h) => `<div class="i-hobby">${ICONS[hobbyIcon(h)]}<span>${esc(h)}</span></div>`
      )
      .join("")}</div>`,

  work: (s, c) =>
    `<div class="i-tl">${(s.work || [])
      .filter((w) => w.company || w.desc)
      .map(
        (w) => `<div class="i-tl-i">
          <div class="i-period">${esc(w.period)}</div>
          <div class="i-org" style="--org:${c}">${esc(w.company)}</div>
          <p class="i-desc">${esc(w.desc)}</p>
        </div>`
      )
      .join("")}</div>`,

  skill: (s) =>
    `<div class="i-skills">${(s.skills || [])
      .filter((k) => k.name)
      .map(
        (k) => `<div class="i-skill">
          <span class="i-bub">${esc(abbrOf(k))}</span>
          <em>${esc(k.name)}</em>
        </div>`
      )
      .join("")}</div>`,
};

const section = (id, state, theme) => {
  const m = MODULES[id];
  if (!m) return "";
  const c = modColor(theme, id);
  return `
    <section class="i-sec" style="--ic:${c}">
      <h3 class="i-sec-t">
        <i class="i-ico" style="background:${c}">${ICONS[m.icon]}</i>
        <span>${esc(m.label)}</span>
        <i class="i-line"></i>
      </h3>
      <div class="i-sec-b">${BODIES[id](state, c) || "&nbsp;"}</div>
    </section>`;
};

/* ---------- 主渲染 ---------- */
export function renderPage(state) {
  const b = state.basic || {};
  const layout = state.layout || { left: [], right: [] };
  const photo = state.photo?.dataUrl
    ? `<img src="${state.photo.dataUrl}" alt="照片" />`
    : `<span>照片</span>`;

  // 装饰性图标块（纯装饰，不承载信息）
  const tiles = [
    modColor(state.theme, "skill"),
    modColor(state.theme, "hobby"),
    modColor(state.theme, "work"),
    modColor(state.theme, "award"),
  ]
    .map((c) => `<i class="i-tile" style="background:${c}"></i>`)
    .join("") + `<i class="i-tile i-tile-lg" style="background:${modColor(state.theme, "info")}"></i>`;

  const col = (ids) => (ids || []).map((id) => section(id, state, state.theme)).join("");

  return `
    <div class="ic-root">
      <div class="i-frame">
        <div class="i-grid">
          <div class="i-col">
            <div class="i-head">
              <div class="i-photo">${photo}</div>
              <div class="i-tiles">${tiles}<i class="i-tile i-tile-lg"></i></div>
            </div>
            <h1 class="i-name">${esc(b.name)}</h1>
            <div class="i-pinyin">${esc(b.pinyin)}</div>
            <div class="i-intent">求职意向：${esc(b.intention)}</div>
            ${state.self ? `<p class="i-summary">${esc(state.self)}</p>` : ""}
            ${col(layout.left)}
          </div>
          <div class="i-col">${col(layout.right)}</div>
        </div>
      </div>
    </div>`;
}
