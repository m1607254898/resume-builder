import { esc } from "../../core/ui.js";
import { getTheme } from "../../core/themes.js";

export const MODULES = {
  cert: { label: "技能证书", side: "left" },
  honor: { label: "获得荣誉", side: "left" },
  hobby: { label: "兴趣爱好", side: "left" },
  edu: { label: "教育背景", side: "right" },
  work: { label: "工作经历", side: "right" },
  project: { label: "项目经历", side: "right" },
  self: { label: "自我评价", side: "right" },
};

/** 描述文字按换行拆成多条项目符号 */
const toBullets = (s) =>
  String(s ?? "").split(/\n+/).map((x) => x.trim()).filter(Boolean);

const bullets = (arr) =>
  arr.length ? `<ul class="s-bul">${arr.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";

const BODIES = {
  cert: (s) => bullets((s.certs || []).filter(Boolean)),
  honor: (s) => bullets((s.honors || []).filter(Boolean)),
  hobby: (s) => bullets((s.hobbies || []).filter(Boolean)),

  edu: (s) =>
    (s.eduList || [])
      .filter((i) => i.school || i.major)
      .map(
        (i) => `<div class="s-item">
          <div class="s-entry">
            <span class="s-time">${esc(i.period)}</span>
            <span class="s-org">${esc(i.school)}</span>
            <span class="s-major">${esc(i.major)}</span>
            <span class="s-last">${esc(i.degree)}</span>
          </div>
          ${bullets(
            i.courses ? [`主修课程：${i.courses}`] : []
          )}
        </div>`
      )
      .join(""),

  work: (s) =>
    (s.work || [])
      .filter((w) => w.company || w.desc)
      .map(
        (w) => `<div class="s-item">
          <div class="s-entry">
            <span class="s-time">${esc(w.period)}</span>
            <span class="s-org">${esc(w.company)}</span>
            <span class="s-last s-pos">${esc(w.position)}</span>
          </div>
          ${bullets(toBullets(w.desc))}
        </div>`
      )
      .join(""),

  project: (s) =>
    (s.projects || [])
      .filter((p) => p.name || p.desc)
      .map(
        (p) => `<div class="s-item">
          <div class="s-entry">
            <span class="s-time">${esc(p.period)}</span>
            <span class="s-org">${esc(p.name)}</span>
            <span class="s-last"></span>
          </div>
          ${bullets([...toBullets(p.desc), ...toBullets(p.duty)])}
        </div>`
      )
      .join(""),

  self: (s) => bullets(toBullets(s.self)),
};

const section = (id, state) => {
  const m = MODULES[id];
  if (!m) return "";
  return `<section class="s-sec">
    <h3 class="s-sec-t"><span class="s-pill">${esc(m.label)}</span></h3>
    <div class="s-sec-b">${BODIES[id](state) || "&nbsp;"}</div>
  </section>`;
};

export function renderPage(state) {
  const t = getTheme(state.theme);
  const b = state.basic || {};
  const layout = state.layout || { left: [], right: [] };

  const photo = state.photo?.dataUrl
    ? `<img src="${state.photo.dataUrl}" alt="照片" />`
    : `<span>照片</span>`;

  const info = [
    ["政治面貌", b.politics],
    ["籍\u3000\u3000贯", b.nativePlace],
    ["联系方式", b.phone],
    ["现 居 地", b.city],
    ["邮\u3000\u3000箱", b.email],
    ["出生年月", b.birth],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<div class="s-info-i"><i>◆</i><b>${esc(k)}</b><span>${esc(v)}</span></div>`)
    .join("");

  const col = (ids) => (ids || []).map((id) => section(id, state)).join("");

  return `
    <div class="sb-root" style="--main:${t.main};--light:${t.light};--rule:${t.rule};--deep:${t.deep}">
      <aside class="s-bar">
        <div class="s-photo">${photo}</div>
        <h1 class="s-name">${esc(b.name)}</h1>
        <div class="s-intent">求职意向：${esc(b.intention)}</div>
        ${col(layout.left)}
      </aside>
      <main class="s-main">
        <div class="s-info">${info}</div>
        ${col(layout.right)}
      </main>
    </div>`;
}
