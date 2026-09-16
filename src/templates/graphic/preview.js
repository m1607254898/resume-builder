import { esc } from "../../core/ui.js";
import { getTheme } from "../../core/themes.js";

export const MODULES = {
  edu: { label: "教育背景", side: "left" },
  self: { label: "自我评价", side: "left" },
  hobby: { label: "兴趣爱好", side: "left" },
  strength: { label: "优势特长", side: "left" },
  work: { label: "工作经历", side: "right" },
  project: { label: "项目经历", side: "right" },
  skill: { label: "技能水平", side: "right" },
};

const section = (label, body) => `
  <section class="g-sec">
    <h3 class="g-sec-t"><i class="g-flag"></i><span>${esc(label)}</span><i class="g-rule"></i></h3>
    <div class="g-sec-b">${body || "&nbsp;"}</div>
  </section>`;

const BODIES = {
  edu: (s) =>
    (s.eduList || [])
      .filter((i) => i.school || i.major || i.degree || i.period)
      .map(
        (i) => `<div class="g-item">
          <div class="g-line"><span class="g-period">${esc(i.period)}</span><b>${esc(i.school)}</b></div>
          <div class="g-kv">专业：${esc(i.major)}</div>
          <div class="g-kv">学历：${esc(i.degree)}</div>
        </div>`
      )
      .join(""),

  self: (s) => `<p class="g-para">${esc(s.self)}</p>`,

  hobby: (s) =>
    `<div class="g-tags">${(s.hobbies || []).filter(Boolean).map((h) => `<span>${esc(h)}</span>`).join('<i>/</i>')}</div>`,

  strength: (s) =>
    `<div class="g-strengths">${(s.strengths || []).filter(Boolean)
      .map((w) => `<div class="g-str">${esc(w)}</div>`).join("")}</div>`,

  work: (s) =>
    (s.work || [])
      .filter((w) => w.company || w.position || w.desc)
      .map(
        (w) => `<div class="g-item">
          <div class="g-period">${esc(w.period)}</div>
          <div class="g-job-h"><b>${esc(w.company)}</b><span class="g-pos">${esc(w.position)}</span></div>
          <p class="g-para">${esc(w.desc)}</p>
        </div>`
      )
      .join(""),

  project: (s) =>
    (s.projects || [])
      .filter((p) => p.name || p.desc || p.duty)
      .map(
        (p) => `<div class="g-item">
          <div class="g-line"><span class="g-period">${esc(p.period)}</span><b>${esc(p.name)}</b></div>
          <p class="g-para"><b>项目描述：</b>${esc(p.desc)}</p>
          <p class="g-para"><b>职责描述：</b>${esc(p.duty)}</p>
        </div>`
      )
      .join(""),

  skill: (s) =>
    (s.skills || [])
      .filter((k) => k.name)
      .map((k) => {
        const lv = Math.max(0, Math.min(100, Number(k.level) || 0));
        return `<div class="g-skill">
          <div class="g-skill-n">${esc(k.name)}</div>
          <div class="g-bar"><i style="width:${lv}%"></i><b style="left:${lv}%"></b></div>
        </div>`;
      })
      .join(""),
};

export function renderPage(state) {
  const t = getTheme(state.theme);
  const b = state.basic || {};
  const layout = state.layout || { left: [], right: [] };

  const photo = state.photo?.dataUrl
    ? `<img src="${state.photo.dataUrl}" alt="照片" />`
    : `<span>照片</span>`;

  const contacts = [
    ["生日", b.birth],
    ["所在地", b.city],
    ["电话", b.phone],
    ["邮箱", b.email],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<div>${esc(k)}：${esc(v)}</div>`)
    .join("");

  const col = (ids) =>
    (ids || []).map((id) => (MODULES[id] ? section(MODULES[id].label, BODIES[id](state)) : "")).join("");

  return `
    <div class="gr-root" style="--main:${t.main};--light:${t.light};--rule:${t.rule};--accent:${t.accent};--accentLight:${t.accentLight};--deep:${t.deep}">
      <div class="g-deco" aria-hidden="true">
        <span class="d1"></span><span class="d2"></span><span class="d3"></span><span class="d4"></span>
      </div>
      <header class="g-head">
        <div class="g-avatar">${photo}</div>
        <div class="g-mid"><div class="g-name">${esc(b.name)}</div></div>
        <div class="g-contact">${contacts}</div>
      </header>
      <div class="g-band">求职意向：${esc(b.intention)}</div>
      <div class="g-body">
        <div class="g-col">${col(layout.left)}</div>
        <div class="g-col">${col(layout.right)}</div>
      </div>
    </div>`;
}
